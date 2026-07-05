// supabase/functions/validate-apple-receipt/index.ts
// Deno + Supabase Edge Function: validate Apple IAP receipt and set is_pro
// - Handles prod/sandbox switch (status 21007 / 21008)
// - Sets/clears user entitlement in a table `user_entitlements`
// - Stores raw response for audit in `purchases`

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const APPLE_PROD_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

// REQUIRED ENV VARS (set in Supabase → Project Settings → Functions → Secrets):
// APPLE_SHARED_SECRET          // App-Specific Shared Secret (Subscriptions/In-App Purchases)
// SUPABASE_URL
// SUPABASE_ANON_KEY            // Used only to verify the user's JWT
// SUPABASE_SERVICE_ROLE_KEY    // Used for all DB writes (bypasses RLS)

// Helpers
function json<T>(status: number, body: T) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type VerifyPayload = {
  "receipt-data": string; // base64 receipt
  password: string;       // Apple shared secret
  "exclude-old-transactions"?: boolean;
};

async function callApple(url: string, payload: VerifyPayload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { status: res.status, data };
}

// Determines entitlement based on Apple response (non-consumable or active subscription)
function deriveEntitlement(apple: any): { isPro: boolean; productIds: string[]; expiresAt?: string } {
  const latest = apple?.latest_receipt_info ?? [];
  const inApp = apple?.receipt?.in_app ?? [];

  let productIds: string[] = [];
  let isPro = false;
  let expiresAt: string | undefined;

  for (const item of inApp) {
    if (item.product_id) productIds.push(item.product_id);
    if (item.product_id) isPro = true;
  }

  const now = Date.now();
  for (const sub of latest) {
    const pid = sub.product_id;
    const expMs = Number(sub.expires_date_ms || 0);
    if (pid) productIds.push(pid);
    if (expMs > now) {
      isPro = true;
      const ex = new Date(expMs).toISOString();
      if (!expiresAt || new Date(expiresAt).getTime() < expMs) {
        expiresAt = ex;
      }
    }
  }

  productIds = Array.from(new Set(productIds));
  return { isPro, productIds, expiresAt };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  // Auth: require a logged-in user (client should send Authorization: Bearer <jwt>)
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(401, { error: "Missing Bearer token" });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

  // User-scoped client — only used to verify the JWT identity
  const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  // Service-role client — used for all DB writes, bypasses RLS
  const adminClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Identify user from JWT
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return json(401, { error: "Invalid or missing user" });
  }

  // Parse body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }
  const receiptData = body?.receiptData;
  if (!receiptData || typeof receiptData !== "string") {
    return json(400, { error: "Missing receiptData (base64 string)" });
  }

  const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
  if (!sharedSecret) {
    return json(500, { error: "Server misconfigured: APPLE_SHARED_SECRET missing" });
  }

  // Apple verify; handle 21007 (sandbox) / 21008 (prod) switching
  const payload: VerifyPayload = {
    "receipt-data": receiptData,
    password: sharedSecret,
    "exclude-old-transactions": true,
  };

  let first = await callApple(APPLE_PROD_URL, payload);
  let apple = first.data;
  if (apple?.status === 21007) {
    const second = await callApple(APPLE_SANDBOX_URL, payload);
    apple = second.data;
  }

  if (!apple || typeof apple.status !== "number") {
    return json(502, { error: "Invalid response from Apple", apple });
  }

  // Store audit log using admin client
  const audit = {
    user_id: user.id,
    platform: "ios",
    status_code: apple.status,
    environment: apple?.environment,
    product_ids: (apple?.receipt?.in_app || []).map((x: any) => x.product_id),
    raw_response: apple,
  };
  await adminClient.from("purchases").insert(audit).select().single().catch(() => {});

  if (apple.status !== 0) {
    // Receipt not valid — clear entitlement
    await adminClient.from("user_entitlements").upsert({
      user_id: user.id,
      is_pro: false,
      apple_expires_at: null,
      updated_at: new Date().toISOString(),
    }).catch(() => {});
    return json(200, { ok: false, status: apple.status, message: "Receipt not valid", environment: apple?.environment });
  }

  // Derive and upsert entitlement using admin client
  const { isPro, productIds, expiresAt } = deriveEntitlement(apple);

  await adminClient.from("user_entitlements").upsert({
    user_id: user.id,
    is_pro: isPro,
    apple_expires_at: expiresAt ?? null,
    updated_at: new Date().toISOString(),
  });

  return json(200, {
    ok: true,
    isPro,
    productIds,
    expiresAt: expiresAt ?? null,
    environment: apple?.environment,
  });
});