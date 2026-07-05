// supabase/functions/claim-referral/index.ts
//
// Called once, right after a new user completes the onboarding quiz.
// It validates their referral code, records the referral, and grants
// 1 free month of Premium to both the referrer and the referred user.
//
// Required secrets (Dashboard → Project Settings → Edge Functions → Secrets):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Deploy:
//   supabase functions deploy claim-referral
//
// Call from the app (after quiz completion):
//   supabase.functions.invoke('claim-referral', {
//     body: { referral_code: 'ABC12345' },
//   })

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Grant 1 free month of Premium to a user.
// If they're already Pro, extends their pro_until date.
// If they're free, sets is_pro=true with pro_until = now + 30 days.
async function grantFreeMonth(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_pro, pro_until, referral_rewards_earned')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.warn(`grantFreeMonth: could not load profile for ${userId}`, error);
    return;
  }

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  // Base date: if already pro and pro_until is in the future, extend from there.
  // Otherwise extend from now.
  const currentUntil = profile.pro_until ? new Date(profile.pro_until).getTime() : 0;
  const baseMs = profile.is_pro && currentUntil > now ? currentUntil : now;
  const newUntil = new Date(baseMs + thirtyDays).toISOString();

  await supabase
    .from('profiles')
    .update({
      is_pro: true,
      pro_until: newUntil,
      referral_rewards_earned: (profile.referral_rewards_earned ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

Deno.serve(async (req) => {
  // ── Auth: require a logged-in user ──────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace('Bearer ', '').trim();
  if (!jwt) return json(401, { error: 'Missing auth token' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
  if (authErr || !user) return json(401, { error: 'Invalid auth token' });

  const referredId = user.id;

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: { referral_code?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const code = (body.referral_code ?? '').trim().toUpperCase();
  if (!code) return json(400, { error: 'referral_code is required' });

  // ── Guard: user can't use their own code ───────────────────────────────────
  const { data: selfProfile } = await supabase
    .from('profiles')
    .select('referral_code, referred_by')
    .eq('id', referredId)
    .single();

  if (selfProfile?.referral_code === code) {
    return json(400, { error: 'You cannot use your own referral code' });
  }

  // ── Guard: user hasn't already been referred ───────────────────────────────
  if (selfProfile?.referred_by) {
    return json(409, { error: 'You have already used a referral code' });
  }

  // ── Look up the referrer ───────────────────────────────────────────────────
  const { data: referrerProfile, error: referrerErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .single();

  if (referrerErr || !referrerProfile) {
    return json(404, { error: 'Referral code not found' });
  }

  const referrerId = referrerProfile.id;

  // ── Record the referral ────────────────────────────────────────────────────
  const { error: insertErr } = await supabase
    .from('referrals')
    .insert({
      referrer_id:   referrerId,
      referred_id:   referredId,
      referral_code: code,
    });

  // 23505 = unique_violation — referred_id already exists (race condition / retry)
  if (insertErr && insertErr.code !== '23505') {
    console.error('referrals insert error:', insertErr);
    return json(500, { error: 'Could not record referral' });
  }

  // ── Store referred_by on the new user's profile ────────────────────────────
  await supabase
    .from('profiles')
    .update({ referred_by: code })
    .eq('id', referredId);

  // ── Grant rewards ──────────────────────────────────────────────────────────
  await Promise.all([
    grantFreeMonth(referrerId),  // referrer gets 1 free month
    grantFreeMonth(referredId),  // new user gets 1 free month
  ]);

  // ── Mark referral as rewarded ──────────────────────────────────────────────
  await supabase
    .from('referrals')
    .update({ rewarded_at: new Date().toISOString() })
    .eq('referred_id', referredId);

  console.log(`Referral claimed: ${referrerId} → ${referredId} (code: ${code})`);

  return json(200, {
    ok: true,
    message: 'Referral claimed — 1 free month added for both of you.',
  });
});