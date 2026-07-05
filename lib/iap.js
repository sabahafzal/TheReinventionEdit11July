// lib/iap.js
// Real subscription wiring using react-native-iap.
// iOS: server-side receipt validation via validate-apple-receipt Edge Function.
// Android: optimistic entitlement via markProActiveBestEffort (no server-side validation available).

import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Keep the same key you were using so older code doesn't break if referenced anywhere.
const SUB_KEY = 'isPro';

// ─── Product IDs ──────────────────────────────────────────────────────────────
// Must match App Store Connect / Google Play Console exactly.
export const PRODUCT_ID_MONTHLY = 'com.reinventionedit.premium';
export const PRODUCT_ID_ANNUAL  = 'com.reinventionedit.premium.annual';

export const productIds = [PRODUCT_ID_MONTHLY, PRODUCT_ID_ANNUAL];

// Set for O(1) membership checks in restore / sync
const PREMIUM_SKUS = new Set(productIds);

// ─── Connection state ─────────────────────────────────────────────────────────
let _iapConnected = false;
let purchaseUpdateSub = null;
let purchaseErrorSub  = null;

// ─── Product cache ────────────────────────────────────────────────────────────
// Populated during initIAP() so buyPremium/buyPremiumAnnual don't need to
// re-fetch from the store on every purchase attempt.
let _cachedProducts = [];

/* ============================================================
   Helpers
   ============================================================ */

function safeDateFromMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return null;
  const d = new Date(n);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Best-effort attempt to get an expiry date from a purchase object.
 * - Android: purchase payload from purchaseUpdatedListener does NOT include expiry;
 *   the optimistic fallback below is always used on Android.
 * - iOS: same — receipt validation is required for accurate expiry.
 */
function inferExpiryFromPurchase(p) {
  if (!p) return null;

  const candidates = [
    p.expiryTimeMillis,
    p.expirationDate,
    p.expirationDateMillis,
    p.expirationTimeMillis,
  ];

  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string' && c.includes('-')) {
      const d = new Date(c);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const d = safeDateFromMs(c);
    if (d) return d;
  }

  return null;
}

/**
 * Optimistic expiry offset used when we can't read expiry from the purchase
 * object (which is almost always on both Android and iOS without server validation).
 * syncEntitlement() on next app open will correct this.
 */
function optimisticExpiryOffsetMs(productId) {
  if (productId === PRODUCT_ID_ANNUAL) {
    return 366 * 24 * 60 * 60 * 1000; // ~1 year
  }
  return 90 * 24 * 60 * 60 * 1000; // ~3 months (conservative for monthly)
}

/**
 * For Android (Google Play Billing v5+), requestSubscription requires an
 * offerToken alongside the SKU. This helper finds the right token from the
 * cached product list.
 *
 * If the product has multiple offers (e.g. a trial offer + a standard offer),
 * we prefer the one whose offerId includes 'trial' or 'free', falling back
 * to the first offer available.
 */
function resolveOfferToken(sku) {
  const product = _cachedProducts.find((p) => p.productId === sku);
  if (!product) return null;

  const offers = product.subscriptionOfferDetails || [];
  if (!offers.length) return null;

  // Prefer a trial/free offer if one exists
  const trialOffer = offers.find((o) =>
    (o.offerId || '').toLowerCase().includes('trial') ||
    (o.offerId || '').toLowerCase().includes('free')
  );

  return (trialOffer || offers[0])?.offerToken || null;
}

async function setLocalProFlag(isPro) {
  await AsyncStorage.setItem(SUB_KEY, isPro ? 'true' : 'false');
}

async function setSupabaseEntitlement({ isPro, proUntil }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const pro_until = proUntil instanceof Date ? proUntil.toISOString() : null;

  await supabase
    .from('profiles')
    .update({
      is_pro: !!isPro,
      pro_until,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
}

async function markProActiveBestEffort(purchase) {
  const inferred = inferExpiryFromPurchase(purchase);
  const offsetMs = optimisticExpiryOffsetMs(purchase?.productId);
  const proUntil = inferred ?? new Date(Date.now() + offsetMs);

  await setLocalProFlag(true);
  await setSupabaseEntitlement({ isPro: true, proUntil });
}

async function markProInactive() {
  await setLocalProFlag(false);
  await setSupabaseEntitlement({ isPro: false, proUntil: null });
}

/**
 * iOS only: call the validate-apple-receipt Edge Function with the transaction
 * receipt. On success the Edge Function writes to user_entitlements, the trigger
 * syncs to profiles, correcting the optimistic pro_until set by markProActiveBestEffort.
 * Failures are non-fatal — the optimistic value remains until next syncEntitlement().
 */
async function validateAppleReceipt(receiptData) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken || !receiptData) return;

    const { error } = await supabase.functions.invoke('validate-apple-receipt', {
      body: { receiptData },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error) {
      console.warn('validateAppleReceipt: Edge Function error', error);
    }
  } catch (e) {
    console.warn('validateAppleReceipt error', e);
  }
}

/* ============================================================
   Public API
   ============================================================ */

// Initialize the IAP connection, cache products, and register listeners.
export async function initIAP() {
  // Guard: don't double-init if already connected
  if (_iapConnected) return;

  try {
    const ok = await RNIap.initConnection();
    if (!ok) {
      console.warn('initIAP: initConnection() returned falsy — IAP unavailable');
      return;
    }

    _iapConnected = true;

    // Android: clear any failed pending purchases from a previous session
    if (Platform.OS === 'android') {
      try {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      } catch (e) {
        console.warn('flushFailedPurchasesCachedAsPendingAndroid error', e);
      }
    }

    // Cache products so buy functions can resolve offerTokens without an
    // extra round-trip to the store on every purchase attempt.
    try {
      _cachedProducts = await RNIap.getSubscriptions({ skus: productIds }) || [];
    } catch (e) {
      console.warn('initIAP: failed to pre-fetch products', e);
      _cachedProducts = [];
    }

    // Purchase update listener: finalize + sync entitlement
    purchaseUpdateSub = RNIap.purchaseUpdatedListener(async (purchase) => {
      try {
        await RNIap.finishTransaction({ purchase, isConsumable: false });

        // Optimistic write — instant UX on both platforms
        await markProActiveBestEffort(purchase);

        // iOS: server-side validation corrects pro_until with real Apple expiry
        // via user_entitlements → trigger → profiles chain.
        if (Platform.OS === 'ios' && purchase.transactionReceipt) {
          await validateAppleReceipt(purchase.transactionReceipt);
        }
      } catch (e) {
        console.warn('purchaseUpdatedListener error', e);
      }
    });

    purchaseErrorSub = RNIap.purchaseErrorListener((error) => {
      console.warn('purchaseErrorListener', error);
    });
  } catch (e) {
    console.warn('initIAP error', e);
    _iapConnected = false;
  }
}

// Cleanup listeners/connection
export function cleanupIAP() {
  try {
    purchaseUpdateSub?.remove?.();
    purchaseErrorSub?.remove?.();
    purchaseUpdateSub = null;
    purchaseErrorSub  = null;
    _iapConnected = false;
    _cachedProducts = [];

    RNIap.endConnection();
  } catch (e) {
    console.warn('cleanupIAP error', e);
  }
}

// Returns true if the IAP connection is active.
export function isIAPConnected() {
  return _iapConnected;
}

// Returns cached products (populated by initIAP). Falls back to a live fetch
// if the cache is empty, e.g. if called before initIAP completes.
export async function getProducts() {
  if (!_iapConnected) {
    console.warn('getProducts: IAP not connected — call initIAP() first');
    return [];
  }
  if (_cachedProducts.length) return _cachedProducts;
  try {
    const subs = await RNIap.getSubscriptions({ skus: productIds });
    _cachedProducts = subs || [];
    return _cachedProducts;
  } catch (e) {
    console.warn('getProducts error', e);
    return [];
  }
}

/**
 * Ensures IAP is connected before a purchase/restore attempt.
 * If App.js initIAP() hasn't finished yet (race condition), this
 * awaits it now so the buy functions never fail due to timing.
 * Returns true if connected and ready.
 */
async function ensureConnected(caller) {
  if (_iapConnected) return true;
  console.warn(`${caller}: IAP not yet connected — attempting initIAP() now…`);
  await initIAP();
  if (!_iapConnected) {
    console.warn(`${caller}: IAP unavailable after retry (emulator without Play Store, or billing not configured)`);
    return false;
  }
  return true;
}

/**
 * Purchase the monthly Premium subscription.
 *
 * On Android (Google Play Billing v5+) we must pass a subscriptionOffers array
 * containing the offerToken for the desired offer (e.g. the 7-day trial).
 * Without this the purchase sheet silently fails on Android.
 */
export async function buyPremium() {
  if (!await ensureConnected('buyPremium')) return false;
  try {
    const offerToken = Platform.OS === 'android'
      ? resolveOfferToken(PRODUCT_ID_MONTHLY)
      : null;

    await RNIap.requestSubscription({
      sku: PRODUCT_ID_MONTHLY,
      ...(offerToken && {
        subscriptionOffers: [{ sku: PRODUCT_ID_MONTHLY, offerToken }],
      }),
    });

    // purchaseUpdatedListener handles finishing + entitlement sync.
    return true;
  } catch (e) {
    console.warn('buyPremium error', e);
    return false;
  }
}

/**
 * Purchase the annual Premium subscription.
 * Same offerToken requirement as buyPremium — see above.
 */
export async function buyPremiumAnnual() {
  if (!await ensureConnected('buyPremiumAnnual')) return false;
  try {
    const offerToken = Platform.OS === 'android'
      ? resolveOfferToken(PRODUCT_ID_ANNUAL)
      : null;

    await RNIap.requestSubscription({
      sku: PRODUCT_ID_ANNUAL,
      ...(offerToken && {
        subscriptionOffers: [{ sku: PRODUCT_ID_ANNUAL, offerToken }],
      }),
    });

    return true;
  } catch (e) {
    console.warn('buyPremiumAnnual error', e);
    return false;
  }
}

/**
 * Restore purchases / check entitlement.
 * Recognises both monthly and annual product IDs as granting Pro access.
 */
export async function restorePurchases() {
  if (!await ensureConnected('restorePurchases')) return false;
  try {
    const purchases = await RNIap.getAvailablePurchases();
    const hasPremium = (purchases || []).some((p) => PREMIUM_SKUS.has(p.productId));

    if (!hasPremium) {
      await markProInactive();
      return false;
    }

    // Pick the most recent premium purchase across both SKUs
    const premiumPurchases = (purchases || [])
      .filter((p) => PREMIUM_SKUS.has(p.productId))
      .sort((a, b) => Number(b.transactionDate || 0) - Number(a.transactionDate || 0));

    const latest = premiumPurchases[0];
    await markProActiveBestEffort(latest);

    // iOS: re-validate on restore to get accurate expiry
    if (Platform.OS === 'ios' && latest.transactionReceipt) {
      await validateAppleReceipt(latest.transactionReceipt);
    }

    return true;
  } catch (e) {
    console.warn('restorePurchases error', e);
    return false;
  }
}

/**
 * Call on app start / resume to re-check entitlement against the store.
 * Corrects any optimistic pro_until values set during purchase.
 */
export async function syncEntitlement() {
  if (!_iapConnected) {
    // Silently skip — IAP unavailable (Expo Go, simulator, etc.)
    return { isPro: false };
  }
  try {
    const purchases = await RNIap.getAvailablePurchases();
    const hasPremium = (purchases || []).some((p) => PREMIUM_SKUS.has(p.productId));

    if (!hasPremium) {
      await markProInactive();
      return { isPro: false };
    }

    const premiumPurchases = (purchases || [])
      .filter((p) => PREMIUM_SKUS.has(p.productId))
      .sort((a, b) => Number(b.transactionDate || 0) - Number(a.transactionDate || 0));

    const latest = premiumPurchases[0];
    await markProActiveBestEffort(latest);

    // iOS: re-validate on sync to keep pro_until accurate
    if (Platform.OS === 'ios' && latest.transactionReceipt) {
      await validateAppleReceipt(latest.transactionReceipt);
    }

    return { isPro: true };
  } catch (e) {
    console.warn('syncEntitlement error', e);
    return { isPro: false };
  }
}