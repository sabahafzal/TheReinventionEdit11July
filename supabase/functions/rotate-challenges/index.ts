// supabase/functions/rotate-challenges/index.ts
//
// Supabase Edge Function — runs daily via cron to rotate expired challenges.
// Self-contained: the challenges library is inlined — no local imports needed.
//
// Deploy:
//   supabase functions deploy rotate-challenges
//
// Schedule in Supabase SQL Editor (requires pg_cron + pg_net extensions):
//   select cron.schedule(
//     'rotate-challenges',
//     '0 1 * * *',
//     $$ select net.http_post(
//         url := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/rotate-challenges',
//         headers := '{"Authorization": "Bearer <YOUR_SERVICE_ROLE_KEY>"}'::jsonb
//       ); $$
//   );
//
// Test manually:
//   supabase functions invoke rotate-challenges

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Challenges library (inlined) ─────────────────────────────────────────────
// Keep this in sync with config/challengesLibrary.js in your app.
// Slot guide:
//   1 → Short burst (1–3 days)
//   2 → Weekly habit (7 days)
//   3 → Deep focus (7 days)
//   4 → Social / community (7 days)

const CHALLENGES_LIBRARY: Record<string, Array<{
  slot: number; order: number; emoji: string;
  total_days: number; title: string; description: string;
}>> = {

  new_city: [
    { slot: 1, order: 1,  emoji: '🗺️', total_days: 3,  title: '3-Day Neighbourhood Walk',              description: 'Walk a different street in your area every day for 3 days. No headphones — just look around.' },
    { slot: 1, order: 2,  emoji: '☕', total_days: 2,  title: 'Try Two New Cafés',                      description: "Find two cafés you've never been to. Sit in. Order something. Notice the vibe." },
    { slot: 1, order: 3,  emoji: '🛒', total_days: 2,  title: 'Local Market Weekend',                   description: "Visit a local market or farmers' market this weekend. Buy something you've never tried." },
    { slot: 1, order: 4,  emoji: '🚌', total_days: 3,  title: 'New Route Challenge',                    description: "Take a completely different route to somewhere you go regularly. Notice what you've been missing." },
    { slot: 1, order: 5,  emoji: '🌇', total_days: 1,  title: 'Golden Hour Explore',                    description: 'Go outside one evening at golden hour and walk without a destination. Just see where you end up.' },
    { slot: 1, order: 6,  emoji: '🍜', total_days: 3,  title: 'Eat Local — 3 Days',                     description: "Try a local restaurant, food truck, or takeaway you've been curious about, three days in a row." },
    { slot: 1, order: 7,  emoji: '📸', total_days: 3,  title: '3 Things That Surprised You',            description: 'Each day, photograph one thing in your city that surprises, delights, or interests you.' },
    { slot: 2, order: 1,  emoji: '👋', total_days: 7,  title: 'Meet One New Person',                    description: 'Introduce yourself to one new person this week — a neighbour, colleague, classmate, or stranger at an event.' },
    { slot: 2, order: 2,  emoji: '📅', total_days: 7,  title: 'Say Yes to One Invite',                  description: "This week, say yes to at least one social invite you'd normally skip. Show up, even briefly." },
    { slot: 2, order: 3,  emoji: '🏃', total_days: 7,  title: '7-Day Morning Out',                      description: 'Every morning this week, get outside within 30 minutes of waking up. Even just to the end of the street.' },
    { slot: 2, order: 4,  emoji: '🌱', total_days: 7,  title: 'Find Your Third Place',                  description: "Spend time in the same non-home, non-work spot 3+ times this week. A café, park, library — your spot." },
    { slot: 2, order: 5,  emoji: '🗓️', total_days: 7,  title: 'Put Yourself On the Map',               description: 'Join or attend one local event, class, or meetup this week. Check Eventbrite, Meetup, or noticeboards.' },
    { slot: 2, order: 6,  emoji: '📞', total_days: 7,  title: 'Reach Out — 7 Days',                     description: 'Text or call one person from your old life every day this week. Staying rooted while you grow new roots.' },
    { slot: 3, order: 1,  emoji: '🗒️', total_days: 7,  title: '7-Day City Journal',                    description: "Write 3 sentences every evening about your day in your new city. What's hard. What's good. What surprised you." },
    { slot: 3, order: 2,  emoji: '🏛️', total_days: 7,  title: 'Know Your City',                        description: 'Learn one interesting historical or cultural fact about your city every day. Use Wikipedia, local blogs, or podcasts.' },
    { slot: 3, order: 3,  emoji: '🗺️', total_days: 7,  title: '7-Day Explore Challenge',               description: 'Visit one new neighbourhood, café, or landmark every day for 7 days. Document it with a photo or note.' },
    { slot: 3, order: 4,  emoji: '🧭', total_days: 7,  title: 'Build Your Mental Map',                  description: "Walk (not drive) to somewhere new every day this week. No Google Maps once you're 10 minutes in." },
    { slot: 3, order: 5,  emoji: '💌', total_days: 7,  title: 'City Love Letter',                       description: "By the end of the week, write a short love letter to your new city — even if it's complicated. What do you appreciate?" },
    { slot: 4, order: 1,  emoji: '🤝', total_days: 7,  title: 'Circle Check-In',                        description: 'Post one update to your circle this week about something you discovered in your city. Big or small.' },
    { slot: 4, order: 2,  emoji: '💬', total_days: 7,  title: 'Share Your Win',                         description: 'Share one "new city win" with your circle this week — a place, a person, a moment. Celebrate out loud.' },
    { slot: 4, order: 3,  emoji: '📍', total_days: 7,  title: 'Give a Recommendation',                  description: 'Recommend one place in your city to your circle this week. A hidden gem, a fave spot, an underrated corner.' },
    { slot: 4, order: 4,  emoji: '🫂', total_days: 7,  title: 'Ask for a Local Tip',                    description: "Ask someone — in your circle or in person — for a local recommendation you haven't tried yet. Then go." },
  ],

  tech_switch: [
    { slot: 1, order: 1,  emoji: '⏱️', total_days: 3,  title: '30-Min Focus Sprint — 3 Days',           description: "No distractions. Set a timer. Study for 30 minutes every day this weekend. That's it." },
    { slot: 1, order: 2,  emoji: '🛠️', total_days: 2,  title: 'Build Something Tiny',                   description: 'Ship one tiny project this weekend — a landing page, a script, a dataset. Anything you can point to.' },
    { slot: 1, order: 3,  emoji: '📖', total_days: 3,  title: 'Read 3 Tech Articles',                   description: 'Read one industry article every day for 3 days. Dev.to, Medium, Hacker News — your pick.' },
    { slot: 1, order: 4,  emoji: '🐛', total_days: 2,  title: 'Fix One Bug',                            description: 'Find something broken in your project or practice code and fix it. One bug. Two days. Done.' },
    { slot: 1, order: 5,  emoji: '💡', total_days: 1,  title: 'Document Your Learning',                 description: "Write a short summary of everything you've learned so far this week. Bullet points are fine." },
    { slot: 1, order: 6,  emoji: '🎯', total_days: 3,  title: 'Complete One Tutorial',                  description: "Pick a tutorial you've had open for ages and actually finish it this weekend." },
    { slot: 2, order: 1,  emoji: '💻', total_days: 7,  title: '30-Min Daily Learning Streak',           description: 'Commit to 30 minutes of focused tech learning every day this week. No skipping.' },
    { slot: 2, order: 2,  emoji: '🗓️', total_days: 7,  title: 'Code Every Single Day',                 description: 'Open your code editor every day this week. Even 10 lines counts. Consistency beats intensity.' },
    { slot: 2, order: 3,  emoji: '📝', total_days: 7,  title: 'Daily TIL (Today I Learned)',            description: 'Write one thing you learned each day in a note, journal, or LinkedIn post. Build your learning habit publicly.' },
    { slot: 2, order: 4,  emoji: '🔁', total_days: 7,  title: 'Revisit Something Confusing',            description: 'Every day this week, revisit one concept that confused you before. Re-read it. Re-try it. Build the reps.' },
    { slot: 2, order: 5,  emoji: '🧩', total_days: 7,  title: 'One Leetcode a Day',                    description: 'One problem per day — easy is fine. The goal is the habit, not the difficulty.' },
    { slot: 2, order: 6,  emoji: '📚', total_days: 7,  title: 'Read the Docs',                          description: "Pick one tool or framework you use. Spend 15 minutes per day reading its official docs this week." },
    { slot: 3, order: 1,  emoji: '🗂️', total_days: 7,  title: 'Portfolio Project Sprint',              description: 'Spend at least 1 hour per day this week on a portfolio project. By Friday you should have something to show.' },
    { slot: 3, order: 2,  emoji: '🔍', total_days: 7,  title: 'Research Your Target Role',              description: 'Every day this week, read one job description for your target role. Note 3 skills that come up repeatedly.' },
    { slot: 3, order: 3,  emoji: '🤖', total_days: 7,  title: 'Master One Concept',                    description: "Choose one concept you've been avoiding (recursion, async/await, SQL joins — whatever). Own it this week." },
    { slot: 3, order: 4,  emoji: '🎤', total_days: 7,  title: 'Explain It Out Loud',                   description: 'Every day this week, explain one concept out loud — to yourself, a friend, or your phone camera. Teaching = learning.' },
    { slot: 3, order: 5,  emoji: '🧪', total_days: 7,  title: 'Write Tests This Week',                 description: "Add tests to something you've built. Any framework. Even just one test file per day." },
    { slot: 4, order: 1,  emoji: '🤝', total_days: 7,  title: 'Reach Out to One Tech Person',           description: 'Connect with one person in tech this week — on LinkedIn, at a meetup, or in a Discord. A genuine message, not a template.' },
    { slot: 4, order: 2,  emoji: '🌐', total_days: 7,  title: 'Join One Tech Community',               description: 'Join one Slack, Discord, or forum for your tech niche this week. Lurk if you must — but be there.' },
    { slot: 4, order: 3,  emoji: '📣', total_days: 7,  title: 'Post Your Progress',                    description: 'Share what you\'re building or learning publicly once this week. LinkedIn, Twitter/X, or a community. Visibility is a skill.' },
    { slot: 4, order: 4,  emoji: '💬', total_days: 7,  title: 'Help Someone in Your Circle',           description: 'Answer one question, share one resource, or encourage one sister in your tech circle this week.' },
  ],

  financial_glow_up: [
    { slot: 1, order: 1,  emoji: '🐖', total_days: 2,  title: 'No-Spend Weekend',                       description: 'Challenge yourself to a full no-spend weekend. Free fun only. No exceptions.' },
    { slot: 1, order: 2,  emoji: '🧾', total_days: 3,  title: '3-Day Receipt Audit',                    description: 'Save every receipt for 3 days — physical and digital. No judgement. Just awareness.' },
    { slot: 1, order: 3,  emoji: '✂️', total_days: 2,  title: 'Cancel One Subscription',               description: "Find one subscription you're not using and cancel it this weekend. Then move that money to savings." },
    { slot: 1, order: 4,  emoji: '🍱', total_days: 3,  title: 'Meal Prep Monday',                      description: 'Prep 3 days of lunches this weekend. Track how much you save vs buying out.' },
    { slot: 1, order: 5,  emoji: '💸', total_days: 1,  title: 'Transfer £1 to Savings',                description: "Today. Right now. Open your savings app and move £1. It's not about the amount — it's about the habit." },
    { slot: 1, order: 6,  emoji: '📊', total_days: 3,  title: 'Net Worth Snapshot',                    description: 'Add up everything you own and everything you owe. Write it down. That number is your starting line.' },
    { slot: 2, order: 1,  emoji: '📊', total_days: 7,  title: 'Track Every Penny — 7 Days',            description: 'Log every transaction for 7 days without judgement. Every coffee, every transfer. Awareness is the first step.' },
    { slot: 2, order: 2,  emoji: '🎯', total_days: 7,  title: 'Budget Check-In — Daily',               description: 'Spend 5 minutes every day this week reviewing your budget. Morning coffee ritual. Non-negotiable.' },
    { slot: 2, order: 3,  emoji: '🧠', total_days: 7,  title: 'Read About Money — 7 Days',             description: '10 minutes of financial reading every day this week. Books, newsletters, podcasts. Your pick.' },
    { slot: 2, order: 4,  emoji: '🚫', total_days: 7,  title: 'Zero Impulse Buys This Week',           description: "Before every non-essential purchase this week, wait 24 hours. If you still want it tomorrow, it counts." },
    { slot: 2, order: 5,  emoji: '💰', total_days: 7,  title: 'Save a Little Daily',                   description: 'Move a small amount to savings every single day this week. Even £2. Automate if you can.' },
    { slot: 2, order: 6,  emoji: '🏦', total_days: 7,  title: 'Know Your Numbers Week',                description: 'Every day this week, look at one financial number — account balance, savings rate, debt total. Own your data.' },
    { slot: 3, order: 1,  emoji: '🗂️', total_days: 7,  title: 'Build Your First Budget',              description: 'This week, create a full monthly budget from scratch. Income vs outgoings. Every category. Use a spreadsheet or app.' },
    { slot: 3, order: 2,  emoji: '💳', total_days: 7,  title: 'Debt Audit Week',                       description: "Map out every debt you have — balance, interest rate, minimum payment. By Friday you'll have a full picture." },
    { slot: 3, order: 3,  emoji: '📈', total_days: 7,  title: 'Investing 101',                         description: 'Spend 20 minutes per day this week learning one investing concept. ISA, S&S ISA, index funds, compound interest.' },
    { slot: 3, order: 4,  emoji: '🏡', total_days: 7,  title: 'Big Goal Planning Week',               description: 'Pick one big financial goal (house, travel, retirement). This week, research what it actually costs and what it takes.' },
    { slot: 3, order: 5,  emoji: '🔐', total_days: 7,  title: 'Emergency Fund Week',                   description: 'Calculate your 3-month emergency fund target. Set up a separate savings account. Make your first deposit.' },
    { slot: 4, order: 1,  emoji: '💬', total_days: 7,  title: 'Talk Money With Your Circle',           description: 'Share one honest money moment with your circle this week — a win, a mistake, or a goal you\'re scared to say out loud.' },
    { slot: 4, order: 2,  emoji: '🎉', total_days: 7,  title: 'Celebrate a Money Win',                description: 'Post your money win this week — however small. Paid off a bill. Saved your first £100. Cooked at home all week.' },
    { slot: 4, order: 3,  emoji: '🤝', total_days: 7,  title: 'Share a Money Resource',               description: 'Share one book, podcast, app, or tip with your circle this week that has genuinely helped your finances.' },
    { slot: 4, order: 4,  emoji: '🫂', total_days: 7,  title: 'Accountability Partner Check-In',      description: 'Find one person in your circle to share your weekly savings goal with. Check in with each other by Sunday.' },
  ],

  physical_glow_up: [
    { slot: 1, order: 1,  emoji: '👟', total_days: 3,  title: '8K Steps — 3 Days',                     description: 'Hit 8,000 steps every day for 3 days. Walk, dance, pace the kitchen. Just move.' },
    { slot: 1, order: 2,  emoji: '💧', total_days: 3,  title: 'Hydration Reset',                       description: '2 litres of water every day for 3 days. Track it. See how you feel by day 3.' },
    { slot: 1, order: 3,  emoji: '🧘', total_days: 2,  title: 'Stretch for 10 Minutes',               description: 'Morning or evening, 10 minutes of stretching both days this weekend. YouTube is your friend.' },
    { slot: 1, order: 4,  emoji: '🥗', total_days: 3,  title: '3-Day Veggie Boost',                   description: 'Add one extra portion of vegetables to every meal for 3 days. No replacing — just adding.' },
    { slot: 1, order: 5,  emoji: '🚶', total_days: 1,  title: '20-Minute Walk Today',                 description: 'Just today. No music, no podcast. Walk for 20 minutes and pay attention to your body.' },
    { slot: 1, order: 6,  emoji: '🌞', total_days: 3,  title: 'Morning Light — 3 Days',               description: 'Get outside within 30 minutes of waking up for 3 days. Natural light first thing resets everything.' },
    { slot: 2, order: 1,  emoji: '👟', total_days: 5,  title: '10K Steps Daily — 5 Days',             description: 'Hit 10,000 steps every day for 5 days. Walk, dance, take the long way. No elevators.' },
    { slot: 2, order: 2,  emoji: '🌙', total_days: 7,  title: 'Bedtime by 10:30pm — 7 Days',          description: 'Protect your sleep. Lights out by 10:30pm for 7 nights straight. Phone down by 10.' },
    { slot: 2, order: 3,  emoji: '💧', total_days: 7,  title: 'Water First — Every Morning',          description: 'Drink a full glass of water before anything else every day this week. Before coffee. Before your phone.' },
    { slot: 2, order: 4,  emoji: '🏋️', total_days: 5,  title: 'Move Every Weekday',                  description: 'Some form of intentional movement every weekday this week. Gym, walk, YouTube workout — anything counts.' },
    { slot: 2, order: 5,  emoji: '🥗', total_days: 7,  title: 'Cook at Home — 7 Days',               description: "Cook or prep every meal at home this week. One week of knowing exactly what you're putting in your body." },
    { slot: 2, order: 6,  emoji: '📵', total_days: 7,  title: 'No Phone in Bed',                      description: 'Charge your phone outside the bedroom every night this week. Your sleep will thank you.' },
    { slot: 3, order: 1,  emoji: '📋', total_days: 7,  title: 'Track Your Food — 7 Days',             description: "Log everything you eat for a week. No calorie restriction. Just awareness. See your patterns." },
    { slot: 3, order: 2,  emoji: '🧠', total_days: 7,  title: 'Understand Your Body',                 description: 'Read or watch one thing daily about fitness, nutrition, or sleep this week. Build your knowledge base.' },
    { slot: 3, order: 3,  emoji: '🏃', total_days: 7,  title: 'Cardio Week',                          description: 'At least 20 minutes of cardiovascular movement every day this week. Brisk walk counts.' },
    { slot: 3, order: 4,  emoji: '💪', total_days: 7,  title: 'Strength Week',                        description: 'Three strength workouts minimum this week. Bodyweight is fine. Focus on form, not weight.' },
    { slot: 3, order: 5,  emoji: '😴', total_days: 7,  title: 'Sleep Audit Week',                     description: 'Track your sleep every night this week — time to bed, time up, quality rating. Find your pattern.' },
    { slot: 4, order: 1,  emoji: '📸', total_days: 7,  title: 'Post Your Workout',                    description: 'Share your movement this week in the circle — a photo, a stat, a note. We celebrate every step here.' },
    { slot: 4, order: 2,  emoji: '🫂', total_days: 7,  title: 'Find a Movement Buddy',               description: 'Find one person — in your circle or not — to move with or check in with this week. Accountability doubles results.' },
    { slot: 4, order: 3,  emoji: '💬', total_days: 7,  title: "Share What's Working",                description: "Post one thing that's actually working for your physical glow up this week. A habit, a recipe, a trick." },
    { slot: 4, order: 4,  emoji: '🎉', total_days: 7,  title: 'Celebrate a Non-Scale Win',           description: 'Share a win this week that has nothing to do with weight. Energy, sleep, strength, confidence — those count more.' },
  ],

  mental_glow_up: [
    { slot: 1, order: 1,  emoji: '🌅', total_days: 3,  title: '3-Day Morning Stillness',              description: 'Before you touch your phone — 5 minutes of quiet for 3 days. Breathe, journal, just sit.' },
    { slot: 1, order: 2,  emoji: '📵', total_days: 2,  title: 'No Social Media Morning',              description: 'No social media before 10am both days this weekend. Notice how your mind feels.' },
    { slot: 1, order: 3,  emoji: '🌿', total_days: 3,  title: '10-Min Nature Reset',                  description: 'Spend 10 minutes outside in nature — park, garden, anywhere green — every day for 3 days.' },
    { slot: 1, order: 4,  emoji: '✍️', total_days: 2,  title: 'Brain Dump Weekend',                  description: 'Write everything on your mind onto paper this weekend. Two pages. No editing. Just emptying.' },
    { slot: 1, order: 5,  emoji: '🎵', total_days: 1,  title: 'One Hour of Joy',                     description: 'Today, do one thing purely for joy. No productivity. No purpose. Just because you like it.' },
    { slot: 1, order: 6,  emoji: '😴', total_days: 3,  title: 'Rest Without Guilt',                  description: "For 3 days, rest intentionally once a day — nap, sit, lie down — without calling it laziness." },
    { slot: 2, order: 1,  emoji: '🌸', total_days: 7,  title: 'Gratitude Note — Every Day',          description: "Write one thing you're genuinely grateful for every single day this week. Not performative. Real." },
    { slot: 2, order: 2,  emoji: '🧘', total_days: 7,  title: '5-Minute Meditation Daily',           description: 'Five minutes of meditation or breathwork every day this week. Headspace, Calm, YouTube, or just silence.' },
    { slot: 2, order: 3,  emoji: '📵', total_days: 7,  title: 'Phone-Free First Hour',               description: 'No phone for the first hour after waking up every day this week. Read, journal, stretch, just be.' },
    { slot: 2, order: 4,  emoji: '✍️', total_days: 7,  title: 'Journal Every Day',                  description: "Write for 5 minutes every day this week. Prompt: what do you need right now that you're not giving yourself?" },
    { slot: 2, order: 5,  emoji: '🎯', total_days: 7,  title: 'One Intentional Act Daily',           description: "Each day this week, do one thing that aligns with who you're becoming — not who you've been." },
    { slot: 2, order: 6,  emoji: '🌙', total_days: 7,  title: 'Wind-Down Ritual — 7 Nights',         description: 'Create a 15-minute wind-down routine and stick to it every night this week. Screens off. Mind down.' },
    { slot: 3, order: 1,  emoji: '📚', total_days: 7,  title: 'Read 10 Pages Daily',                 description: "Read 10 pages of a real book every day this week. Not articles. Not tweets. A book." },
    { slot: 3, order: 2,  emoji: '🧠', total_days: 7,  title: 'Identify Your Thought Patterns',      description: "Each day this week, catch one recurring negative thought. Write it down. Then write what's actually true." },
    { slot: 3, order: 3,  emoji: '🌀', total_days: 7,  title: 'Feel Your Feelings Week',             description: 'This week, when you feel something, name it out loud or in writing before moving on. Emotion labelling is a skill.' },
    { slot: 3, order: 4,  emoji: '💭', total_days: 7,  title: 'Values Audit',                        description: "Every day this week, reflect on one value that matters to you and whether your current life reflects it." },
    { slot: 3, order: 5,  emoji: '🫀', total_days: 7,  title: 'Boundaries Week',                     description: "Each day this week, notice one place where you need a boundary. You don't have to act — just notice." },
    { slot: 4, order: 1,  emoji: '💬', total_days: 7,  title: 'Share Something Real',                description: "Share one genuine, unpolished moment with your circle this week. Not a highlight reel. Something real." },
    { slot: 4, order: 2,  emoji: '🫂', total_days: 7,  title: 'Check On One Person',                 description: "Reach out to one person this week just to ask how they're doing. No agenda. Just care." },
    { slot: 4, order: 3,  emoji: '🌸', total_days: 7,  title: 'Write Someone a Kind Note',           description: 'Write a genuine, specific compliment or thank-you to someone this week. Send it. Generosity is mental health medicine.' },
    { slot: 4, order: 4,  emoji: '🎙️', total_days: 7,  title: 'Voice Note Your Circle',             description: 'Send your circle a voice note this week instead of typing. Connection is in the voice, not the words.' },
  ],
};

// ─── Helper: get next challenge in a slot, wrapping around to order 1 ─────────
function getNextChallenge(
  roadmapKey: string,
  slot: number,
  currentOrder: number,
) {
  const all = CHALLENGES_LIBRARY[roadmapKey] ?? [];
  const inSlot = all
    .filter((ch) => ch.slot === slot)
    .sort((a, b) => a.order - b.order);
  return inSlot.find((ch) => ch.order > currentOrder) ?? inSlot[0] ?? null;
}

// ─── Edge Function handler ────────────────────────────────────────────────────
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async () => {
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 1. Find all challenges that expired yesterday
  const { data: expired, error: fetchError } = await supabase
    .from('challenges')
    .select('id, circle_id, slot, order, circles ( roadmap_key )')
    .eq('ends_at', yesterday);

  if (fetchError) {
    console.error('fetchError:', fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  if (!expired?.length) {
    return new Response(JSON.stringify({ rotated: 0 }), { status: 200 });
  }

  const inserts: object[] = [];
  const skipped: string[] = [];

  for (const ch of expired) {
    const roadmapKey = (ch.circles as any)?.roadmap_key as string | undefined;
    if (!roadmapKey) { skipped.push(ch.id); continue; }

    const next = getNextChallenge(roadmapKey, ch.slot, ch.order);
    if (!next) { skipped.push(ch.id); continue; }

    inserts.push({
      circle_id:   ch.circle_id,
      title:       next.title,
      description: next.description,
      emoji:       next.emoji,
      total_days:  next.total_days,
      slot:        next.slot,
      order:       next.order,
      starts_at:   today,
      // ends_at: omitted — generated column
    });
  }

  if (!inserts.length) {
    return new Response(JSON.stringify({ rotated: 0, skipped }), { status: 200 });
  }

  // 2. Insert next challenges
  const { error: insertError } = await supabase
    .from('challenges')
    .insert(inserts);

  if (insertError) {
    console.error('insertError:', insertError);
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  console.log(`Rotated ${inserts.length}, skipped ${skipped.length}`);
  return new Response(
    JSON.stringify({ rotated: inserts.length, skipped }),
    { status: 200 },
  );
});