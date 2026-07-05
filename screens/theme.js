// theme.js
// Single source of truth for colours, typography, spacing, and radii.
// Derived from ProfileScreen.js — use this everywhere instead of local C = {} objects.
//
// Usage:
//   import { colors, typography, spacing, radii, shadows } from '../theme';

// ─── Colours ──────────────────────────────────────────────────────────────────

export const colors = {

  // ── Base palette ────────────────────────────────────────────────────────────
  ink:        '#1e150e',   // primary text, headings, icons
  warmWhite:  '#faf7f2',   // screen / card background (warm)
  offWhite:   '#f5f0e6',   // subtle section background
  linen:      '#ede6d8',   // card fills, avatar bg, icon box bg
  fawn:       '#ddd2c0',   // avatar border, divider accents
  champagne:  '#c8b89e',   // chevrons, muted icons, lock labels

  // ── Accent — rose / clay ─────────────────────────────────────────────────
  deepRose:   '#7a3535',   // primary CTA bg, badge text, italic accents
  midRose:    '#a04848',   // hover / pressed state for rose elements
  dustyRose:  '#c8948e',   // pips, progress bar fill, member dot
  clay:       '#a0613a',   // section eyebrow labels, section rules

  // ── Greens ──────────────────────────────────────────────────────────────────
  sage:       '#5a7358',   // secondary / success accent (used sparingly)

  // ── Semantic alpha tokens ────────────────────────────────────────────────────
  // These are ready-made rgba strings so you never have to recalculate them.
  softBorder:     'rgba(30,21,14,0.10)',   // card borders, input borders
  subtleBorder:   'rgba(30,21,14,0.06)',   // intra-card row dividers
  caption:        'rgba(30,21,14,0.42)',   // secondary / muted text
  bodyMuted:      'rgba(30,21,14,0.58)',   // action subtitles, sub-labels
  bodyLight:      'rgba(30,21,14,0.65)',   // upgrade bullet text
  overlayDark:    'rgba(30,21,14,0.45)',   // modal scrim

  // Rose alpha — badges, borders, backgrounds
  roseTint08:     'rgba(122,53,53,0.08)',  // badge / tag background
  roseTint15:     'rgba(122,53,53,0.15)',  // free badge border
  roseTint18:     'rgba(122,53,53,0.18)',  // tag border
  roseTint20:     'rgba(122,53,53,0.20)',  // danger button border
  roseTint30:     'rgba(200,148,142,0.30)', // upgrade card border

  // Clay alpha — section rule line
  clayRule:       'rgba(160,97,58,0.22)',

  // Neutral whites
  white:    '#ffffff',
  card:     '#ffffff',   // explicit card white (same as white, named for intent)
};


// ─── Typography ───────────────────────────────────────────────────────────────
// fontFamily values reference fonts loaded in App.js.
// 'PlayfairDisplay' is the primary display/headline font (loaded via expo-font).
// 'DancingScript' is kept for any legacy screens still using it.
// 'serif' is the system serif (used for body italic moments).

export const typography = {

  // Font families
  fontSerif:         'serif',           // body italic accents
  fontDisplay:       'PlayfairDisplay', // headlines, screen titles, hero names
  fontDisplayItalic: 'PlayfairDisplay_Italic', // italic variant
  fontLegacy:        'DancingScript',   // kept for backward compat — prefer fontDisplay
  fontSans:          undefined,         // React Native default — omit fontFamily to use it

  // ── Scale ────────────────────────────────────────────────────────────────
  // Named by role, not just size, so usage is self-documenting.

  screenTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 28,
    fontWeight: '400',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  heroName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 24,
    fontWeight: '400',
    color: colors.ink,
    letterSpacing: 0.2,
  },

  sectionTitle: {           // modal titles, card headings
    fontFamily: 'PlayfairDisplay',
    fontSize: 20,
    fontWeight: '400',
    color: colors.ink,
    letterSpacing: 0.1,
  },

  cardTitle: {              // infoRowValue, repersonalise label
    fontFamily: 'PlayfairDisplay_Italic',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.deepRose,
  },

  bodyLarge: {              // primary body copy
    fontSize: 16,
    fontWeight: '400',
    color: colors.ink,
    lineHeight: 24,
  },

  body: {                   // standard body / list items
    fontSize: 14,
    fontWeight: '400',
    color: colors.ink,
    lineHeight: 20,
  },

  actionLabel: {            // tappable row primary label
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: 0.1,
  },

  actionSub: {              // tappable row subtitle
    fontSize: 11,
    fontWeight: '400',
    color: colors.bodyMuted,
    letterSpacing: 0.1,
  },

  caption: {                // timestamps, email, member-since
    fontSize: 12,
    fontWeight: '300',
    color: colors.caption,
    letterSpacing: 0.1,
  },

  eyebrow: {                // uppercase section labels ("YOUR PLAN", "SETTINGS")
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.clay,
  },

  badge: {                  // plan / status badges ("FREE", "PREMIUM")
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.deepRose,
  },

  buttonPrimary: {          // CTA buttons (uppercase)
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.white,
  },

  buttonDanger: {           // logout / destructive (uppercase, muted rose)
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(122,53,53,0.5)',
  },

  modalCancel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.caption,
  },

  brandWordmark: {          // "The Reinvention Edit" italicised in header
    fontFamily: 'serif',
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.ink,
    opacity: 0.55,
    letterSpacing: 0.2,
  },

  avatarInitials: {
    fontFamily: 'serif',
    fontSize: 26,
    fontStyle: 'italic',
    color: colors.deepRose,
    lineHeight: 30,
  },

  lockLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.champagne,
  },
};


// ─── Spacing ──────────────────────────────────────────────────────────────────
// Use these instead of magic numbers. Derived from the patterns in ProfileScreen.

export const spacing = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   22,
  xxl:  26,   // standard horizontal screen margin (matches ProfileScreen's 26px gutters)
  xxxl: 32,

  // Named layout tokens
  screenPaddingH:     26,   // left/right margin for all screen content
  screenPaddingTop:   60,   // top padding under status bar
  cardPaddingH:       18,   // horizontal padding inside info cards
  cardPaddingV:       13,   // vertical padding inside info card rows
  sectionGap:         22,   // vertical gap between sections
};


// ─── Border radii ──────────────────────────────────────────────────────────────

export const radii = {
  sm:    10,   // small buttons, inputs
  md:    12,   // action buttons, modal buttons
  lg:    14,   // repersonalise row, danger button
  xl:    18,   // info cards, actions group, upgrade card
  xxl:   22,   // modal card
  pill:  999,  // fully rounded pills / chips
  dot:   3,    // 5×5 pip/dot decorations
};


// ─── Shadows ──────────────────────────────────────────────────────────────────
// ProfileScreen uses borders rather than elevation shadows, so these are
// intentionally light — just enough to lift a card off the background.

export const shadows = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  modal: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};


// ─── Gradients ────────────────────────────────────────────────────────────────
// Pass these directly to <LinearGradient colors={gradients.planBackground} />

export const gradients = {
  planBackground:  ['#DDE6E1', '#97ADA3'],   // from PlanLayout — roadmap plan screens
  profileHeader:   [colors.warmWhite, colors.offWhite], // subtle warm fade for profile-style headers
};


// ─── Composite tokens (pre-assembled StyleSheet-ready objects) ─────────────────
// Use these for frequently repeated patterns to avoid copy-pasting.

export const tokens = {

  // Standard bordered card (white with soft ink border)
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    overflow: 'hidden',
  },

  // Linen-tinted card (upgrade prompts, feature highlights)
  linenCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.roseTint30,
  },

  // Tappable action row (inside a card group)
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },

  // Icon box (34×34 linen square, used left of action labels)
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.linen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Primary CTA button (deep rose)
  buttonPrimary: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },

  // Danger / ghost button (rose outline, no fill)
  buttonDanger: {
    borderWidth: 1.5,
    borderColor: colors.roseTint20,
    borderRadius: radii.lg,
    paddingVertical: 13,
    alignItems: 'center',
  },

  // Plan / status badge (rose tinted pill)
  badge: {
    backgroundColor: colors.roseTint08,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.roseTint18,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },

  // Section eyebrow row (label + horizontal rule)
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xxl,
    marginBottom: 12,
    marginTop: 4,
  },

  // The rule line that follows an eyebrow label
  eyebrowRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.clayRule,
  },

  // Modal overlay scrim
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  // Modal card
  modalCard: {
    width: '100%',
    backgroundColor: colors.warmWhite,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
  },
};