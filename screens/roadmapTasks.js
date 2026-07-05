// screens/roadmapTasks.js

// --- Task generators ---


const DEFAULT_DUR = 0.5;

const generateEveryNDays = ({
  title,
  daysTotal = 90,
  every = 2,
  startDay = 1,
  duration = DEFAULT_DUR,
  explanation = "",
  idBase = null,
  meta = {},

  // NEW: control whether "(Day X)" is appended to the task title
  includeDayInTitle = true,
}) => {
  const out = [];
  for (let day = startDay; day <= daysTotal; day += every) {
    out.push({
      task: includeDayInTitle ? `${title} (Day ${day})` : `${title}`,
      duration,
      explanation,
      ...(idBase ? { id: `${idBase}.day${day}` } : {}),
      meta: { kind: "recurring", day, every, ...meta },
    });
  }
  return out;
};


// Convenience wrappers
const generateDaily = (opts = {}) => generateEveryNDays({
  daysTotal: 90,
  every: 1,
  startDay: 1,
  ...opts,
});

const generateWeekly = ({
  title,
  weeksTotal = 13,
  every = 1,
  startWeek = 1,
  duration = DEFAULT_DUR,
  explanation = '',
  idBase = null,
  meta = {},
} = {}) => {
  const out = [];
  for (let week = startWeek; week <= weeksTotal; week += every) {
    out.push({
      task: `${title} (Week ${week})`,
      duration,
      explanation,
      ...(idBase ? { id: `${idBase}.week${week}` } : {}),
      meta: { kind: 'recurring_weekly', week, every, ...meta },
    });
  }
  return out;
};

const baseRoadmapTasks = {
  new_city: {
    jobhunt: [
            {
  task: "Create your updated CV",
  duration: 3,
  explanation: `
A clear and up-to-date CV helps employers quickly understand your background and suitability.

Step-by-step
1. Open Google Docs, Canva, or Notion and select a simple CV template.  
2. Add key sections: contact details, work experience, skills, and education.  
3. For each role, write 3–5 bullet points focused on measurable outcomes.  
4. Add a short line explaining your relocation timeline, if relevant.  
5. Export the CV as a PDF and save it in a dedicated job search folder.

Outcome
A concise CV that presents your experience clearly and supports your job applications.

Free Tools
Google Docs, Canva
`
},

      {
  task: "Create a target list of companies and roles",
  duration: 2,
  explanation: `
A focused list helps streamline your job search and prevents applying randomly.

Step-by-step
1. Identify 20–25 companies that align with your interests, industry, or preferred working style.  
2. For each company, note 1–2 role titles that match your skills and experience.  
3. Add links to their careers pages or job alerts.  
4. Save everything in a structured document or spreadsheet so you can track progress.

Outcome
A clear reference list that guides your job search and reduces decision fatigue.

Free Tools
Google Sheets, Notion
`
},

{
  task: "Write a short cover letter or outreach message template",
  duration: 1,
  explanation: `
Having a standard template saves time and ensures consistent communication across applications.

Step-by-step
1. Open a document and write 3–4 sentences introducing your background and interest in the city.  
2. Add a short statement on why you are exploring opportunities in this market.  
3. Create one version for cover letters and one for LinkedIn messages.  
4. Leave placeholders for company name and role title for quick customisation.

Outcome
Reusable templates that make applications and networking messages faster and more consistent.
`
},
      
{
  task: "Send five tailored job applications",
  duration: 5,
  explanation: `
Targeted applications increase the likelihood of hearing back from employers.

Step-by-step
1. Pick five roles from your target list that match your experience.  
2. Adjust your CV bullets to reflect the main skills the job description highlights.  
3. Write a short customised cover message for each application.  
4. Submit through the company website or job platform.  
5. Record each submission in your tracking sheet.

Outcome
Five quality applications aligned with your skills and career goals.
`
},
      {
  task: "Reach out to people working in your target companies or roles",
  duration: 2,
  explanation: `
Connecting with professionals in your field can provide insights and opportunities that aren’t listed publicly.

Step-by-step
1. Search LinkedIn for employees in your target companies or roles.  
2. Send a short message introducing yourself and asking one specific question.  
3. Keep messages brief and professional.  
4. Track who you contacted and any responses you receive.

Outcome
New connections that may lead to guidance, referrals, or industry insights.

Free Tools
LinkedIn
`
},

...generateDaily({
  title: "Daily job search block (30 mins)",
  daysTotal: 90,
  duration: 0.5,
  explanation: `
A short, focused daily block keeps momentum without burnout.

What to do
• Use this time for job applications, tailoring your CV, or networking outreach.
• Pick ONE priority per session; quality over quantity.
• Stop when the timer ends to avoid overwhelm.

Outcome
Consistent daily progress without decision fatigue.

Free Tools
Google Calendar, Notion
`,
  idBase: "new_city.jobhunt.daily_job_search",
  meta: { roadmap: "new_city", theme: "jobhunt" },
}),

...generateWeekly({
  title: "Weekly job search review (20 mins)",
  weeksTotal: 13,
  duration: 0.5,
  explanation: `
A weekly review helps you course-correct and stay strategic.

What to review
• Applications sent this week  
• Responses or follow-ups needed  
• Gaps in your CV, portfolio, or outreach  
• Priorities for the coming week

End by choosing ONE focus for next week.

Outcome
Clarity, direction, and smarter job-search decisions.

Free Tools
Notion, Google Sheets
`,
  idBase: "new_city.jobhunt.weekly_review",
  meta: { roadmap: "new_city", theme: "jobhunt" },
}),


      {
  task: "Create or update your portfolio",
  duration: 3,
  explanation: `
A portfolio helps employers assess your work quickly, especially in creative or technical roles.

Step-by-step
1. Choose a platform (Notion, Canva, GitHub Pages, or a simple Google Drive folder).  
2. Add 3–5 projects that best demonstrate your skills.  
3. For each project, include a short description, your role, and the key outcomes.  
4. Ensure the layout is easy to navigate and the links work.  
5. Export or publish the final version.

Outcome
A clear and accessible portfolio that strengthens job applications.

Free Tools
Notion, Canva, GitHub
`
}

    ],

job: [
      { task: 'Set up salary and benefits with HR (payroll, pension, perks) ', 
	duration: 1,
	explanation:'Use the HR portal to review and confirm your salary, payroll details, pension, and available benefits. Complete all selections and e-sign the required forms ahead of day one.'
	}
    ],

finances: [
  {
  task: "Estimate your rent, utilities, and local tax costs",
  duration: 2,
  explanation: `
Before choosing a neighbourhood or viewing flats, calculate your expected monthly housing expenses.

Step-by-step
1. Search rental listings in your preferred areas. 
2. Select 5–7 realistic options and record the monthly rent.  
3. Look up average utility costs for electricity, water, gas, and internet.  
4. Confirm your area's council tax band and calculate the monthly amount.  
5. Add all figures into a simple table to find your approximate monthly total.  
6. Compare the total to your income to ensure it fits your budget.

Outcome
A realistic estimate of monthly living costs to guide your housing decisions.

Free Tools
Google Sheets, Rightmove, Zoopla
`
},
 
{
  task: "Create a city-specific monthly budget",
  duration: 2,
  explanation: `
A structured budget gives you control and clarity as you adjust to the cost of living in your new city. 
Each budget category becomes a to-do item you can tick off once it has been added to your monthly budget.

How to do it
1. Open your budgeting tool (spreadsheet, Notion, or in-app budget builder).

2. Add the following budget categories one by one.  
   Mark each category as completed once it has been added and assigned an amount:

   □ Housing (rent, service charges)  
   □ Utilities (electricity, gas, water, internet)  
   □ Council / local tax  
   □ Transport (commute, passes, occasional travel)  
   □ Phone & subscriptions  
   □ Insurance (tenant, contents, health if applicable)  
   □ Groceries  
   □ Eating out & cafés  
   □ Social & leisure  
   □ Fitness & wellbeing  
   □ Personal spending  
   □ Savings (emergency fund, short-term goals)

3. Enter a realistic monthly amount for each category based on research and estimates.

4. Add your net monthly income (after tax) and compare it to your total planned spending.

5. Adjust category amounts until you reach a balanced budget or a small surplus.

6. Save this budget as your baseline city budget and label it clearly (e.g. “London – Month 1”).

Outcome
A complete, city-specific monthly budget where every spending category is defined, reviewed, and checked off, which gives you a clear financial baseline for your new chapter.

Free Tools
Google Sheets, Notion, banking apps with budgeting features
`
},

  {
  task: "Open a local bank account or update your existing one",
  duration: 2,
  explanation: `
A local account helps you avoid fees and makes everyday transactions easier.

Step-by-step
1. Compare local banks or digital banks that operate in your new city.  
2. Review required documents for account opening (ID, proof of address, etc.).  
3. Submit an online application or visit a branch.  
4. If keeping your current bank, update your city and address.  
5. Save your account information securely.

Outcome
A functioning local or updated bank account ready for daily expenses.

Free Tools
Monzo, Revolut, Starling
`
},
  {
  task: "Build a three-month emergency fund plan",
  duration: 2,
  explanation: `
An emergency fund gives you financial stability while settling into a new city.

Step-by-step
1. Calculate three months of essential expenses (rent, food, transport, utilities).  
2. Note how much you currently have saved.  
3. Set a realistic monthly savings goal.  
4. Automate transfers from your main account where possible.

Outcome
A structured plan for building an emergency fund over time.
`
},
  {
  task: "Review and cancel old or non-local subscriptions",
  duration: 1,
  explanation: `
Removing unused subscriptions reduces monthly expenses and financial clutter.

Step-by-step
1. Check your bank statements or phone settings for recurring charges.  
2. List subscriptions you no longer use or that are tied to your previous city.  
3. Cancel or pause any that are not needed.  
4. Update payment details for the ones you keep.

Outcome
Lower monthly spending and a clearer overview of your active subscriptions.
`
},
 {
  task: "Choose an expense tracker and log one week of spending",
  duration: 1,
  explanation: `
Tracking your spending for a week helps identify habits and any needed adjustments.

Step-by-step
1. Select a simple tracker app or spreadsheet.  
2. Log every purchase for seven days, including small and one-off expenses.  
3. Categorise each expense under one of the following:
   • Housing (rent, service charges)  
   • Utilities (electricity, gas, water, internet)  
   • Council or local tax  
   • Transport (public transport, fuel, taxis)  
   • Groceries  
   • Eating out & cafés  
   • Subscriptions (streaming, apps, memberships)  
   • Phone & mobile plans  
   • Insurance  
   • Fitness & wellbeing  
   • Social & leisure  
   • Personal spending (clothes, beauty, hobbies)  
   • Health & medical  
   • Home & household items  
   • Travel & trips  
   • Miscellaneous or one-off costs  
4. Review which categories are higher or lower than expected and note any patterns.

Outcome
A clear, honest snapshot of your real spending habits, giving you a strong foundation for adjusting your budget in your new city.

Free Tools
Monzo, Notion, Google Sheets
`
},

  {
  task: "Find three affordable food options and two budget grocery stores",
  duration: 1,
  explanation: `
Identifying low-cost food options early helps manage your monthly budget.

Step-by-step
1. Search for affordable cafés, takeaways, or meal deals in your area.  
2. Check nearby grocery stores and compare average prices.  
3. Save locations in Google Maps for easy access.  
4. Try at least one new place each week.

Outcome
Reliable food and grocery options that support your budget.

Free Tools
Google Maps
`
},
  {
  task: "Calculate commute costs, including caps and passes",
  duration: 1,
  explanation: `
Understanding commute costs helps you plan your transport budget.

Step-by-step
1. Check the transport options in your area (bus, train, Metro, Tube).  
2. Look up daily and weekly caps and monthly passes.  
3. Estimate commute frequency and calculate average monthly cost.  
4. Compare options to choose the most affordable route.

Outcome
An accurate estimate of your monthly transport spending.

Free Tools
City transport websites, Google Maps
`
},
  {
  task: "Set a 60-day savings goal with weekly transfers",
  duration: 0.5,
  explanation: `
Short-term goals help build savings quickly and consistently.

Step-by-step
1. Choose a realistic amount to save over the next 60 days.  
2. Divide it into weekly transfer amounts.  
3. Set up automatic transfers if possible.  
4. Track progress weekly.

Outcome
A structured short-term savings habit.
`
},
  {
  task: "Compare phone/SIM plans and switch if beneficial",
  duration: 1,
  explanation: `
Switching to a local or better-value phone plan can significantly reduce monthly costs.

Step-by-step
1. Review your current plan and monthly charges.  
2. Compare local SIM providers and data packages.  
3. Pick the plan with the best coverage and price for your needs.  
4. Activate the new SIM or update your account details.

Outcome
A cost-effective mobile plan suited to your new city.

Free Tools
USwitch, CompareTheMarket
`
},
  {
  task: "Review insurance needs (tenant, contents, liability)",
  duration: 2,
  explanation: `
Insurance protects you against unexpected costs when settling into a new home.

Step-by-step
1. Check what coverage is standard for renters in your new city.  
2. Compare policies from different providers.  
3. Calculate monthly or annual costs.  
4. Choose a policy that fits your needs and budget.

Outcome
Appropriate insurance coverage for your living situation.
`
},
  {
  task: "Open a savings or ISA account for emergency funds",
  duration: 1,
  explanation: `
A dedicated savings account helps your emergency fund grow steadily.

Step-by-step
1. Compare high-interest savings accounts or ISAs.  
2. Review withdrawal rules and interest rates.  
3. Open the account online.  
4. Transfer your initial amount and set monthly contributions.

Outcome
A secure savings account that supports long-term financial stability.
`
},
  {
  task: "Create a moving-costs tracker",
  duration: 1,
  explanation: `
Tracking moving-related expenses helps you stay within budget.

Step-by-step
1. List expected costs: deposit, first month’s rent, transport, storage, supplies.  
2. Add estimated amounts for each.  
3. Enter actual costs as you incur them.  
4. Review and adjust your budget accordingly.

Outcome
A clear overview of your moving-related spending.

Free Tools
Google Sheets, Notion
`
},
  {
  task: "Set bill payment reminders and notifications",
  duration: 1,
  explanation: `
Reminders help prevent late fees and missed payments.

Step-by-step
1. List all monthly bills and due dates.  
2. Add reminders to your digital calendar.  
3. Enable notifications 2–3 days before each due date.  
4. Where possible, set up automatic payments.

Outcome
Consistent, on-time payments with minimal effort.

Free Tools
Google Calendar
`
},
  {
  task: "Negotiate one recurring bill",
  duration: 1,
  explanation: `
Negotiating recurring bills can lower your monthly expenses.

Step-by-step
1. Choose a bill with potential flexibility (internet, phone, gym).  
2. Research competitor prices.  
3. Contact your provider and request a price review.  
4. If possible, switch to a lower-cost plan.

Outcome
Reduced monthly spending and better value for money.
`
},
  {
  task: "Learn the local credit score system and check your score",
  duration: 1,
  explanation: `
Understanding how credit works in your new country helps with renting, borrowing, and services.

Step-by-step
1. Research how credit scores are calculated locally.  
2. Sign up for a free credit-checking platform.  
3. Review your report for accuracy.  
4. Make note of actions that can help you improve your score.

Outcome
A clear understanding of your credit position in the new city.

Free Tools
ClearScore, Experian
`
},

  {
  task: "Review your 30-day budget versus actual spending",
  duration: 2.5,
  explanation: `
Comparing your planned budget to your actual spending helps you adjust categories and stay financially on track.

Step-by-step
1. Open your budget document or app from the start of the month.  
2. Export or review your spending from your banking app or expense tracker.  
3. Compare each category (rent, groceries, transport, etc.) to your original estimates.  
4. Identify areas where you overspent or underspent.  
5. Adjust your budget for the next month based on these patterns.

Outcome
A clearer understanding of your spending habits and an updated budget that better reflects your real costs.

Free Tools
Money Dashboard, Monzo categories, Google Sheets
`
}

],

    // 2) PREP & LOGISTICS
prep: [
  {
  task: "Book 10–14 days of temporary accommodation",
  duration: 1,
  explanation: `
Temporary accommodation gives you time to explore neighbourhoods and arrange a long-term home.

Step-by-step
1. Search for short-term stays near the areas you are considering living in.  
2. Compare prices, transport links, and cancellation policies.  
3. Book accommodation that aligns with your budget and schedule.  
4. Save booking confirmations in your move folder.

Outcome
A secure base for your first days in the new city while you settle in and view properties.

Free Tools
Airbnb, Booking.com
`
},

{
  task: "Save accommodation address and check-in details",
  duration: 0.5,
  explanation: `
On arrival day, you want zero digging through emails and zero stress.

Step-by-step
1. Copy the full address into your Notes app.
2. Save the location in Google Maps (label it “Temp Home”).
3. Save check-in instructions (codes, keys, concierge, timings).
4. Screenshot the details for offline access.

Outcome
Instant access to your accommodation details, even without internet.

Free Tools
Notes app, Google Maps
`
},
{
  task: "Research long-term neighbourhood options",
  duration: 0.5,
  explanation: `
A shortlist of areas gives you direction (and stops you spiralling on Rightmove at 1am).

Step-by-step
1. Pick 5–7 neighbourhoods to explore.
2. For each one, note: rent range, commute time, vibe, safety/lighting.
3. Save 2–3 listings per area to compare.
4. Shortlist your top 3 based on budget + lifestyle fit.

Outcome
A focused list of neighbourhoods worth viewing seriously.

Free Tools
Google Maps, Rightmove/Zoopla, Notion/Notes
`
},
{
  task: "Prepare flat-viewing questions",
  duration: 0.5,
  explanation: `
Good questions prevent expensive surprises later.

Step-by-step
1. Create a short checklist you can reuse.
2. Include: bills included, council tax band, heating type, damp/mould history.
3. Ask about contract length, break clause, deposit protection, repairs process.
4. Save the questions as a note you can open during viewings.

Outcome
A ready-to-use viewing checklist that protects your time and money.

Free Tools
Notes app, Notion
`
},

{
  task: "Book transport to the new city",
  duration: 0.5,
  explanation: `
Booking early reduces cost and removes a major mental load.

Step-by-step
1. Confirm your preferred travel date and arrival time window.
2. Compare 2–3 transport options (flight/train/bus).
3. Book the best combination of price + arrival convenience.
4. Save confirmations and add the trip to your calendar.

Outcome
Travel booked and documented with a clear arrival timeline.

Free Tools
Google Calendar, airline/train apps
`
},
{
  task: "Book airport or station transfer",
  duration: 0.5,
  explanation: `
The first 60 minutes in a new city should be smooth, not chaotic.

Step-by-step
1. Decide your transfer option (Uber/taxi/public transport).
2. If booking a taxi, confirm pickup point and luggage allowance.
3. If using public transport, save the route + backup option.
4. Save instructions and links in Notes.

Outcome
A clear, reliable plan from arrival point to accommodation.

Free Tools
Citymapper, Google Maps, Uber/Bolt
`
},
{
  task: "Save travel confirmations offline",
  duration: 0.5,
  explanation: `
Offline access = no panic if WiFi fails or your email won’t load.

Step-by-step
1. Screenshot tickets/boarding passes/booking confirmations.
2. Save them in a dedicated album (e.g., “Move Travel”).
3. If available, download PDFs to your phone files.
4. Star/flag the emails for quick access.

Outcome
All travel documents accessible instantly, even offline.

Free Tools
Phone screenshots, Files app, Gmail
`
},
{
  task: "Prepare arrival-day plan",
  duration: 0.5,
  explanation: `
A simple plan prevents decision fatigue when you are tired and carrying bags.

Step-by-step
1. Write a 5-step timeline (arrive → transfer → check-in → food → sleep).
2. Save 1–2 food options near accommodation.
3. Note key essentials to do within 24 hours (SIM, groceries, commute check).
4. Share your ETA with someone you trust.

Outcome
A calm arrival flow with no last-minute decisions.

Free Tools
Notes app, Google Maps
`
},

{
  task: "Scan passport and ID",
  duration: 0.5,
  explanation: `
Digital copies save you if documents get lost or you need quick verification.

Step-by-step
1. Scan passport photo page + any relevant ID cards.
2. Save as clear, named files (e.g., “Passport_YourName_2026”).
3. Upload to your document vault.
4. Optional: keep one offline copy in phone files.

Outcome
Secure digital backups of key ID documents.

Free Tools
iPhone Scan / Adobe Scan, Google Drive/iCloud
`
},
{
  task: "Scan contracts (lease, job, visa if relevant)",
  duration: 0.5,
  explanation: `
Contracts are the documents you’ll need most when setting up services.

Step-by-step
1. Gather PDFs or paper copies (lease, job contract, visa docs).
2. Scan anything not already digital.
3. Rename files clearly with dates.
4. Upload to your document vault and star the folder.

Outcome
All contracts securely stored and easy to retrieve.

Free Tools
Google Drive, Adobe Scan, iPhone Scan
`
},
{
  task: "Back up documents to cloud storage",
  duration: 1.0,
  explanation: `
Your move becomes instantly calmer when everything lives in one place.

Step-by-step
1. Choose one primary cloud location (Drive/iCloud).
2. Upload your ID, bookings, contracts, and key screenshots.
3. Check files open correctly on your phone.
4. Enable two-factor authentication if available.

Outcome
A reliable cloud backup you can access anywhere.

Free Tools
Google Drive, iCloud
`
},
{
  task: "Create a digital document folder",
  duration: 0.5,
  explanation: `
A clear folder structure reduces admin chaos later.

Step-by-step
1. Create a folder called “New City Move”.
2. Add subfolders: ID, Housing, Travel, Work, Banking, Healthcare.
3. Move your scanned documents into the right subfolder.
4. Pin/star the main folder for quick access.

Outcome
A tidy document vault that makes admin fast.

Free Tools
Google Drive, iCloud, Dropbox
`
},

{
  task: "Decide what to pack, ship, sell, or donate",
  duration: 1.0,
  explanation: `
Sorting upfront saves money and reduces the amount you physically move.

Step-by-step
1. Walk through each room and list key items.
2. Categorise each: pack / ship / sell / donate / store.
3. Prioritise bulky items first (furniture, heavy appliances).
4. Set 1–2 collection or selling dates.

Outcome
A clear plan for everything you own, so there is no last-minute chaos.

Free Tools
Notes app, Vinted, Facebook Marketplace
`
},
{
  task: "Create packing categories (clothes, work, essentials)",
  duration: 0.5,
  explanation: `
Categories make unpacking faster and reduce the “where is everything?” stress.

Step-by-step
1. Create categories: clothes, work, toiletries, kitchen, documents, tech.
2. Assign 1–2 boxes/bags to each category.
3. Make a short list of “must access first” items.
4. Keep categories consistent across all labels.

Outcome
A packing system that makes unpacking logical and quick.

Free Tools
Notes app, Google Sheets
`
},
{
  task: "Pack your first-week essentials bag",
  duration: 1.0,
  explanation: `
This is the bag that saves you when everything else is in boxes.

Step-by-step
1. List essential items such as chargers, adapters, toiletries, medications, key documents, and 2 outfits.
2. Add laptop or work materials if needed.
3. Pack everything into one separate, easy-access bag.
4. Keep this bag with you rather than in checked luggage or moving boxes.
5. Double-check that you can access it immediately on arrival.

Outcome
Immediate access to key items without needing to unpack everything at once during your first days in the new city.

Free Tools
Notes app
`
},
{
  task: "Label boxes or bags clearly",
  duration: 0.5,
  explanation: `
Labelling prevents the “open every box to find one thing” nightmare.

Step-by-step
1. Label each box with category + priority (e.g. “Kitchen – Week 1”).
2. Add room destination if known (bedroom, bathroom).
3. Optional: number boxes and keep a simple inventory note.
4. Place labels on the top + one side for visibility.

Outcome
Boxes that are easy to identify and unpack in the right order.

Free Tools
Marker + tape, Notes app
`
},

{
  task: "List utilities to cancel or transfer",
  duration: 0.5,
  explanation: `
Leaving utilities unmanaged can cost you double-billing.

Step-by-step
1. List your current providers: electricity, gas, water, internet, phone.
2. Check contract end dates and cancellation notice periods.
3. Identify which can transfer vs must cancel.
4. Add cancellation/transfer dates to your calendar.

Outcome
A clean utility exit plan with no surprise charges.

Free Tools
Google Calendar, Notes app
`
},
{
  task: "Set aside emergency cash for arrival",
  duration: 0.5,
  explanation: `
Emergency cash covers you if cards fail or unexpected costs appear.

Step-by-step
1. Choose a realistic amount (e.g., £100–£300 depending on trip).
2. Withdraw cash in small notes.
3. Store separately from your main wallet.
4. Note what it’s reserved for (transport, food, emergency).

Outcome
A safety buffer for arrival-day surprises.

Free Tools
Bank/ATM
`
},
{
  task: "Notify bank of travel if needed",
  duration: 0.5,
  explanation: `
Some banks still flag transactions abroad. Better safe than card-blocked.

Step-by-step
1. Check your bank app settings for “travel notice”.
2. If required, add destination + travel dates.
3. Ensure your contact details are correct for fraud alerts.

Outcome
Reduced risk of declined payments during travel.

Free Tools
Bank app
`
},

  {
  task: "Order a local SIM or eSIM",
  duration: 0.5,
  explanation: `
Setting up basic connectivity early ensures you can navigate and communicate easily on arrival.

Step-by-step
1. Compare local SIM or eSIM providers.  
2. Order one that offers good coverage and cost-effective plans.  
3. Save activation steps and support contact.

Outcome
Reliable mobile data from your first day in the city.

Free Tools
Local mobile provider websites, Revolut/airalo-style eSIM options (if relevant)
`
},
{
  task: "Download essential city apps",
  duration: 0.5,
  explanation: `
The right apps make your first week smoother instantly.

Step-by-step
1. Download: maps, transport (Citymapper), banking, rentals, food delivery.
2. Create a folder called “New City” on your phone.
3. Log in to the apps you’ll need immediately.

Outcome
Key apps ready so you can navigate and settle quickly.

Free Tools
Google Maps, Citymapper, local transport apps, UberEats
`
},

{
  task: "Ensure phone storage is cleared and backed up",
  duration: 1.0,
  explanation: `
Your phone will be your lifeline. Keep it fast, backed up, and reliable.

Step-by-step
1. Back up photos/videos to cloud (iCloud/Google Photos).
2. Delete large downloads and unused apps.
3. Check you have space for offline maps and travel docs.
4. Restart your phone after cleanup.

Outcome
A ready-to-go phone with storage, backups, and stability.

Free Tools
iCloud, Google Photos
`
},
{
  task: "Review checklist before travel",
  duration: 0.5,
  explanation: `
A final review prevents the classic “forgotten one crucial thing” moment.

Step-by-step
1. Do a 10-minute scan of your move tasks.
2. Confirm: documents, travel confirmations, essentials bag, transfer plan.
3. Make a quick “last 24 hours” mini-list.
4. Tick off anything still pending.

Outcome
Peace of mind that you are actually ready to go.

Free Tools
In-app checklist, Notes app
`
},
{
  task: "Schedule weekly checklist review",
  duration: 0.5,
  explanation: `
Weekly reviews stop the move from becoming a messy pile of half-done tasks.

Step-by-step
1. Pick one weekly slot (e.g., Sunday 30 mins).
2. Add a recurring reminder in your calendar.
3. During review: close open loops and add missing tasks.
4. Keep it short and consistent.

Outcome
A controlled move where nothing silently slips.

Free Tools
Google Calendar
`
},

{
  task: "Create first-week grocery list",
  duration: 2,
  explanation: `
Planning your first essentials run helps you avoid repeated trips and keeps your first days efficient.
Use the checklist below and tick items off once they have been added to your shopping list or purchased.

How to do it
1. Open your notes app or shopping list.
2. Add the items below under each category.
3. Mark items as completed once bought.
4. Keep the list intentionally minimal; this is about settling in, not fully stocking a home.

First grocery & home-basics checklist

Food basics (first week)
□ Bread or wraps  
□ Milk or milk alternative  
□ Eggs  
□ Butter or spread  
□ Cheese or simple protein (chicken, tofu, beans)  
□ Pasta, rice, or noodles  
□ Simple sauce (tomato, pesto, soy)  
□ Cooking oil  
□ Salt and pepper  
□ One easy breakfast option (cereal, yoghurt, oats)  
□ One snack option (fruit, nuts, crackers)

Fridge & freezer essentials
□ Fresh fruit  
□ Fresh vegetables (2–3 basics you’ll actually use)  
□ Ready-to-eat or freezer meal for day one  
□ Condiments you use daily (ketchup, mustard, chilli, etc.)

Cleaning basics
□ Washing-up liquid  
□ Dish sponge or cloth  
□ Multi-surface cleaner  
□ Bin bags  
□ Kitchen roll or paper towels  
□ Laundry detergent  

Bathroom & personal care
□ Toilet paper  
□ Hand soap  
□ Shower gel or soap  
□ Shampoo and conditioner  
□ Toothpaste and toothbrush  
□ Deodorant  

Home essentials
□ Tea towels  
□ Dishcloths  
□ Storage bags or foil  
□ Basic light bulbs (if unsure what’s fitted)  

Optional comfort items (nice-to-have)
□ Tea or coffee  
□ Mug or glass if needed  
□ Candle or small comfort item  

5. Check nearby supermarkets or convenience stores.
6. Save opening hours and directions in your phone.
7. Plan to do this shop on arrival day or the morning after.

Outcome
A calm, well-prepared first week with food, hygiene, and basics covered.

Free Tools
Google Maps, Notes app
`
},

  {
  task: "Set up mail forwarding and update key accounts",
  duration: 1,
  explanation: `
Redirecting your mail prevents missed letters and ensures important documents reach you.

Step-by-step
1. Use the official mail service to set up forwarding from your old address.  
2. Update your address in key accounts: banks, employer, subscriptions, and services.  
3. Make a checklist to ensure all important accounts are covered.  
4. Confirm forwarding start and end dates.

Outcome
Mail and important documents continue to reach you without interruption.

Free Tools
Postal service forwarding tool
`
},
  {
  task: "Save emergency contacts and nearest services",
  duration: 0.5,
  explanation: `
Knowing where essential services are located helps you respond quickly in urgent situations.

Step-by-step
1. Map the nearest GP, pharmacy, hospital, and police station.  
2. Save addresses and phone numbers in your contacts app.  
3. Add at least two local emergency contacts if applicable.  
4. Pin these places in your preferred map app.

Outcome
Quick access to important services in case of emergencies.

Free Tools
Google Maps
`
},
  {
  task: "Do a mock commute during peak hours",
  duration: 2,
  explanation: `
Testing your commute helps you understand travel time, route options, and potential delays.

Step-by-step
1. Choose the time you would usually commute to work.  
2. Travel the full route using your preferred transport method.  
3. Time the journey and note any delays or transfers.  
4. Repeat once at a different time to compare.

Outcome
A realistic understanding of your daily commute before committing to a new home.
`
},
  {
  task: "Block time in your calendar for unpacking and admin",
  duration: 0.5,
  explanation: `
Scheduling unpacking time ensures it does not get delayed or forgotten.

Step-by-step
1. Choose two evenings or time blocks within your first week.  
2. Add them to your digital calendar as dedicated tasks.  
3. Use the first block for unpacking and the second for admin tasks.  
4. Adjust timings based on progress.

Outcome
A structured plan to settle in without feeling rushed.
`
},
  {
  task: "Create packing labels or a QR-code inventory",
  duration: 1.0,
  explanation: `
Labelling boxes clearly helps you find items quickly and reduces unpacking chaos.

Step-by-step
1. Assign each box a number or category.  
2. Create a list describing what’s inside each box.  
3. Optional: use a QR code generator linked to a digital inventory.  
4. Tape labels securely on each box.

Outcome
An organised packing system that makes unpacking faster and more efficient.

Free Tools
Google Sheets, QR code generator
`
},
{
  task: "Order a basic home toolkit and essential supplies",
  duration: 0.5,
  explanation: `
A small toolkit helps you handle simple fixes and setup tasks during move-in.
Use the checklist below and mark items as completed once they have been ordered or purchased.

How to do it
1. Open your shopping list or notes app.
2. Add the items below.
3. Tick items off once bought.
4. Keep this kit in one easy-to-find place during your first weeks.

Basic home toolkit checklist

Core tools
□ Flat-head screwdriver  
□ Phillips (cross-head) screwdriver  
□ Small adjustable wrench  
□ Measuring tape  
□ Scissors  
□ Utility knife or box cutter  
□ Small hammer  

Fixing & setup supplies
□ Multi-purpose tape (duct tape or strong tape)  
□ Double-sided tape or adhesive strips  
□ Wall hooks or removable hooks  
□ Assorted screws and wall plugs  
□ Zip ties or cable ties  

Electrical & lighting
□ Light bulbs (check fitting type if possible)  
□ Extension lead or power strip  
□ Batteries (AA / AAA)

Cleaning & protection
□ Microfibre cloths  
□ Gloves (cleaning or DIY)  

Move-in extras (highly useful)
□ Door stopper  
□ Allen key set (for flat-pack furniture)  
□ Basic picture hooks  

5. Order a compact toolkit set if you don’t already own these items.
6. Store everything together in a small box, bag, or drawer.

Outcome
All basic tools and supplies ready for unpacking, small fixes, and everyday setup without last-minute stress.

Free Tools
Amazon, local hardware stores
`
},

  {
  task: "Set up a shared emergency plan document",
  duration: 0.5,
  explanation: `
A shared emergency document ensures household members have access to important information.

Step-by-step
1. Create a simple document with emergency contacts, addresses, and key instructions.  
2. Add medical information or local service details if relevant.  
3. Share the document with household members.  
4. Store it in a location that is easy to access.

Outcome
A centralised reference that supports safety and preparedness.

Free Tools
Google Docs
`
},
  {
  task: "Block time in your calendar for flat viewings",
  duration: 0.5,
  explanation: `
Setting aside time for viewings helps you stay consistent and prepared during your search.

Step-by-step
1. Decide which days and time slots you can dedicate to viewings.  
2. Add recurring blocks to your calendar for 2–3 weeks.  
3. Share availability with agents or landlords promptly.  
4. Adjust the schedule as you start receiving viewing times.

Outcome
An organised approach to attending viewings and securing a suitable home.

Free Tools
Google Calendar
`
},
  {
  task: "Download local safety or health apps",
  duration: 0.5,
  explanation: `
Local safety and health apps help you stay informed and prepared.

Step-by-step
1. Search for official safety, emergency, or health apps used in your new city.  
2. Download at least one relevant app.  
3. Enable notifications if useful.  
4. Save emergency numbers in your phone contacts.

Outcome
Quick access to safety alerts and health resources.

Free Tools
NHS App (UK), local emergency apps
`
},
  {
  task: "Update your location on LinkedIn and your CV",
  duration: 1.0,
  explanation: `
Updating your location helps employers and recruiters recognise that you are available for local opportunities.

Step-by-step
1. Edit the location on your LinkedIn profile to your new city or “Relocating to X”.  
2. Update your CV header with the same information.  
3. Review your job preferences in LinkedIn or job boards.  
4. Save all changes and check that they display correctly.

Outcome
Improved visibility in local job searches and better alignment with your relocation timeline.

Free Tools
LinkedIn
`
},
  {
  task: "Back up your device photos and free storage space",
  duration: 2,
  explanation: `
Freeing up device storage ensures your phone is ready for travel and navigation during the move.

Step-by-step
1. Upload photos and videos to a cloud service.  
2. Delete files from your device after confirming the backup.  
3. Clear unused apps or large downloads.  
4. Restart your device to complete the cleanup.

Outcome
A device with enough storage and performance for travel, navigation, and documentation.

Free Tools
Google Photos, iCloud
`
}
],


visa: [

  {
    task: "Confirm your visa type and eligibility requirements",
    duration: 1.5,
    explanation: `
Before booking anything, understand exactly what status you qualify for and what it allows.

Step-by-step
1. Visit the official government immigration website for your destination country.
2. Identify the visa or permit that matches your situation (work, student, spouse, etc.).
3. Note:
   • Length of stay allowed
   • Work permissions
   • Required documents
   • Processing times
4. Save links or screenshots in your document folder.

Outcome
Clarity on the correct visa pathway and requirements.

Free Tools
Official government immigration website
`
  },

  {
    task: "Create a visa document checklist",
    duration: 1,
    explanation: `
Having all documents ready early prevents delays and stress.

Step-by-step
1. Open Notes or a document.
2. Add required items such as:
   • Passport
   • Job offer or contract
   • Proof of funds
   • Bank statements
   • Accommodation proof
   • Passport photos
   • Insurance
3. Tick items off as you collect them.
4. Scan each document to cloud storage.

Outcome
All paperwork prepared and organised in one place.

Free Tools
Google Drive, Notes app
`
  },

  {
    task: "Book your visa appointment or submit application",
    duration: 1.0,
    explanation: `
Appointments fill quickly, so book early.

Step-by-step
1. Create an account on the official visa portal.
2. Complete the application form carefully.
3. Upload required documents.
4. Book your biometrics or interview appointment.
5. Save confirmation emails.

Outcome
Application officially submitted and appointment secured.
`
  },

  {
    task: "Prepare for biometrics or interview",
    duration: 1.0,
    explanation: `
Being prepared avoids repeat visits or delays.

Step-by-step
1. Print appointment confirmation.
2. Prepare passport and originals of all documents.
3. Bring photos if required.
4. Arrive 10–15 minutes early.
5. Keep receipts or tracking numbers.

Outcome
Smooth, stress-free appointment.
`
  },

  {
    task: "Track application status weekly",
    duration: 0.5,
    explanation: `
Staying informed helps you plan flights and housing realistically.

Step-by-step
1. Log into the visa portal.
2. Check application progress.
3. Save updates or emails.
4. Note expected approval date.

Outcome
Clear visibility on your timeline.
`
  },

  {
    task: "Arrange health insurance if required",
    duration: 1,
    explanation: `
Many visas require proof of coverage before entry.

Step-by-step
1. Check minimum coverage requirements.
2. Compare providers and prices.
3. Choose a compliant plan.
4. Download policy documents.
5. Save proof for your application.

Outcome
Valid insurance meeting visa requirements.
`
  },

  {
    task: "Plan entry timeline around visa approval",
    duration: 0.5,
    explanation: `
Avoid booking travel before approval windows.

Step-by-step
1. Confirm earliest legal entry date.
2. Check visa start and expiry rules.
3. Book flights within that window.
4. Align housing and move-in dates.

Outcome
Travel plans aligned with legal status.
`
  },

  {
    task: "Complete post-arrival registration (residence permit or local registration)",
    duration: 1,
    explanation: `
Many countries require registration shortly after arrival.

Step-by-step
1. Research required post-arrival steps (BRP pickup, residence card, address registration).
2. Book appointments if necessary.
3. Bring passport and visa approval.
4. Submit fingerprints or photos if requested.
5. Save confirmation documents.

Outcome
Fully legal and registered locally.
`
  },

  {
    task: "Store all visa approvals and IDs in your document vault",
    duration: 0.5,
    explanation: `
Keeping digital copies prevents panic if documents are lost.

Step-by-step
1. Scan visa approval, permits, and ID cards.
2. Upload to your secure document vault.
3. Rename clearly with dates.
4. Keep one offline backup.

Outcome
Secure, accessible copies of all legal documents.
`
  },

],


// ——— 3) SETTLING ADMIN ———
admin: [
  {
    task: "Register with a GP or primary care practice",
    duration: 1,
    explanation: `
Registering early ensures you can access healthcare smoothly when you need it, without last-minute stress.

Step-by-step
1. Search for GP or primary care practices near your home postcode.  
2. Check whether they are accepting new patients.  
3. Complete the online registration form or book an in-person registration if required.  
4. Upload or bring ID and proof of address if requested.  
5. Save confirmation emails or screenshots in your admin folder.

Outcome
You are officially registered for healthcare, with access to appointments, prescriptions, and referrals when needed.
`
  },
  {
    task: "Set up council or local tax or residency steps",
    duration: 1.5,
    explanation: `
Local registrations are easy to forget and annoying to fix later. Doing this early keeps everything clean and penalty-free.

Step-by-step
1. Visit your local council or authority website.  
2. Register your address for council tax, residency, or local services.  
3. Confirm household details and move-in date.  
4. Set up payment method or direct debit if applicable.  
5. Save your reference numbers or confirmation emails.

Outcome
Your address is officially registered and compliant with local requirements.
`
  },
  {
    task: "Create or tidy your tax account and login",
    duration: 1.5,
    explanation: `
Having clean access to your tax account saves time, confusion, and future panic.

Step-by-step
1. Log in to your government tax portal (or create an account if needed).  
2. Reset passwords or recover usernames if access is unclear.  
3. Check that your name, address, and employment status are correct.  
4. Enable two-factor authentication if available.  
5. Save login details securely in your document vault.

Outcome
A fully accessible tax account, ready for filings, updates, and future admin.
`
  },
  {
    task: "Get or confirm local ID or residence card if relevant",
    duration: 1.5,
    explanation: `
Local ID or residency documentation often unlocks services, banking, and contracts, it’s worth prioritising.

Step-by-step
1. Check whether your country or city requires local ID or residence registration.  
2. Review required documents (passport, visa, lease, photos).  
3. Book an appointment or submit an online application.  
4. Attend appointment or upload documents.  
5. Track expected delivery or confirmation timelines.

Outcome
Your legal status and identification are fully recognised locally.
`
  },
  {
    task: "Open utilities and take meter photos",
    duration: 1,
    explanation: `
Correct utility setup prevents billing errors and awkward disputes later.

Step-by-step
1. Identify current providers for electricity, gas, and water.  
2. Register accounts in your name or confirm transfers.  
3. Take clear photos of meters on move-in day.  
4. Submit readings to providers where required.  
5. Save photos and account numbers in your admin folder.

Outcome
Utilities correctly set up with accurate billing from day one.
`
  },
  {
    task: "Book home internet install or transfer",
    duration: 1.0,
    explanation: `
Reliable internet is a non-negotiable, especially if you work or study from home.

Step-by-step
1. Check which providers serve your address.  
2. Compare speeds, prices, and contract lengths.  
3. Book installation or transfer date.  
4. Confirm equipment delivery or engineer visit.  
5. Save confirmation details.

Outcome
Internet ready (or scheduled) with no unnecessary downtime.
`
  },
  {
    task: "Register with dentist or optician near home",
    duration: 1,
    explanation: `
Registering before you need care saves stress when something comes up.

Step-by-step
1. Search for local dentists and opticians accepting new patients.  
2. Register online or by phone.  
3. Note waiting times for appointments.  
4. Save contact details in your phone.  

Outcome
You’re registered and prepared and no scrambling later.
`
  },
  {
    task: "Set up local emergency and non-emergency numbers",
    duration: 0.5,
    explanation: `
Knowing who to call and having it saved brings quiet peace of mind.

Step-by-step
1. Look up emergency and non-emergency numbers for your city.  
2. Save them in your phone contacts.  
3. Label clearly (e.g. “Emergency – City”).  
4. Add nearest hospital or urgent care if useful.

Outcome
Instant access to help if you ever need it.
`
  },
  {
    task: "Create a secure document vault",
    duration: 1.0,
    explanation: `
A single source of truth for your paperwork keeps admin calm and controlled.

Step-by-step
1. Create a main folder in Google Drive, iCloud, or similar.  
2. Add subfolders: ID, Housing, Tax, Banking, Healthcare, Work.  
3. Upload scans or PDFs of key documents.  
4. Name files clearly with dates.  
5. Enable security features where available.

Outcome
All important documents stored safely and easy to find.
`
  },
  {
    task: "Add city address to banks and critical services",
    duration: 0.5,
    explanation: `
Keeping addresses aligned avoids missed letters, blocked accounts, and admin loops.

Step-by-step
1. List banks, insurers, employer portals, subscriptions, and official services.  
2. Update your address in each system.  
3. Confirm changes via email or profile check.  

Outcome
All essential services correctly linked to your new address.
`
  },
  {
    task: "Register for electoral roll if eligible",
    duration: 0.5,
    explanation: `
If eligible, registering supports both civic participation and practical admin like credit checks.

Step-by-step
1. Check eligibility requirements.  
2. Complete online registration.  
3. Save confirmation details.

Outcome
You are officially registered and recognised at your new address.
`
  },
  {
    task: "Install and connect healthcare app",
    duration: 0.5,
    explanation: `
Digital access makes healthcare admin faster and more transparent.

Step-by-step
1. Download the official healthcare app.  
2. Log in using your registration details.  
3. Connect records or GP where prompted.  
4. Enable notifications for appointments or prescriptions.

Outcome
Healthcare access in your pocket, simple and organised.
`
  },
  {
    task: "Confirm tenancy deposit is protected",
    duration: 0.5,
    explanation: `
Deposit protection safeguards your money and your rights as a tenant.

Step-by-step
1. Ask your landlord or agent for deposit protection details.  
2. Verify the scheme online.  
3. Save confirmation certificate or reference number.

Outcome
Your deposit is legally protected and documented.
`
  },
  {
    task: "TV licence or streaming compliance check",
    duration: 0.5,
    explanation: `
A quick check avoids unnecessary fines or confusion.

Step-by-step
1. Review whether a TV licence is required at your address.  
2. Confirm streaming subscriptions and usage rules.  
3. Register or update status if needed.

Outcome
Entertainment set up fully compliant, no surprises.
`
  },
  {
    task: "Update driving licence or vehicle address",
    duration: 0.5,
    explanation: `
Keeping vehicle records updated avoids fines and admin headaches.

Step-by-step
1. Update address on driving licence portal.  
2. Update vehicle registration if applicable.  
3. Save confirmation emails or screenshots.

Outcome
Driving records fully aligned with your new address.
`
  },
  {
    task: "Set tax reminders",
    duration: 0.5,
    explanation: `
Gentle reminders prevent last-minute stress and missed deadlines.

Step-by-step
1. Identify key tax dates (filings, payments).  
2. Add reminders to your digital calendar.  
3. Set alerts 1–2 weeks in advance.

Outcome
Tax handled calmly, on time, every time.
`
  }
],


// ——— 4) FINDING HOME ———
home: [
  {
    task: "Pick top 3 neighborhoods with pros and cons",
    duration: 2,
    explanation: `
Choosing neighbourhoods intentionally prevents decision fatigue later.

Step-by-step
1. List 5–6 neighbourhoods you are initially curious about.  
2. Narrow down to three based on budget range and commute distance.  
3. For each neighbourhood, note:
   • Average rent  
   • Commute time  
   • Safety and lighting  
   • Local vibe (quiet, lively, residential)  
4. Write 3 pros and 3 cons for each area.  
5. Rank them from strongest fit to weakest.

Outcome
Three clearly evaluated neighbourhoods you feel confident focusing on.
`
  },
  {
    task: "Define must-haves versus nice-to-haves",
    duration: 1,
    explanation: `
Clear priorities make viewing decisions faster and less emotional.

Step-by-step
1. Draw two columns: “Must-haves” and “Nice-to-haves”.  
2. Add essentials (e.g. budget cap, commute limit, washing machine).  
3. Add flexible extras (e.g. balcony, dishwasher, floor height).  
4. Circle the top 3 non-negotiables.  
5. Keep this list open during viewings.

Outcome
A clear decision framework that prevents second-guessing.
`
  },
  {
    task: "Shortlist 6 to 8 listings and book at least 3 viewings",
    duration: 2,
    explanation: `
Seeing multiple options helps you compare realistically rather than settling too quickly.

Step-by-step
1. Search listings using your neighbourhood and must-have filters.  
2. Shortlist 6–8 realistic options.  
3. Book at least 3 viewings across different days or areas.  
4. Save listing links and viewing times in one place.  
5. Prepare your questions in advance.

Outcome
A solid comparison set instead of a rushed decision.
`
  },
  {
    task: "Learn tenant rights and typical fees or clauses",
    duration: 1,
    explanation: `
Understanding what’s standard protects you from unfair terms.

Step-by-step
1. Research tenant rights for your country or city.  
2. Note typical fees, deposits, and notice periods.  
3. Learn which clauses are standard vs negotiable.  
4. Save a short checklist of red flags.  

Outcome
Confidence when reviewing contracts or speaking to agents.
`
  },
  {
    task: "Visit at different times for noise and commute tests",
    duration: 2,
    explanation: `
Neighbourhoods can feel very different depending on the time of day.

Step-by-step
1. Visit once during the day and once in the evening.  
2. Walk the surrounding streets.  
3. Note noise, lighting, foot traffic, and safety.  
4. Test the commute route during peak hours if possible.

Outcome
A realistic sense of daily life in the area.
`
  },
  {
    task: "Check broadband speeds and phone signal at flats",
    duration: 0.5,
    explanation: `
Connectivity issues are frustrating and hard to fix later.

Step-by-step
1. Check broadband providers available at the address.  
2. Look up average speeds.  
3. Test phone signal inside the flat.  
4. Note any weak spots.

Outcome
A home that supports work, streaming, and daily life.
`
  },
  {
    task: "Note supermarkets, gyms, and parks within 10 minutes",
    duration: 1,
    explanation: `
Daily convenience matters more than you expect.

Step-by-step
1. Open Google Maps at the property location.  
2. Search for:
   • Supermarkets  
   • Gyms or studios  
   • Parks or green space  
3. Note walking times.  
4. Save useful places.

Outcome
A neighbourhood that supports your lifestyle with ease.
`
  },
  {
    task: "Photograph condition and create an inventory checklist",
    duration: 1.0,
    explanation: `
Documenting condition protects you when moving out.

Step-by-step
1. Photograph walls, floors, appliances, and fixtures.  
2. Note existing damage or wear.  
3. Save photos with date labels.  
4. Store everything in your document vault.

Outcome
Clear evidence of the flat’s condition at move-in.
`
  },
  {
    task: "Set up standing orders for rent and bills",
    duration: 0.5,
    explanation: `
Automation reduces mental load and prevents missed payments.

Step-by-step
1. Confirm payment details for rent and utilities.  
2. Set standing orders or direct debits.  
3. Align payment dates with your salary.  

Outcome
Rent and bills handled quietly in the background.
`
  },
  {
    task: "Create a cozy corner with lamp, throw, and scent",
    duration: 1,
    explanation: `
One finished corner makes a new place feel like home faster.

Step-by-step
1. Choose a small area (chair, desk, bedside).  
2. Add a lamp, throw, or cushion.  
3. Introduce a familiar scent (candle, diffuser).  

Outcome
A comforting anchor space while the rest comes together.
`
  },
  {
    task: "Plan low-cost furnishing sequence for first four weeks",
    duration: 1.0,
    explanation: `
Spreading purchases avoids financial overwhelm.

Step-by-step
1. List essentials needed immediately.  
2. Assign each item to Week 1–4.  
3. Set rough budget caps per week.  

Outcome
A calm, phased setup instead of rushed spending.
`
  },
  {
    task: "Celebrate with a small house-warming treat",
    duration: 0.5,
    explanation: `
Marking milestones builds emotional closure and joy.

Step-by-step
1. Choose a simple treat (flowers, takeaway, candle).  
2. Enjoy it intentionally in your new space.  

Outcome
A sense of arrival and accomplishment.
`
  },
  {
    task: "Measure rooms and plan layout with floor plan sketch",
    duration: 1,
    explanation: `
Measurements prevent expensive furniture mistakes.

Step-by-step
1. Measure walls, doorways, and key spaces.  
2. Sketch a simple floor plan.  
3. Map furniture placement before buying.

Outcome
Furniture that fits properly and flows well.
`
  },
  {
    task: "Book a deep clean or hire a cleaner before moving in",
    duration: 1.5,
    explanation: `
Starting fresh makes settling in easier.

Step-by-step
1. Book a deep clean before unpacking.  
2. Focus on kitchen, bathroom, and floors.  
3. Ventilate the space afterward.

Outcome
A clean, reset environment from day one.
`
  },
  {
    task: "Do a safety check for smoke alarms, CO alarms, and fire exits",
    duration: 0.5,
    explanation: `
Safety checks provide peace of mind.

Step-by-step
1. Test smoke and CO alarms.  
2. Locate fire exits.  
3. Note emergency procedures.

Outcome
Confidence that your home is safe and compliant.
`
  },
  {
    task: "Order or fit window coverings or privacy film",
    duration: 0.5,
    explanation: `
Privacy improves comfort immediately.

Step-by-step
1. Identify windows needing coverage.  
2. Order curtains, blinds, or privacy film.  
3. Install or schedule fitting.

Outcome
A more secure and comfortable living space.
`
  },
  {
    task: "Do first big grocery and essentials stock-up",
    duration: 2,
    explanation: `
Planning your first essentials run helps you avoid repeated trips and keeps your first days efficient.
Use the checklist below and tick items off once they have been added to your shopping list or purchased.

How to do it
1. Open your notes app or shopping list.
2. Add the items below under each category.
3. Mark items as completed once bought.
4. Keep the list intentionally minimal; this is about settling in, not fully stocking a home.

First grocery & home-basics checklist

Food basics (first week)
□ Bread or wraps  
□ Milk or milk alternative  
□ Eggs  
□ Butter or spread  
□ Cheese or simple protein (chicken, tofu, beans)  
□ Pasta, rice, or noodles  
□ Simple sauce (tomato, pesto, soy)  
□ Cooking oil  
□ Salt and pepper  
□ One easy breakfast option (cereal, yoghurt, oats)  
□ One snack option (fruit, nuts, crackers)

Fridge & freezer essentials
□ Fresh fruit  
□ Fresh vegetables (2–3 basics you’ll actually use)  
□ Ready-to-eat or freezer meal for day one  
□ Condiments you use daily (ketchup, mustard, chilli, etc.)

Cleaning basics
□ Washing-up liquid  
□ Dish sponge or cloth  
□ Multi-surface cleaner  
□ Bin bags  
□ Kitchen roll or paper towels  
□ Laundry detergent  

Bathroom & personal care
□ Toilet paper  
□ Hand soap  
□ Shower gel or soap  
□ Shampoo and conditioner  
□ Toothpaste and toothbrush  
□ Deodorant  

Home essentials
□ Tea towels  
□ Dishcloths  
□ Storage bags or foil  
□ Basic light bulbs (if unsure what’s fitted)  

Optional comfort items (nice-to-have)
□ Tea or coffee  
□ Mug or glass if needed  
□ Candle or small comfort item  

5. Check nearby supermarkets or convenience stores.
6. Save opening hours and directions in your phone.
7. Plan to do this shop on arrival day or the morning after.

Outcome
A calm, well-prepared first week with food, hygiene, and basics covered.

Free Tools
Google Maps, Notes app
`
  },
  {
    task: "Create repairs and issues log with photos and dates",
    duration: 0.5,
    explanation: `
A simple log protects you later.

Step-by-step
1. Create a document titled “Repairs Log”.  
2. Add date, issue, and photo.  
3. Update after any communication.

Outcome
Clear documentation if issues escalate.
`
  },
  {
    task: "Set up recycling and collection schedules with bins",
    duration: 0.5,
    explanation: `
Understanding local systems avoids fines and confusion.

Step-by-step
1. Check council recycling rules.  
2. Identify collection days.  
3. Set reminders if needed.

Outcome
Waste handled correctly and effortlessly.
`
  },
  {
    task: "Draft landlord or agent communication templates",
    duration: 0.5,
    explanation: `
Prepared messages reduce stress during issues.

Step-by-step
1. Draft short templates for:
   • Repairs  
   • Questions  
   • Notices  
2. Save them in your notes app.

Outcome
Quick, calm communication whenever needed.
`
  }
],


// ——— 5) MAKING FRIENDS & SOCIAL LIFE ———
friends: [
  {
    task: "Join all social events at work for an entire month, including after-work meetups",
    duration: 1,
    explanation: `
Early consistency builds familiarity faster than one-off effort.

Step-by-step
1. Check your work calendar, Slack, or internal emails for social events.  
2. Commit to attending all optional social events for the next month.  
3. Aim to stay at least 30–60 minutes at each event.  
4. Focus on showing up, not impressing. Simple presence is enough.  
5. Greet the same people multiple times to build recognition.

Outcome
Stronger familiarity and early social footing at work.
`
  },
  {
    task: "Join two local groups or clubs",
    duration: 2,
    explanation: `
Interest-led groups create natural conversation without pressure.

Step-by-step
1. Search Meetup, Eventbrite, gyms, studios, or community boards.  
2. Choose two groups based on genuine interest, not networking value.  
3. Check meeting frequency and location.  
4. Join and save the next event dates in your calendar.

Outcome
Two recurring social touchpoints outside of work.
`
  },
  {
    task: "Attend one event this week and talk to three people",
    duration: 2,
    explanation: `
Small interactions add up. Depth is not required at the start.

Step-by-step
1. Choose one event this week (work, hobby, community).  
2. Introduce yourself to three different people.  
3. Ask simple questions: “How did you find this group?” or “Are you local?”  
4. End conversations naturally after a few minutes.

Outcome
Practised social momentum and growing confidence.
`
  },
  {
    task: "Message three acquaintances for coffee introductions",
    duration: 0.5,
    explanation: `
Warm connections are often easier than starting from zero.

Step-by-step
1. List people you already loosely know (friends of friends, colleagues, old contacts).  
2. Send three short messages suggesting a coffee or walk.  
3. Keep it light and flexible on timing.  
4. Log who you contacted for follow-up.

Outcome
Social plans initiated without overthinking.
`
  },
  {
    task: "Find a weekly class such as yoga, dance, or language",
    duration: 1.0,
    explanation: `
Repetition is how strangers become familiar faces.

Step-by-step
1. Search for weekly classes near your home or work.  
2. Choose one that fits your schedule realistically.  
3. Commit to attending for at least four weeks.  
4. Save the class time as a recurring calendar block.

Outcome
One consistent social rhythm in your week.
`
  },
  {
    task: "Follow ten city accounts and save venues",
    duration: 0.5,
    explanation: `
Passive discovery makes social planning easier.

Step-by-step
1. Follow local cafés, venues, event spaces, and community pages.  
2. Save posts or locations that interest you.  
3. Create a “City Ideas” collection if available.

Outcome
A steady stream of low-effort social inspiration.
`
  },
  {
    task: "Say hi to your barista or bartender and learn their name",
    duration: 0.5,
    explanation: `
Micro-familiarity builds a sense of belonging quickly.

Step-by-step
1. Choose one regular spot you visit weekly.  
2. Make eye contact and say hello each time.  
3. Learn and use their name once comfortable.

Outcome
A neighbourhood that feels more human and familiar.
`
  },
  {
    task: "Volunteer once or pick a cause to explore",
    duration: 2,
    explanation: `
Shared purpose creates meaningful connection.

Step-by-step
1. Identify one cause you care about.  
2. Search for one-off or trial volunteering opportunities.  
3. Sign up for a single session or information event.  
4. Attend with no expectation beyond participation.

Outcome
Connection through shared values and contribution.
`
  },
  {
    task: "Host or plan a small picnic or board game night",
    duration: 2,
    explanation: `
Small gatherings are easier to manage and more intimate.

Step-by-step
1. Pick a simple format (picnic, games, takeaway).  
2. Invite 3–5 people max.  
3. Keep the plan low-effort and casual.  
4. Choose a clear start and end time.

Outcome
A relaxed hosting experience that builds closeness.
`
  },
  {
    task: "Schedule two coffee walks in new areas",
    duration: 1,
    explanation: `
Combining exploration with social time reduces friction.

Step-by-step
1. Choose two neighbourhoods you want to explore.  
2. Invite one person per walk.  
3. Keep it short and casual (30–45 minutes).  

Outcome
Social connection paired with city familiarity.
`
  },
  {
    task: "Create a simple new-friend tracker",
    duration: 0.5,
    explanation: `
Remembering details helps relationships deepen naturally.

Step-by-step
1. Create a note or spreadsheet titled “New People”.  
2. Add name, where you met, and one shared detail.  
3. Update briefly after social interactions.

Outcome
More thoughtful and intentional follow-ups.
`
  },
  {
    task: "Post one short update about your city chapter",
    duration: 0.5,
    explanation: `
Visibility invites connection without direct outreach.

Step-by-step
1. Share a short, honest update about your move or city life.  
2. Keep it casual, no announcement needed.  
3. Respond warmly to replies or messages.

Outcome
Reconnections and new conversations sparked.
`
  },
  {
    task: "Send three thank you or follow-up messages",
    duration: 0.5,
    explanation: `
Following up keeps momentum alive.

Step-by-step
1. Identify three recent interactions.  
2. Send a short message saying it was nice to meet or catch up.  
3. Suggest a future plan only if it feels natural.

Outcome
Relationships gently moved forward.
`
  },
  {
    task: "Join a professional association",
    duration: 1,
    explanation: `
Professional groups combine social and career alignment.

Step-by-step
1. Identify an industry or professional group relevant to you.  
2. Join online or via membership sign-up.  
3. Note upcoming events or meetups.

Outcome
Access to aligned peers and opportunities.
`
  },
  {
    task: "Take a coworking day pass to meet locals",
    duration: 1,
    explanation: `
Changing environments increases chance encounters.

Step-by-step
1. Choose a coworking space near your area.  
2. Book a single day pass.  
3. Sit in shared areas where possible.  
4. Initiate light conversation if natural.

Outcome
New energy and casual social exposure.
`
  },
  {
    task: "Invite a neighbour or colleague for a coffee walk",
    duration: 0.5,
    explanation: `
Proximity makes connection easier and more sustainable.

Step-by-step
1. Identify someone nearby you see regularly.  
2. Suggest a short coffee or walk.  
3. Keep it informal and time-bound.

Outcome
Local connections that fit into daily life.
`
  },
  {
    task: "Create a WhatsApp or Signal group for new friends",
    duration: 0.5,
    explanation: `
Group chats reduce coordination effort.

Step-by-step
1. Create a small group (3–6 people max).  
2. Use it to suggest simple plans or share events.  
3. Keep the tone light and optional.

Outcome
An easy hub for casual social planning.
`
  },
  {
    task: "Try a drop-in sports or social club",
    duration: 1,
    explanation: `
Low-commitment activities lower the barrier to showing up.

Step-by-step
1. Find a drop-in or pay-as-you-go activity.  
2. Attend once without long-term commitment.  
3. Note whether the vibe feels right.

Outcome
Exploration without pressure.
`
  },
  {
    task: "Attend a community or faith-based event",
    duration: 1.0,
    explanation: `
Shared values often create deeper bonds.

Step-by-step
1. Find a local community or faith-based event.  
2. Attend with openness and curiosity.  
3. Stay for informal conversation afterward if possible.

Outcome
Connection rooted in shared values and belonging.
`
  },
  {
    task: "Do a Friday follow-up ritual and schedule next week’s socials",
    duration: 0.5,
    explanation: `
Small weekly planning prevents social drift.

Step-by-step
1. Review who you interacted with this week.  
2. Send any follow-ups needed.  
3. Schedule 1–2 social plans for next week.

Outcome
Steady, sustainable social momentum.
`
  }
],


// ——— 6) EXPLORING & CULTURE ———
culture: [
  {
    task: "Buy or consider a museum or gallery pass",
    duration: 0.5,
    explanation: `
A culture pass lowers the barrier to spontaneous exploration.

Step-by-step
1. Look up museum or gallery passes available in your city.  
2. Check which venues are included and any guest benefits.  
3. Compare cost versus individual ticket prices.  
4. Decide whether to buy now or bookmark for later.

Outcome
Easier, guilt-free access to culture whenever you feel like it.
`
  },
  {
    task: "Explore three new neighborhoods",
    duration: 3,
    explanation: `
Seeing different areas helps the city feel familiar rather than overwhelming.

Step-by-step
1. Choose three neighbourhoods you haven’t explored yet.  
2. Walk without a strict agenda for 45–60 minutes each.  
3. Notice cafés, parks, streets, and overall vibe.  
4. Take a few notes or photos from each walk.

Outcome
A broader, more intuitive sense of your city beyond your bubble.
`
  },
  {
    task: "Find your third place such as a café or library",
    duration: 1.0,
    explanation: `
A “third place” gives you belonging outside home and work.

Step-by-step
1. Visit a café, library, or quiet public space nearby.  
2. Stay for at least 30 minutes.  
3. Notice how comfortable and welcome you feel.  
4. Decide if this could become a regular spot.

Outcome
One place that feels grounding and familiar.
`
  },
  {
    task: "Do one guided walking tour or audio tour",
    duration: 2,
    explanation: `
Learning the stories behind streets makes the city feel alive.

Step-by-step
1. Search for guided tours or audio walks in your city.  
2. Choose a theme that interests you (history, architecture, culture).  
3. Book or download the tour.  
4. Walk at a relaxed pace and listen attentively.

Outcome
Deeper understanding of the city’s character and history.
`
  },
  {
    task: "Try a local food market or signature dish",
    duration: 1.5,
    explanation: `
Food is one of the fastest ways to connect with a place.

Step-by-step
1. Research one local food market or iconic dish.  
2. Visit during a non-rushed time if possible.  
3. Try at least one unfamiliar item.  
4. Note what you enjoyed for future visits.

Outcome
A sensory connection to local culture through food.
`
  },
  {
    task: "Pick a weekly culture night such as cinema or theatre",
    duration: 0.5,
    explanation: `
Regular rituals make culture part of everyday life.

Step-by-step
1. Choose one evening that works most weeks.  
2. Decide on a simple format (cinema, theatre, lecture, talk).  
3. Save venues or schedules.  
4. Add a recurring reminder to your calendar.

Outcome
One dependable cultural rhythm in your week.
`
  },
  {
    task: "Create a custom Google Map of favourites",
    duration: 1.0,
    explanation: `
Saving favourites reduces decision fatigue later.

Step-by-step
1. Open Google Maps and create a new custom map.  
2. Add cafés, parks, museums, and venues you like.  
3. Use labels or colours for categories.  
4. Update the map as you explore.

Outcome
Your personal cultural map of the city.
`
  },
  {
    task: "Plan a low-cost day trip on public transport",
    duration: 1,
    explanation: `
Small escapes expand your sense of place.

Step-by-step
1. Search for towns or nature spots reachable by public transport.  
2. Check travel time and return options.  
3. Plan one simple activity (walk, café, viewpoint).  
4. Save directions and timings.

Outcome
A mini adventure without high cost or stress.
`
  },
  {
    task: "Attend a community festival or street fair",
    duration: 2,
    explanation: `
Festivals show the city at its most social.

Step-by-step
1. Look up upcoming festivals or street fairs.  
2. Choose one that fits your schedule.  
3. Attend without needing to stay the whole time.  
4. Observe music, food, and people.

Outcome
A felt sense of the city’s energy and traditions.
`
  },
  {
    task: "Take five slice-of-life photos to mark the week",
    duration: 0.5,
    explanation: `
Small moments are what make a place feel like home.

Step-by-step
1. Over one week, take five casual photos.  
2. Capture everyday scenes, not landmarks.  
3. Save them in a dedicated album.

Outcome
A visual memory of your real life in the city.
`
  },
  {
    task: "Get a library card and explore a nearby branch",
    duration: 0.5,
    explanation: `
Libraries offer quiet, culture, and community.

Step-by-step
1. Register online or in person for a library card.  
2. Visit one nearby branch.  
3. Explore seating, sections, and resources.  

Outcome
Access to calm, culture, and public space.
`
  },
  {
    task: "Go to a museum late-night or free-entry day",
    duration: 1.5,
    explanation: `
Off-peak visits feel more relaxed and accessible.

Step-by-step
1. Check museum late openings or free days.  
2. Pick one venue.  
3. Wander without trying to see everything.

Outcome
Low-pressure cultural immersion.
`
  },
  {
    task: "Do a street art or architecture photo walk",
    duration: 1.5,
    explanation: `
Looking closely changes how you experience streets you already walk.

Step-by-step
1. Choose an area known for street art or architecture.  
2. Walk slowly and observe details.  
3. Take photos that catch your eye.

Outcome
A fresh perspective on familiar surroundings.
`
  },
  {
    task: "Attend live music, open mic, or a jazz night",
    duration: 1.5,
    explanation: `
Live events connect you to the city’s creative pulse.

Step-by-step
1. Find a small live music or open mic event.  
2. Attend casually. Staying for part of it is enough.  
3. Notice the atmosphere and crowd.

Outcome
Connection to local creative life.
`
  },
  {
    task: "Join or start a book club meet",
    duration: 1,
    explanation: `
Books create natural conversation and continuity.

Step-by-step
1. Search for local book clubs or reading groups.  
2. Alternatively, invite 2–3 people to read one book.  
3. Set a low-pressure first meet.

Outcome
Culture combined with gentle social connection.
`
  },
  {
    task: "Plan a seasonal event such as a market or festival",
    duration: 1,
    explanation: `
Seasonal events anchor you in time and place.

Step-by-step
1. Look ahead at the next seasonal calendar.  
2. Pick one event that sounds appealing.  
3. Add it to your calendar.

Outcome
A future moment to look forward to.
`
  },
  {
    task: "Do a local history podcast walk",
    duration: 1,
    explanation: `
Stories turn streets into meaningful places.

Step-by-step
1. Find a local history or city podcast episode.  
2. Walk through areas mentioned while listening.  
3. Pause when something catches your attention.

Outcome
A deeper emotional connection to the city’s past.
`
  }
],

// ——— 7) THE NEW YOU ———
energy: [
  {
    task: "Curate a moodboard for your city era",
    duration: 2,
    explanation: `
A moodboard helps translate abstract feelings into something tangible.

Step-by-step
1. Choose a tool (Pinterest, Canva, Notes, or a physical board).  
2. Collect images that reflect how you want this chapter to feel: style, colours, places, energy.  
3. Avoid trends. Focus on what genuinely resonates.  
4. Add one word or phrase that captures this era.  

Outcome
A clear visual reference for the version of YOU, you are stepping into.
`
  },
  {
    task: "Choose a signature scent or lipstick",
    duration: 0.5,
    explanation: `
Small personal rituals create a sense of identity and continuity.

Step-by-step
1. Choose one scent or lipstick you already love or want to try.  
2. Test it on a normal day, not a special occasion.  
3. Decide to use it intentionally for workdays or outings.  

Outcome
A subtle, repeatable confidence anchor.
`
  },
  {
    task: "Refresh wardrobe basics for fit and function",
    duration: 2.0,
    explanation: `
Well-fitting basics make everything else easier.

Step-by-step
1. Pull out your core items (trousers, tops, layers, shoes).  
2. Check fit, comfort, and condition.  
3. Identify what needs tailoring, replacing, or upgrading.  
4. Make a short priority list.

Outcome
A wardrobe that supports your real daily life.
`
  },
  {
    task: "Assemble five go-to outfits and photograph them",
    duration: 1,
    explanation: `
Prepared outfits remove daily decision fatigue.

Step-by-step
1. Create five outfits suitable for work and everyday plans.  
2. Try them on fully (including shoes and outerwear).  
3. Take quick photos on your phone.  
4. Save them in a dedicated album.

Outcome
Reliable outfit options ready for busy mornings.
`
  },
  {
    task: "Make a 60-day main character playlist",
    duration: 1.0,
    explanation: `
Music subtly shapes mood and momentum.

Step-by-step
1. Create a new playlist titled with this chapter or city.  
2. Add songs that energise, calm, or ground you.  
3. Keep it intentionally short and focused.  

Outcome
A soundtrack that supports your next two months.
`
  },
  {
    task: "Take yourself on a solo date such as brunch or an exhibition",
    duration: 2,
    explanation: `
Solo time builds confidence and self-trust in a new environment.

Step-by-step
1. Choose one simple solo activity.  
2. Go without multitasking or rushing.  
3. Notice how it feels to enjoy your own company.

Outcome
Increased comfort and independence in your new city.
`
  },
  {
    task: "Design an at-home spa or evening ritual",
    duration: 1,
    explanation: `
Evening rituals help your nervous system settle.

Step-by-step
1. Choose 2–3 calming elements (shower, skincare, tea, music).  
2. Decide a consistent start time.  
3. Keep it realistic and repeatable.

Outcome
A reliable way to wind down and reset.
`
  },
  {
    task: "Do daily five-minute affirmations for one week",
    duration: 0.5,
    explanation: `
Short repetition shapes internal narrative over time.

Step-by-step
1. Write 3–5 affirmations that feel believable.  
2. Read them once daily for a week.  
3. Say them quietly or mentally, no performance needed.

Outcome
A steadier, more supportive inner voice.
`
  },
  {
    task: "Beautify one nook at home with flowers or art",
    duration: 0.5,
    explanation: `
One beautiful corner can shift how a whole space feels.

Step-by-step
1. Choose a small area (desk, shelf, bedside).  
2. Add one intentional item (flowers, print, candle).  
3. Keep it simple and uncluttered.

Outcome
A visual reminder that this space is yours.
`
  },
  {
    task: "Plan a themed mini photo shoot in your area",
    duration: 2,
    explanation: `
Documenting this phase helps anchor memory and identity.

Step-by-step
1. Choose a loose theme (street style, cafés, architecture).  
2. Take 5–10 relaxed photos on a walk.  
3. Focus on atmosphere, not perfection.

Outcome
A visual snapshot of this chapter in your life.
`
  },
  {
    task: "Write a note to Future You about this chapter",
    duration: 1,
    explanation: `
Capturing the present makes future reflection richer.

Step-by-step
1. Write a short letter dated today.  
2. Describe how this chapter feels.  
3. Add one hope or intention for the next phase.  
4. Save it somewhere safe.

Outcome
A meaningful time capsule for later reflection.
`
  },
  {
    task: "Celebrate a tiny win with intention",
    duration: 0.5,
    explanation: `
Acknowledging progress builds motivation.

Step-by-step
1. Identify one small win from the week.  
2. Choose a simple reward (coffee, walk, treat).  
3. Enjoy it consciously.

Outcome
A habit of recognising progress instead of rushing ahead.
`
  },
  {
    task: "Do a closet edit and donate or sell five items",
    duration: 1,
    explanation: `
Letting go creates space, physically and mentally.

Step-by-step
1. Choose five items you no longer wear.  
2. Decide whether to donate or sell.  
3. Bag them immediately to avoid reconsidering.

Outcome
A lighter, more intentional wardrobe.
`
  },

...generateDaily({
  title: "Complete your ten-minute morning routine",
  duration: 0.5,
  explanation: `
A short, repeatable morning routine helps you start the day grounded without feeling rushed or overwhelmed.

Step-by-step
1. Start with one grounding action (make your bed, open a window, or drink a glass of water).
2. Do 1–2 minutes of gentle movement or stretching to wake up your body.
3. Wash your face or apply skincare intentionally, without rushing.
4. Take 2–3 slow breaths and choose one priority for the day.
5. Begin your first task without checking your phone.

Rules
• Keep the routine under 15 minutes.
• Do the steps in the same order each day.
• If short on time, do just the first two steps.

Outcome
Calm, focused, and consistent starts to your mornings.
`,
  idBase: "new_city.energy.morning_routine",
  meta: { roadmap: "new_city", theme: "energy" },
}),


...generateDaily({
  title: "Play your evening wind-down playlist",
  duration: 0.5,
  explanation: `
Using the same calming music each evening helps signal to your body that it’s time to slow down and transition into rest.

Step-by-step
1. Play your chosen wind-down playlist at the start of your evening routine.
2. Keep the volume low and the music familiar.
3. Let it run while you unwind (skincare, tea, light stretching, or journaling).

Rules
• Use the same playlist most nights.
• No scrolling while it plays.
• If short on time, play just one track.

Outcome
Smoother transitions into rest and easier evenings.
`,
  idBase: "new_city.energy.evening_wind_down",
  meta: { roadmap: "new_city", theme: "energy" },
}),

  {
    task: "Define outfit templates for work and weekend",
    duration: 1,
    explanation: `
Templates simplify daily decisions.

Step-by-step
1. Write 2–3 outfit formulas for work.  
2. Write 1–2 for weekends.  
3. Base them on comfort and confidence.

Outcome
Faster dressing with consistent style.
`
  },
  {
    task: "Book a haircut or beauty appointment for a reset",
    duration: 2,
    explanation: `
Physical resets often trigger emotional ones.

Step-by-step
1. Choose one appointment (haircut, facial, grooming).  
2. Book it intentionally as a reset moment.  
3. Avoid stacking it with other errands.

Outcome
A visible and felt refresh.
`
  },
  {
    task: "Set a weekly flowers or café ritual",
    duration: 1,
    explanation: `
Small recurring rituals create rhythm and pleasure.

Step-by-step
1. Choose one simple weekly treat.  
2. Assign a consistent day.  
3. Keep it modest and intentional.

Outcome
Something gentle to look forward to each week.
`
  },
  {
  task: "Read your vision letter and reflect on this chapter",
  duration: 0.5,
  explanation: `
This is your closing moment. Returning to the vision you set earlier helps you recognise how far you have come and what has shifted along the way.

Step-by-step
1. Reread the vision letter or note you wrote at the start of this roadmap.
2. Notice what feels aligned, what surprised you, and what no longer fits.
3. Mentally acknowledge the growth, changes, and effort you have made.

Outcome
A conscious sense of closure and clarity before stepping into what comes next.
`
}

]

},

tech_switch: {
mindset: [
  {
  task: "Set up your Learning Hub",
  duration: 1,
  explanation: `
Your Learning Hub is your central command centre for this entire tech journey. 
Instead of scattered notes, screenshots, and half-finished ideas, you will keep everything in one organised place.

What you need to know first
• A Learning Hub is simply one main place where you store notes, reflections, concepts, and project ideas.
• It can be digital; Notion, Google Docs, Obsidian, or even a well-structured folder on your computer.
• The goal is clarity, not perfection.

Step-by-step
1. Choose your tool (Notion, Google Docs, Obsidian, or a folder on your laptop).
2. Create a main page or folder called “Tech Switch Learning Hub”.
3. Inside it, create the following sections:
   • Expectations
   • Weekly Wins
   • Concepts & Notes
   • Projects
   • Interview Prep
4. Add today’s date at the top of the main page.
5. Write one sentence: “This is where I build my new career.”

Outcome
A structured, distraction-free system that keeps all your learning in one place and makes progress visible.

Free Tools
Notion, Google Docs, Obsidian, or a simple folder structure
`
},

{
  task: "Understand what learning tech realistically looks like",
  duration: 1.5,
  explanation: `
Before you begin, it is important to know what to expect. Tech can seem overwhelming at first, but many people with no background learn it successfully. Progress often happens slowly, and that is normal.

What you need to know first
• Tech is a skill, not a talent. Anyone can learn it with time.  
• Confusion is part of the learning process, not a sign of failure.  
• You do not need to know everything. Only the basics to start.  

Step-by-step
1. Open your learning hub and go to the page “Expectations”.  
2. Write three things you believe about learning tech (positive or negative).  
3. Beside each one, add a more realistic version. Example:  
   - “I need to understand everything immediately.” → “It’s normal to not understand new concepts at first.”  
4. Write two reasons why learning tech is worth your time.  
5. Save this page. You will revisit it when learning feels difficult.

Outcome
A more grounded understanding of the learning journey, reducing pressure and helping you stay consistent.
`
},

{
  task: "Identify your limiting beliefs about tech",
  duration: 1,
  explanation: `
Many beginners believe they are “not technical” or “not good enough” for tech. These beliefs usually come from lack of exposure, not lack of ability.

What you need to know first
• A limiting belief is a thought that makes you doubt your abilities.  
• Most limiting beliefs are based on assumptions, not facts.  
• Once identified, they become easier to work with.

Step-by-step
1. Open a blank document and write “Limiting Beliefs” at the top.  
2. List any thoughts that make you feel unsure about switching into tech.  
   Examples: “I’m not technical,” “I’m too slow,” “Other people understand this faster.”  
3. For each belief, write one piece of evidence that challenges it.  
   Example: “I have learned new skills before, even if they were difficult.”  
4. Write one supportive replacement statement for each belief.  
   Example: “I can learn tech step-by-step at my own pace.”

Outcome
A clearer understanding of what thoughts may hold you back and practical ways to respond to them.
`
},

{
  task: "Expectation reset: what learning tech feels like in weeks 1–3",
  duration: 1.0,
  explanation: `
Early learning often feels messy. This is normal and expected.

Step-by-step
1. Open your learning hub and create a note called “Weeks 1–3 Expectations”.
2. Write down what will likely happen:
   • You will google constantly  
   • You will forget things  
   • You may rewatch videos  
   • You may not understand immediately  
3. Write: “Confusion means I am learning, not failing.”

Outcome
A realistic expectation of early learning that prevents unnecessary self-doubt.
`
},

{
  task: "Set a realistic weekly learning schedule",
  duration: 1.0,
  explanation: `
Consistent short sessions are more effective than long, irregular ones. A realistic schedule helps you make steady progress without burnout.

What you need to know first
• Most beginners start with 3–5 hours per week.  
• Short daily sessions (20–30 minutes) are often easier than one long session.  

Step-by-step
1. Look at your weekly routine and identify small blocks of free time.  
2. Choose 3–4 sessions of 20–40 minutes each for learning tech.  
3. Add these sessions to your digital calendar.  
4. Set automatic reminders on your phone to support the habit.

Outcome
A structured and achievable weekly routine that fits your lifestyle.
`
},

{
  task: "Learn the beginner mindset for tech",
  duration: 1,
  explanation: `
Tech involves problem-solving, experimentation, and learning through trial and error. The beginner mindset helps you stay calm when things don’t work immediately.

What you need to know first
• It’s normal for code not to work the first time.  
• Asking questions is a strength, not a weakness.  
• Progress often happens in small steps.

Step-by-step
1. Write down a recent situation (not related to tech) where you learned something new.  
2. List what helped you during that learning process.  
3. Choose one of those strategies to apply to your tech learning.  
   Examples: practising slowly, taking notes, watching tutorials.  
4. Add a note to remind yourself that struggling is part of learning, not a sign to stop.

Outcome
A mindset that supports resilience and reduces frustration during technical challenges.
`
},

{
  task: "Create a distraction-free learning environment",
  duration: 0.5,
  explanation: `
Having a calm and organised space makes it easier to concentrate during your learning sessions.

What you need to know first
You don’t need a dedicated office, even a small corner or routine setup can work.

Step-by-step
1. Choose a spot where you can focus for 20–30 minutes.  
2. Remove distractions (notifications, TV, unnecessary tabs).  
3. Keep a notebook or digital notes app open for quick reminders.  
4. Prepare your tools: laptop, charger, water, and your learning hub.  

Outcome
A consistent and supportive environment that helps you focus during each session.
`
},

{
  task: "Practice breaking down a task into smaller steps",
  duration: 1,
  explanation: `
Breaking problems into smaller parts is one of the most important skills in tech. This practice helps you get comfortable with it even before writing code.

What you need to know first
Tech problems are rarely solved all at once. Developers break tasks into smaller actions and solve them step-by-step.

Step-by-step
1. Choose a simple everyday task like “making breakfast” or “sending an email.”  
2. Write down every small action required for that task.  
   Example: “open fridge → take eggs → heat pan → crack eggs → cook.”  
3. Look at your list and notice how each step is clear and simple on its own.  
4. In your notes, write: “This is how coding problems work too. One small step at a time.”

Outcome
A foundational problem-solving skill that prepares you for real coding later in the roadmap.
`
},

],


  exploration: [
{
  task: "Identify your transferable skills and preferred work style",
  duration: 1.5,
  explanation: `
Before exploring tech roles, it helps to understand what you are already good at. Many skills from non-tech jobs transfer well into tech, such as communication, organisation, problem-solving, customer understanding, and attention to detail.

Step-by-step
1. Open Google Docs or Notion and create a new page.  
2. Add two headings:  
   - “Transferable Skills”  
   - “Preferred Work Style”  
3. Under Transferable Skills, list at least seven strengths you already use in daily life or work.  
   Examples: explaining information clearly, planning tasks, working with numbers, helping customers, solving problems calmly, staying organised.  
4. For each skill, write one example of when you used it.  
   Example: “Planning: I manage weekly schedules and coordinate tasks for my team.”  
5. Under Preferred Work Style, write a few sentences describing the environments you enjoy.  
   Examples: “I like clear instructions,” “I work well independently,” “I enjoy helping others,” “I like structure and checklists.”  
6. Finish by writing 2–3 sentences summarising what types of tech work might fit your strengths and style.

Outcome
A clear overview of your strengths and preferences to guide your tech career exploration.

Free Tools
Google Docs, Notion
`
},

{
  task: "Explore common tech roles and pick your first track",
  duration: 2.5,
  screen: "TechSwitchRole",
  screenParams: { fromTask: true },
  explanation: `
Understanding what different tech roles actually do helps you pick a direction without feeling overwhelmed. Not all tech roles require coding. Many are about planning, design, communication, and problem-solving.

Quick role guide:

• Data Analyst
  Answers business questions using data; cleaning, querying (SQL), building dashboards, and turning messy numbers into clear insights. Great if you enjoy spotting patterns and working with spreadsheets or data tools.

• Frontend Developer
  Builds what users actually see and click; websites and app interfaces using HTML, CSS, and JavaScript. A good fit if you like visual problem-solving and want to see your work come to life quickly.

• Product Manager
  Decides what gets built and why by balancing user needs, business goals, and engineering effort. A natural fit if you are good at communicating, organising people, and seeing the big picture without needing to write code.

• UX Designer
  Designs how products feel to use. User research, wireframes, flows, and testing. Well suited if you are creative and care deeply about making things intuitive.

• DevOps Engineer
  Keeps software running reliably by managing deployment pipelines, cloud infrastructure, and the systems that let developers ship code safely. Good if you like structure, automation, and understanding how things work behind the scenes.

• AI Engineer
  Builds practical AI-powered products by integrating AI models and tools into real applications. Suited to people who want to work with cutting-edge technology without needing a deep maths or research background.

If you want more detail, search the role name on YouTube and watch a short “day in the life of a ___” video.

Step-by-step
1. Read the role guide above.
2. Pick the one track that sounds most interesting. Go with your gut.
3. Write one sentence: “I’m starting with ___ because ___.”
4. Save your choice below. You can always change it later.

Outcome
A clear first tech track to begin with (without overwhelm).

Free Tools
Google Search, YouTube, Google Docs, Notion
`
},

{
  task: "Watch three 'day in the life' videos and take structured notes",
  duration: 1.5,
  explanation: `
Seeing real examples of how people work in tech provides a clearer understanding of the job beyond descriptions.

What you need to know first
Different people experience the same role differently, so it helps to see more than one example.

Step-by-step
1. Search YouTube for “day in the life of a ___” using the role you selected.  
2. Watch at least three videos from different creators.  
3. Create a simple table with three columns:  
   - What the person does most often  
   - Tools they use  
   - What looked enjoyable or stressful  
4. After watching, write 2–3 sentences summarising what type of workday appeals to you.

Outcome
A realistic idea of what the job feels like and whether the daily tasks match your preferences.

Free Tools
YouTube, Google Docs, Notion
`
},

],

  product_skills: [

{
  task: "Define the problem clearly",
  duration: 1.5,
  explanation: `
Product management starts with understanding the problem you are solving.

Step-by-step
1. Open a blank page in your Learning Hub.  
2. Write four short sections:  
   - Target User: Who are you helping? (e.g., students, remote workers, small business owners)  
   - Context: When or where do they face the problem?  
   - Desired Outcome: What would success look like for them?  
   - Constraints: Time, budget, or tech limits.  
3. Keep it to one page. If someone else reads it, they should instantly know what issue you are addressing.

Outcome  
A one-page problem definition that sets direction for your project.

Free Tools  
Google Docs or Notion
`
},

{
  task: "Create an interview plan and gather insights",
  duration: 2,
  explanation: `
Good product decisions come from listening to real people.

Step-by-step
1. In a new document, write six open-ended questions starting with “Tell me about…” or “How do you…?” Example: “Tell me about how you track expenses each month.”  
2. Add a section called Bias Guards, which are reminders to stay neutral (avoid yes/no questions, don’t suggest answers).  
3. Ask three people from your target user group for 15-minute interviews (friends or colleagues are fine).  
4. Take short notes on what surprised you or repeated often.

Outcome  
First-hand understanding of real user needs and frustrations.

Free Tools  
Google Docs or Notion, Google Meet or Zoom for calls
`
},

{
  task: "Write a simple Product Requirements Document (PRD)",
  duration: 2,
  explanation: `
A PRD (Product Requirements Document) is a short document that explains what you are building, who it's for, and what success looks like.

Step-by-step

1. Pick ONE tiny project idea:

   • Habit tracker (tick off a daily habit)  
   • Budgeting app (add income and expenses)  
   • Job application tracker (save applications + status)  
   • To-do list app (add and complete tasks)  
   • Meal picker (save meals and choose one randomly)  

2. In your Learning Hub, create a new page called:
   “PRD - [Project Name]”

3. Add the following sections:

   • Goal  
   • Target Users  
   • User Story  
   • Key Features (3–5 only)  
   • Out of Scope (Not in version 1)  
   • Success Metrics  

4. Fill in each section using simple sentences.

   Goal  
   - What does this product help someone do?

   Target Users  
   - Who is this product for?

   User Story  
   Use this format:
   “As a [type of user], I want to [do something], so that [benefit].”

   Key Features  
   - List 3–5 things your product must do to work.

   Out of Scope  
   - List things you are NOT building yet.

   Success Metrics  
   - Add 2 simple measures of success.
     Example: “70% of users add one item within 5 minutes.”

5. Review your PRD and remove anything unclear or unnecessary.
   Try to keep the whole document to one page.

Outcome  
A 1-page PRD that clearly explains your project idea.

Free Tools  
Google Docs, Notion
`
,
meta: { roadmap: "tech_switch", theme: "product_skills" }
},
{
  task: "Turn ideas into user stories",
  duration: 2,
  explanation: `
User stories describe what your product should do from the user’s point of view.

Step-by-step

1. In your Learning Hub, open a new table.

2. Add these columns:
   • As a [user type]  
   • I want to [action]  
   • So that [benefit]  
   • Acceptance Criteria  

3. Write at least three user stories.

   Example 1:
   As a new visitor,  
   I want to create an account,  
   So that I can save my progress.

   Acceptance Criteria:
   - User can enter email and password  
   - Account is created successfully  
   - User is redirected to dashboard  

   Example 2:
   As a job seeker,  
   I want to add a job application,  
   So that I can track my progress.

   Acceptance Criteria:
   - User can enter company name and role  
   - Application is saved  
   - Status defaults to “Applied”  

4. Repeat this for at least one more story related to your project.

Outcome  
A clear, user-focused description of what your product needs to do.

Free Tools  
Notion or Google Sheets
`
},

{
  task: "Visualise your workflow with a Kanban or Scrum board",
  duration: 1.5,
  explanation: `
A Kanban or Scrum board helps you see what you need to do, what you are working on, and what you have finished.

Kanban = continuous flow (move tasks as you complete them).
Scrum = working in short focused cycles called “sprints”.
A sprint is a short, fixed period (usually 1–2 weeks) where you focus on a small set of tasks.

Step-by-step

1. Go to https://trello.com and sign up for a free account if you don’t have one.

2. Click “Create” → “Create Board”.
   Name your board:
   “[Project Name] Workflow”

3. Create these lists (columns):

   • To Do  
   • Doing  
   • Done  

4. Go back to the user stories you created in the previous task.

5. For each user story:
   - Create a new card in the “To Do” list.
   - Use the user story as the card title.
     Example:
     “User can create an account”

6. As you start working on a story:
   - Drag the card from “To Do” → “Doing”.

7. When you finish it:
   - Drag the card to “Done”.

Optional (Scrum style):
- Create an additional list called “Sprint 1”.
- Move 3–5 cards from “To Do” into “Sprint 1”.
- Focus only on completing these before starting new ones.

Outcome  
A visual board showing what you plan to build and your current progress.

Free Tools  
Trello (free plan)
`
},

{
  task: "Prepare a quick stakeholder update",
  duration: 1.5,
  explanation: `
Communicating progress keeps everyone aligned.

Step-by-step
1. In Google Slides, make a 3-slide deck:  
   - Slide 1: Status summary (On track / At risk / Delayed)  
   - Slide 2: Key wins and blockers  
   - Slide 3: Next week’s focus and help needed  
2. Keep it short to a five minutes presentation.

Outcome  
A simple, professional update you can reuse weekly.

Free Tools  
Google Slides
`
},

{
  task: "Review designs or wireframes critically",
  duration: 2,
  explanation: `
Learn to give useful feedback on design work, even as a beginner.

Step-by-step
1. Pick ONE thing to review (choose the easiest option):
   • A screenshot of any app screen you use (signup, home, settings), OR
   • A free Figma Community template, OR
   • Your own wireframe/prototype (if you already made one).

2. If using Figma:
   - Go to https://www.figma.com → sign up free
   - Click “Community” and open any “Login / Signup screen” file (or create a blank file and paste your screenshot in).

3. Review the screen using this checklist:
   - Clarity: Is it obvious what the main action is?
   - Consistency: Do buttons/labels look and sound consistent?
   - Friction: Is anything confusing or taking too many steps?
   - Trust: Does anything feel unclear or risky (e.g., password rules missing)?

4. Write:
   - 3 positives (what works well)
   - 3 improvements (what you’d change)

Example improvements (what “good feedback” looks like)
• Positive: “The primary button stands out clearly.”
• Improvement: “Add helper text under the password field (e.g., 8+ characters) so users don’t guess.”
• Improvement: “Change the button label from ‘Submit’ to ‘Create account’ for clarity.”

Outcome
You can review design work from a product perspective, not just ‘what looks nice’.

Free Tools
Figma (free plan) or any screenshot + Notes app
`
},

{
  task: "Define 3 key metrics for your product",
  duration: 1.5,
  explanation: `
Metrics help you measure whether your product is actually working.

You are not guessing, you are defining what success looks like in numbers.

Step-by-step

1. Open your PRD from the previous task.
   Add a new section called:
   “Key Metrics”

2. First, answer this question:
   What is the ONE main action that proves your product is useful?

   Examples:
   • Habit tracker → User logs a habit  
   • Budgeting app → User adds an expense  
   • Job tracker → User adds an application  
   • To-do app → User completes a task  

3. Now define 3 metrics using this structure:

   Metric 1: Activation  
   → Are users using the core feature quickly?
   Example:
   “70% of new users log one habit within 5 minutes.”

   Metric 2: Engagement  
   → Are users coming back or continuing to use it?
   Example:
   “40% of users return within 7 days.”

   Metric 3: Outcome or Value  
   → Is the product creating real value?
   Example:
   “60% of users track at least 5 habits in their first week.”

4. For each metric, write one line explaining:
   How would you track this?

   Examples:
   • Count actions in the database  
   • Use Google Analytics events  
   • Add a simple in-app counter  
   • Send a short user survey  

Keep each metric clear and measurable.
Avoid vague statements like “users like it” or “engagement is good.”

Outcome  
You can clearly define what “success” means in numbers, not opinions.

Free Tools  
Google Sheets, Notion, or a simple notes document
`
,
meta: { roadmap: "tech_switch", theme: "product_skills" }
},

{
  task: "Run an Alpha Test (small pilot)",
  duration: 2.5,
  explanation: `
An Alpha Test is a small early test with a few people before a full launch.
The goal is not perfection, it’s learning what breaks or confuses users.

Step-by-step

1. Prepare something testable.
   This can be:
   • A clickable Figma prototype  
   • A simple coded version  
   • Screenshots explaining the flow  
   • Even a short demo video walking through it  

2. Choose 3–5 testers.
   Pick people who roughly match your target user.
   (Friends are fine at this stage.)

3. Decide what you want them to try.
   Give them 1–2 simple tasks.
   Example:
   - “Create an account.”
   - “Add one job application.”
   - “Log one habit.”

4. Create a short Google Form (5–6 questions max).

   Include:
   - What did you find useful?
   - What was confusing?
   - What felt unnecessary?
   - Did anything break?
   - Would you use this again? (Yes/No/Maybe)
   - Optional: Rate the experience 1–5

5. Send them:
   - The link to your prototype/demo
   - The task instructions
   - The feedback form

6. Review responses.
   In Google Sheets, look for patterns:
   - What issue was mentioned more than once?
   - What confused multiple people?
   - What worked consistently well?

7. Write a short summary in your Learning Hub:
   • 3 things that worked  
   • 3 things to improve  
   • 1 clear next action  

Outcome  
Structured early feedback that tells you what to fix before moving forward.

Free Tools  
Google Forms, Google Sheets
`
},

{
  task: "Reflect and summarise lessons learned",
  duration: 1,
  explanation: `
After each mini project, reflect on what worked and what didn’t.
This helps you improve faster in your next project.

Step-by-step

1. Open your project document.
   Add a final section called:
   “Retrospective”

2. Create five bullet points and add one action for each:

   - Keep Doing (e.g., breaking features into small tasks before starting)
   - Do More (e.g., testing with real users earlier)
   - Do Less (e.g., overthinking design details before core features work)
   - Stop Doing (e.g., switching tools midway through the project)
   - Start Doing (e.g., setting a clear weekly goal before building)

3. Keep each reflection short and practical.
   Focus on behaviours, not emotions.

4. End by writing one clear improvement for your next project.
   Example:
   “In my next project, I will test the core feature within 3 days.”

Outcome  
A short, structured reflection that improves how you work on future projects.

Free Tools  
Google Docs or Notion
`
},

{
  task: "Prioritise 5 features using the MoSCoW method",
  duration: 1,
  explanation: `
Product Managers decide what gets built first.
The MoSCoW method helps you prioritise features logically.

MoSCoW stands for:
• Must-have (cannot launch without it)
• Should-have (important but not critical)
• Could-have (nice to have if time allows)
• Won’t-have (not included in this version)

Step-by-step

1. Imagine you are building a simple Habit Tracker app.

2. List 5 possible features.
   Example ideas:
   - Add a new habit
   - Mark habit as completed
   - Streak counter
   - Reminder notifications
   - Share progress with friends

3. Now categorise them:

   Must-have  
   → Features the app cannot function without.
   Example:
   - Add a new habit
   - Mark habit as completed

   Should-have  
   → Important improvements, but the app still works without them.
   Example:
   - Streak counter

   Could-have  
   → Nice extras that increase delight but are not essential.
   Example:
   - Reminder notifications

   Won’t-have (for version 1)  
   → Ideas you intentionally postpone.
   Example:
   - Share progress with friends

4. Write one short reason next to each choice.
   Example:
   “Mark habit as completed. Must-have because without it, tracking doesn’t work.”

Important:
“Won’t-have” does not mean “bad idea.”
It means “not now.”

Outcome
A structured prioritisation decision, similar to what product teams do before building.

Free Tools
Google Docs, Notion, or a simple table
`
},

],

ux_skills: [

{
  task: "Define the user problem before designing",
  duration: 2,
  explanation: `
Before creating screens, UX designers first understand the problem they are solving.

You are not designing features yet.
You are clarifying the user’s struggle.

Step-by-step

1. Pick ONE tiny app idea:

   • Habit tracker (tick off a daily habit)  
   • Budgeting app (add income and expenses)  
   • Job application tracker (save applications + status)  
   • To-do list app (add and complete tasks)  
   • Meal picker (save meals and choose one randomly)  

2. In your Learning Hub, create a new page called:
   “UX Brief - [Project Name]”

3. Add the following sections:

   • The User  
   • The Problem  
   • Current Alternatives  
   • Pain Points  
   • Desired Outcome  

4. Fill in each section using simple sentences.

   The User  
   - Who is this person? (age, situation, goal)

   The Problem  
   - What frustrates them right now?

   Current Alternatives  
   - What are they using today? (Notes app, Excel, memory, nothing)

   Pain Points  
   - Why are current solutions not good enough?

   Desired Outcome  
   - What would success feel like for them?

5. Keep the entire document to one page.
   Clear and simple is better than detailed and complex.

Outcome  
A focused UX brief that clearly defines the user’s problem before any design work begins.

Free Tools  
Notion, Google Docs
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Create personas based on your chosen app idea",
  duration: 1.5,
  explanation: `
Personas help you design for a real human, not a vague “user”.

Use the same app idea and UX Brief from the previous task.

Step-by-step

1. Open your “UX Brief - [Project Name]” document.

2. Based on the problem you defined, create 1–2 fictional users who would realistically use your app.

3. For each persona, include:

   • Name and age  
   • Background or situation  
   • Main goal (related to your app idea)  
   • Frustrations (connected to the problem you identified)  
   • Current behaviour (how they solve this today)

Example (if you chose a Habit Tracker app):

“Emma, 26, marketing assistant.  
Wants to build consistent gym habits but struggles with motivation.  
Currently tracks workouts in her Notes app but forgets to update it.  
Feels discouraged when she misses a day.”

4. Keep each persona short (maximum one page).
   Focus on clarity, not detail.

Important:
Make sure the persona’s frustrations clearly connect to the problem you defined earlier.

Outcome  
A clear picture of who you are designing for, grounded in your chosen app idea.

Free Tools  
Canva, Notion, or Google Docs
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},
{
  task: "Map a user journey for your chosen app idea",
  duration: 2,
  explanation: `
A user journey shows the step-by-step experience your persona has when using your app.

Use the same app idea and persona you created in the previous tasks.

Step-by-step

1. Open Miro, FigJam, or a blank page in Notion.

2. Choose ONE realistic scenario based on your app idea.
   Example:
   - Habit tracker → User tries to log their first habit
   - Budget app → User adds their first expense
   - Job tracker → User saves a new job application
   - To-do app → User creates and completes a task

3. Create five columns:

   • Step  
   • User Action  
   • Feeling  
   • Pain Point  
   • Opportunity  

4. Fill in 5–7 steps from start to finish.

Example (Habit Tracker – first use):

Step: Downloads app  
Action: Opens app for the first time  
Feeling: Curious  
Pain Point: Unsure what to do first  
Opportunity: Clear onboarding message

Step: Tries to add first habit  
Action: Taps “Add Habit”  
Feeling: Slightly unsure  
Pain Point: Too many options  
Opportunity: Simplify input form

5. Connect steps with arrows to show flow.

Important:
Make sure the journey reflects the frustrations you identified in your persona.

Outcome  
A clear visual understanding of your user’s real experience, not just the screens.

Free Tools  
Miro (free plan), FigJam, or Notion
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Sketch wireframes for your chosen app idea",
  duration: 2.5,
  explanation: `
Wireframes are simple black-and-white layout sketches.
They focus on structure and flow, not colours or styling.

Use the same app idea, persona, and user journey from the previous tasks.

Step-by-step

1. Look at the user journey you mapped.
   Identify the 3–4 key screens your persona interacts with.

   Example:
   - Habit tracker → Onboarding, Add Habit screen, Dashboard, Progress view  
   - Budget app → Home overview, Add Expense screen, Expense list, Summary  
   - Job tracker → Dashboard, Add Application, Application Detail page  

2. Take a sheet of paper OR open https://excalidraw.com.

3. For each screen, draw simple boxes for:
   • Title/Header  
   • Main content area  
   • Buttons or key actions  
   • Navigation (if needed)

4. Label each element clearly.
   Example:
   - “Add Habit” button  
   - “Total Spent This Week”  
   - “Save Application”  

5. Keep everything black and white.
   Do NOT design colours, logos, or fonts yet.
   Focus only on layout and clarity.

6. Sketch at least 3–4 screens that connect logically.
   Imagine your persona moving through them step-by-step.

7. Take a photo or screenshot and upload it to your Learning Hub.

Important:
Ask yourself:
- Is the main action obvious?
- Is the layout simple?
- Would my persona know what to do next?

Outcome  
Rough structural layouts that translate your user journey into visible screens.

Free Tools  
Paper + pen, Excalidraw
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Turn wireframes into a clickable prototype",
  duration: 3,
  explanation: `
A clickable prototype allows someone to click through your app before any code is written.

You will recreate your wireframes digitally and connect the screens based on the user journey you mapped earlier.

Step-by-step

1. Go to https://www.figma.com → sign up (free) → click “New design file”.

2. Create one frame per screen.
   Click “Frame (F)” and choose a phone size (e.g., iPhone).
   Create frames for the 3–4 screens you sketched earlier.

3. Recreate your wireframes inside each frame.
   Use:
   • Rectangle tool (R) for buttons and sections  
   • Text tool (T) for labels  
   • Simple shapes for icons  
   
   Keep everything simple and mostly black and white.
   Focus on structure, not styling.

4. Switch to the “Prototype” tab (top right).

5. Connect screens:
   - Click on a button (e.g., “Add Habit”).
   - Drag the blue arrow to the next screen.
   - Set interaction to: On Click → Navigate To.

6. Repeat for key actions.
   Example:
   - “Add” button → Add screen  
   - “Save” button → Dashboard  
   - “Back” → Previous screen  

7. Click “Present” (▶) in the top right.
   Test your flow as if you were your persona.

Important:
Ask yourself:
- Can I complete the main task without confusion?
- Is the primary action clear on every screen?
- Does the flow match the journey map?

You do NOT need colours, branding, or polish yet.
Function and clarity come first.

Outcome  
A simple interactive prototype that demonstrates your app’s flow and logic.

Free Tools  
Figma (free plan)
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Create a basic visual design system",
  duration: 2,
  explanation: `
A design system keeps your app visually consistent.
It defines your colours, text styles, and buttons so every screen feels cohesive.

You will apply this to the same app idea and prototype you created earlier.

Step-by-step

1. In your existing Figma file, create a new page.
   Name it:
   “Styles” or “Design System”.

2. Choose your visual foundations:

   Colours
   - Pick 1 Primary colour (used for main buttons and highlights).
   - Pick 1 Accent or Secondary colour (used sparingly for emphasis).
   - Add 1 Neutral colour (dark grey or black for text).
   - Add 1 Light background colour (white or very light grey).

   Create small rectangles for each colour.
   Label them clearly:
   Example:
   - Primary - #4F46E5
   - Accent - #22C55E
   - Text - #1F2937
   - Background - #F9FAFB

3. Define basic typography:

   Create text styles for:
   - Heading (larger, bold)
   - Body (regular paragraph text)
   - Small text (optional, for captions)

   Example:
   - Heading - 24px Bold
   - Body - 16px Regular
   - Small - 14px Regular

   Type sample text for each and label them.

4. Create one consistent button style:

   - Draw a rectangle
   - Apply your Primary colour
   - Add white text
   - Add consistent padding (space inside button)
   - Slightly rounded corners (e.g., 6–8px)

   Label it:
   “Primary Button”

5. (Optional but recommended)
   Turn your button into a Component:
   - Select it → Right click → “Create component”
   This lets you reuse it across screens.

6. Apply your styles to 1-2 prototype screens.
   Replace plain black wireframe elements with your new styles.

Important:
Keep it simple.
This is not branding, it’s consistency.

Ask yourself:
- Do all buttons look the same?
- Are headings consistent?
- Is the main action visually clear?

Outcome  
A simple, reusable visual system that keeps your prototype consistent and professional.

Free Tools  
Figma (free plan)
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Test your design with real users",
  duration: 2.5,
  explanation: `
Usability testing checks how real people interact with your prototype.

The goal is not to hear “it looks nice.”
The goal is to observe where users struggle.

Use the clickable prototype you created earlier.

Step-by-step

1. Prepare 2–3 simple tasks based on your app idea.
   Example:
   - “Create an account.”
   - “Add a new habit.”
   - “Save a job application.”
   - “Log your first expense.”

   Keep tasks realistic and clear.

2. Choose 3–5 testers.
   They do not need to be designers.
   Ideally, they should match your persona as closely as possible.

3. Share your Figma prototype link.
   Click “Share” → set to “Anyone with the link can view.”

4. Run the session (15–20 minutes per person).
   - Ask them to think out loud.
   - Do NOT guide them.
   - Only say: “What are you thinking?” if they go quiet.

5. Observe carefully:
   - Where do they hesitate?
   - Do they click the wrong thing?
   - Do they ask questions?
   - Do they complete the task successfully?

6. Take structured notes in your Learning Hub:

   Create three sections:
   • Worked Well  
   • Confusing  
   • Improvement Ideas  

7. After all sessions, look for patterns.
   If 2+ people struggle with the same thing, it’s a design issue, not a user issue.

Important:
Do not defend your design.
Your job is to learn.

Outcome  
Real usability insights that help you improve clarity, flow, and user experience.

Free Tools  
Figma share link, Zoom, Google Meet, or in-person testing
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "List top three usability issues and fix them",
  duration: 2,
  explanation: `
After usability testing, you’ll choose the biggest problems and improve your prototype.
This is how designers iterate: test → fix → improve.

Step-by-step

1. Open your testing notes from the previous task.

2. Create a simple table in your Learning Hub with these columns:
   • Issue (what went wrong)
   • Severity (High / Medium / Low)
   • Fix Idea (what you will change)

3. Pick your top three issues using this rule:
   - High = users could not complete the task, or got stuck
   - Medium = users completed it but hesitated or clicked wrong things
   - Low = small confusion, wording, or visual polish

Example issues (what counts as a usability issue):
- “Users didn’t notice the main button.”
- “Users clicked the wrong tab first.”
- “Users didn’t understand what ‘Submit’ means.”

4. Write one fix idea for each issue.
   Keep fix ideas specific and simple.
   Examples:
   - Change button label from “Submit” to “Create account”
   - Make primary button bigger and move it higher
   - Add a clear back button in the top left
   - Reduce choices on the first screen

5. Open your Figma file and make the changes.
   Focus only on fixes that improve clarity and flow (not redesigning everything).

6. Save a new version in Figma:
   Name it:
   “v2 - after testing”

7. Under each issue in your table, add 1–2 lines:
   - What you changed
   - Why you changed it
   Example:
   “Moved ‘Add Habit’ button to the bottom centre because 3/5 users missed it.”

Outcome  
A second version of your design (v2) that is clearer and more usable because it’s based on real user behaviour.

Free Tools  
Notion or Google Sheets, Figma
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Design for empty, loading, and error states",
  duration: 2,
  explanation: `
Great UX handles what happens when things are empty, slow, or broken.

These states make your product feel professional and realistic.

Use the same app idea and prototype you created earlier.

Step-by-step

1. Open your Figma prototype.
   Choose your main screen (e.g., Dashboard or Home screen).

2. Duplicate that screen three times.
   Rename them:
   • Empty State
   • Loading State
   • Error State

3. Design the Empty State (no data yet).

   Ask:
   What does the user see the first time they open the app?

   Examples:
   - Habit tracker → “No habits yet. Add your first habit to get started.”
   - Budget app → “No expenses added this week.”
   - Job tracker → “You haven’t saved any applications yet.”
   - To-do app → “Your task list is empty.”

   Add:
   • Short helpful message  
   • Clear primary action button (e.g., “Add Habit”)  
   • Optional small illustration placeholder  

4. Design the Loading State (data is processing).

   Ask:
   What appears while the app is loading?

   Add:
   • A simple spinner shape OR
   • “Loading…” text
   • Optional grey placeholder blocks (skeleton layout)

   Keep it minimal and calm.

5. Design the Error State (something failed).

   Ask:
   What happens if the app cannot load data?

   Add:
   • Clear message:
     “Something went wrong.”
   • Short explanation (optional):
     “Please check your connection.”
   • Action button:
     “Try again”

6. Keep everything visually consistent:
   - Same fonts
   - Same button styles
   - Same spacing
   - Calm, reassuring tone

Important:
Your goal is not drama.
Your goal is clarity and reassurance.

Ask yourself:
- Would my persona know what to do next?
- Does the message feel helpful, not technical?

Outcome  
A more realistic and polished product that works even when things are imperfect.

Free Tools  
Figma (free plan)
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Prepare handoff notes for developers",
  duration: 1.5,
  explanation: `
Handoff notes explain exactly how your design should be built.

Designers don’t just create screens.
They communicate clearly so developers can implement them correctly.

Use the final version of your prototype (v2 after testing).

Step-by-step

1. Review your final Figma screens.
   Make sure:
   - All buttons use the same style
   - Fonts are consistent
   - Spacing looks intentional

2. Create a new page in your Figma file.
   Name it:
   “Handoff Notes”

3. Document your core design specifications:

   Typography
   - Font family (e.g., Inter, Roboto)
   - Heading size (e.g., 24px Bold)
   - Body size (e.g., 16px Regular)
   - Small text size (e.g., 14px)

   Colours
   - Primary color (include hex code, e.g., #4F46E5)
   - Accent color
   - Text color
   - Background color

   Buttons
   - Height (e.g., 48px)
   - Border radius (e.g., 8px)
   - Padding (e.g., 16px left/right)
   - Hover or pressed state (if designed)

4. For key screens, add short functional notes:

   Example:
   - “Primary button should be disabled until required fields are filled.”
   - “Error message appears below input field.”
   - “After clicking Save, user returns to Dashboard.”

5. Export any assets developers might need:
   - Icons (SVG preferred)
   - Images (PNG or JPG)
   - Illustrations (if used)

   To export:
   - Select element → Right panel → Export → Choose format → Export

6. Do a clarity check:
   Imagine a developer has never seen you before.
   Could they rebuild your design from your notes alone?

Important:
Avoid vague instructions like:
- “Make it look nice”
- “Space things evenly”

Be specific:
- “16px spacing between sections”
- “Button centered horizontally”

Outcome  
A clear, professional handoff package that allows developers to build your design accurately.

Free Tools  
Figma (free plan)
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},
{
  task: "Write your UX case study summary",
  duration: 1.5,
  explanation: `
A UX case study shows how you think, not just what you designed.

Use your chosen app idea and final prototype (v2 after testing).

Step-by-step

1. Open your Learning Hub.
   Create a new page called:
   “UX Case Study - [Project Name]”

2. Write the following sections:

   Problem  
   - What user problem were you solving?
   - Who was the persona?
   - Why did this problem matter?

   Process  
   - How did you approach the design?
   - Mention key steps:
     UX Brief → Persona → Journey Map → Wireframes → Prototype → Testing → Iteration

   Outcomes  
   - What usability issues did you discover?
   - What changes did you make?
   - How did the design improve from v1 to v2?

   Next Steps  
   - What would you improve if you had more time?
   - What would you test further?

3. Add 2–3 screenshots:
   - One early wireframe
   - One final screen (v2)
   - Optional: empty/loading/error state

4. Keep the summary concise (1–2 pages max).
   Focus on decisions and learning, not decoration.

Optional:
Export the page as a PDF to use in your portfolio.

Outcome  
A structured, professional UX case study that shows your thinking, process, and iteration.

Free Tools  
Learning Hub, Figma screenshots
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

{
  task: "Sketch one improved screen from your UX audit",
  duration: 1,
  explanation: `
UX designers don’t just spot problems, they propose clearer solutions.

Use the mini UX audit you completed earlier.

Step-by-step

1. Open your UX audit notes.
   Look at the 3 improvements you identified.

2. Choose ONE issue that:
   - Affected clarity, OR
   - Made users hesitate, OR
   - Made the main action hard to find.

   Example issues:
   - Primary button was not obvious.
   - Too many options on one screen.
   - Labels were unclear.
   - Important information was buried.

3. Take a sheet of paper OR open Excalidraw.
   Redesign that single screen.

4. Focus on improving:
   - Visual hierarchy (what stands out first?)
   - Clarity of the main action
   - Simplicity (remove unnecessary elements)

5. Label directly on your sketch:
   - What you changed
   - Why you changed it

   Example:
   - “Moved primary button higher to make it more visible.”
   - “Changed ‘Submit’ to ‘Create Account’ for clarity.”
   - “Reduced 6 options to 3 to lower cognitive load.”

6. Keep it simple and black-and-white.
   This is about structure, not visual polish.

Important:
Do not redesign the whole product.
Focus on solving one clear usability problem.

Outcome  
A focused before-and-after UX improvement that shows problem-solving skills.

Free Tools  
Paper + pen or Excalidraw
`
,
meta: { roadmap: "tech_switch", theme: "ux_skills" }
},

],

projects_product: [

{
  task: "Choose a new product idea for this project phase",
  duration: 1.5,
  explanation: `
In this phase, you will work on a completely NEW product idea.

This helps you avoid overfitting your thinking to your previous project and proves you can apply product skills to different contexts.

Step-by-step

1. Pick ONE idea from the list below (or create your own):

   • Neighbourhood discovery app for new city movers
   • AI-powered meeting notes summariser
   • Accountability app for gym consistency
   • Digital wardrobe organiser
   • Flatmate expense splitter with fairness tracking
   • Local volunteering matcher
   • Sustainable shopping comparison tool

2. Choose something slightly outside your comfort zone.

3. Write in your Learning Hub:
   • The name of the idea
   • Who it is for
   • Why it is interesting to you

4. Commit to using THIS idea for the entire projects_product theme.

Do not change it halfway.

Outcome
A fresh product idea that allows you to demonstrate adaptable product thinking beyond your earlier project.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},

  { 
  task: "Define target segment & JTBD", 
  duration: 2,
  explanation: `
Now that you’ve chosen your NEW product idea, it’s time to narrow your focus.

Strong Product Managers do not build for “everyone”.
They define ONE clear user and ONE clear job.

If this step is vague, everything that follows becomes vague.

Step-by-step

1. Pick ONE specific target segment for YOUR chosen idea.
   Be precise using this structure:

   - Role: Who exactly are they?
   - Context: When or where are they experiencing this problem?
   - Constraints: What makes solving it difficult today?

   Example target segments based on your idea options:

   • Neighbourhood discovery app:
     “Young professionals relocating alone to a new city who don’t know which areas match their lifestyle.”

   • AI meeting notes summariser:
     “Startup founders running back-to-back virtual meetings who struggle to extract clear action items.”

   • Accountability gym app:
     “Office workers who buy gym memberships in January but lose consistency after 3 weeks.”

   • Digital wardrobe organiser:
     “Busy professionals who own many clothes but feel they ‘have nothing to wear’ each morning.”

   • Flatmate expense splitter:
     “Three flatmates sharing rent and groceries who argue about who paid for what.”

   • Local volunteering matcher:
     “New city movers who want to meet people through volunteering but don’t know where to start.”

   • Sustainable shopping comparison tool:
     “Environmentally conscious shoppers who want ethical options but don’t trust brand marketing claims.”

2. Write your JTBD (Jobs To Be Done) statement.

   Use this template:

   “When ___, I want to ___, so I can ___.”

   Examples:

   • Neighbourhood discovery app:
     “When I move to a new city, I want to compare neighbourhoods based on lifestyle fit, so I can choose where to live with confidence.”

   • Flatmate expense splitter:
     “When we share expenses, I want costs calculated fairly and automatically, so we avoid awkward conversations.”

   • Digital wardrobe organiser:
     “When I’m getting dressed for work, I want quick outfit suggestions from what I already own, so I can save time and feel confident.”

3. List 3 pains your target user currently experiences.
   (What frustrates them? What feels inefficient? What causes tension or stress?)

4. List 3 desired outcomes.
   (More clarity? Less conflict? Faster decisions? More confidence?)

5. Write one “anti-user”.
   Who is this NOT for?
   (Example: “Enterprise HR departments managing 1,000 employees.”)

Outcome
A sharply defined user and job statement that anchors the rest of your product decisions in this theme.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},

  { 
  task: "Draft a lean PRD for one core feature", 
  duration: 2.5,
  explanation: `
You are not writing a 20-page document.

A lean PRD (Product Requirements Document) is a focused, practical document that explains ONE feature clearly enough that someone could build it.

Important:
Choose ONE core feature from your chosen product idea, not the entire app.

Examples of a “core feature” per idea:

• Neighbourhood discovery app → “Compare neighbourhoods side-by-side”
• AI meeting notes summariser → “Generate automatic action items from transcript”
• Accountability gym app → “Daily workout check-in with streak tracking”
• Digital wardrobe organiser → “Create outfit from saved clothing items”
• Flatmate expense splitter → “Auto-calculate who owes who after shared purchase”
• Local volunteering matcher → “Match users to opportunities based on interests”
• Sustainable shopping comparison tool → “Display sustainability score for a product”

Now write your lean PRD.

Step-by-step

1. Problem Statement (2–3 sentences)

Describe the specific problem this ONE feature solves.

Example (Flatmate splitter):
“Flatmates often split costs unevenly or forget who paid. This causes tension and manual tracking in notes or messages. Users need a simple way to calculate balances automatically.”

2. Goal + Non-Goals

Goal:
What does this feature successfully enable?

Non-goals:
What are you explicitly NOT building right now?

Example (Wardrobe app):
Goal → Allow users to combine saved items into a simple outfit view.
Non-goals → AI stylist recommendations, social sharing, e-commerce integration.

3. Happy Path Flow (5–8 bullets)

Describe what happens when everything works perfectly.

Example (AI meeting summariser):

• User uploads meeting transcript  
• System processes transcript  
• Action items are extracted  
• User sees summary screen  
• User edits if needed  
• User exports or shares summary  

Keep it simple and sequential.

4. Basic Requirements

List the minimum things needed for this feature to function.

Include:
• Inputs (What does the user provide?)
• Outputs (What does the system produce?)
• Constraints (Time, privacy, device limits, etc.)

Example (Gym accountability app):

Input → User taps “Workout complete”
Output → Streak increases + confirmation message
Constraints → Must work in under 2 seconds; no complex setup required

5. Success Metrics (2–3) + One Guardrail

Success metrics measure if the feature works.

Examples:

• % of users who use feature at least once per week  
• % of summaries exported after generation  
• % of expenses successfully split without manual edits  

Guardrail metric:
A metric that ensures you’re not harming user experience.

Example:
• Error rate < 5%
• Average load time under 3 seconds
• User complaints about incorrect calculations remain low

6. Open Questions & Assumptions

Write at least 2 assumptions and 2 open questions.

Example:
Assumption → Users trust automatic calculations.
Question → How accurate must sustainability scoring be to feel credible?

Outcome
A focused, build-ready lean PRD for one core feature that shows structured product thinking without unnecessary complexity.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},

  { 
  task: "User story map + scope v1", 
  duration: 2,
  explanation: `
Now that you’ve written a lean PRD for one feature, zoom out.

A user story map helps you:
• See the full journey end-to-end  
• Avoid building isolated features  
• Decide what version 1 (v1) actually includes  

You are designing the smallest complete experience, not the biggest product.

Step-by-step

1. List the main stages of the user journey (start → finish).

Think high-level first.

Examples based on your idea:

• Neighbourhood discovery app:
  Discover areas → Compare neighbourhoods → Save favourites → Decide

• Flatmate expense splitter:
  Create group → Add expense → Auto-calculate split → View balances

• AI meeting summariser:
  Upload transcript → Generate summary → Review/edit → Export/share

• Gym accountability app:
  Create account → Log workout → View streak → Get reminder

Keep it 4–6 stages maximum.

2. Write user stories under each stage.

Use this format:
“As a [user], I want to [action], so that [benefit].”

Example (Expense splitter):

Stage: Add expense  
• As a flatmate, I want to add a shared purchase, so that everyone knows who paid.  
• As a flatmate, I want the split calculated automatically, so that we avoid manual math.

3. Mark each story as:

• Must-have (cannot deliver value without it)  
• Nice-to-have (improves experience but not required for v1)

Be strict.
If removed and the product still works → it’s not a must-have.

4. Define your v1 scope.

Your v1 must:
• Complete the job from start to finish  
• Avoid advanced features  
• Deliver one clear outcome  

Example (Wardrobe organiser v1):
User can upload items, create one outfit, and save it.
(No AI suggestions, no social sharing, no shopping links.)

Example (Neighbourhood app v1):
User can compare 3 neighbourhoods using 5 key attributes and save one favourite.

5. Write a one-sentence v1 definition.

Format:
“v1 allows [target user] to [core action] so they can [core benefit].”

Example:
“v1 allows flatmates to split shared expenses automatically so they avoid awkward money conversations.”

Outcome
A tightly scoped v1 that delivers real value without feature creep or overbuilding.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},

  { 
  task: "Delivery plan + risks + mitigation", 
  duration: 1.5,
  explanation: `
This task helps you plan delivery like a real PM.
You’re turning your v1 scope into a simple plan that your future self can actually follow.

Use your v1 scope from the previous task.

Step-by-step

1. Create a simple delivery plan in your Learning Hub with 5 milestones:
   • Discovery (confirm the problem + assumptions)
   • Design (wireframes/prototype if needed)
   • Build (implementation of v1)
   • Test (alpha/usability + bug fixes)
   • Launch (release + measure)

2. Add a rough timeline to each milestone.
   Choose ONE format:
   - Weeks (e.g., Week 1, Week 2…), OR
   - Sprints (Sprint 1, Sprint 2…)

   Example (2-sprint plan):
   - Sprint 1: Discovery + Design + start Build
   - Sprint 2: Finish Build + Test + Launch

3. Break v1 into 3–5 mini-deliverables (milestones inside milestones).
   These should be outcome-based, not vague.
   Examples (pick ones that match your idea):

   • Flatmate expense splitter:
     - Users can create a flat group
     - Users can add an expense
     - App calculates balances correctly

   • AI meeting summariser:
     - User can upload/paste transcript
     - Summary + action items are generated
     - User can export/share results

   • Neighbourhood discovery:
     - User can browse neighbourhoods
     - User can compare 2–3 areas side-by-side
     - User can save favourites

4. Identify your top 3 risks.
   Pick from different categories if possible.

   Example risk types + examples for your ideas:
   - Technical risk: “AI summarisation quality is inconsistent”
   - Scope risk: “Too many features creep into v1”
   - Data risk: “Neighbourhood data is hard to source or keep accurate”
   - Dependency risk: “Relying on an external API that may change”
   - Stakeholder risk (even if it’s just you): “I keep changing priorities”

5. Add a mitigation for each risk.
   Use one of these mitigation tactics:

   • Buffer: add time for uncertainty  
   • Spike: do a quick 1–2 hour test early (prototype or technical test)  
   • Decision deadline: set a date where you lock scope  
   • Fallback plan: define a simpler option if the risk happens  

   Examples:
   - Risk: “AI summaries aren’t reliable”
     Mitigation: “Do a quick spike with 10 sample transcripts and define ‘good enough’ criteria.”
   - Risk: “Scope creep”
     Mitigation: “Lock v1 scope by Friday and move all extra ideas into a ‘v2 backlog’.”
   - Risk: “Data accuracy issues”
     Mitigation: “Use a minimal dataset for v1 (top 10 neighbourhoods) and clearly label as ‘beta’.”

6. Define ONE weekly check-in habit (15 minutes).
   Add a repeating weekly ritual in your Learning Hub:

   - What did I complete this week?
   - What’s blocked?
   - What’s the next smallest task?
   - Did my scope change? If yes, why?

Outcome
A realistic delivery plan with clear milestones, known risks, and simple mitigations, so you move faster with fewer surprises.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},
{ 
  task: "Basic wireframes (happy path)", 
  duration: 2,
  explanation: `
Before adding colours, branding, or visual polish, you must design the structure.

Wireframes are simple black-and-white sketches that focus on layout, flow, and clarity, and not aesthetics.

For this task, assume your product is:
Flatmate expense splitter with fairness tracking.

Step-by-step

1. Identify the key screens (3–6 maximum).

For a simple v1, your screens might be:

• Home / Balance overview  
• Create or join flat group  
• Add expense  
• Expense details  
• Balance breakdown screen  

Do NOT add extra screens unless absolutely necessary.

2. Draw low-fidelity wireframes.

Use paper or a simple tool (Excalidraw or Figma).
Only use:

• Boxes  
• Lines  
• Labels  
• Placeholder text  

Example (Add expense screen layout):

[ Title: Add Expense ]
[ Amount input ]
[ Description input ]
[ Paid by dropdown ]
[ Split equally toggle ]
[ Save button ]

No colours. No logos. No shadows.

3. Map the happy path click-by-click.

Write the exact user journey assuming everything works perfectly.

Example happy path:

• User opens app  
• User creates flat group  
• User adds £60 grocery expense  
• App splits equally between 3 flatmates  
• Balance screen updates automatically  

Draw arrows between screens to show the flow.

4. Label key UI elements and states.

Add notes directly on your wireframes:

• “Primary button”  
• “Disabled until amount entered”  
• “Error state if amount is empty”  
• “Success message after saving expense”  

This forces you to think about interaction logic.

5. Share with one person.

Show your wireframes and ask:

“Can you explain what happens from start to finish?”

If they hesitate or get confused, simplify the structure.

Do not explain it to them first.
Let the design speak.

Outcome
A simple, logical, testable flow that prevents costly rework and feature confusion later, and proves you understand structure before styling.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},
  { 
  task: "Stakeholder readout (slides/1-pager)", 
  duration: 2,
  explanation: `
A stakeholder readout is a short update that helps others understand your project quickly.
You can do this as:
• 3–5 slides, OR
• a one-page document

The goal is clarity, not perfect design.

Step-by-step

1. Create your format (pick one):
   - Slides: 3–5 slides max
   - 1-pager: one page max

2. Summarise the Problem, User, and Goal in 3 bullets total.
   Keep each bullet to one sentence.
   Example structure:
   • Problem: ___
   • User: ___
   • Goal: ___

3. Show v1 scope (what’s in vs out).
   Make two short lists:
   • In v1 (3–6 items)
   • Out of v1 / Later (3–6 items)
   Keep scope strict and easy to scan.

4. Share timeline + current status.
   Include:
   • Key milestones (discovery, design, build, test, launch)
   • Where you are today (e.g., “Design complete, build in progress”)
   • Any blockers (if relevant)

5. Call out:
   • Top 3 risks (short bullets)
   • Decisions needed (what you need agreement on)
   Example decisions:
   - “Confirm v1 scope is locked”
   - “Approve which user segment we’re prioritising”
   - “Decide whether we include X in v1 or push to v2”

6. End with next steps + owners.
   List 3–5 actions.
   Each action should have:
   • What will be done
   • Who owns it (even if it’s just you)
   • When (this week / next week is fine)

Tip:
If someone only reads the first and last section, they should still understand:
- What we’re doing
- What’s included
- What happens next

Outcome
Alignment, fewer misunderstandings, and faster decisions because your update is simple and structured.

Free Tools
Google Slides, PowerPoint, Canva, or your Learning Hub
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},

  { 
  task: "Define success metrics & guardrails", 
  duration: 1.5,
  explanation: `
Metrics help you answer one simple question:
Did this feature actually work?

Guardrails help you answer another:
Did anything go wrong while trying to make it work?

This task makes your project measurable instead of opinion-based.

Step-by-step

1. Pick 2–3 success metrics.

Choose metrics that match your v1 goal.
Common types include:

• Activation – Did users complete the key first action?
• Adoption – Are users using the core feature?
• Engagement – Are they coming back or repeating the action?
• Conversion – Did they move from step A to step B?

Examples (generic structure):

• % of new users who complete the core action within 24 hours  
• % of users who use the feature at least once per week  
• Average number of core actions per user  

2. Define how you’ll measure each metric.

For each metric, write:

• Event name – What action is tracked?  
• Source – Where does the data come from? (app events, database logs, survey, etc.)  
• Time window – When is it measured? (Day 1, Week 1, 30 days post-launch)

If you can’t explain how it’s measured, it’s too vague.

3. Choose 1–2 guardrail metrics.

Guardrails protect user experience and trust.

Examples:

• Error rate (how often something fails)  
• Load time or latency  
• User complaints or support tickets  
• Drop-off rate after key step  
• Opt-outs or churn  

4. Write target ranges (even if provisional).

You don’t need perfect numbers.
You need directional clarity.

Example format:

• Activation target: 60–80%  
• Engagement target: 40% weekly return rate  
• Error rate guardrail: < 5%  

Targets can be estimates, you can refine later.

5. Add a review date.

Write a specific review moment:
“Review metrics two weeks after launch.”
or
“Review after first 50 users.”

If you don’t schedule review, metrics get ignored.

Tip:
If a metric wouldn’t change your decision-making, it’s not useful.

Outcome
A simple measurement plan that defines what success looks like, and what failure looks like, so you can improve based on data, not guesswork.
`,
  meta: { roadmap: "tech_switch", theme: "projects_product" }
},
{ 
  task: "Retrospective with lessons learnt", 
  duration: 1.5,
  explanation: `
A retrospective (retro) is how you improve your process, not just your product.

This is what strong product teams do after every release.
The goal is honesty and learning, not perfection.

Step-by-step

1. Write: What went well (minimum 3 bullets).

Focus on behaviours and decisions, not just outcomes.

Examples:
• Scope stayed locked after v1 definition  
• User testing revealed issues early  
• Wireframes made development clearer  
• Weekly check-ins kept momentum  

2. Write: What didn’t go well (minimum 3 bullets).

Be specific. Avoid vague statements like “time management”.

Examples:
• Spent too long polishing non-essential details  
• Added features outside v1 scope  
• Left testing too late  
• Didn’t validate assumptions early  

3. Identify root causes (briefly).

For 1–2 items above, ask:
Why did this happen?

Example:
“Scope creep happened because I didn’t clearly define what was out of scope.”

4. Choose 2 changes to try next time.

These must be behavioural and concrete.

Weak change:
“I’ll be more organised.”

Strong change:
• Lock scope before designing  
• Run a 30-minute assumption check before building  
• Schedule testing before development starts  

5. Assign an owner and trigger.

Even if the owner is you.

Write:
• Owner: ___  
• When this will be applied: ___ (e.g., next project, next sprint)

6. Save your retro notes somewhere searchable.

Create a folder or page titled:
“Project Retrospectives”

Future-you should be able to revisit this before starting the next build.

Tip:
If the same mistake appears in two retros, it’s a system issue, not bad luck.

Outcome
A repeatable improvement loop that strengthens your product thinking and prevents the same mistakes from showing up in your next project.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
},
  { 
  task: "Publish case study (Notion/portfolio)", 
  duration: 1.5,
  explanation: `
A case study turns your project into proof you can think like a Product Manager.
It should be easy to skim and focused on decisions, trade-offs, and learning.

Step-by-step

1. Create a new page in your Learning Hub (or Notion/portfolio page).
   Title it:
   “Product Case Study - [Project Name]”

2. Write the story in a simple structure:

   • Problem
     - Who was the target user?
     - What problem were you solving?
     - Why did it matter?

   • Approach
     - How did you decide what to build?
     - Include your key choices:
       target segment & JTBD → lean PRD → v1 scope → delivery plan → metrics

   • Outcome
     - What did you produce?
     - What changed after testing/feedback?
     - What did you learn?

3. Add key artifacts (screenshots or links).
   Include 3–6 items max to keep it clean:
   - Lean PRD (summary)
   - User story map + v1 scope
   - Wireframes (happy path)
   - Delivery plan + risks
   - Success metrics & guardrails

Tip: Use screenshots instead of long text blocks.

4. Add “What I’d improve next”.
   Write 3 bullets:
   - One product improvement (feature or scope)
   - One UX improvement (clarity, flow)
   - One process improvement (how you’d work differently)

5. Make it skimmable.
   - Use headings
   - Use short paragraphs (2–4 lines)
   - Use bullet points
   - Add images/screenshots

6. Publish and share.
   - If using Notion: Share → Publish to web
   - Copy the link
   - Add it to:
     • Your CV (Projects section)
     • Your LinkedIn Featured section

Outcome
A portfolio-ready case study that demonstrates product thinking, decision-making, and iteration, not just output.
`
,
meta: { roadmap: "tech_switch", theme: "projects_product" }
}
],


  cs_basics: [

{
  task: "Set up your Coding Learning Hub",
  duration: 1.5,
  explanation: `
This is where you will organise everything you learn about programming.

Professional developers document concepts, errors, and patterns.
Beginners who don’t do this forget 60–70% within weeks.

This is not reflection.
This is your technical workspace.

Step-by-step

1. Open your Learning Hub.
2. Create a new section called “Coding”.

3. Add these sub-pages:
   • Concepts (variables, loops, functions, APIs)
   • Errors & Fixes (copy real error messages + solutions)
   • Code Snippets (reusable examples)
   • Vocabulary (technical terms explained simply)
   • Mini Projects

4. Add your first entry:
   - Write what a variable is
   - Add one code example
   - Explain it in your own words

5. After every coding session:
   - Add one concept
   - Add one mistake you made
   - Add one working snippet

Outcome
A structured coding knowledge base that compounds over time instead of disappearing.
`,
meta: { roadmap: "tech_switch", theme: "cs_basics" }
},

{
  task: "Set up basic coding tools and make your first saved file",
  duration: 1.5,
  explanation: `
This is your official start as a developer.

Do not worry if this feels technical. 
You are simply installing tools and creating your first file.

What you need to know first

• VS Code is a free program where developers write code.
• Python is a beginner-friendly programming language.
• Git helps you save versions of your work (like Google Docs version history, but for code).
• Every developer starts by printing “Hello, world!”

Take this slowly. Follow each step exactly.

────────────────────────
PART 1: Install VS Code
────────────────────────

1. Go to the official website:
   https://code.visualstudio.com/

2. Click the big “Download” button.
   It will detect whether you use:
   • Windows
   • Mac
   • Linux

3. Open the downloaded file and follow the installation steps.
   Accept default settings.

4. Once installed, open VS Code.

You should now see a mostly empty window with a sidebar.

Good. That means it worked.

────────────────────────
PART 2: Install Python
────────────────────────

You need Python to run Python files.

1. Go to:
   https://www.python.org/downloads/

2. Click “Download Python” (latest version).

3. IMPORTANT (Windows users):
   When installing, tick the box:
   ☑ “Add Python to PATH”

4. Complete installation.

To check it worked:
• Open your computer terminal (Command Prompt on Windows, Terminal on Mac).
• Type:
  python --version

If you see a version number, you're ready.

────────────────────────
PART 3: Create Your First File
────────────────────────

1. Open VS Code.
2. Click:
   File → New File
3. Type exactly this:

   print("Hello, world!")

4. Click:
   File → Save As
5. Save it as:

   hello.py

Choose a folder you can easily find again (e.g., Desktop or Documents).

The ".py" tells your computer this is a Python file.

────────────────────────
PART 4: Run Your File
────────────────────────

1. In VS Code, click:
   View → Terminal

A terminal panel will open at the bottom.

2. Type:

   python hello.py

3. Press Enter.

If everything worked, you will see:

   Hello, world!

Congratulations.
You just executed your first program.

────────────────────────
PART 5: Install Git (Optional but Recommended)
────────────────────────

Git is how developers save work properly.

1. Go to:
   https://git-scm.com/downloads

2. Download for your operating system.
3. Install using default settings.

To check it worked:
• Open terminal
• Type:
  git --version

If you see a version number, Git is installed.

────────────────────────
PART 6: Save Your Work with Git
────────────────────────

In VS Code terminal, type:

   git init
   git add .
   git commit -m "My first code file"

This does three things:
• git init → starts version tracking
• git add . → selects your file
• git commit → saves a version snapshot

If it asks for your name/email:
Type:
   git config --global user.name "Your Name"
   git config --global user.email "youremail@example.com"

Then repeat the commit command.

────────────────────────

Outcome

• You installed real developer tools.
• You created and ran your first program.
• You saved it using version control.
• You now have a working coding setup.

This is not small.
This is your foundation.

Free Tools
• VS Code - https://code.visualstudio.com/
• Python - https://www.python.org/downloads/
• Git - https://git-scm.com/downloads
`
,
meta: { roadmap: "tech_switch", theme: "cs_basics" }
},

{
  task: "Understand what 'coding' actually means",
  duration: 1,
  explanation: `
Before writing any code, it's important to understand what coding really is.

Many beginners imagine coding as something abstract, mathematical, or only for “geniuses”.
In reality, coding is simply structured communication.

At its core:
Coding = giving very clear, step-by-step instructions to a computer.

What you need to know first

• A computer program is just a list of instructions.
• Coding means writing those instructions in a specific language (like Python or JavaScript).
• The computer does not think or guess.
• It only does exactly what you tell it. Nothing more, nothing less.
• If something breaks, it usually means an instruction was unclear or incomplete.

Think of a computer like:
- A very fast assistant
- Who follows instructions perfectly
- But has zero common sense

If you tell a human:
“Make me a sandwich.”
They’ll fill in the gaps.

If you tell a computer:
“Make a sandwich.”
It will have no idea what that means.

You must say:
1. Take bread.
2. Add butter.
3. Add cheese.
4. Close sandwich.

That level of clarity is coding.

Step-by-step

1. Open your Learning Hub.
2. Create a new page titled:
   “What Coding Is”.

3. Write this sentence in your own words:
   “Coding is giving clear, step-by-step instructions to a computer.”

4. Now write one everyday example of instructions, such as:
   • A recipe
   • Directions to a location
   • Instructions for assembling furniture
   • Instructions for making tea

5. Under your example, answer:
   - What would happen if a step was missing?
   - What would happen if a step was unclear?
   - What would happen if steps were in the wrong order?

6. Finally, write:
   “Computers behave the same way.”

Important mindset shift

When code doesn’t work:
It does not mean you are bad at coding.
It means one instruction needs adjusting.

That’s normal.
That’s debugging.
That’s learning.

Outcome
A calm, realistic understanding of coding as structured instructions, which reduces fear and makes the learning process feel logical instead of mysterious.
`
,
meta: { roadmap: "tech_switch", theme: "cs_basics" }
},
{
  task: "Learn what a programming language is",
  duration: 1,
  explanation: `
Before you learn to code, you need to understand what a programming language actually is.

A computer only understands binary (0s and 1s).
Humans cannot realistically write in binary.
So we use programming languages as a bridge between humans and computers.

A programming language is a structured way to give instructions to a computer in a format humans can read and write.

Think of it like this:
You speak English.
A computer speaks binary.
A programming language translates your clear instructions into something the computer can execute.

Important ideas to understand

• You do NOT need to learn every programming language.
• Most developers focus on 1–3 languages.
• All languages follow rules called syntax (like grammar in English).
• If you break the syntax rules, the program will not run.
• Different languages are better suited for different tasks.

Examples of common programming languages

• Python – beginner-friendly, used for data, AI, automation, backend
• JavaScript – used for websites and web apps
• Java – used in enterprise systems and Android apps
• C++ – used in game engines and performance-heavy systems

You are starting with Python.

────────────────────────
What is Python?
────────────────────────

Python is a high-level programming language.

High-level means:
It is closer to human language than machine language.

Python was designed to be:
• Easy to read
• Simple to write
• Clear and structured
• Beginner-friendly

Python is commonly used for:

• Data analysis (e.g., analysing spreadsheets or large datasets)
• Automation (e.g., renaming files automatically)
• Web development (building backend systems)
• Artificial Intelligence & Machine Learning
• Scripting small tools and utilities

Many major companies use Python:
• Google
• Netflix
• Instagram
• Spotify

Python is powerful, not “just beginner”.

────────────────────────
Step-by-step
────────────────────────

1. Open your Learning Hub.
2. Create a new page titled:
   “Programming Languages”.

3. Write this definition in your own words:
   “A programming language is a structured system used to tell a computer what to do.”

4. Underneath, answer:
   Why can’t humans just write in binary?

5. Now create a section titled:
   “What is Python?”

6. Write:
   - Python is a high-level programming language.
   - It is designed to be readable and simple.
   - It is used for data, automation, web apps, and AI.

7. Add this simple example:

   print("Hello")

8. Ask yourself:
   Why does this look readable compared to something like:
   01001000 01100101 01101100 01101100 01101111

Notice:
The word “print” is a real English word.
The quotation marks show text.
The parentheses group the instruction.

That readability is why Python is beginner-friendly.

Optional curiosity exercise (2 minutes)
Search:
“Why is Python called Python?”

(Answer: It was named after Monty Python, not the snake.)

────────────────────────

Outcome

You understand:
• What a programming language is
• Why languages exist
• Why Python is a smart first choice
• That coding is structured communication, not magic

This foundation reduces confusion later when syntax errors appear.
`
,
meta: { roadmap: "tech_switch", theme: "cs_basics" }
},

{
  task: "Understand what data is",
  duration: 1,
  explanation: `
Before you write meaningful code, you need to understand one core idea:

Computers work with data.

Data simply means information.

If coding is giving instructions,
data is what those instructions act on.

For example:
If you tell a program to calculate something,
it needs numbers.
If you tell a program to send a message,
it needs text.
If you tell a program to sort people,
it needs names, ages, or categories.

What you need to know first

• Data is everywhere in daily life.
• Data can be numbers, words, dates, categories, or even images.
• Computers store, organise, and manipulate data.
• Most programming is about transforming data from one form into another.

Think of apps you use:
- Instagram stores photos (image data) and captions (text data).
- Banking apps store transactions (numbers + dates).
- Spotify stores song titles (text) and play counts (numbers).
- Weather apps show temperatures (numbers) and conditions (categories like “rainy”).

Without data, programs would have nothing to work with.

────────────────────────
Common Basic Types of Data
────────────────────────

You don’t need to memorise these yet, but start noticing them:

• Text (also called “strings”)
  Example: "Hello", "London", "£25"

• Numbers
  Example: 10, 3.14, -7

• Categories (also called labels)
  Example: "Paid" vs "Unpaid"
           "Active" vs "Inactive"

• Dates
  Example: 01/03/2026

Later in coding, these different types matter.

────────────────────────
Step-by-step
────────────────────────

1. Open your Learning Hub.
2. Create a new page titled:
   “What Is Data?”

3. Write this sentence:
   “Data is information that a computer can store and use.”

4. Now write five everyday examples of data:
   - A grocery list
   - Phone numbers
   - Bank transactions
   - Movie ratings
   - Weather temperatures

5. Under each one, identify the type:
   - Grocery list → text
   - Phone number → number (even though we treat it like text sometimes)
   - Bank transaction → number + date + category
   - Movie rating → number
   - Weather temperature → number

6. Now answer:
   What would happen if the data was wrong?
   (Example: wrong bank number, wrong temperature, wrong name)

7. Write this sentence:
   “When coding, we organise and structure data so the computer can process it correctly.”

────────────────────────

Important mindset shift

Coding is not about typing random symbols.
It is about:
• Storing data
• Changing data
• Organising data
• Moving data
• Displaying data

Almost everything in tech revolves around data.

Outcome
A clear understanding that programming is about working with information, which prepares you for variables, lists, and data structures next.
`,
meta: { roadmap: "tech_switch", theme: "cs_basics" }
},
{
  task: "Learn what variables are",
  duration: 1.5,
  explanation: `
Variables are one of the most important concepts in coding.
If you understand variables, you understand the foundation of programming.

A variable is a named place in memory where the computer stores information.

Think of a variable like:

• A labelled box  
• A sticky note with a name on it  
• A container with a name and something inside  

The name is called the variable name.
What you store inside is called the value.

For example:
If you write:

name = "Sarah"

You are telling the computer:
“Create a box called name and put the text Sarah inside it.”

What you need to know first

• Variables store data.
• The equals sign (=) does NOT mean “equals” like in maths.
  It means “store this value inside this name”.
• Values can be:
  - Text (called strings)
  - Numbers (integers or decimals)
  - Later: lists, true/false, and more

Important:
The computer remembers the variable so you can use it later.

────────────────────────
Step-by-step
────────────────────────

1. Open VS Code.
2. Create a new file named:

   variables.py

3. Type the following exactly:

   name = "Sarah"
   age = 30
   city = "London"

4. Now add this line underneath:

   print(name, age, city)

5. Save the file.

6. Open the terminal in VS Code:
   View → Terminal

7. Run the file by typing:

   python variables.py

8. Press Enter.

You should see:

   Sarah 30 London

That output is the computer reading the variables
and printing their stored values.

────────────────────────
Understand What Just Happened
────────────────────────

You created three variables:
• name stores text
• age stores a number
• city stores text

Then you told Python:
“Print whatever is inside those containers.”

The computer looked up the values
and displayed them.

────────────────────────
Try This Small Experiment
────────────────────────

Change:

   age = 30

to:

   age = 45

Run the program again.

Notice:
The output changes.

That is because the variable now stores a different value.

This is powerful.
Programs become dynamic because variables can change.

────────────────────────
Write This in Your Learning Hub
────────────────────────

Open your Learning Hub and write:

• A variable is a named container for storing data.
• The = symbol means “store this value”.
• I can change the value and the output will change.
• Variables allow programs to remember and reuse information.

────────────────────────

Why Variables Matter

Almost every program ever written uses variables.

Apps use variables to store:
• Your username
• Your email
• Your balance
• Your preferences
• Your messages

Without variables, programs could not remember anything.

Outcome
A clear understanding that variables store information in named containers, making programs flexible and dynamic instead of fixed and repetitive.

Free Tools
VS Code, Python
`
},

{
  task: "Understand what functions are",
  duration: 1.5,
  explanation: `
Functions are one of the most powerful ideas in programming.

If variables are containers for data,
functions are containers for actions.

A function is a reusable block of code that performs a specific task.

Think of a function like:

• A recipe you can reuse  
• A machine button that performs a task  
• A mini-program inside your main program  

Instead of writing the same instructions again and again,
you write them once inside a function -
then “call” the function whenever you need it.

What you need to know first

• You define a function using the word def.
• You give the function a name.
• The code inside the function is indented (usually by 4 spaces), and in VS Code you can simply press Tab to insert the correct indentation automatically.
• The function does nothing until you call it.
• Calling a function means telling the computer to run it.

Important:
Indentation (the spaces before the code) matters in Python.
The indented lines belong to the function.

────────────────────────
Step-by-step
────────────────────────

1. Open VS Code.
2. Create a new file named:

   functions.py

3. Type this exactly:

   def greet():
       print("Hello, welcome!")

4. Save the file.

If you run it now, nothing will happen.
That is normal.

Why?
Because you defined the function -
but you did not call it yet.

5. Now add this line below it:

   greet()

6. Save the file again.

7. Open the terminal:
   View → Terminal

8. Run the file:

   python functions.py

You should see:

   Hello, welcome!

That happened because you called the function.

────────────────────────
Understand What Just Happened
────────────────────────

You created a function named greet.
Inside it, you placed one instruction:
print a message.

When you wrote:

   greet()

You told the computer:
“Run the instructions stored inside greet.”

That is all a function is.

────────────────────────
Why Functions Matter
────────────────────────

Imagine you want to greet 10 users.

Without a function, you would write:

   print("Hello, welcome!")
   print("Hello, welcome!")
   print("Hello, welcome!")

With a function, you write it once:

   def greet():
       print("Hello, welcome!")

Then call it 10 times:

   greet()
   greet()
   greet()

Much cleaner.
Much more organised.

Real programs can contain hundreds of functions.

Functions help you:
• Avoid repeating yourself
• Keep code organised
• Break big problems into smaller pieces
• Make programs easier to read

────────────────────────
Try This Small Experiment
────────────────────────

Change your function to:

   def greet():
       print("Hello!")
       print("Nice to see you.")
       print("Have a great day.")

Run it again.

Notice:
All three lines run when you call greet().

That’s because everything indented under def belongs to the function.

────────────────────────
Write This in Your Learning Hub
────────────────────────

Open your Learning Hub and write:

• A function is a reusable block of instructions.
• I define a function using def.
• I call a function by writing its name with parentheses.
• Indentation matters in Python.
• Functions help organise programs.

────────────────────────

Outcome
A clear understanding that functions group reusable actions together, forming the structure of real programs and making code organised instead of repetitive.

Free Tools
VS Code, Python
`
},

{
  task: "Understand classes (practical foundations)",
  duration: 1,
  explanation: `
Classes allow you to group data and related functions together.
Most real-world Python libraries use classes, including machine learning frameworks.

You do not need advanced theory.
You need to understand the structure and recognise the pattern.

────────────────────────
Step 1: Understand the structure
────────────────────────

A class:
• Stores data (attributes)
• Contains functions that operate on that data (methods)

Basic structure:

class Example:
    def __init__(self, value):
        self.value = value

    def show(self):
        print(self.value)

Key ideas:
• "__init__" runs when you create the object.
• "self" refers to the specific object created.
• Methods are functions defined inside the class.

────────────────────────
Step 2: Type and run a simple example
────────────────────────

Create a new file called:

classes_practice.py

Write:

class Counter:
    def __init__(self):
        self.count = 0

    def increase(self):
        self.count += 1

    def display(self):
        print(self.count)

Below it, add:

c = Counter()
c.increase()
c.increase()
c.display()

Run the file.
It should print: 2

Ensure you understand:
• Where "count" is stored
• Why "self.count" is used

────────────────────────
Step 3: Recognise the pattern used in ML
────────────────────────

Many ML libraries follow this structure:

model = SomeModel()
model.fit(data)
model.predict(new_data)

That pattern comes from classes.

You are not required to build complex systems.
You are required to understand how this structure works.

────────────────────────
Step 4: Small reinforcement exercise
────────────────────────

Create a class called "Tracker" with:

• an attribute called total (start at 0)
• a method called add(number)
• a method called show()

Test it by adding two numbers and printing the result.

Keep it simple.
The goal is structural understanding.

Outcome
You can read and write simple classes, understand __init__ and self, and recognise class-based structure used in real projects.

Free Tools
Python, VS Code
`
},

{
  task: "Learn how to read error messages without panic",
  duration: 1,
  explanation: `
One of the biggest mindset shifts in coding is this:

Errors are not proof that you are bad at coding.
Errors are proof that you are coding.

Professional developers see errors every single day.
The difference is: they read them calmly.

An error message is not an attack.
It is a report.

It usually tells you:
• What went wrong
• Where it happened
• What kind of problem it is

Your job is not to avoid errors.
Your job is to interpret them.

────────────────────────
What you need to know first
────────────────────────

• Errors are normal and expected.
• Every small mistake produces an error.
• The computer is very literal.
• Error messages look scary because they contain technical words.
• Most beginner errors are small (spelling, missing quotes, wrong indentation).

When you see red text:
Slow down.
Do not panic.
Read from the bottom up.

The most useful line is often the last line.

────────────────────────
Step-by-step
────────────────────────

1. Open your file:

   variables.py

2. Change this line:

   name = "Sarah"

   to:

   nme = "Sarah"

3. Make sure you still have this line below:

   print(name)

4. Save the file.

5. Run the file again:

   python variables.py

You will now see an error.

It may look long.
That is normal.

────────────────────────
How to Read the Error
────────────────────────

Look for three things:

1. The error type  
   Example:
   NameError

2. The line number  
   It will say something like:
   line 4

3. The explanation  
   It may say:
   name 'name' is not defined

What does this mean?

You changed the variable to nme,
but you are still printing name.

The computer is saying:
“I don’t know what name is.”

That’s all.

────────────────────────
Fix It
────────────────────────

Change:

   nme = "Sarah"

back to:

   name = "Sarah"

Save the file.
Run it again.

The error disappears.

You just debugged your first issue.

────────────────────────
Important Habit
────────────────────────

When you see an error:

1. Read it slowly.
2. Identify the line number.
3. Identify the error type.
4. Ask: What is different on that line?

Do not randomly delete code.
Do not rewrite everything.
Small changes fix most beginner errors.

────────────────────────
Write This in Your Learning Hub
────────────────────────

Write:

• Errors are information, not failure.
• Error messages tell me what and where.
• I read errors calmly and fix one thing at a time.
• Debugging is part of learning.

────────────────────────

Outcome
Reduced fear of errors and increased confidence in reading, understanding, and fixing them. A core skill every real developer uses daily.
`
},

{
  task: "Understand what files and folders mean in coding",
  duration: 1,
  explanation: `
Before you build real projects, you must understand how code is organised.

Coding is not just writing lines of code.
It is also organising those lines properly.

If your files are messy, your project becomes confusing.
If your folders are structured, your project becomes manageable.

Think of it like this:

• A file = a single document containing code.
• A folder = a container that holds files.
• Projects are usually folders that contain multiple files.

Real apps often have:
• 10 files
• 50 files
• Sometimes hundreds of files

Organisation matters from the beginning.

────────────────────────
What you need to know first
────────────────────────

• Every program you write is saved inside a file.
• The file extension (.py) tells the computer it is a Python file.
• Folders help group related files together.
• Developers organise projects into folders so they don’t lose track of code.

Without folders, everything would sit on your desktop.
That becomes chaos quickly.

────────────────────────
Step-by-step
────────────────────────

1. Go to your Desktop.

2. Right-click → New Folder.

3. Name the folder:

   tech_learning

This folder is now your project folder.

4. Open VS Code.

5. Click:
   File → Open Folder

6. Select the folder:
   tech_learning

Now VS Code is “inside” your project.

7. Create a new file inside that folder:
   example.py

8. Type this code:

   print("This is my first project folder.")

9. Save the file.

10. Open the terminal in VS Code:
    View → Terminal

11. Run the file:

    python example.py

You should see:

    This is my first project folder.

That means:
• Your file works.
• Your folder structure works.
• Your project is organised correctly.

────────────────────────
Understand What Just Happened
────────────────────────

You created:

Desktop  
└── tech_learning  
    └── example.py  

This is called a folder structure.

In the future, your structure might look like:

tech_learning  
├── main.py  
├── functions.py  
├── data.txt  
└── tests  
    └── test_main.py  

That structure helps developers:
• Find files quickly
• Separate different responsibilities
• Avoid confusion

────────────────────────
Write This in Your Learning Hub
────────────────────────

Write:

• Files contain code.
• Folders organise files.
• Projects are folders with related files inside.
• Good structure prevents confusion later.

────────────────────────

Outcome
A practical understanding of how coding projects are structured, which prevents chaos and prepares you for working on larger, multi-file programs.
`
},

{
  task: "Learn the basics of how the terminal works",
  duration: 1.5,
  explanation: `
The terminal looks scary at first.
It’s just a black (or white) screen with text.

But the terminal is simply a way to talk directly to your computer using commands instead of clicking.

When you click folders with your mouse,
your computer is running commands in the background.

The terminal just lets you type those commands yourself.

Every developer uses the terminal daily.
You only need a few simple commands to begin.

────────────────────────
What you need to know first
────────────────────────

• The terminal is not “hacking”.
• It does not break your computer.
• It only does what you tell it to do.
• Short commands replace clicking.
• You are always “inside” a folder when using the terminal.

Think of it like navigating folders with text instead of a mouse.

────────────────────────
Step-by-step
────────────────────────

1. Open VS Code.

2. Click:
   View → Terminal

A panel will open at the bottom.
You will see something like:

   C:\\Users\\YourName\\tech_learning
or
   /Users/YourName/tech_learning

This line shows your current location.

3. Type:

   pwd

Press Enter.

pwd means:
“Print Working Directory”

It shows the full path of the folder you are currently inside.

4. Type:

   ls

Press Enter.

ls means:
“List”

It shows all files and folders inside your current folder.

If you see:

   example.py

That means your file is there.

5. Type:

   cd ..

Press Enter.

cd means:
“Change Directory”

.. means:
“Go one level up”

You just moved back one folder.

6. Type:

   pwd

again to confirm your new location.

────────────────────────
Understand What Just Happened
────────────────────────

You just:

• Checked where you are (pwd)
• Listed files (ls)
• Moved between folders (cd)

These three commands are used constantly.

Developers use them to:
• Navigate projects
• Run programs
• Install packages
• Use Git
• Deploy applications

────────────────────────
Extra (Optional Practice)
────────────────────────

Try:

   cd tech_learning

to go back into your project folder.

Then type:

   ls

You should see your Python file again.

You are navigating your computer using text.

That is all the terminal is.

────────────────────────
Write This in Your Learning Hub
────────────────────────

Write:

• pwd = shows where I am
• ls = shows what is inside this folder
• cd = moves between folders
• The terminal is just a text-based way to control my computer

────────────────────────

Important mindset shift

The terminal feels intimidating because it looks technical.
But it is just another tool.

You do not need 50 commands.
You need 5–10 basics.

You already know three.

Outcome
Comfort using the terminal for navigation, running programs, and working with Git. A core skill used in real-world development.
`
},

{
  task: "Follow a step-by-step algorithm in simple code",
  duration: 1,
  explanation: `
Algorithms are meant to be executed.

Step-by-step
1. Write a simple algorithm:
   Example: “check if number is even”
2. In pseudocode:
   IF number % 2 == 0 → even
   ELSE → odd
3. Run it in any online coding tool or console.

Outcome
A concrete understanding that algorithms are instructions you can execute.
`
},

{
  task: "Understand arrays (lists) and indexing",
  duration: 1,
  explanation: `
Arrays (called lists in Python) are ordered collections of items.

What you need to know first
• A list stores multiple values in one variable.
• Each item has a position number called an index.
• Indexing starts at 0, not 1.

Example:

numbers = [10, 20, 30]
print(numbers[0])   # prints 10

This means:
Index 0 = first item
Index 1 = second item
Index 2 = third item

Step-by-step
1. Create a file called arrays.py.
2. Write:

   fruits = ["apple", "banana", "cherry"]
   print(fruits[0])
   print(fruits[2])

3. Run the file.
4. Change the index numbers.
5. Try using an index that is too large and read the error message.

Outcome
You understand how lists store data and how indexing works.
`
},

{
  task: "Loop through a list (traversal)",
  duration: 1,
  explanation: `
Traversal means going through each item one by one.

Instead of manually writing:
print(fruits[0])
print(fruits[1])
print(fruits[2])

We use a loop.

Step-by-step
1. Open your arrays.py file.
2. Add:

   for fruit in fruits:
       print(fruit)

3. Run the file.
4. Add one more fruit to the list and run again.

Notice:
The loop automatically adjusts to the list size.

Outcome
You can move through all elements in a list using a loop.
`
},

{
  task: "Loop through a list (traversal)",
  duration: 1,
  explanation: `
Traversal means going through each item one by one.

Instead of manually writing:
print(fruits[0])
print(fruits[1])
print(fruits[2])

We use a loop.

Step-by-step
1. Open your arrays.py file.
2. Add:

   for fruit in fruits:
       print(fruit)

3. Run the file.
4. Add one more fruit to the list and run again.

Notice:
The loop automatically adjusts to the list size.

Outcome
You can move through all elements in a list using a loop.
`
},

{
  task: "Create and modify new lists",
  duration: 1,
  explanation: `
Often you will create new lists based on existing ones.

Step-by-step
1. Create a new file called list_practice.py.
2. Add:

   numbers = [1, 2, 3, 4, 5]
   doubled = []

3. Add a loop:

   for number in numbers:
       doubled.append(number * 2)

4. Print doubled.
5. Change the multiplication to * 3 and observe the difference.

Outcome
You understand how to build new lists from existing data.
`
},

{
  task: "Understand strings and slicing",
  duration: 1,
  explanation: `
A string is text, and it behaves like a list of characters.

Example:

word = "Python"

Each letter has an index:
P = 0
y = 1
t = 2
h = 3
o = 4
n = 5

Step-by-step
1. Create a file called strings.py.
2. Add:

   word = "Python"
   print(word[0])
   print(word[-1])

3. Try slicing:

   print(word[0:3])
   print(word[2:])

Notice:
• word[0:3] starts at index 0 and stops before index 3.
• Slicing creates a new string.

Outcome
You can access and extract parts of text.
`
},

{
  task: "Practice basic string methods",
  duration: 1,
  explanation: `
Strings have built-in tools called methods.

Step-by-step
1. In strings.py, add:

   sentence = "I am learning Python"

2. Count characters:

   print(len(sentence))

3. Make it uppercase:

   print(sentence.upper())

4. Replace a word:

   print(sentence.replace("Python", "coding"))

5. Try lower() and title() as well.

Outcome
You can manipulate and transform text confidently.
`
},

{
  task: "Understand dictionaries (hash maps) and key-value pairs",
  duration: 1,
  explanation: `
A dictionary (also called a hash map) stores data as key → value pairs.

Think of it as:
label → information

Example:

user = {
    "name": "Sarah",
    "age": 30,
    "city": "London"
}

Keys must be unique.
Values can be numbers, text, lists, etc.

Step-by-step
1. Create a file called dictionaries.py.
2. Add:

   student = {
       "name": "Ali",
       "course": "Computer Science",
       "year": 1
   }

3. Print:
   student["name"]
   student["course"]

4. Try accessing a key that does not exist.
5. Carefully read the error message.

Outcome
You understand how dictionary lookup works and how keys retrieve values.
`
},

{
  task: "Modify and update dictionary data",
  duration: 1.0,
  explanation: `
Dictionaries are mutable, meaning you can change them.

Step-by-step
1. Open dictionaries.py.
2. Add a new key:

   student["grade"] = "A"

3. Change an existing value:

   student["year"] = 2

4. Print the full dictionary.
5. Add another key of your choice.

Outcome
You can add and update key-value pairs confidently.
`
},

{
  task: "Lookup vs iteration in dictionaries",
  duration: 1,
  explanation: `
Lookup means accessing one specific value using its key.
Iteration means going through everything one by one.

Step-by-step
1. In dictionaries.py, add:

   for key in student:
       print(key)

2. Then add:

   for key, value in student.items():
       print(key, value)

Notice:
• Lookup → student["name"] (instant access).
• Iteration → loops through all items.

Reflect:
When would you want just one value?
When would you need all of them?

Outcome
You understand the difference between fast lookup and full iteration.
`
},

{
  task: "Understand sets and uniqueness",
  duration: 1.0,
  explanation: `
A set stores unique values only.

No duplicates are allowed.

Step-by-step
1. Create a file called sets.py.
2. Add:

   emails = {"a@email.com", "b@email.com"}

3. Add a duplicate email.
4. Print the set.

Notice:
Duplicates are automatically removed.

Outcome
You understand how sets enforce uniqueness.
`
},
{
  task: "Sets for fast membership checking",
  duration: 1.0,
  explanation: `
Sets are very fast when checking if something exists.

Step-by-step
1. In sets.py, add:

   print("a@email.com" in emails)

2. Create a list:

   numbers = [1,2,3,4,5,3,2,1]

3. Convert it to a set:

   numbers_set = set(numbers)

4. Print both numbers and numbers_set.

Observe:
• The list keeps duplicates.
• The set removes duplicates.

Reflect:
Why might checking membership in a set be faster than in a list when the data is large?

Outcome
You understand when to use sets instead of lists.
`
},

{
  task: "Stacks: implement LIFO + 3 real uses",
  duration: 1.5,
  explanation: `
A stack follows the rule:

Last In, First Out (LIFO)

Imagine stacking plates:
The last plate placed on top is the first one removed.

In programming:
• You add an item → push
• You remove the most recent item → pop

────────────────────────
What you need to know first
────────────────────────
In Python, we can use a list as a stack.

Example:

stack = []

stack.append("A")   # push
stack.append("B")
stack.append("C")

print(stack.pop())  # removes C

C is removed first because it was added last.

────────────────────────
Exercise 1: Build your own stack
────────────────────────
1. Create a file called stacks.py.
2. Create an empty list called stack.
3. Push 3 numbers onto it.
4. Print the stack.
5. Pop one item.
6. Print the stack again.

Observe how the last item disappears first.

────────────────────────
Exercise 2: Simulate Undo
────────────────────────
1. Create a list called actions.
2. Add 3 “actions” like:
   "typed hello"
   "deleted word"
   "added exclamation"

3. Pop the last action to simulate undo.
4. Print the remaining actions.

Notice:
Undo removes the most recent change first.

────────────────────────
3 Real Uses of Stacks
────────────────────────
• Undo/redo systems
• Browser back button history
• Function call memory (call stack)

Outcome
You understand LIFO order and can implement a stack using lists.
`
},

{
  task: "Queues: implement FIFO + 3 real uses",
  duration: 1.5,
  explanation: `
A queue follows the rule:

First In, First Out (FIFO)

Imagine a checkout line:
The first person who joins is the first served.

In programming:
• You add an item → enqueue
• You remove the oldest item → dequeue

────────────────────────
What you need to know first
────────────────────────
We can simulate a queue using a list.

Example:

queue = []

queue.append("A")
queue.append("B")
queue.append("C")

print(queue.pop(0))   # removes A

A is removed first because it was added first.

────────────────────────
Exercise 1: Build your own queue
────────────────────────
1. Create a file called queues.py.
2. Create an empty list called queue.
3. Add 3 tasks (e.g., "task1", "task2", "task3").
4. Print the queue.
5. Remove the first task using pop(0).
6. Print the queue again.

Observe how the oldest item disappears first.

────────────────────────
Exercise 2: Simulate a print queue
────────────────────────
1. Add print jobs:
   "report.pdf"
   "photo.jpg"
   "invoice.doc"

2. Remove jobs one by one.
3. Print which job is being processed each time.

Notice:
Jobs are processed in arrival order.

────────────────────────
3 Real Uses of Queues
────────────────────────
• Print job scheduling
• Task processing systems
• Breadth-first search in algorithms

Outcome
You understand FIFO order and can implement a queue.
`
},

{ 
  task: "Linked lists: implement (singly) + reverse", 
  duration: 3,
  explanation: `
A linked list is a different way to store multiple pieces of data.

Unlike a list (array), where items sit next to each other in memory,
a linked list connects items using references.

Each item is called a node.

A node contains:
• data (the value)
• a reference (pointer) to the next node

This creates a chain.

Example structure:

[10] → [20] → [30] → None

Each box points to the next one.
The last node points to None.

────────────────────────
Why Linked Lists Exist
────────────────────────

In arrays:
• Inserting in the middle can require shifting many elements.
• Removing can also require shifting.

In linked lists:
• You only adjust pointers.
• No shifting required.

They are useful when:
• You frequently insert or delete items.
• You don’t need random index access.

────────────────────────
Part 1: Create a Node Class
────────────────────────

1. Create a file called linked_list.py.
2. Define a Node class:

   class Node:
       def __init__(self, data):
           self.data = data
           self.next = None

Each node starts by pointing to nothing.

────────────────────────
Part 2: Create the Linked List
────────────────────────

3. Create three nodes:

   node1 = Node(10)
   node2 = Node(20)
   node3 = Node(30)

4. Connect them:

   node1.next = node2
   node2.next = node3

Now you have:

10 → 20 → 30 → None

The head of the list is node1.

────────────────────────
Part 3: Traverse the List
────────────────────────

Traversal means visiting each node one by one.

Add:

   current = node1

   while current:
       print(current.data)
       current = current.next

This prints:
10
20
30

You move forward using the next pointer.

Outcome so far:
You understand how linked nodes form a chain.

────────────────────────
Part 4: Insert a New Node
────────────────────────

Let’s insert 15 between 10 and 20.

1. Create a new node:

   new_node = Node(15)

2. Adjust pointers:

   new_node.next = node1.next
   node1.next = new_node

Now the chain becomes:

10 → 15 → 20 → 30

Notice:
You did not shift values.
You only updated pointers.

────────────────────────
Part 5: Reverse the Linked List
────────────────────────

Reversing means flipping all the arrows.

Original:
10 → 15 → 20 → 30

Reversed:
30 → 20 → 15 → 10

Add:

   prev = None
   current = node1

   while current:
       next_node = current.next
       current.next = prev
       prev = current
       current = next_node

After the loop:
prev is the new head.

Print from prev to see the reversed list.

This works because:
• You change each pointer to point backward instead of forward.

────────────────────────
Key Concepts Practiced
────────────────────────
• Node structure
• Pointers (references)
• Traversal
• Insertion by pointer adjustment
• Reversing a linked structure

────────────────────────
Important Beginner Mindset
────────────────────────

Linked lists are harder than arrays at first.

That’s normal.

The goal is not memorising code.
The goal is understanding:
• Each node holds data.
• Each node points to the next.
• You control the chain by changing pointers.

────────────────────────
Why This Matters
────────────────────────

Linked lists help you understand:
• How memory references work
• How dynamic data structures operate
• How more complex structures (trees, graphs) are built

They are common in:
• Interview questions
• Memory-efficient systems
• Low-level programming concepts

Outcome
A working singly linked list with traversal, insertion, and reversal, and a deeper understanding of how data structures connect elements dynamically.

Free Tools
VS Code, Python
`
},

{
  task: "Understand what sorting means and why it matters",
  duration: 1.0,
  explanation: `
Sorting means putting items in order.

Example:
[5, 2, 9, 1]

Sorted:
[1, 2, 5, 9]

Sorting is important because:
• Searching is easier in sorted data.
• Reports need ordered output.
• Many algorithms depend on sorted lists.

Step-by-step
1. Create a file called sorting_intro.py.
2. Create a list of 5 numbers in random order.
3. Use Python's built-in sorted() function.
4. Print both the original list and the sorted list.
5. Notice that sorted() returns a new list.

Outcome
You understand what sorting does before learning how it works internally.
`
},
{
  task: "Bubble sort: concept + implement from scratch",
  duration: 1,
  explanation: `
Bubble sort compares neighbouring elements and swaps them if needed.

Idea:
Compare two items.
If they are in the wrong order, swap.
Repeat until no swaps are needed.

Largest numbers gradually move to the end.

Step-by-step
1. Create a file called bubble_sort.py.
2. Add:

   numbers = [5, 2, 9, 1, 3]

3. Implement:

   for i in range(len(numbers)):
       for j in range(len(numbers) - 1):
           if numbers[j] > numbers[j + 1]:
               numbers[j], numbers[j + 1] = numbers[j + 1], numbers[j]

4. Print numbers.

Reflect:
• How many comparisons are happening?
• What happens if the list is already sorted?

Outcome
You understand repeated comparison and swapping.
`
},

{
  task: "Insertion sort: concept + implement from scratch",
  duration: 1.5,
  explanation: `
Insertion sort builds a sorted section step by step.

────────────────────────
Concept
────────────────────────

Idea:
• Assume the first item is already sorted.
• Take the next item.
• Insert it into the correct position in the sorted section.
• Repeat until the entire list is sorted.

Example:

[5, 2, 9]

Start:
[5] is considered sorted.

Take 2:
Insert before 5 → [2, 5]

Take 9:
Insert after 5 → [2, 5, 9]

The sorted portion grows from left to right.

Insertion sort is often:
• Faster than bubble sort for small lists
• Efficient when the list is already nearly sorted

Time complexity:
O(n²) in the worst case.

────────────────────────
Implementation
────────────────────────

Step-by-step

1. Create a file called insertion_sort.py.
2. Add:

   numbers = [5, 2, 9, 1, 3]

3. Implement the algorithm:

   for i in range(1, len(numbers)):
       current = numbers[i]
       j = i - 1

       while j >= 0 and numbers[j] > current:
           numbers[j + 1] = numbers[j]
           j -= 1

       numbers[j + 1] = current

4. Print numbers.

────────────────────────
What Is Happening?
────────────────────────

• "current" stores the number we are inserting.
• The while loop shifts larger numbers to the right.
• When the correct position is found, we insert current.

Each pass expands the sorted section.

────────────────────────
Reflect
────────────────────────

• What happens if the list is already sorted?
• What happens if the list is in reverse order?
• How many shifts occur in each case?

────────────────────────
Outcome
────────────────────────

You understand how insertion sort builds order gradually and can implement it from scratch without copying code blindly.
`
},

{
  task: "Merge sort: understand divide and conquer",
  duration: 1.0,
  explanation: `
Merge sort uses a different strategy called divide and conquer.

Steps:
1. Split the list into halves.
2. Recursively sort each half.
3. Merge the two sorted halves.

Example:
[5, 2, 9, 1]

Split:
[5, 2] and [9, 1]

Split again:
[5] [2] and [9] [1]

Merge:
[2, 5] and [1, 9]

Merge final:
[1, 2, 5, 9]

Why it matters:
• Much faster for large lists.
• Time complexity: O(n log n).
• Used in real systems.

Outcome
You understand why some algorithms scale better than others.
`
},
{
  task: "Binary search trees: concept + search / insert",
  duration: 3,
  explanation: `
A Binary Search Tree (BST) is a way to organise numbers so that finding them becomes faster.

Do not worry about the name.
Focus on the rule.

────────────────────────
The Simple Rule
────────────────────────

Every number lives inside a "node".

Each node can connect to:
• one left child
• one right child

And there is ONE important rule:

• Smaller numbers go to the left.
• Larger numbers go to the right.

That’s it.

Example:

        10
       /  \
      5    20
     / \     \
    3   7     30

Look at 10:
• 5 is smaller → goes left.
• 20 is larger → goes right.

Look at 5:
• 3 is smaller → left.
• 7 is larger → right.

The same rule repeats at every level.

────────────────────────
Why This Is Powerful
────────────────────────

Imagine searching for 7.

Start at 10:
7 is smaller → go left.

Now at 5:
7 is larger → go right.

Found 7.

You did NOT check every number.
You followed a path.

That is why trees can be fast.

────────────────────────
Step 1: Create a Node
────────────────────────

Create a file called bst.py.

Add:

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

Each node stores:
• a number
• a left connection
• a right connection

At first, left and right are empty (None).

────────────────────────
Step 2: Insert Numbers
────────────────────────

Insert means:
Place the number in the correct position.

Add this function:

def insert(root, value):
    if root is None:
        return Node(value)

    if value < root.value:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)

    return root

Now build a tree:

root = None
values = [10, 5, 20, 3, 7, 30]

for v in values:
    root = insert(root, v)

What is happening?

• First 10 becomes the root.
• 5 is smaller → goes left.
• 20 is larger → goes right.
• 3 goes left of 5.
• 7 goes right of 5.
• 30 goes right of 20.

The tree builds itself following the rule.

────────────────────────
Step 3: Search for a Number
────────────────────────

Search means:
Does this number exist?

Add:

def search(root, target):
    if root is None:
        return False

    if target == root.value:
        return True

    if target < root.value:
        return search(root.left, target)
    else:
        return search(root.right, target)

Test it:

print(search(root, 7))   # True
print(search(root, 99))  # False

Notice:
The function moves either left OR right.
Never both.
It follows one path only.

────────────────────────
Balanced vs Not Balanced
────────────────────────

Balanced tree:

        10
       /  \
      5    20

This is good.
Height is small.
Searching is fast.

But if you insert numbers in order:

[10, 20, 30]

The tree becomes:

10
  \
   20
     \
      30

Now it looks like a linked list.
Searching becomes slow.

So structure matters.

────────────────────────
What You Should Really Understand
────────────────────────

You do NOT need to memorise recursion perfectly.

You should understand:

• Smaller goes left.
• Larger goes right.
• Searching follows one path.
• Shape affects speed.

If the tree is well-shaped, searching is fast.
If the tree becomes long and narrow, searching becomes slower.

────────────────────────
Why This Matters
────────────────────────

BSTs help you understand:

• How ordered structures work
• Why structure affects performance
• How binary search works in practice
• The foundation for more advanced trees

This is a major mental shift in data structures.

Outcome
You can build a basic BST, insert values, search for values, and understand how structure affects performance.

Free Tools
VS Code, Python
`
},
{
  task: "Recursion patterns: 3 small recursive problems",
  duration: 3,
  explanation: `
Recursion means:
A function calls itself.

That’s it.

But it must follow TWO rules:

1) Base case → the rule that tells the function when to stop calling itself.
2) Recursive step → the part where the function calls itself with a smaller or simpler version of the problem.

If you forget the base case, the function will run forever.

────────────────────────
The Pattern
────────────────────────

Every recursive function has this shape:

def function_name(input):
    if base_case:
        return something

    return function_name(smaller_input)

You:
• Solve a tiny version of the problem.
• Trust that the smaller version works.

────────────────────────
Problem 1: Count Down
────────────────────────

Goal:
Print numbers from n down to 1.

Example:
count_down(3)
Prints:
3
2
1

Step-by-step

def count_down(n):
    if n == 0:       # base case
        return

    print(n)
    count_down(n - 1)   # smaller problem

count_down(5)

What is happening?
• It prints 5.
• Then calls itself with 4.
• Then 3.
• Then 2.
• Then 1.
• Stops at 0.

This is recursion in its simplest form.

────────────────────────
Problem 2: Factorial
────────────────────────

Factorial means:
5! = 5 × 4 × 3 × 2 × 1

Notice:
5! = 5 × 4!
4! = 4 × 3!
3! = 3 × 2!

The pattern repeats.

Base case:
1! = 1

Implementation:

def factorial(n):
    if n == 1:          # base case
        return 1

    return n * factorial(n - 1)

print(factorial(5))

What is happening?
• factorial(5)
• becomes 5 * factorial(4)
• becomes 5 * 4 * factorial(3)
• continues until factorial(1)
• then builds back up

This shows recursion working in two directions:
Down → breaking problem
Up → combining results

────────────────────────
Problem 3: Sum of a List
────────────────────────

Goal:
Add all numbers in a list.

Example:
[1, 2, 3, 4] → 10

Think recursively:
Sum of list =
first element +
sum of the rest

Base case:
Empty list → sum is 0

Implementation:

def sum_list(numbers):
    if len(numbers) == 0:    # base case
        return 0

    return numbers[0] + sum_list(numbers[1:])

print(sum_list([1,2,3,4]))

What is happening?
• Take first number.
• Add it to the sum of the smaller list.
• Repeat until list is empty.

────────────────────────
What You Should Notice
────────────────────────

All recursive problems follow the same structure:

1) Identify the smallest version of the problem.
2) Define when to stop.
3) Reduce the problem toward that stop point.

────────────────────────
Common Beginner Mistakes
────────────────────────

• Forgetting the base case.
• Not reducing the input.
• Not returning the recursive call.
• Confusing when recursion stops.

If something feels confusing, trace it step by step on paper.

────────────────────────
Why Recursion Matters
────────────────────────

Recursion is used in:
• Trees
• Binary search
• File systems
• Sorting (merge sort)
• Graph algorithms
• Interview problems

Even if you later prefer loops, recursion teaches you:

• Pattern recognition
• Problem breakdown
• Thinking in smaller pieces

────────────────────────
Outcome
────────────────────────

You understand:
• What recursion is
• What a base case is
• How to shrink a problem
• How recursive calls build results

Free Tools
VS Code, Python
`
},

...generateEveryNDays({
  title: "Coding practice (30–60 mins)",
  daysTotal: 90,
  every: 2,
  duration: 1,
  explanation: `
This is your consistency builder.

You do not need to build something big.
You need to practise thinking in code regularly.

Every session should have ONE clear outcome.

────────────────────────
Step 1: Pick ONE small deliverable
────────────────────────

Choose only ONE of the following:

• Complete one short lesson and write 5 bullet notes in your Learning Hub  
• Solve 1 small coding problem (for example: reverse a string, find the largest number in a list)  
• Improve one previous exercise (clean up variable names, add comments)  
• Fix one small bug in your code  
• Build one tiny feature (e.g. add input to a program, add validation, add a loop)  

Do NOT try to do everything.

────────────────────────
Step 2: Focus without multitasking
────────────────────────

• Set a 30–60 minute timer  
• Close extra tabs  
• Work on only the chosen task  

The goal is depth, not volume.

────────────────────────
Step 3: Finish properly
────────────────────────

Before ending your session:

1. Make sure the code runs without errors  
2. Add one comment explaining what the code does  
3. Save your file  
4. If using Git, commit your work:

   git add .
   git commit -m "Practice session – [short description]"

Even if the task feels small, commit it.

────────────────────────
Step 4: Reflect (2 minutes)
────────────────────────

Ask yourself:
• What did I understand today?
• What confused me?
• What will I practise next time?

Write 1–2 sentences in your Learning Hub.

────────────────────────
Why This Matters
────────────────────────

Consistency beats intensity.

Practising every 2 days for 90 days:
• Builds confidence
• Reduces fear of errors
• Strengthens problem-solving
• Makes coding feel normal

You are not trying to be perfect.
You are trying to become consistent.

Outcome
A strong coding habit and steady skill growth over 90 days.
`,
  idBase: "tech_switch.cs_basics.coding",
  meta: { roadmap: "tech_switch", theme: "cs_basics" },
}),

  ],


data_skills: [

{
  task: "Set up your Data & AI workspace",
  duration: 1.5,
  explanation: `
Before analysing data or training AI models, you need a place where you can run Python code easily.

Instead of installing complex tools, you will use Google Colab.
Colab runs Python in your browser and saves everything to Google Drive.

No installation needed.

────────────────────────
What You Need First
────────────────────────

• A Google account
• A stable internet connection

That’s it.

────────────────────────
Step-by-step
────────────────────────

1. Go to:
   https://colab.research.google.com

2. Click “New Notebook”.

3. At the top-left, rename it:
   "My Data & AI Studio"

4. Colab automatically connects to your Google Drive.
   Now organise your Drive:

   Create three folders:

   • data/       → for datasets (CSV files, Excel files)
   • notebooks/  → for your Colab notebooks
   • outputs/    → for charts, results, exported files

5. Move your new notebook into the notebooks/ folder.

────────────────────────
Step 2: Run Your First Python Code
────────────────────────

In the first code cell, type:

import pandas as pd
print("Workspace ready!")

Now press:

Shift + Enter

You should see:
Workspace ready!

If you see the message printed below the cell,
your environment is working correctly.

────────────────────────
What Just Happened?
────────────────────────

• You imported a library called pandas.
• Pandas is used for data analysis.
• You ran Python code in the cloud.
• Your work is saved automatically.

This is now your Data & AI lab.

────────────────────────
Why This Matters
────────────────────────

From here you will:
• Load datasets
• Clean messy data
• Build simple models
• Create charts
• Experiment safely

You now have a professional-grade environment used by:
• Data analysts
• Data scientists
• AI researchers
• Students at top universities

And it’s completely free.

────────────────────────
Outcome
────────────────────────

You have a cloud-based Python workspace ready for data analysis and AI projects, without installing anything on your computer.

Free Tools
Google Colab, Google Drive
`
},

{
  task: "Learn to load and explore data with Pandas (women in tech dataset)",
  duration: 3,
  explanation: `
Pandas is a Python library that helps you load, explore, and analyse data quickly.

In this task, you will:
• Load a real dataset  
• View the structure  
• Inspect columns  
• Sort and filter information  

We will use a public dataset from the Stack Overflow Developer Survey.  
It includes gender information and tech-related responses.

────────────────────────
Step 1: Load the dataset
────────────────────────

Open your Colab notebook.

▶ TYPE THIS CODE:

import pandas as pd

url = "https://raw.githubusercontent.com/plotly/datasets/master/stackoverflow_2019_survey_results_subset.csv"
df = pd.read_csv(url)

df.head()

Then press Shift + Enter.

You should now see the first 5 rows.

This is called a DataFrame.  
It is a table of data.

────────────────────────
Step 2: Understand the structure
────────────────────────

▶ TYPE THIS CODE:

df.info()

This shows:
• Column names  
• Data types (text, number, etc.)  
• Missing values  

Now run:

▶ TYPE THIS CODE:

df.describe()

This shows basic statistics for numerical columns.

────────────────────────
Step 3: Explore gender data
────────────────────────

▶ TYPE THIS CODE:

df["Gender"].value_counts()

This counts how many respondents are in each gender category.

Now filter for women respondents:

▶ TYPE THIS CODE:

df[df["Gender"] == "Woman"].head()

Filtering means selecting only rows that meet a condition.

────────────────────────
Step 4: Sort and ask questions
────────────────────────

Sort by years of coding experience:

▶ TYPE THIS CODE:

df.sort_values("YearsCodePro", ascending=False).head()

Now try to answer:

• How many women are in the dataset?  
• What is the average salary by gender?  
• Which countries appear most frequently?  

Hint:
You can use:
df["ColumnName"].mean()
df["ColumnName"].value_counts()

────────────────────────
Important Concepts Practiced
────────────────────────

• Loading data from a URL  
• Viewing first rows with head()  
• Understanding structure with info()  
• Getting statistics with describe()  
• Filtering rows  
• Sorting values  

────────────────────────
Why This Matters
────────────────────────

Real data is messy and imperfect.  
Learning to explore it confidently is a core Data & AI skill.

You are now working with a real dataset about developers,
including women in tech.

This is how data analysis starts in real jobs.

Outcome
You can confidently load and explore real-world datasets using Pandas.

Free Tools
Google Colab, Pandas
`,
  meta: { roadmap: "tech_switch", theme: "data_ai_basics" }
},

{
  task: "Clean and prepare your data",
  duration: 3,
  explanation: `
Real-world data is rarely perfect.

Before analysing or building models, you must:
• Check for missing values  
• Fix incorrect data  
• Rename unclear columns  
• Save a clean version  

This process is called data cleaning.

────────────────────────
Step 1: Check for missing values
────────────────────────

Missing values are empty cells.

▶ TYPE THIS CODE:

df.isnull().sum()

This shows how many missing values exist in each column.

If a column shows 0 → no missing values.  
If it shows a number → those rows need attention.

────────────────────────
Step 2: Handle missing values
────────────────────────

For numeric columns, a common fix is replacing missing values with the average (mean).

▶ TYPE THIS CODE:

df["size"].fillna(df["size"].mean(), inplace=True)

What this does:
• Finds missing values in the "size" column  
• Replaces them with the average value  
• Updates the dataset directly  

Important:
Only do this for numeric columns where averaging makes sense.

If a column is text, you might instead replace missing values with:

▶ TYPE THIS CODE:

df["Gender"].fillna("Unknown", inplace=True)

────────────────────────
Step 3: Rename columns for clarity
────────────────────────

Sometimes column names are unclear or too long.

▶ TYPE THIS CODE:

df.rename(columns={"total_bill":"bill"}, inplace=True)

This changes:
"total_bill" → "bill"

Clear names make analysis easier later.

────────────────────────
Step 4: Check for duplicates
────────────────────────

Duplicate rows can distort results.

▶ TYPE THIS CODE:

df.duplicated().sum()

If duplicates exist, remove them:

▶ TYPE THIS CODE:

df.drop_duplicates(inplace=True)

────────────────────────
Step 5: Save the cleaned dataset
────────────────────────

After cleaning, save a new version.

▶ TYPE THIS CODE:

df.to_csv("/content/clean_dataset.csv", index=False)

This creates a new file in your Colab environment.

Now you have:
• The original dataset  
• A cleaned version ready for analysis  

────────────────────────
Important Concepts Practiced
────────────────────────

• Detecting missing values  
• Replacing missing data  
• Renaming columns  
• Removing duplicates  
• Saving cleaned data  

────────────────────────
Why This Matters
────────────────────────

In real data jobs:
Cleaning takes 60–80% of the time.

If your data is messy:
• Your analysis will be wrong  
• Your models will be unreliable  
• Your insights will be misleading  

Clean data = trustworthy results.

────────────────────────
Outcome
────────────────────────

You can now inspect, clean, and prepare a dataset properly before analysing it.

Free Tools
Google Colab
`,
  meta: { roadmap: "tech_switch", theme: "data_skills" }
},

{
  task: "Create your first charts and visualisations",
  duration: 2,
  explanation: `
Data becomes powerful when you can SEE it.

In this task, you will turn numbers into charts using a library called Matplotlib.

Visualisation helps you:
• Spot patterns
• Compare groups
• Identify outliers
• Communicate insights clearly

────────────────────────
Step 1: Create a simple histogram
────────────────────────

A histogram shows the distribution of values.

▶ TYPE THIS CODE:

import matplotlib.pyplot as plt

df["tip"].plot(kind="hist", bins=10, title="Distribution of Tips")
plt.xlabel("Tip amount")
plt.ylabel("Frequency")
plt.show()

What this does:
• Groups tip values into bins
• Shows how often each range appears
• Helps you understand spread and skew

Ask yourself:
• Are most tips small or large?
• Is the distribution even?

────────────────────────
Step 2: Create a bar chart (group comparison)
────────────────────────

Now compare average tips by day.

▶ TYPE THIS CODE:

df.groupby("day")["tip"].mean().plot(kind="bar", title="Average Tip by Day")
plt.xlabel("Day")
plt.ylabel("Average Tip")
plt.show()

What this does:
• Groups data by "day"
• Calculates average tip per day
• Displays results as a bar chart

Ask yourself:
• Which day has the highest average tip?
• Is there a clear difference?

────────────────────────
Step 3: Improve your chart
────────────────────────

You can customise colours and labels.

▶ TYPE THIS CODE:

df["tip"].plot(kind="hist", bins=10, color="purple")
plt.title("Tip Distribution")
plt.xlabel("Tip amount")
plt.ylabel("Frequency")
plt.show()

Clear labels make charts professional.

────────────────────────
Important Concepts Practiced
────────────────────────

• Creating a histogram
• Grouping data
• Aggregating (mean)
• Creating a bar chart
• Adding titles and labels
• Showing plots

────────────────────────
Why This Matters
────────────────────────

In real jobs, you rarely present raw tables.
You present charts.

Visualisation is used in:
• Dashboards
• Business reports
• AI model evaluation
• Product analytics
• Stakeholder presentations

If you can visualise data clearly,
you can communicate insights clearly.

────────────────────────
Outcome
────────────────────────

You can now turn raw numbers into visual insights and understand basic data patterns.

Free Tools
Google Colab, Matplotlib
`
},

{
  task: "Write a short EDA (Exploratory Data Analysis) report",
  duration: 3,
  explanation: `
EDA stands for Exploratory Data Analysis.

It means:
Understanding your dataset before building models.

In real data jobs, EDA is the first thing analysts do.

Your goal:
Turn raw data into clear observations.

────────────────────────
Step 1: Describe the dataset
────────────────────────

In your Colab notebook, answer:

• How many rows does the dataset have?
• How many columns?
• What does each column represent?
• Are there missing values?
• What data types are present (text, number, date)?

▶ TYPE THIS CODE:

df.shape
df.info()

Write 4–6 sentences summarising:
• What the dataset contains
• What it seems to measure
• Any immediate issues (missing data, strange values)

────────────────────────
Step 2: Create at least 3 visualisations
────────────────────────

You must create:

1️⃣ A histogram  
(Shows distribution)

Example:

df["tip"].plot(kind="hist", bins=10)
plt.title("Distribution of Tips")
plt.show()

2️⃣ A bar chart  
(Compares categories)

Example:

df.groupby("day")["tip"].mean().plot(kind="bar")
plt.title("Average Tip by Day")
plt.show()

3️⃣ A scatter plot  
(Shows relationship between two numeric variables)

Example:

df.plot(kind="scatter", x="total_bill", y="tip")
plt.title("Total Bill vs Tip")
plt.show()

Make sure:
• Every chart has a title
• Axes are labelled clearly
• You understand what each chart shows

────────────────────────
Step 3: Write 3 clear insights
────────────────────────

Insights are not descriptions.
They are conclusions.

Bad insight:
“The chart shows tips and bills.”

Good insight:
• Larger bills tend to result in higher tips.
• Weekend days show higher average tips.
• Tip distribution is right-skewed (more small tips than large ones).

Write 3–5 bullet-point insights.

Ask yourself:
What surprised me?
What patterns are clear?
What would I investigate further?

────────────────────────
Step 4: Structure your EDA report
────────────────────────

Organise your notebook like this:

1. Introduction  
   - What dataset is this?  
   - What question are you exploring?

2. Data Overview  
   - Shape  
   - Columns  
   - Data types  

3. Visual Analysis  
   - Charts  
   - Short explanation under each  

4. Key Insights  
   - 3–5 bullet points  

Keep it clean and readable.

────────────────────────
Step 5: Export your report
────────────────────────

To create a shareable HTML file:

▶ TYPE THIS CODE:

!jupyter nbconvert --to html /content/your_notebook.ipynb

Then download the file from the left panel.

This becomes:
• A portfolio piece
• Something you can share on LinkedIn
• Proof of practical skills

────────────────────────
Why This Matters
────────────────────────

EDA is used in:
• Data analyst roles
• Product analytics
• AI model development
• Consulting
• Business reporting

Before building models, professionals explore data.

If you can write a clean EDA report,
you are thinking like a real data analyst.

────────────────────────
Outcome
────────────────────────

You now have:
• A structured data analysis
• Multiple visualisations
• Written insights
• A shareable HTML report

Free Tools
Google Colab
`
},

{
  task: "Practice SQL basics using a web playground",
  duration: 3,
  explanation: `
SQL (Structured Query Language) is how you talk to databases.

In real tech jobs, SQL is used to:
• Retrieve data
• Filter results
• Combine tables
• Calculate metrics
• Answer business questions

Today you’ll practise the 4 most important SQL concepts:
SELECT, WHERE, GROUP BY, and JOIN.

No installation needed.

────────────────────────
Step 1: Open the SQL playground
────────────────────────

Go to:
https://www.w3schools.com/sql/trysql.asp

You will see:
• A database with example tables
• An editor box
• A Run SQL button

────────────────────────
Step 2: Basic SELECT
────────────────────────

SELECT means:
“Show me data.”

▶ TYPE THIS:

SELECT * FROM Customers;

This shows all columns from the Customers table.

Now limit the results:

▶ TYPE THIS:

SELECT * FROM Customers LIMIT 5;

This shows only 5 rows.

Important:
• SELECT chooses columns
• FROM chooses the table

────────────────────────
Step 3: Filter with WHERE
────────────────────────

WHERE means:
“Only show rows that meet a condition.”

▶ TYPE THIS:

SELECT * FROM Customers
WHERE Country = 'Germany';

This shows only customers from Germany.

Try changing the country.
What happens?

────────────────────────
Step 4: Count and Group
────────────────────────

GROUP BY is used to summarise data.

▶ TYPE THIS:

SELECT Country, COUNT(*)
FROM Customers
GROUP BY Country;

This means:
• Group customers by country
• Count how many customers are in each country

Ask yourself:
Which country has the most customers?

────────────────────────
Step 5: Combine tables with JOIN
────────────────────────

JOIN connects two tables together.

Orders and Customers are separate tables.
JOIN allows you to combine them.

▶ TYPE THIS:

SELECT Orders.OrderID, Customers.CustomerName
FROM Orders
JOIN Customers
ON Orders.CustomerID = Customers.CustomerID;

What this does:
• Matches orders to the correct customer
• Combines data from both tables

Without JOIN, databases would stay separate.

────────────────────────
What You Just Practiced
────────────────────────

• SELECT → choose columns
• FROM → choose table
• WHERE → filter rows
• GROUP BY → summarise data
• COUNT → aggregate values
• JOIN → combine tables

These are used daily in data, analytics, product, and backend roles.

────────────────────────
Mini Challenge (Optional)
────────────────────────

Try answering:
• How many customers are in France?
• Which country has the most orders?
• Can you show only orders from 1997?

────────────────────────
Why This Matters
────────────────────────

Most companies store data in databases.

If you can write SQL, you can:
• Pull metrics
• Investigate problems
• Support product decisions
• Work with analysts and engineers
• Pass technical interviews

SQL is one of the highest ROI skills in tech.

────────────────────────
Outcome
────────────────────────

You can now:
• Retrieve data
• Filter results
• Summarise groups
• Combine tables confidently

Free Tools
W3Schools SQL Try Editor
`
},


{
  task: "Understand what AI and Machine Learning mean",
  duration: 1.5,
  explanation: `
Before writing code, you need to clearly understand what AI and Machine Learning actually mean.

────────────────────────
What is Artificial Intelligence (AI)?
────────────────────────

Artificial Intelligence (AI) refers to computer systems designed to perform tasks that normally require human intelligence.

This includes tasks like:
• Recognising images
• Understanding language
• Making decisions
• Solving problems

AI is the broad umbrella term.
It includes many techniques, one of them is Machine Learning.

In simple terms:
AI = making computers behave in intelligent ways.

────────────────────────
What is Machine Learning (ML)?
────────────────────────

Machine Learning (ML) is a method within AI.

Instead of programming a computer with fixed rules,
we give it data and let it learn patterns.

The system improves its predictions by analysing examples.

Simple formula:

Data → Learn patterns → Make predictions

Example:
Instead of writing rules to detect spam emails,
you show the system thousands of spam and non-spam emails.
It learns the difference.

Machine Learning is about pattern recognition from data.

────────────────────────
Real-World Use Cases
────────────────────────

AI and ML are already everywhere:

• Netflix and Spotify recommendations  
• Google Maps predicting traffic  
• Email spam filters  
• Chatbots and voice assistants  
• Fraud detection in banking  
• Resume screening systems  
• Medical image analysis  
• Credit scoring models  

In each case:
The system learns from past data
and makes a prediction or decision.

────────────────────────
Why This Matters
────────────────────────

Understanding AI and ML helps you:

• Avoid hype and misinformation  
• Recognise where data drives decisions  
• Understand how tech products are built  
• Build your own predictive systems later  

If you understand that:
Machine Learning = pattern learning from data,

then everything else becomes easier.

────────────────────────
Reflection
────────────────────────

In your Learning Hub, write:

“In my own words, AI is…”
“In my own words, Machine Learning is…”

Keep it simple.

If you can explain it clearly,
you truly understand it.

────────────────────────
Outcome
────────────────────────

You can clearly explain:
• What AI is
• What Machine Learning is
• Where they are used
• Why they matter

Free Tools
Learning Hub, YouTube (optional)
`
},

{
  task: "Try AI text generation tools (prompt practice)",
  duration: 1.5,
  explanation: `
Modern AI tools respond to instructions.
The quality of the output depends heavily on the quality of your prompt.

Prompting is a skill.

Your goal in this task:
Understand how clearer instructions produce better results.

────────────────────────
Step 1: Open an AI tool
────────────────────────

Go to one of the following:

https://chat.openai.com  
https://gemini.google.com  

Sign in if needed.

────────────────────────
Step 2: Use the 3-part prompt formula
────────────────────────

A strong prompt has 3 parts:

1) Role → Who the AI should act as  
2) Task → What it should do  
3) Format → How the answer should look  

Example prompt:

Act as a data analyst.
Explain common patterns in a customer dataset.
Write the answer in 3 clear bullet points.

Notice how specific that is.

────────────────────────
Step 3: Try 3 variations
────────────────────────

Prompt 1:
Act as a product manager.
Explain why churn might increase in a subscription app.
Write 4 short bullet points.

Prompt 2:
Act as a Python teacher.
Explain what a function is to a 12-year-old.
Use simple language and one example.

Prompt 3:
Act as a career coach.
Suggest 3 beginner AI project ideas.
Keep it under 150 words.

Run each prompt.
Observe:
• Tone
• Clarity
• Structure
• Level of detail

────────────────────────
Step 4: Improve your prompt
────────────────────────

Now take one of your prompts and make it better.

Add:
• More context
• Clear constraints
• Output format requirements
• Audience level

Example improvement:

Instead of:
Explain machine learning.

Try:
Act as a university lecturer.
Explain machine learning to complete beginners.
Use one real-world example.
Limit to 200 words.
Avoid technical jargon.

Run both versions.
Compare results.

────────────────────────
Step 5: Save your best examples
────────────────────────

In your Learning Hub, write:

• The original prompt  
• The improved prompt  
• What changed in the output  
• What you learned  

────────────────────────
Why This Matters
────────────────────────

In real jobs, AI tools are used for:
• Drafting documentation  
• Debugging code  
• Analysing datasets  
• Brainstorming ideas  
• Writing reports  
• Generating test cases  

People who write better prompts:
• Get better results  
• Save time  
• Make fewer errors  

AI is not magic.
It follows instructions.

Clear thinking → Clear prompt → Better output.

────────────────────────
Outcome
────────────────────────

You understand:
• How prompt structure affects output
• How to control tone and format
• How to refine instructions for better results

Free Tools
ChatGPT (free plan) or Gemini
`
},

{
  task: "Train a simple predictive model",
  duration: 3,
  explanation: `
Now you will build your first Machine Learning model.

You will create a model that predicts:
How much tip someone leaves,
based on the total bill.

This is called a regression problem.
We are predicting a number.

────────────────────────
What Is Happening Conceptually?
────────────────────────

Machine Learning follows this pattern:

1) Give the model data (examples)
2) The model learns patterns
3) The model makes predictions
4) You evaluate how good it is

In this case:

Input (X)  → total_bill  
Output (y) → tip  

We are asking:
Can the model learn how tips relate to bill size?

────────────────────────
Step 1: Import required tools
────────────────────────

Open your Colab notebook.

▶ TYPE THIS CODE:

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

These are tools from a library called scikit-learn.
It is widely used in real ML jobs.

────────────────────────
Step 2: Define input and output
────────────────────────

▶ TYPE THIS CODE:

X = df[["total_bill"]]
y = df["tip"]

X = the feature (what we use to predict)  
y = the target (what we want to predict)

────────────────────────
Step 3: Split the data
────────────────────────

We do NOT train on all data.
We keep some aside for testing.

▶ TYPE THIS CODE:

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

This means:
• 80% of data → training
• 20% → testing

Testing helps measure real performance.

────────────────────────
Step 4: Train the model
────────────────────────

▶ TYPE THIS CODE:

model = LinearRegression()
model.fit(X_train, y_train)

The model now learns the relationship between:
total_bill and tip.

────────────────────────
Step 5: Evaluate performance
────────────────────────

▶ TYPE THIS CODE:

score = model.score(X_test, y_test)
print("Model R² score:", score)

The score tells us:
How well the model explains the variation in tips.

If the score is:
• Close to 1 → strong relationship
• Close to 0 → weak relationship

────────────────────────
Step 6: Make a prediction
────────────────────────

Try predicting a tip for a $50 bill.

▶ TYPE THIS CODE:

model.predict([[50]])

The model gives an estimated tip amount.

You just made a prediction using AI.

────────────────────────
What You Just Did
────────────────────────

• Selected a feature
• Split data into train/test
• Trained a regression model
• Evaluated performance
• Generated a prediction

That is the core workflow of Machine Learning.

────────────────────────
Important Mental Model
────────────────────────

This is NOT magic.

The model:
• Finds the best-fit line
• Minimises prediction error
• Uses statistics under the hood

Machine Learning = mathematical pattern fitting.

────────────────────────
Why This Matters
────────────────────────

This is the foundation of:
• Price prediction
• Risk modelling
• Recommendation systems
• Forecasting
• AI products

Most ML jobs start with models like this.

────────────────────────
Outcome
────────────────────────

You have trained, evaluated, and used your first predictive model.

You now understand the full ML pipeline at a basic level.

Free Tools
Google Colab, scikit-learn
`
},
{
  task: "Create new features to improve accuracy",
  duration: 3,
  explanation: `
In Machine Learning, better inputs often lead to better predictions.

This process is called feature engineering.

A feature is simply a column the model uses to learn patterns.

Sometimes the original data is not enough.
You can create smarter features from existing columns.

Your goal:
Improve the model by designing better inputs.

────────────────────────
Step 1: Create a new percentage feature
────────────────────────

Instead of predicting tip directly from total_bill,
we can calculate tip as a percentage of the bill.

▶ TYPE THIS CODE:

df["tip_percent"] = df["tip"] / df["total_bill"] * 100

This creates a new column:
How much tip was given relative to bill size.

Why this helps:
Percentages often capture behaviour better than raw values.

────────────────────────
Step 2: Create a weekend feature
────────────────────────

People might tip differently on weekends.

Let’s create a simple binary feature:
1 = weekend
0 = weekday

▶ TYPE THIS CODE:

df["is_weekend"] = df["day"].isin(["Sat", "Sun"]).astype(int)

What this does:
• Checks if the day is Saturday or Sunday
• Converts True/False into 1 or 0

Now the model can learn:
Do tips change on weekends?

────────────────────────
Step 3: Train the model again
────────────────────────

Previously, we only used total_bill.

Now include the new feature.

▶ TYPE THIS CODE:

X = df[["total_bill", "is_weekend"]]
y = df["tip"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LinearRegression()
model.fit(X_train, y_train)

score = model.score(X_test, y_test)
print("New R² score:", score)

Compare this score to your previous one.

Did it improve?

────────────────────────
Step 4: Reflect
────────────────────────

Ask yourself:

• Did adding "is_weekend" help?
• Why might weekends change tipping behaviour?
• What other features could you create?

Ideas:
• Table size
• Bill per person
• Lunch vs dinner indicator

Feature engineering is about creative thinking.

────────────────────────
Important Concept
────────────────────────

Models do NOT invent new information.
They only learn from what you give them.

Better features → better learning.

In real-world ML projects:
Feature engineering often improves performance more than changing algorithms.

────────────────────────
Why This Matters
────────────────────────

This is how data scientists think.

Instead of asking:
“Which model should I use?”

They ask:
“How can I better represent the problem in data?”

That mindset separates beginners from professionals.

────────────────────────
Outcome
────────────────────────

You understand:
• What a feature is
• How to create new features
• How to test improvement
• Why input design matters in AI

Free Tools
Google Colab
`
},

{
  task: "Explain your model’s results with feature importance",
  duration: 2,
  explanation: `
Building a model is only half the job.

In real-world AI work, you must answer:
Why did the model make this prediction?

This builds:
• Trust
• Transparency
• Better decision-making

Today you will measure which features influence your model most.

────────────────────────
Step 1: Use a tree-based model
────────────────────────

Linear regression gives predictions,
but tree-based models allow us to measure feature importance directly.

▶ TYPE THIS CODE:

from sklearn.ensemble import RandomForestRegressor

model = RandomForestRegressor(random_state=42)
model.fit(X_train, y_train)

────────────────────────
Step 2: Extract feature importance
────────────────────────

▶ TYPE THIS CODE:

importances = model.feature_importances_
print(dict(zip(X.columns, importances)))

This prints something like:

{
  'total_bill': 0.82,
  'is_weekend': 0.58
}

The numbers represent:
How much each feature contributes to the prediction.

Higher number = more influence.

────────────────────────
Step 3: Interpret the results
────────────────────────

Ask yourself:

• Which feature has the highest importance?
• Does that make sense logically?
• Are the results surprising?

Example interpretation:

"If total_bill has 0.82 importance,
it means bill size strongly influences tip amount."

If is_weekend has lower importance,
it means day of week matters less than bill size.

────────────────────────
Step 4: Visualise feature importance (Optional but recommended)
────────────────────────

▶ TYPE THIS CODE:

import matplotlib.pyplot as plt

plt.bar(X.columns, importances)
plt.title("Feature Importance")
plt.ylabel("Importance Score")
plt.show()

This makes the explanation clearer and more professional.

────────────────────────
Why This Matters
────────────────────────

In real AI systems:

• Banks must explain credit decisions
• Hospitals must justify medical predictions
• Companies must defend algorithmic choices

If you cannot explain your model,
you should not deploy it.

Feature importance is one way to build explainable AI.

────────────────────────
Important Concept
────────────────────────

Machine Learning is not magic.

Models learn patterns.
Feature importance helps you understand:
Which patterns matter most.

Better understanding = better decisions.

────────────────────────
Outcome
────────────────────────

You can now:
• Train a tree-based model
• Measure feature importance
• Interpret what drives predictions
• Explain results clearly

Free Tools
Google Colab, scikit-learn
`
},

{
  task: "Check for fairness and responsible AI practices",
  duration: 1.5,
  explanation: `
Building a model is not enough.

Responsible AI means asking:
Should we use this model?
Who might it affect?
Could it cause harm?

Even simple models can influence real decisions.

Your goal:
Develop the habit of ethical reflection.

────────────────────────
Step 1: Add an “Ethical Check” section
────────────────────────

In your Colab notebook:

• Insert a new Markdown cell
• Title it: Ethical Check

This section will document your thinking.

────────────────────────
Step 2: Consider who is affected
────────────────────────

Write short answers to:

• Who could be affected if this model makes mistakes?
• Could wrong predictions disadvantage certain groups?
• Would errors cause financial, social, or emotional harm?

Example:
If this were a loan approval model,
wrong predictions could deny people credit unfairly.

────────────────────────
Step 3: Identify sensitive data
────────────────────────

Ask:

• Does the dataset contain gender, age, ethnicity, income?
• Should these be used for prediction?
• Could they introduce bias?

Even if your current dataset is simple,
practice asking this question.

Sensitive features require careful consideration.

────────────────────────
Step 4: Consider fairness
────────────────────────

Ask:

• Does the model perform equally well across different groups?
• Could it be more accurate for one group than another?
• How would we test that?

Fairness means:
The model should not systematically disadvantage certain people.

────────────────────────
Step 5: Add human oversight
────────────────────────

Ask:

• Should a human review important predictions?
• In which situations should the model NOT make the final decision?
• What safeguards should exist?

Example:
AI can assist decision-making,
but humans should approve high-risk outcomes.

────────────────────────
Why This Matters
────────────────────────

AI systems are used in:

• Hiring
• Lending
• Healthcare
• Insurance
• Education
• Policing

Mistakes or bias can cause real harm.

Responsible AI is not optional.
It is part of professional practice.

────────────────────────
Important Mindset
────────────────────────

Good AI practitioners ask:

“Just because we CAN build this model,
should we?”

Thinking about ethics early prevents problems later.

────────────────────────
Outcome
────────────────────────

You now think beyond accuracy.

You consider:
• Fairness
• Bias
• Risk
• Human oversight

This mindset separates responsible technologists from careless ones.

Free Tools
Google Colab
`
},

{
  task: "Build a small AI-powered web app (no-code style)",
  duration: 2,
  explanation: `
You will turn your simple prediction logic into a tiny web app that people can interact with.

This is powerful because:
• It looks like a real product
• You can share a link
• It turns your work into a portfolio demo

We will use Streamlit (a beginner-friendly tool for building mini apps with Python).

────────────────────────
Step 1: Install Streamlit + tunnel tools
────────────────────────

In Colab, run this in a new code cell:

▶ TYPE THIS CODE:

!pip -q install streamlit localtunnel

Wait until installation finishes.

────────────────────────
Step 2: Create your app file (app.py)
────────────────────────

Streamlit apps are Python files.
We will create a simple “Tip Predictor” app.

Run this cell to create the file:

▶ TYPE THIS CODE:

%%writefile app.py
import streamlit as st

st.title("Tip Predictor")

st.write("Enter a bill amount and this app will estimate the tip.")

bill = st.number_input("Bill amount", min_value=0.0, value=50.0, step=1.0)

# Simple prediction rule (placeholder model)
predicted_tip = bill * 0.55

st.write("Predicted tip:", round(predicted_tip, 2))

What this app does:
• Shows a title
• Lets the user type a bill amount
• Calculates a predicted tip using 15%

This is “AI-style” behaviour: input → prediction.

────────────────────────
Step 3: Start the Streamlit app
────────────────────────

Run this cell:

▶ TYPE THIS CODE:

!streamlit run app.py &>/content/logs.txt &

This starts the web app in the background.

────────────────────────
Step 4: Create a public link you can open
────────────────────────

Now run:

▶ TYPE THIS CODE:

!npx localtunnel --port 8501

It will print a public link like:
https://something.loca.lt

Copy that link and open it in your browser.

You now have a live mini web app.

────────────────────────
Step 5: Make it feel more “AI-powered”
────────────────────────

Improve the output by showing a range instead of one number:

Go back to your app.py cell and replace the predicted tip section with:

predicted_tip = bill * 0.55
low = predicted_tip * 0.9
high = predicted_tip * 1.1

st.write("Predicted tip range:")
st.write("Low:", round(low, 2))
st.write("High:", round(high, 2))

Run Step 3 and Step 4 again to refresh your app.

────────────────────────
Why This Matters
────────────────────────

In real tech jobs, building “models” is not enough.
You also need to:
• Turn them into something usable
• Show them to people
• Demonstrate your work clearly

A shareable demo link is portfolio gold.

────────────────────────
Outcome
────────────────────────

You built a working mini web app that takes input and returns a prediction, and you generated a public link that others can try.

Free Tools
Google Colab, Streamlit, LocalTunnel
`
},

{
  task: "Write your project summary and publish it",
  duration: 1.5,
  explanation: `
Finishing a project is good.
Explaining it clearly is what makes it valuable.

In tech, being able to communicate what you built is just as important as building it.

Today you will turn your Data & AI work into something portfolio-ready.

────────────────────────
Step 1: Create your summary document
────────────────────────

Open Google Docs, Notion, or your Learning Hub.

Title it:
“Mini Data & AI Project – [Your Project Name]”

Write 4 short sections:

1) Problem  
• What question were you trying to answer?  
• Why does this matter?  
Example: “I explored whether bill size influences tip amount and how simple models can predict tipping behaviour.”

2) Approach  
• What dataset did you use?  
• What cleaning steps did you take?  
• What models did you train?  
• What tools did you use (Pandas, Matplotlib, scikit-learn)?

Keep this concise and structured.

3) Results  
• What patterns did you find?  
• What was your model score?  
• Which features mattered most?  
• Did feature engineering improve accuracy?

Use bullet points for clarity.

4) Reflection  
• What did you learn?  
• What was challenging?  
• What would you improve next time?  
• How could this project be expanded?

────────────────────────
Step 2: Make it professional
────────────────────────

• Add 1–2 screenshots of your charts  
• Add a screenshot of your Streamlit app (if you built it)  
• Keep formatting clean with headings  
• Aim for 1–2 pages maximum  

Clarity > length.

────────────────────────
Step 3: Export and save
────────────────────────

Export your summary as a PDF.

Then:

• Download your Colab notebook as .ipynb (File → Download → .ipynb)
• Upload both files to:
  - GitHub (recommended), or
  - A shared Google Drive folder

Optional:
Add the link to your LinkedIn or CV under “Projects”.

────────────────────────
Why This Matters
────────────────────────

Hiring managers do not hire “people who followed tutorials.”

They hire people who can:
• Solve problems
• Explain their thinking
• Show evidence of learning
• Reflect and improve

This summary turns your practice into proof.

────────────────────────
Outcome
────────────────────────

A complete, structured, shareable Data & AI project ready for your portfolio, CV, or LinkedIn.

Free Tools
Google Colab, Google Docs or Notion, GitHub
`
}
],

frontend_skills: [

{
  task: "Understand the three building blocks of the web: HTML, CSS, and JavaScript",
  duration: 1,
  explanation: `
Every modern website is built using three core technologies:
HTML, CSS, and JavaScript.

Before writing code, you need to understand what each one does.

Think of a website like a house:

• HTML = the structure (walls, rooms, doors)
• CSS = the interior design (colours, layout, styling)
• JavaScript = the electricity and movement (buttons working, lights turning on, forms reacting)

Each has a clear role.

────────────────────────
What You Need to Know First
────────────────────────

HTML (HyperText Markup Language)
• Defines what content appears on the page
• Headings, paragraphs, images, buttons
• It gives structure

CSS (Cascading Style Sheets)
• Controls how the page looks
• Colours, fonts, spacing, layout
• Makes the page visually appealing

JavaScript
• Makes the page interactive
• Handles clicks, animations, pop-ups
• Allows dynamic behaviour (like updating content without refreshing)

────────────────────────
Step-by-Step
────────────────────────

1. Open your Learning Hub.
2. Create a page called:
   “Frontend Basics”

3. Write these definitions in your own words:
   • HTML = content and structure
   • CSS = styling and layout
   • JavaScript = interaction and behaviour

4. Open a website you use daily (e.g., Google, Amazon, Instagram).

Ask yourself:
• What parts are pure content? (Headlines, product names → HTML)
• What parts are styling? (Colours, spacing, fonts → CSS)
• What parts react when you click? (Dropdowns, forms, live updates → JavaScript)

5. Optional (curiosity exercise):
Right-click on any webpage → Click “Inspect”.
You will see the HTML structure behind the page.

You are now looking at real web code.

────────────────────────
Why This Matters
────────────────────────

Understanding these three layers helps you:
• Know where to start learning
• Debug problems more easily
• Communicate clearly with designers and developers
• Understand how apps like your own are built

Almost every frontend job uses these three technologies.

────────────────────────
Outcome
────────────────────────

You understand the difference between:
• Structure (HTML)
• Style (CSS)
• Behaviour (JavaScript)

This is the foundation of frontend development.

Free Tools
Any web browser, Learning Hub
`
},

{
  task: "Create your first HTML file",
  duration: 1.5,
  explanation: `
HTML (HyperText Markup Language) tells the browser what content to display.
It is the foundation of every website.

Today you will create your very first webpage.

────────────────────────
What You Need to Know First
────────────────────────

• HTML uses tags.
• Tags are written inside angle brackets, like <h1> or <p>.
• Most tags have an opening tag and a closing tag.

Example:
<h1>Hello</h1>

The opening tag is <h1>
The closing tag is </h1>

The slash (/) means “this tag is closing”.

────────────────────────
Step-by-Step
────────────────────────

1. Open VS Code.
2. Click File → New File.
3. Save the file as:
   index.html

Important:
Make sure it ends with .html
This tells the computer it is a webpage.

4. Now type the following:

<html>
  <body>
    <h1>Hello, world!</h1>
    <p>This is my first webpage.</p>
  </body>
</html>

5. Save the file (Ctrl + S or Cmd + S).

6. Go to where you saved the file (for example, your Desktop).
7. Double-click index.html.

It will open in your browser.

You have just created a webpage.

────────────────────────
What This Code Means
────────────────────────

<html>
This tells the browser: “This is an HTML document.”

<body>
This is where visible content goes.

<h1>
This is a large heading.

<p>
This is a paragraph.

Everything inside <body> appears on the page.

────────────────────────
Small Experiment (Optional)
────────────────────────

Change the text inside <h1>.
Save the file.
Refresh your browser.

Notice:
When you edit the file and refresh, the page updates.

This is how frontend development works.

────────────────────────
Why This Matters
────────────────────────

Every website starts with HTML.
It defines structure before design or interaction.

You now understand:
• What tags are
• How files become webpages
• How browsers read HTML

────────────────────────
Outcome
────────────────────────

You created and opened your first webpage.
This is your first real frontend milestone.

Free Tools
VS Code, any web browser
`
},
{
  task: "Learn the most common HTML tags",
  duration: 1.5,
  explanation: `
To build real webpages, you only need to understand a small set of core HTML tags.

Most websites are made using these basic building blocks.

────────────────────────
What You Need to Know First
────────────────────────

• Most HTML tags come in pairs:
  Opening tag: <p>
  Closing tag: </p>

• Content goes between the opening and closing tag.

Example:
<p>This is a paragraph</p>

• Some tags (like <img>) do not need a closing tag.

────────────────────────
Step-by-Step
────────────────────────

1. Open your existing index.html file.

2. Below your current content, add:

<h2>My Skills</h2>

<ul>
  <li>Communication</li>
  <li>Problem-solving</li>
  <li>Organisation</li>
</ul>

<h2>Contact</h2>

<p>Email me at example@email.com</p>

3. Save the file.

4. Refresh your browser.

You should now see:
• A smaller heading ("My Skills")
• A bullet-point list
• A paragraph under "Contact"

────────────────────────
Understand What Each Tag Does
────────────────────────

<h1> to <h6>
Headings (h1 is largest, h6 is smallest)

<p>
Paragraph text

<ul>
Unordered list (bullet list)

<li>
List item (each bullet point)

Now add an image below your contact section:

<img src="https://via.placeholder.com/150" alt="Placeholder image">

Save and refresh again.

You should now see a small image.

────────────────────────
Optional Experiment
────────────────────────

Try:
• Changing <ul> to <ol> (ordered list)
• Changing <h2> to <h3>
• Adding another <li> item

Observe how the page changes.

This is how you learn HTML: small edits + refresh.

────────────────────────
Why This Matters
────────────────────────

These tags are used on almost every website.

If you understand:
• Headings
• Paragraphs
• Lists
• Images

You can already structure a real webpage.

Design (CSS) and interaction (JavaScript) come later.
Structure always comes first.

────────────────────────
Outcome
────────────────────────

You now understand the most common HTML tags and how to use them to build structured content.

Free Tools
VS Code, any web browser
`
},
{
  task: "Add your first CSS styles",
  duration: 1.5,
  explanation: `
So far, your webpage works, but it looks plain.

CSS (Cascading Style Sheets) controls how your webpage looks:
• Colours
• Fonts
• Spacing
• Layout

HTML = structure  
CSS = design

────────────────────────
What You Need to Know First
────────────────────────

CSS works using rules.

A CSS rule looks like this:

selector {
  property: value;
}

Example:

h1 {
  color: blue;
}

This means:
“Select all h1 headings and make them blue.”

• selector = what you are targeting (e.g., h1, p, body)
• property = what you want to change (color, font-size, margin)
• value = how you want it to look (blue, 18px, Arial)

────────────────────────
Step-by-Step
────────────────────────

1. In the same folder as index.html,
   create a new file called:

   styles.css

2. Open styles.css and add:

body {
  font-family: Arial;
  background-color: #f4f4f4;
}

h1 {
  color: darkblue;
  text-align: center;
}

p {
  font-size: 18px;
  color: #333333;
}

3. Save the file.

────────────────────────
Step 3: Connect CSS to HTML
────────────────────────

Now you must tell your HTML file to use the CSS file.

Open index.html.

At the top, add a <head> section like this:

<html>
  <head>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

Make sure:
• The link tag is inside <head>
• The filename matches exactly: styles.css

4. Save both files.

5. Refresh your browser.

Your webpage should now:
• Have a light background
• Use Arial font
• Show a centered blue heading
• Display larger paragraph text

────────────────────────
Small Experiments (Optional)
────────────────────────

Try changing:
• background-color
• font-family
• color
• font-size

Save and refresh after each change.

This is how frontend developers experiment.

────────────────────────
Why This Matters
────────────────────────

Almost every modern website separates:
• Structure (HTML)
• Design (CSS)

Understanding how to connect them is a major milestone.

You now know how websites become visually styled.

────────────────────────
Outcome
────────────────────────

You successfully:
• Created a CSS file
• Connected it to HTML
• Styled your webpage
• Understood how CSS rules work

Free Tools
VS Code, any web browser
`
},
{
  task: "Create a simple landing section (hero, features, call-to-action)",
  duration: 2,
  explanation: `
Most modern websites start with a landing section.

This usually includes:
• A hero section (big headline + short message)
• A features section (why it matters)
• A call-to-action button (what the user should do next)

Today you will build your first mini landing page layout.

────────────────────────
Step 1: Add the HTML structure
────────────────────────

Open index.html.

Inside the <body> (below your existing content), add:

<section id="hero">
  <h1>Learn with Me</h1>
  <p>Start your tech journey today.</p>
  <button>Get Started</button>
</section>

<section id="features">
  <h2>Why Join?</h2>
  <ul>
    <li>Free learning path</li>
    <li>Simple lessons</li>
    <li>Community support</li>
  </ul>
</section>

Save the file.

Refresh your browser.

You should now see:
• A large heading
• A short description
• A button
• A list of benefits

────────────────────────
Step 2: Style the landing sections with CSS
────────────────────────

Open styles.css.

Add:

#hero {
  text-align: center;
  padding: 40px;
  background: #e0f7fa;
}

#features {
  padding: 30px;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

Save the file.
Refresh your browser again.

Now your page should:
• Have a coloured hero section
• Have spacing between sections
• Show a styled button
• Change button colour when you hover

────────────────────────
Step 3: Improve it (Optional Practice)
────────────────────────

Try:
• Changing background colours
• Increasing padding
• Making the hero text bigger
• Changing the button colour
• Adding a second button

Experimenting is how frontend developers learn.

────────────────────────
What You Just Practiced
────────────────────────

• Creating page sections using <section>
• Using IDs (#hero, #features)
• Styling buttons
• Adding spacing and background colours
• Creating a simple layout structure

────────────────────────
Why This Matters
────────────────────────

Landing sections are everywhere:
• Startup websites
• Product launches
• Portfolios
• SaaS products
• App marketing pages

If you can build a hero + features + CTA,
you can build the foundation of most modern sites.

────────────────────────
Outcome
────────────────────────

You built your first mini landing page section with structure and styling.

Free Tools
VS Code or Replit, any web browser
`
},
{
  task: "Make your page responsive with Flexbox",
  duration: 2,
  explanation: `
Responsive design means your website looks good on:
• Phones
• Tablets
• Laptops
• Large screens

Flexbox is a CSS layout system that helps elements automatically adjust based on screen size.

Instead of manually positioning everything, Flexbox distributes space for you.

────────────────────────
What You Need to Know First
────────────────────────

display: flex;
→ Turns a container into a flexible layout.

flex: 1;
→ Makes items share available space evenly.

@media (max-width: 600px)
→ Applies special styles when the screen becomes small (like a phone).

────────────────────────
Step 1: Add the HTML structure
────────────────────────

Open index.html.

Below your existing sections, add:

<section id="cards">
  <div class="card">HTML</div>
  <div class="card">CSS</div>
  <div class="card">JavaScript</div>
</section>

Save the file.

Refresh your browser.

You should now see three simple boxes stacked vertically.

────────────────────────
Step 2: Turn it into a Flexbox layout
────────────────────────

Open styles.css.

Add:

#cards {
  display: flex;
  gap: 10px;
  padding: 20px;
}

.card {
  flex: 1;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #ccc;
  text-align: center;
}

Save and refresh.

Now the cards should appear side-by-side horizontally.

This happens because:
• display: flex places children in a row by default.
• flex: 1 makes each card take equal width.

────────────────────────
Step 3: Make it responsive for small screens
────────────────────────

Still in styles.css, add:

@media (max-width: 600px) {
  #cards {
    flex-direction: column;
  }
}

Save.

Now resize your browser window to be narrow.

You should see:
• Cards stack vertically when the screen is small.
• Cards sit horizontally when the screen is wide.

This is responsive design.

────────────────────────
What You Just Practiced
────────────────────────

• Using display: flex
• Distributing space evenly
• Adding spacing with gap
• Using media queries
• Making layouts adapt automatically

────────────────────────
Why This Matters
────────────────────────

Most users browse on mobile devices.

If your layout:
• Breaks on small screens
• Forces horizontal scrolling
• Overlaps content

Users leave.

Flexbox is used in almost every modern website.

Learning it now saves you hours later.

────────────────────────
Outcome
────────────────────────

You built a responsive layout that automatically adapts to screen size using Flexbox.

Free Tools
VS Code or Replit, any web browser
`
},

{
  task: "Use CSS Grid for a magazine-style layout",
  duration: 2,
  explanation: `
Flexbox is great for arranging items in one direction (row OR column).

CSS Grid is different.
It allows you to design layouts in two directions at once:
• Rows
• Columns

This makes Grid perfect for:
• Magazine-style pages
• Dashboards
• News layouts
• Structured multi-column designs

Today you will build a simple grid layout.

────────────────────────
What You Need to Know First
────────────────────────

display: grid;
→ Turns a container into a grid layout.

grid-template-columns
→ Defines how many columns exist and how wide they are.

grid-template-areas
→ Lets you visually map layout sections using names.

────────────────────────
Step 1: Add the HTML structure
────────────────────────

Open index.html.

Replace your previous layout section (or add a new one) with:

<section id="grid">
  <div class="header">Header</div>
  <div class="main">Main</div>
  <div class="aside">Aside</div>
  <div class="footer">Footer</div>
</section>

Save and refresh.

You will see four stacked boxes.

Now we will turn them into a structured layout.

────────────────────────
Step 2: Add CSS Grid styling
────────────────────────

Open styles.css and add:

#grid {
  display: grid;

  grid-template-areas:
    "header header"
    "main aside"
    "footer footer";

  grid-template-columns: 2fr 1fr;

  gap: 10px;
  padding: 20px;
}

.header {
  grid-area: header;
  background: #bbdefb;
  padding: 20px;
}

.main {
  grid-area: main;
  background: #c8e6c9;
  padding: 20px;
}

.aside {
  grid-area: aside;
  background: #ffe0b2;
  padding: 20px;
}

.footer {
  grid-area: footer;
  background: #f8bbd0;
  padding: 20px;
}

Save and refresh.

Now your layout should look like:

Header spans full width  
Main content on left  
Sidebar (Aside) on right  
Footer spans full width  

────────────────────────
What grid-template-columns: 2fr 1fr Means
────────────────────────

2fr 1fr means:
• The first column takes 2 parts
• The second column takes 1 part

So the main section is twice as wide as the aside.

Try changing it to:
1fr 1fr

Observe how both columns become equal width.

────────────────────────
Experiment and Explore
────────────────────────

Try:

• Changing grid-template-columns to 3fr 1fr
• Moving "aside" above "main" in grid-template-areas
• Adding another row

Small changes in Grid can completely rearrange layout.

────────────────────────
Flexbox vs Grid
────────────────────────

Flexbox → one direction (row OR column)  
Grid → two directions (rows AND columns)

Both are used in modern websites.
Grid is especially powerful for structured layouts.

────────────────────────
Why This Matters
────────────────────────

Many real-world layouts use Grid:
• Blog pages
• News websites
• Admin dashboards
• Portfolio sites

Understanding Grid makes you capable of designing structured web layouts confidently.

────────────────────────
Outcome
────────────────────────

You created a multi-column layout using CSS Grid and understand how rows, columns, and layout areas work together.

Free Tools
VS Code or Replit, MDN Grid documentation
`
},

{
  task: "Use console.log to inspect what your code is doing",
  duration: 1,
  explanation: `
When you write JavaScript, you cannot always see what is happening just by looking at the page.

Developers use console.log() to:
• Check if code is running
• See variable values
• Debug problems
• Understand program flow

It is one of the most important beginner tools.

────────────────────────
What You Need to Know First
────────────────────────

console.log() prints messages to the browser console.

The console is inside your browser’s Developer Tools.
It does NOT show on the webpage.
It is for developers only.

────────────────────────
Step 1: Connect JavaScript to Your Page
────────────────────────

If you don’t already have a JavaScript file:

1. Create a new file called:
   script.js

2. Open index.html.

3. Before the closing </body> tag, add:

<script src="script.js"></script>

Save the file.

────────────────────────
Step 2: Add Your First console.log
────────────────────────

Open script.js and add:

console.log("Hello from JavaScript");

Save the file.

────────────────────────
Step 3: Open the Browser Console
────────────────────────

1. Open your webpage in the browser.
2. Right-click anywhere on the page.
3. Click “Inspect”.
4. Click the “Console” tab.

You should see:
Hello from JavaScript

This means:
Your JavaScript file is connected correctly.

────────────────────────
Step 4: Inspect Variables
────────────────────────

Now replace your code with:

let name = "Sarah";
console.log(name);

Refresh the page.

You should see:
Sarah

Change the value of name.
Refresh again.

Observe how the console updates.

────────────────────────
Why This Matters
────────────────────────

In real development:

• You use console.log to test ideas
• You check values during calculations
• You debug errors
• You trace what your program is doing

Even senior developers use console.log daily.

It is your visibility tool into JavaScript.

────────────────────────
Common Beginner Mistakes
────────────────────────

If nothing appears in the console:
• Check that script.js is linked correctly
• Make sure you saved the file
• Refresh the browser

Debugging starts here.

────────────────────────
Outcome
────────────────────────

You can:
• Print messages to the console
• Inspect variable values
• Confirm your JavaScript is running

This is your first real debugging skill.

Free Tools
VS Code, any browser with Developer Tools
`
},
{
  task: "Understand how JavaScript adds interactivity",
  duration: 1.5,
  explanation: `
So far, your webpage shows content and styling.
Now you will make it respond to user actions.

JavaScript adds interactivity.

It allows you to:
• React to clicks
• Show messages
• Change text
• Update content
• Create dynamic behaviour

Without JavaScript, websites would be static.

────────────────────────
What You Need to Know First
────────────────────────

• JavaScript runs inside your browser.
• A function is a block of code that performs an action.
• An event is something that happens (like a click).
• We can tell JavaScript: “When this event happens, run this function.”

That is how interactivity works.

────────────────────────
Step 1: Create a JavaScript file
────────────────────────

1. In your project folder, create a file called:
   script.js

2. Open script.js and add:

function greetUser() {
  alert("Welcome to my website!");
}

Save the file.

This function:
• Is named greetUser
• Shows a popup message using alert()

────────────────────────
Step 2: Add a Button in HTML
────────────────────────

Open index.html.

Inside the <body>, add:

<button onclick="greetUser()">Click me</button>

This means:
When the button is clicked,
run the function greetUser().

────────────────────────
Step 3: Link JavaScript to HTML
────────────────────────

At the bottom of index.html,
right before </body>, add:

<script src="script.js"></script>

Save everything.

────────────────────────
Step 4: Test It
────────────────────────

Open your webpage.
Click the button.

You should see a popup that says:
“Welcome to my website!”

That popup is JavaScript in action.

────────────────────────
Understand What Just Happened
────────────────────────

1. You clicked the button (event).
2. The browser saw onclick="greetUser()".
3. It looked for the greetUser function.
4. It executed the code inside it.
5. The alert appeared.

That is interactivity.

────────────────────────
Optional Upgrade
────────────────────────

Replace alert() with this instead:

function greetUser() {
  document.querySelector("h1").textContent = "You clicked the button!";
}

Now clicking the button will change the heading instead of showing a popup.

This shows how JavaScript can modify the page.

────────────────────────
Why This Matters
────────────────────────

Almost every modern website uses JavaScript for:
• Forms
• Login systems
• Search bars
• Live updates
• Animations
• Notifications

Understanding functions + events is the foundation.

────────────────────────
Outcome
────────────────────────

You understand:
• What a function is
• What an event is
• How JavaScript reacts to user actions
• How interactivity works on the web

Free Tools
VS Code, any web browser
`
},

{
  task: "Create a navigation bar and link sections",
  duration: 2,
  explanation: `
Navigation helps users move around a website.

Most websites have a menu at the top that lets users:
• Jump to sections
• Explore content
• Understand structure

Today you’ll build a simple navigation bar and link it to different parts of your page.

────────────────────────
What You Need to Know First
────────────────────────

HTML links use this format:

<a href="destination">Text</a>

The href attribute tells the browser where to go.

If you use:
href="#sectionID"

It jumps to a section on the same page
that has id="sectionID".

This is called an anchor link.

────────────────────────
Step 1: Add a Navigation Bar
────────────────────────

Open index.html.

At the top of your <body>, add:

<nav>
  <a href="#hero">Home</a>
  <a href="#features">Features</a>
  <a href="#cards">Topics</a>
</nav>

Make sure:
Your sections already have matching IDs, like:

<section id="hero">
<section id="features">
<section id="cards">

Save the file.

────────────────────────
Step 2: Style the Navigation Bar
────────────────────────

Open styles.css and add:

nav {
  background: #333;
  padding: 10px;
}

nav a {
  color: white;
  margin: 0 10px;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

Save and refresh your browser.

You should now see:
• A dark bar at the top
• White navigation links
• Underline effect when hovering

────────────────────────
Step 3: Test the Links
────────────────────────

Click “Home”, “Features”, and “Topics”.

The page should scroll to each section automatically.

This works because:
• The link uses #hero
• The section has id="hero"
• The browser matches them

────────────────────────
Optional Improvements
────────────────────────

Try adding:

html {
  scroll-behavior: smooth;
}

Now clicking links will smoothly scroll instead of jumping instantly.

You can also:
• Add more links
• Change colours
• Center the nav
• Add spacing

────────────────────────
Why This Matters
────────────────────────

Navigation is one of the most important parts of a website.

Without navigation:
• Users get lost
• Pages feel confusing
• Content feels disconnected

Every professional site has structured navigation.

You just built your first one.

────────────────────────
Outcome
────────────────────────

You understand:
• How anchor links work
• How href connects to section IDs
• How navigation menus are structured
• How users move around a webpage

Free Tools
VS Code or Replit, any web browser
`
},
{
  task: "Learn how the browser reads your code",
  duration: 1,
  explanation: `
When something breaks on your webpage, it’s often because you don’t fully understand how the browser reads your files.

Understanding the loading order helps you:
• Fix bugs faster
• Connect files correctly
• Avoid common beginner mistakes

────────────────────────
What You Need to Know First
────────────────────────

When you open a webpage, the browser reads files in this general order:

1. HTML → structure and content
2. CSS → styling and layout
3. JavaScript → behaviour and interaction

Important:
The browser reads HTML from top to bottom.

If JavaScript runs before the HTML element exists,
it may cause errors.

That’s why we usually place:
<script src="script.js"></script>
at the bottom of the <body>.

────────────────────────
Step-by-Step
────────────────────────

1. Open your Learning Hub.
2. Write this in your own words:

   • HTML builds the structure.
   • CSS styles the structure.
   • JavaScript adds behaviour.
   • The browser reads from top to bottom.

3. Open your webpage in the browser.

4. Right-click anywhere → Click “Inspect”.

5. Click the “Elements” tab.

This shows your HTML structure exactly as the browser sees it.

Expand different sections to see:
• <nav>
• <section>
• <button>

You are now looking at the live DOM (Document Object Model).

────────────────────────
Explore the Styles
────────────────────────

Click on any element (for example, your button).

On the right side, click the “Styles” panel.

You will see:
• The CSS rules being applied
• Where they come from
• Which styles are active or overridden

This helps you debug styling problems.

────────────────────────
Explore the Console (Optional)
────────────────────────

Click the “Console” tab.

If there are errors, they will appear here.

Most JavaScript errors show up in the console.

────────────────────────
Why This Matters
────────────────────────

When beginners get stuck, it is usually because:

• The CSS file is not linked correctly
• The JavaScript file is loading too early
• There is a typo in HTML
• The browser cannot find a file

Understanding how the browser processes files gives you confidence.

You are not guessing anymore.
You understand the system.

────────────────────────
Mental Model to Remember
────────────────────────

HTML → builds the skeleton  
CSS → paints the skeleton  
JavaScript → makes it move  

The browser combines all three to create the page you see.

────────────────────────
Outcome
────────────────────────

You now understand:
• The loading order of HTML, CSS, and JavaScript
• How to inspect elements
• How to see applied styles
• How to debug basic issues

This mental model will make every future bug easier to solve.

Free Tools
Any web browser with Developer Tools
`
},

{
  task: "Build a simple 'About Me' webpage",
  duration: 2,
  explanation: `
Now you will combine everything you’ve learned:

• HTML (structure)
• CSS (styling)
• JavaScript (interactivity)

Instead of following tiny isolated examples, you’ll build a small real project.

Mini-projects are powerful because:
• They reinforce learning
• They build confidence
• They create portfolio pieces

────────────────────────
Step 1: Set Up Your HTML
────────────────────────

Open your index.html file.

Replace the content with:

<html>
  <head>
    <title>About Me</title>
    <link rel="stylesheet" href="styles.css">
  </head>

  <body>
    <h1>About Me</h1>

    <p>Hello! My name is ___ and I’m learning frontend development.</p>

    <h2>My Interests</h2>

    <ul>
      <li>Learning new skills</li>
      <li>Technology</li>
      <li>Creativity</li>
    </ul>

    <button onclick="showMessage()">Click here</button>

    <script src="script.js"></script>
  </body>
</html>

Replace the blank with your real name.

Save the file.

────────────────────────
Step 2: Add JavaScript Interactivity
────────────────────────

Open script.js.

Add:

function showMessage() {
  alert("Thanks for visiting my webpage!");
}

Save the file.

Now open your webpage in the browser and click the button.
You should see a popup message.

You just connected HTML + JavaScript.

────────────────────────
Step 3: Add Basic Styling
────────────────────────

Open styles.css.

Add something simple like:

body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  padding: 40px;
}

h1 {
  color: #333;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

Save and refresh your browser.

Your page should now:
• Have spacing
• Look cleaner
• Have a styled button

────────────────────────
Step 4: Improve It (Optional)
────────────────────────

Try:
• Adding an image using <img>
• Adding another section
• Changing colors
• Centering content
• Replacing alert() with changing text instead

Experimentation builds confidence.

────────────────────────
What You Just Practiced
────────────────────────

• Creating a full HTML structure
• Linking external CSS
• Linking external JavaScript
• Using onclick events
• Styling with CSS
• Testing in the browser

You built a complete small web page from scratch.

────────────────────────
Why This Matters
────────────────────────

This is how real websites are built:
Structure → Style → Behaviour

You are no longer copying isolated snippets.
You are building small products.

That’s real progress.

────────────────────────
Outcome
────────────────────────

Your first complete webpage combining HTML, CSS, and JavaScript into one working project.

Free Tools
VS Code or Replit, any web browser
`
},
{
  task: "Save your webpage as your first project folder",
  duration: 0.5,
  explanation: `
Writing code is important.
Organising your work is just as important.

Professional developers do not keep random files on their desktop.
They organise projects into clear folders.

Good organisation helps you:
• Track progress
• Avoid confusion
• Share projects easily
• Build a portfolio over time

────────────────────────
What You Need to Know First
────────────────────────

Each project should live inside its own folder.

A project folder usually contains:
• index.html
• styles.css
• script.js
• Any images
• Notes or documentation

Keeping everything together prevents broken file links.

────────────────────────
Step-by-Step
────────────────────────

1. Go to your Desktop (or wherever you store projects).

2. Create a new folder called:

   about-me-project

3. Move these files into the folder:
   • index.html
   • styles.css
   • script.js

4. Double-click index.html inside the folder to confirm:
   The page still works correctly.

If it does not work,
check that:
• The CSS file name matches exactly.
• The script file name matches exactly.
• All files are inside the same folder.

────────────────────────
Step 2: Add a Notes File
────────────────────────

Inside the same folder, create a new file called:

notes.txt

Open it and write:

• What I learned about HTML
• What I learned about CSS
• What I learned about JavaScript
• One thing I found difficult
• One thing I want to improve next

Keep it short (5–10 lines).

This builds reflection skills.

────────────────────────
Step 3: Save It in Your Learning Hub
────────────────────────

In your Learning Hub, create a new entry:

Project 1 – About Me Webpage

Write:
• Date completed
• What technologies you used
• One improvement idea

────────────────────────
Why This Matters
────────────────────────

From now on, every project should:

• Have its own folder
• Be clearly named
• Include notes
• Be easy to revisit

This habit builds:
• Professional discipline
• Portfolio readiness
• Long-term confidence

────────────────────────
Outcome
────────────────────────

You now have:
• Your first structured project folder
• A clean file organisation system
• Written reflection on your learning

This is how real developer portfolios start.

Free Tools
VS Code, File Explorer / Finder
`
},
{
  task: "Publish your static site online",
  duration: 2,
  explanation: `
So far, your webpage only works on your computer.

Now you will make it live on the internet.

Publishing your site means:
• Anyone with the link can view it
• You can share it on LinkedIn or your CV
• It becomes part of your portfolio

This is a major confidence milestone.

────────────────────────
Option 1: Publish with Replit (Beginner Friendly)
────────────────────────

1. Go to https://replit.com and log in.
2. Click “Create Repl”.
3. Choose “HTML, CSS, JS”.
4. Upload your project files:
   • index.html
   • styles.css
   • script.js

5. Make sure your HTML file is named exactly:
   index.html

6. Click the “Run” button.
7. You will see a preview of your site.

To publish:

8. Click the “Deploy” or “Share” button.
9. Choose “Publish” (free option if available).
10. Copy the public link provided.

Open the link in a new browser tab.

Your website is now live.

────────────────────────
Option 2 (Alternative): GitHub Pages
────────────────────────

If you want a more professional setup:

1. Create a GitHub account.
2. Create a new repository called:
   about-me-project
3. Upload your project files.
4. Go to Settings → Pages.
5. Select “Deploy from branch” → main branch.
6. Save.

GitHub will generate a public link like:
https://yourusername.github.io/about-me-project

This is widely used by developers.

────────────────────────
Step 2: Test Everything
────────────────────────

Open your public link.

Check:
• Does styling load?
• Does the button work?
• Do links work?
• Are there any errors?

If something is broken:
• Make sure all files are uploaded.
• Check file names match exactly.
• Refresh the page.

────────────────────────
Step 3: Share It
────────────────────────

Now:

• Add the link to your Learning Hub.
• Send it to a friend for feedback.
• Post it on LinkedIn (optional).
• Save it in a document called “Portfolio Links”.

You just built something real and public.

────────────────────────
Why This Matters
────────────────────────

Most beginners stop at:
“It works on my computer.”

Professionals:
Ship.

Publishing builds:
• Confidence
• Visibility
• Accountability
• Portfolio evidence

This is the beginning of your public tech presence.

────────────────────────
Outcome
────────────────────────

Your first live website accessible to anyone with the link.

Free Tools
Replit (free hosting) or GitHub Pages
`
},
{
  task: "Learn the basics of React (create app, components, props)",
  duration: 3,
  explanation: `
React is a JavaScript library used to build modern, dynamic user interfaces.

Instead of writing one large page,
React lets you build small reusable pieces called components.

Big idea:
Websites are made of components.

For example:
• Navbar
• Button
• Card
• Profile section
• Footer

Each of these can be its own component.

────────────────────────
What You Need to Know First
────────────────────────

Component:
A reusable piece of UI.

Props:
Short for "properties".
They allow you to pass data into a component.

React uses JavaScript to describe what the UI should look like.

────────────────────────
Step 1: Create a React App (No Installation Needed)
────────────────────────

1. Go to:
   https://codesandbox.io

2. Click “Create” → Choose “React”.

3. Wait for the editor to load.

You will see:
• App.js
• index.js
• A preview window

React is already set up for you.

────────────────────────
Step 2: Create Your First Component
────────────────────────

Open App.js.

Replace everything inside with:

function Greeting(props) {
  return <h2>Hello {props.name}!</h2>;
}

export default function App() {
  return (
    <div>
      <Greeting name="Alex" />
      <Greeting name="Taylor" />
    </div>
  );
}

────────────────────────
What This Code Means
────────────────────────

function Greeting(props)
→ Creates a reusable component.

props.name
→ Accesses the value passed in.

<Greeting name="Alex" />
→ Uses the component and passes data.

React renders:
Hello Alex!
Hello Taylor!

The same component is reused with different data.

That’s powerful.

────────────────────────
Step 3: Experiment
────────────────────────

Try:

• Changing the names.
• Adding a third Greeting.
• Changing <h2> to <p>.
• Adding more text inside the component.

For example:

function Greeting(props) {
  return (
    <div>
      <h2>Hello {props.name}!</h2>
      <p>Welcome to React.</p>
    </div>
  );
}

React updates instantly.

────────────────────────
Why React Is Popular
────────────────────────

React is used by:
• Facebook
• Instagram
• Netflix
• Airbnb
• Thousands of startups

Because it:
• Encourages reusable components
• Makes large apps manageable
• Separates UI into small logical pieces

────────────────────────
Key Concepts You Just Learned
────────────────────────

• What a component is
• How to create a component
• How to reuse components
• How props pass data
• How React renders dynamic content

────────────────────────
Mental Model
────────────────────────

HTML = static pages  
JavaScript = behaviour  
React = dynamic, reusable UI components  

React builds interfaces like LEGO blocks.

────────────────────────
Outcome
────────────────────────

You understand:
• What React is
• How components work
• How props pass data
• How UI becomes reusable and dynamic

Free Tools
CodeSandbox (React template)
`
},
{
  task: "Manage state in React (Counter app)",
  duration: 2,
  explanation: `
So far, your React components displayed static data.

Now you will learn about state.

State is data that can change over time.
When state changes, React automatically updates the screen.

This is what makes React powerful.

────────────────────────
What You Need to Know First
────────────────────────

State:
• Stores changing data inside a component.
• When it changes, the UI re-renders automatically.

useState:
• A React Hook used to create state.
• It returns two things:
  1) The current value
  2) A function to update it

Example:
const [count, setCount] = useState(0);

count → current value  
setCount → function to update value  
0 → starting value  

────────────────────────
Step-by-Step
────────────────────────

1. Open your React sandbox in CodeSandbox.

2. Open App.js.

3. Replace everything with:

import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Counter App</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Add 1
      </button>
    </div>
  );
}

4. Save.

5. Click the button in the preview window.

You should see the number increase.

────────────────────────
What Just Happened
────────────────────────

1. You clicked the button.
2. onClick triggered setCount(count + 1).
3. React updated the state.
4. React re-rendered the component.
5. The new count appeared on screen.

No page refresh needed.

That is React state in action.

────────────────────────
Experiment and Learn
────────────────────────

Try:

• Changing the starting value to 10.
• Adding a second button:

<button onClick={() => setCount(count - 1)}>
  Subtract 1
</button>

• Preventing negative numbers.
• Adding a “Reset” button.

Each change strengthens your understanding.

────────────────────────
Why State Matters
────────────────────────

State is used for:
• Forms
• Login systems
• Shopping carts
• Likes and counters
• Dynamic dashboards
• API data

Without state, apps would not be interactive.

────────────────────────
Mental Model
────────────────────────

Props → data passed in  
State → data that changes internally  

When state changes → UI updates automatically  

This is the foundation of React apps.

────────────────────────
Outcome
────────────────────────

You built:
• A working interactive counter
• A component with state
• A real example of dynamic UI

You now understand how React handles changing data.

Free Tools
CodeSandbox (React template)
`
},
{
  task: "Fetch and display live data in React",
  duration: 3,
  explanation: `
So far, your React apps used hard-coded data.

Now you will fetch real data from the internet using an API.

API (Application Programming Interface):
A service that allows your app to request data from another server.

This is how real apps:
• Load users
• Show products
• Display posts
• Retrieve dashboards
• Connect to databases

────────────────────────
What You Need to Know First
────────────────────────

useEffect:
• Runs code when the component loads.
• Often used for fetching data.

fetch():
• Sends a request to a web address (URL).
• Returns data.

useState:
• Stores the fetched data.

Empty dependency array []:
• Means “run only once when the component loads”.

────────────────────────
Step 1: Open CodeSandbox
────────────────────────

Open your React project in CodeSandbox.

Open App.js.

Replace everything with:

import { useState, useEffect } from "react";

export default function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

Save the file.

────────────────────────
Step 2: Understand What Happened
────────────────────────

1. The component loads.
2. useEffect runs.
3. fetch sends a request to the API.
4. The API returns JSON data.
5. setUsers stores that data in state.
6. React re-renders the component.
7. The user names appear on screen.

You just loaded live data.

────────────────────────
What is jsonplaceholder?
────────────────────────

It is a free fake API for practice.
It simulates real backend data.

Real apps use similar APIs,
but connected to real databases.

────────────────────────
Step 3: Improve It (Optional)
────────────────────────

Try displaying more information:

<li key={u.id}>
  {u.name} – {u.email}
</li>

Or show loading state:

Add this above return:

if (users.length === 0) {
  return <p>Loading...</p>;
}

Now your app shows “Loading…” before data appears.

This is professional behaviour.

────────────────────────
Why This Matters
────────────────────────

Almost every modern frontend app:

• Fetches data from APIs
• Stores it in state
• Displays it dynamically

This is how:
• Social media feeds work
• E-commerce sites load products
• Dashboards display metrics
• Apps connect to backends

You just built a real data-driven component.

────────────────────────
Mental Model
────────────────────────

Component loads → fetch runs → state updates → UI updates

That is the core React data flow.

────────────────────────
Outcome
────────────────────────

You understand:
• How to fetch data from an API
• How useEffect works
• How to store results in state
• How to render lists dynamically

You just moved from static apps to real-world apps.

Free Tools
CodeSandbox
`
},
{
  task: "Save preferences with localStorage",
  duration: 2,
  explanation: `
So far, when you refresh your page, everything resets.

Now you will learn how to save small pieces of data
so they stay even after refreshing the browser.

This is done using localStorage.

────────────────────────
What You Need to Know First
────────────────────────

localStorage:
• A built-in browser storage system.
• Stores small amounts of data in key–value pairs.
• Data stays saved even after refresh.
• Data stays saved until manually cleared.

Example:
localStorage.setItem("theme", "dark");
localStorage.getItem("theme");

React + localStorage is very common for:
• Theme preferences
• Login tokens
• Language settings
• Saved filters

────────────────────────
Step-by-Step
────────────────────────

Open your React project in CodeSandbox.

Replace App.js with:

import { useState, useEffect } from "react";

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div style={{
      background: theme === "dark" ? "#222" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      height: "100vh",
      padding: "20px"
    }}>
      <h2>Theme Preference</h2>
      <p>Current theme: {theme}</p>

      <button onClick={() =>
        setTheme(theme === "light" ? "dark" : "light")
      }>
        Toggle Theme
      </button>
    </div>
  );
}

Save the file.

────────────────────────
What Just Happened
────────────────────────

1. When the app loads:
   It checks localStorage for a saved theme.
   If none exists → it defaults to "light".

2. When you click the button:
   setTheme updates the state.

3. useEffect runs automatically
   because theme changed.

4. localStorage.setItem saves the new value.

5. When you refresh:
   The saved theme is loaded again.

The preference persists.

────────────────────────
Test It
────────────────────────

• Click “Toggle Theme”
• Refresh the page

Notice:
The theme stays the same.

That is persistence.

────────────────────────
Optional Experiment
────────────────────────

Open browser DevTools → Application → Local Storage.

You can see:
Key: theme
Value: light or dark

You can even edit it manually and refresh.

────────────────────────
Why This Matters
────────────────────────

Real applications remember:

• Dark mode settings
• Saved carts
• Selected filters
• Language preferences

localStorage is often the first step before learning:
• Databases
• Authentication
• Backend storage

It teaches persistence thinking.

────────────────────────
Mental Model
────────────────────────

State = temporary data  
localStorage = persistent browser data  

When state changes → save to localStorage  
When app loads → read from localStorage  

────────────────────────
Outcome
────────────────────────

You can now:
• Store user preferences locally
• Persist data across refresh
• Combine React state with browser storage

Free Tools
CodeSandbox
`
},
{
  task: "Create multiple pages using React Router",
  duration: 2,
  explanation: `
So far, your React app has only had one page.

Real applications have multiple pages, such as:
• Home
• About
• Contact
• Dashboard
• Profile

React Router allows you to switch between “pages”
without reloading the browser.

This is called client-side routing.

────────────────────────
What You Need to Know First
────────────────────────

BrowserRouter
• Wraps your app and enables routing.

Route
• Defines which component shows for which URL.

Link
• Lets users navigate without refreshing the page.

Routes
• Contains all route definitions.

React apps do NOT reload the page when navigating.
They swap components instead.

────────────────────────
Step 1: Install React Router
────────────────────────

In CodeSandbox:

1. Open the “Dependencies” panel.
2. Search for:
   react-router-dom
3. Install the latest version.

(If using terminal, run: npm install react-router-dom)

────────────────────────
Step 2: Create Simple Pages
────────────────────────

Open App.js and replace everything with:

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return <h2>Home Page</h2>;
}

function About() {
  return <h2>About Page</h2>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/">Home</Link> | 
          <Link to="/about"> About</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

Save the file.

────────────────────────
Step 3: Test Navigation
────────────────────────

Click:
• Home
• About

Notice:
• The URL changes.
• The content updates.
• The page does NOT refresh.

React is swapping components dynamically.

────────────────────────
What Just Happened
────────────────────────

When you click:
<Link to="/about">

React Router:
1. Changes the URL.
2. Matches the path.
3. Renders the matching component.

No full reload.
No new HTML file.

That is single-page application behaviour.

────────────────────────
Optional Improvement
────────────────────────

Add a third page:

function Contact() {
  return <h2>Contact Page</h2>;
}

Add:

<Link to="/contact"> Contact</Link>

And:

<Route path="/contact" element={<Contact />} />

Now your app has three pages.

────────────────────────
Why This Matters
────────────────────────

Almost every modern web app uses routing:

• Dashboards
• Admin panels
• E-commerce sites
• SaaS products
• Social media apps

Routing is a core React skill.

────────────────────────
Mental Model
────────────────────────

URL changes → Router checks path → Matching component renders

You are now building real multi-page apps.

────────────────────────
Outcome
────────────────────────

You understand:
• How client-side routing works
• How to define routes
• How to navigate using Link
• How React swaps pages without reload

Free Tools
CodeSandbox
`
},
{
  task: "Handle forms and validation in React",
  duration: 2.5,
  explanation: `
Forms are one of the most important parts of web applications.

They are used for:
• Login pages
• Sign-up forms
• Contact forms
• Checkout pages
• Settings pages

Today you will learn how to:
• Capture user input
• Store it in state
• Validate it
• Show feedback

────────────────────────
What You Need to Know First
────────────────────────

Controlled input:
In React, form inputs are usually controlled by state.

That means:
• The input value comes from state
• When the user types, state updates

Validation:
Checking if user input is correct before submitting.

Example:
• Email contains "@"
• Password has minimum length
• Required fields are not empty

────────────────────────
Step-by-Step
────────────────────────

Open your React project in CodeSandbox.

Replace App.js with:

import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Please enter a valid email");
    } else {
      setError("Form submitted successfully!");
    }
  };

  return (
    <div>
      <h2>Sign Up Form</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <button type="submit">Submit</button>
      </form>

      <p>{error}</p>
    </div>
  );
}

Save the file.

────────────────────────
What Just Happened
────────────────────────

1. The input field is connected to state (email).
2. When the user types, setEmail updates the state.
3. When the form is submitted:
   • preventDefault() stops page reload.
   • We check if the email contains "@".
   • If not, we show an error message.
   • If yes, we show a success message.

React updates the screen automatically.

────────────────────────
Try This
────────────────────────

• Enter text without "@"
• Enter a valid email like test@email.com
• Observe how feedback changes

────────────────────────
Optional Improvements
────────────────────────

Try adding:

• A required password field
• A minimum length check
• Real-time validation inside onChange
• Styling error messages in red

Example:

<p style={{ color: "red" }}>{error}</p>

────────────────────────
Why This Matters
────────────────────────

Every real application needs forms.

Learning this prepares you for:
• Authentication systems
• User registration
• Checkout processes
• Data collection

Form handling + validation is a core frontend skill.

────────────────────────
Mental Model
────────────────────────

Input → state → validation → feedback → UI update

React makes this cycle predictable and structured.

────────────────────────
Outcome
────────────────────────

You can:
• Capture user input
• Prevent default form submission
• Validate data
• Show real-time feedback
• Build functional forms

Free Tools
CodeSandbox
`
},
{
  task: "Optimise performance with React.memo",
  duration: 1.5,
  explanation: `
As React apps grow, performance becomes important.

Sometimes components re-render even when nothing inside them changed.

Re-rendering is not always bad,
but unnecessary re-renders can:
• Slow down large apps
• Cause lag
• Reduce responsiveness

React.memo helps prevent unnecessary re-renders.

────────────────────────
What You Need to Know First
────────────────────────

Re-render:
When React updates a component and redraws it.

By default:
If a parent component re-renders,
all child components also re-render.

React.memo:
• Wraps a component.
• Prevents it from re-rendering
  unless its props change.

It works by comparing old props vs new props.

If nothing changed → no re-render.

────────────────────────
Step-by-Step Example
────────────────────────

Open your React project in CodeSandbox.

Replace App.js with:

import { useState } from "react";
import React from "react";

const List = React.memo(({ items }) => {
  console.log("List rendered");
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
});

export default function App() {
  const [count, setCount] = useState(0);

  const items = ["React", "JavaScript", "CSS"];

  return (
    <div>
      <h2>Performance Demo</h2>

      <button onClick={() => setCount(count + 1)}>
        Increment Counter ({count})
      </button>

      <List items={items} />
    </div>
  );
}

────────────────────────
Step 2: Observe the Console
────────────────────────

1. Open your browser DevTools.
2. Go to the Console tab.
3. Click the "Increment Counter" button.

Notice:
“List rendered” does NOT appear repeatedly.

Why?

Because:
The items array didn’t change.
React.memo prevented re-rendering.

────────────────────────
Try Without React.memo
────────────────────────

Remove React.memo:

Change:

const List = React.memo(({ items }) => {

to:

const List = ({ items }) => {

Now click the button again.

You’ll see:
“List rendered” logs every time.

That is unnecessary re-rendering.

────────────────────────
When Should You Use React.memo?
────────────────────────

Use it when:
• A component renders large lists
• A component is expensive to render
• Props rarely change
• You notice performance lag

Do NOT overuse it.
Premature optimisation can add complexity.

────────────────────────
How to Measure Performance
────────────────────────

In Chrome DevTools:
1. Open the "Performance" tab.
2. Record interactions.
3. Look at rendering activity.

For small apps, you won’t see big differences.
In large apps, it matters a lot.

────────────────────────
Why This Matters
────────────────────────

In real applications:
• Dashboards update frequently
• Lists can contain hundreds of items
• Performance affects user experience

Understanding rendering behaviour makes you a more advanced React developer.

────────────────────────
Mental Model
────────────────────────

Parent re-renders
→ Child normally re-renders
→ React.memo stops re-render
   if props did not change

Optimisation = render only when necessary.

────────────────────────
Outcome
────────────────────────

You understand:
• What re-rendering is
• How React.memo works
• When to optimise
• How to inspect rendering behaviour

Free Tools
CodeSandbox, Chrome DevTools
`
},
{
  task: "Create a simple portfolio page",
  duration: 3,
  explanation: `
This is your first “real” public-facing project.

A portfolio page shows:
• Who you are
• What you can build
• How to contact you

Even a simple one is powerful.

You can use:
• HTML/CSS/JS (simpler)
OR
• React (if you feel comfortable)

The goal is clarity, not complexity.

────────────────────────
What You Need to Know First
────────────────────────

Recruiters scan quickly.

Your portfolio should be:
• Clean
• Simple
• Easy to read
• Focused on projects

Do NOT overcomplicate it.

────────────────────────
Step 1: Plan Your Structure
────────────────────────

Your page should include 3 main sections:

1. About Me
   • 2–4 sentences about you
   • What you’re learning
   • What type of role you want

2. Projects
   • 2–4 small projects
   • Title
   • 1–2 sentence description
   • Technologies used
   • Link to GitHub or live demo

3. Contact
   • Email
   • GitHub link
   • LinkedIn link

Write this structure first before coding.

────────────────────────
Step 2: Basic HTML Structure (if using HTML)
────────────────────────

Create index.html:

<html>
  <head>
    <title>My Portfolio</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <section>
      <h1>Your Name</h1>
      <p>Aspiring Frontend Developer</p>
    </section>

    <section>
      <h2>Projects</h2>
      <div>
        <h3>Project 1</h3>
        <p>Short description.</p>
      </div>
    </section>

    <section>
      <h2>Contact</h2>
      <p>Email: your@email.com</p>
    </section>

  </body>
</html>

────────────────────────
Step 3: Style It (CSS)
────────────────────────

In styles.css:

body {
  font-family: Arial, sans-serif;
  margin: 40px;
  line-height: 1.6;
}

section {
  margin-bottom: 40px;
}

h1 {
  color: #2c3e50;
}

Keep spacing generous.
Avoid too many colours.
Use 1–2 accent colours maximum.

────────────────────────
Step 4: Improve Visual Hierarchy
────────────────────────

Add:
• Clear headings
• White space
• Slight contrast backgrounds
• Button-style links

Example:

a {
  display: inline-block;
  padding: 8px 12px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

────────────────────────
Step 5: Add Real Links
────────────────────────

Add:

<a href="https://github.com/yourname" target="_blank">
  View GitHub
</a>

Make sure links open in a new tab.

────────────────────────
Step 6: Publish Online
────────────────────────

Option 1: Replit
• Upload files
• Click Deploy / Share
• Copy public link

Option 2: Netlify
• Go to netlify.com
• Drag your project folder into the deploy box
• Get instant public link

Test the live link in a private browser window.

────────────────────────
Optional Upgrades (If Time Allows)
────────────────────────

• Add smooth scrolling
• Add hover effects
• Add a simple contact form
• Add a small project screenshot
• Add responsive layout (Flexbox)

────────────────────────
What Recruiters Look For
────────────────────────

They care about:
• Can you build something clean?
• Do you understand structure?
• Can you explain your projects?
• Is it readable?

They do NOT expect:
• Complex animations
• Fancy frameworks
• Perfect design

Clarity > complexity.

────────────────────────
Why This Matters
────────────────────────

This is your first public proof.

You now have:
• A shareable link
• Something to put on LinkedIn
• Something to attach in applications
• A foundation to improve over time

Small projects compound.

────────────────────────
Outcome
────────────────────────

You now have:
• A structured personal webpage
• A live public link
• A portfolio starting point
• Increased confidence applying for roles

Free Tools
Replit, Netlify (free hosting)
`
},


{
  task: "Add accessibility checks",
  duration: 1.5,
  explanation: `
Accessibility means making your website usable for everyone, including people who use screen readers, have low vision, limited mobility, or other disabilities.

Professional developers always consider accessibility.

It improves:
• Inclusivity
• Legal compliance
• SEO (search engines)
• Overall usability

────────────────────────
What You Need to Know First
────────────────────────

Common accessibility issues:
• Images without alt text
• Poor colour contrast
• Buttons without clear labels
• Missing form labels
• Small clickable areas
• Heading structure in the wrong order

Accessibility is not “extra”.
It is part of good development practice.

────────────────────────
Step 1: Run an Accessibility Scan
────────────────────────

1. Publish your site (Replit or Netlify).
2. Go to:
   https://wave.webaim.org
3. Paste your live website link.
4. Click “Evaluate”.

You will see:
• Errors (red icons)
• Alerts (yellow icons)
• Structural elements

Click each issue to see what it means.

────────────────────────
Step 2: Fix Common Issues
────────────────────────

Fix at least 3 problems.

Examples:

1) Missing alt text

If you have:
<img src="profile.jpg">

Change to:
<img src="profile.jpg" alt="Portrait of Your Name">

Alt text describes the image for screen readers.

2) Poor contrast

If text is hard to read (light grey on white),
change the colour in CSS to increase contrast.

Example:
color: #222;

3) Missing form labels

Instead of:
<input type="text" placeholder="Email">

Use:
<label for="email">Email</label>
<input id="email" type="text">

Screen readers rely on labels.

4) Heading structure

Use headings in order:
<h1> → <h2> → <h3>

Do not jump from h1 to h4 randomly.

────────────────────────
Step 3: Manual Accessibility Checks
────────────────────────

Try:

• Navigate using only your keyboard (Tab key).
• Zoom browser to 200%. Is it still readable?
• Turn on high contrast mode.
• Resize to mobile view.

If something breaks, improve spacing or layout.

────────────────────────
Optional: Chrome Lighthouse Check
────────────────────────

1. Right-click → Inspect.
2. Go to “Lighthouse” tab.
3. Run an audit.
4. Check Accessibility score.

Aim for 90+.

────────────────────────
Why This Matters
────────────────────────

In real companies:
• Accessibility is part of frontend standards.
• Many regions have legal requirements.
• Inclusive design improves brand reputation.

Recruiters notice developers who think about users.

────────────────────────
Professional Mindset
────────────────────────

Good code works.
Great code works for everyone.

Accessibility = empathy + engineering.

────────────────────────
Outcome
────────────────────────

You now:
• Understand basic accessibility principles
• Fixed real usability issues
• Improved professionalism of your portfolio
• Learned how to use auditing tools

Free Tools
WAVE Accessibility Checker, Chrome Lighthouse
`
},

{
  task: "Deploy final version and update README",
  duration: 2,
  explanation: `
This step turns your project from “practice” into “portfolio-ready”.

Deploying means:
Your project is live on the internet.
Anyone with the link can view it.

Updating your README means:
You can clearly explain what you built and why.

This is what makes projects job-ready.

────────────────────────
Step 1: Clean Up Before Deploying
────────────────────────

Before publishing:

• Remove console.log test messages.
• Fix obvious spelling mistakes.
• Check mobile responsiveness.
• Test all links and buttons.
• Run an accessibility check.
• Make sure your page loads without errors.

Think:
Would I show this to a hiring manager?

────────────────────────
Step 2: Deploy Your Site
────────────────────────

Choose one:

Option 1: Netlify
1. Go to netlify.com
2. Sign in (GitHub recommended)
3. Drag and drop your project folder
4. Netlify generates a live link

Option 2: Vercel
1. Go to vercel.com
2. Import project from GitHub
3. Click Deploy
4. Get your live URL

Option 3: Replit
1. Open your project
2. Click Deploy or Share
3. Copy public link

Open your link in:
• A private/incognito window
• Your phone

Make sure it works everywhere.

────────────────────────
Step 3: Take Screenshots
────────────────────────

Take 2–3 screenshots:

• Homepage (hero section)
• Projects section
• Mobile view

On Windows:
Use Snipping Tool.

On Mac:
Cmd + Shift + 4.

Save them as:
• screenshot-home.png
• screenshot-mobile.png

These will go in your README.

────────────────────────
Step 4: Update Your README
────────────────────────

If using GitHub:
Open README.md in your repository.

If not:
Create a Google Doc called:
“Portfolio Project – Documentation”

Include:

1) Project Title

2) Purpose
Example:
"This is a personal portfolio website built to showcase my frontend development skills."

3) Technologies Used
• HTML
• CSS
• JavaScript (or React)
• Netlify (deployment)

4) Features
• Responsive layout
• Navigation menu
• Contact section
• Accessibility improvements

5) Live Link
Paste your deployed URL.

6) Screenshots
Upload the images.

7) What I Learned
Write 3–5 bullet points:
• How HTML, CSS, JS work together
• How to deploy a site
• How to fix accessibility issues
• How to structure a project

────────────────────────
Optional: Improve Professionalism
────────────────────────

Add:
• Clean commit history
• Proper file structure
• Clear project naming
• A short project description at the top

Example:

# Personal Portfolio Website

Simple responsive portfolio built with HTML, CSS, and JavaScript.

Live demo: https://your-link.netlify.app

────────────────────────
Why This Matters
────────────────────────

Many beginners build projects.
Few document them properly.

A strong README shows:
• Communication skills
• Professional mindset
• Ownership
• Clarity of thinking

Recruiters often read READMEs before code.

────────────────────────
Mental Model
────────────────────────

Build → Test → Polish → Deploy → Document

Documentation turns code into proof.

────────────────────────
Outcome
────────────────────────

You now have:
• A live deployed website
• A documented project
• Screenshots for applications
• A portfolio-ready frontend project
• Something to confidently share on LinkedIn

Free Tools
Netlify, Vercel, Replit, GitHub
`
}
],


// ——— AI FOUNDATIONS ———
ai_foundations: [

  {
    task: "Set up your AI development environment",
    duration: 1.5,
    id: "tech_switch.ai_foundations.env_setup",
    meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "working_env" },
    explanation: `
This environment will be your base for all AI work.
Python should already be installed from cs_basics. This task focuses on creating a clean AI workspace.

────────────────────────
Step 1: Create your AI workspace folder
────────────────────────
1. Create a folder called: ai-learning
2. Open this folder in VS Code (or your preferred editor).

Outcome
A dedicated workspace that keeps AI work separate and organised.

────────────────────────
Step 2: Create and activate a virtual environment
────────────────────────
────────────────────────
Step 2: Create and activate a virtual environment
────────────────────────

A virtual environment is a separate Python workspace for this project.

It prevents libraries from different projects interfering with each other.
Every serious Python project uses one.

You will create one inside your ai-learning folder.

────────────────────────
Step 2.1: Open the terminal inside your project
────────────────────────

1. Open the ai-learning folder in VS Code.
2. In the top menu click:

   Terminal → New Terminal

A terminal panel should appear at the bottom of the screen.

It should show that your current folder is:

ai-learning

If you are not inside that folder, navigate there first.

Example command:

cd ai-learning


────────────────────────
Step 2.2: Create the virtual environment
────────────────────────

Type this command and press Enter:

python -m venv venv

What this command means:

• python → run Python  
• -m venv → use Python's built-in environment tool  
• venv → create a folder called "venv"

After running the command, a new folder called **venv** will appear inside your project.

Your folder should now look like this:

ai-learning  
│  
├── venv  
└── (other project files later)

This folder contains an isolated Python environment.

Do not edit files inside the venv folder.


────────────────────────
Step 2.3: Activate the virtual environment
────────────────────────

Now you need to activate the environment.

Activation tells your computer to use the Python inside this project instead of the global Python installation.

Run the command depending on your system.

Mac or Linux:

source venv/bin/activate

Windows:

venv\\Scripts\\activate


────────────────────────
Step 2.4: Confirm activation
────────────────────────

After activation, the terminal line should change.

You should now see:

(venv)

at the beginning of the terminal line.

Example:

(venv) Sara-MacBook:ai-learning sara$

or

(venv) C:\\Users\\Sara\\ai-learning>

This means the environment is active.


────────────────────────
Step 2.5: Important rule
────────────────────────

Every time you work on this project:

1. Open the ai-learning folder
2. Open a terminal
3. Activate the environment again

Mac/Linux:
source venv/bin/activate

Windows:
venv\\Scripts\\activate


────────────────────────
Outcome
────────────────────────

You now have a **project-specific Python environment**.

This ensures:

• libraries installed for this project do not affect other projects  
• different projects can use different library versions  
• your setup remains clean and reproducible

────────────────────────
Step 3: Install core AI libraries
────────────────────────
Install:
• pandas (data handling)
• numpy (numerical operations)
• matplotlib (basic visualisation)
• scikit-learn (machine learning models)
• jupyter notebook

Type:
pip install numpy pandas matplotlib scikit-learn notebook

All installations should be done inside your activated virtual environment.
Make sure you see (venv) in your terminal before continuing.

Outcome
Core libraries installed for data handling, visualisation, and modelling.

────────────────────────
Step 4: Test the setup in a notebook
────────────────────────
1. Run:
   jupyter notebook

2. Create a new notebook.
3. Run this cell:

   import numpy as np
   import pandas as pd
   print("AI environment ready")

If it runs without errors, the setup is correct.

Outcome
A working environment you can reuse across all AI projects.

Free Tools
Python, VS Code, Jupyter
`
  },

  {
    task: "Explore a real dataset with pandas",
    duration: 1.5,
    id: "tech_switch.ai_foundations.data_explore",
    meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "notebook" },
    explanation: `
Machine learning is data-first. Before models, you must understand what data looks like.

────────────────────────
Step 1: Load a beginner dataset
────────────────────────

For this exercise you will use the **Titanic dataset**, which is one of the most common beginner machine learning datasets.

It contains information about passengers on the Titanic and whether they survived.

The goal of many ML exercises with this dataset is to predict survival.

You will load the dataset directly from the internet so you do not need to download anything manually.

1. Open a new Jupyter notebook.

2. Save it as:

01_data_explore.ipynb

3. In the first cell, type the following code:

import pandas as pd

url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"

df = pd.read_csv(url)

df.head()

4. Run the cell.

You should now see the first 5 rows of the dataset.

Outcome  
You have successfully loaded a real dataset into Python.

────────────────────────
Step 2: Inspect the dataset structure
────────────────────────

Now you will explore what the dataset looks like.

Create a new cell and run:

df.info()

This shows:
• number of rows
• column names
• data types
• missing values

Next run:

df.describe()

This shows summary statistics for numeric columns such as:
• mean
• minimum
• maximum
• standard deviation

Finally run:

df.describe(include="all")

This shows summary information for **all columns**, including text columns.

Outcome  
You understand the structure of the dataset and how to inspect data using pandas.

────────────────────────
Step 3: Answer these questions in notes
────────────────────────
• What is the label (the thing you want to predict)?
• Which columns look useful as features?
• Which columns have missing values?
• What does a “row” represent?

Outcome
You can read a dataset confidently instead of guessing.

Free Tools
Jupyter, pandas
`
  },

  {
    task: "Understand what machine learning actually is",
    duration: 1.5,
    id: "tech_switch.ai_foundations.ml_concepts",
    meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "notes" },
    explanation: `
Before building models, you need conceptual clarity.

Machine learning is not magic.
It is pattern recognition from data.

────────────────────────
────────────────────────
Step 1: Understand key components
────────────────────────

Machine learning works with **datasets**.

A dataset is simply a table of information.

Each row represents **one observation** (for example one house, one person, or one transaction).

Each column represents **a property or measurement**.

Example dataset:

| house_size | rooms | distance_to_city | price |
|-------------|------|------------------|-------|
| 1200        | 3    | 10 km            | 350000 |
| 900         | 2    | 5 km             | 280000 |
| 2000        | 4    | 15 km            | 520000 |

In machine learning we split the columns into two groups:

Features (inputs)  
These are the variables we use to make a prediction.

Examples:
• house size  
• number of rooms  
• distance to city  

Label (output)  
This is the value we want to predict.

Example:
• house price

So the model receives the **features** and tries to estimate the **label**.

You can think of it like this:

features → model → predicted label

Example:

house size + rooms + distance → model → predicted price


────────────────────────
Step 2: Understand training vs prediction
────────────────────────

Machine learning has two main phases.

Training phase  
This is when the model **learns patterns from historical data**.

Example:

You show the model thousands of houses where you already know the price.

The model starts identifying relationships like:

• larger houses usually cost more  
• houses closer to the city cost more  
• more rooms often increase value

The model adjusts its internal parameters until it can estimate prices reasonably well.

Prediction phase  
After training, the model can make predictions on **new data it has never seen before**.

Example:

You give the model a new house:

• size = 1400  
• rooms = 3  
• distance = 8 km  

The model predicts:

price = £395,000

This process is called **inference or prediction**.

Important idea:

Training = learning patterns  
Prediction = applying those patterns to new data


────────────────────────
Step 3: Understand major categories
────────────────────────

Machine learning problems are usually divided into two major categories.

Supervised learning

In supervised learning, the dataset **contains labels**.

The model learns by comparing its predictions to the known correct answers.

Example tasks:

Predict house prices  
Predict whether an email is spam  
Predict if a customer will churn

Example dataset:

| age | income | churn |
|-----|-------|-------|
| 35  | 60000 | yes |
| 28  | 45000 | no |
| 50  | 90000 | no |

Here the label is **churn**.


Unsupervised learning

In unsupervised learning, the dataset **does not contain labels**.

The model tries to find patterns or structure in the data.

Example tasks:

• Group similar customers together  
• Detect unusual behaviour  
• Reduce complex datasets into simpler representations

Example dataset:

| age | income |
|-----|-------|
| 35  | 60000 |
| 28  | 45000 |
| 50  | 90000 |

The model might discover clusters such as:

• high income customers  
• young customers  
• budget customers

There is **no correct answer column**, the model discovers patterns itself.


────────────────────────
Important takeaway
────────────────────────

Machine learning is not magic.

It is simply:

1. Data
2. Patterns
3. Predictions

You give the model examples, and it learns relationships that allow it to make predictions about new data.
────────────────────────
Step 4: Write a short summary
────────────────────────
In your notes, answer:
• What is a feature?
• What is a label?
• What does training mean?
• What does prediction mean?

Outcome
Clear conceptual understanding of machine learning fundamentals.

Free Tools
Notebook, Notes app
`
  },


{
  task: "Understand the most common machine learning model types",
  duration: 1.5,
  id: "tech_switch.ai_foundations.ml_model_types",
  meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "notes" },
  explanation: `
Before training your first model, it is important to understand the major categories of machine learning models and what problems they solve.

Machine learning models are tools that learn patterns from data in order to make predictions or discover structure.

────────────────────────
Step 1: Understand the four main categories of ML
────────────────────────

Most machine learning models fall into four major categories.

1️⃣ Classification  
2️⃣ Regression  
3️⃣ Clustering  
4️⃣ Generation (Generative AI)

These categories describe the **type of problem you are solving**, not the specific algorithm.

────────────────────────
1️⃣ Classification
────────────────────────

Classification models predict **categories** (labels).

The output is **one of several possible classes**.

Examples
• Predict if an email is spam or not spam  
• Predict whether a customer will churn  
• Predict whether a patient has a disease  
• Predict whether a passenger survived the Titanic disaster  

Example output

Survived = Yes / No

Common classification models

Logistic Regression  
Despite the name, it is actually a classification algorithm.  
It estimates the probability that something belongs to a class.

Decision Trees  
These models split data using simple rules (like a flowchart).

Example  
IF age > 30 → go left  
IF age < 30 → go right

Random Forest  
A collection of many decision trees combined together.  
This often performs better than a single tree.

Key idea  
Classification predicts **discrete categories**.

────────────────────────
2️⃣ Regression
────────────────────────

Regression models predict **continuous numeric values**.

Instead of predicting a category, they predict a **number**.

Examples
• Predict house prices  
• Predict revenue next month  
• Predict delivery time  
• Predict energy consumption  

Example output

House price = £350,000

Common regression models

Linear Regression  
The simplest regression model.

It tries to draw a straight line that best fits the data.

Example relationship

House price =  
(size × coefficient) + constant

Ridge Regression / Lasso Regression  
These are variations of linear regression that prevent the model from becoming overly complex.

Decision Tree Regressor  
Similar to decision trees used for classification, but predicts numeric values instead.

Key idea  
Regression predicts **numbers**, not categories.

────────────────────────
3️⃣ Clustering
────────────────────────

Clustering models **group similar data points together**.

There are **no labels provided** in the dataset.

The model discovers structure automatically.

Example use cases

• Customer segmentation  
• Grouping similar products  
• Detecting unusual behaviour  
• Market segmentation  

Example result

Group 1 → price-sensitive customers  
Group 2 → premium buyers  
Group 3 → occasional buyers

Common clustering models

K-Means Clustering  
The most common clustering algorithm.

It groups data points into **K clusters** based on similarity.

Hierarchical Clustering  
Builds clusters step-by-step in a tree-like structure.

DBSCAN  
Groups dense clusters and detects outliers.

Key idea  
Clustering finds **hidden patterns in unlabeled data**.

────────────────────────
4️⃣ Generation (Generative AI)
────────────────────────

Generative models **create new content** based on patterns they learned from existing data.

Instead of predicting a label or number, these models **generate new outputs** such as text, images, audio, or code.

Examples

• Chatbots generating text responses  
• AI generating images from text prompts  
• Music generation  
• Code generation  
• Writing assistants

Example output

Input prompt:
"Write a short poem about the ocean"

Output:
A newly generated poem.

Common generative model types

Large Language Models (LLMs)  
These models generate text.  
Examples include GPT-style models.

Generative Adversarial Networks (GANs)  
These models generate realistic images by training two neural networks against each other.

Diffusion Models  
Modern image generators that gradually transform noise into images.

Transformers  
A neural network architecture used in many modern generative models.

Key idea  
Generative models **create new data instead of predicting existing labels**.

────────────────────────
Step 2: Understand the difference between models
────────────────────────

Different models solve the **same problem type** but in different ways.

Example: classification

Logistic Regression  
• simple  
• fast  
• easy to interpret

Random Forest  
• more complex  
• often more accurate  
• harder to interpret

Choosing models is a trade-off between

• simplicity
• accuracy
• interpretability
• training speed

For beginners, simple models are best.

────────────────────────
Step 3: Know what you will use first
────────────────────────

For your first ML project you will use:

Classification  
LogisticRegression

or

Regression  
LinearRegression

These are widely used baseline models and perfect for learning.

────────────────────────
Step 4: Write short notes in your Learning Hub
────────────────────────

Create a page called:

"Machine Learning Model Types"

Write 5–6 bullet notes:

• What is classification?  
• What is regression?  
• What is clustering?  
• What is generative AI?  
• Which model type predicts numbers?  
• Which model type creates new content?

Outcome
You understand the most common machine learning model categories and the types of problems they solve.

Free Tools
Jupyter Notebook, scikit-learn documentation
`
},


  {
  task: "Train your first simple ML model (end-to-end)",
  duration: 2.0,
  id: "tech_switch.ai_foundations.first_model",
  meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "notebook" },
  explanation: `
This is the moment machine learning becomes real.

You will train a simple model that predicts whether a Titanic passenger survived.

You will go through the full ML workflow:
data → features → model → predictions → evaluation.

Do not worry about perfection.
The goal is simply to understand how the pieces fit together.

────────────────────────
Important concepts before starting
────────────────────────

Model  
A model is a mathematical formula that learns patterns from data and makes predictions.

Feature  
A feature is an input variable used to make predictions.

Example features:
• passenger age
• passenger class
• ticket fare

Label (target variable)  
The label is the value we want to predict.

For the Titanic dataset:

label = Survived

0 = passenger died  
1 = passenger survived


Training data  
Training data is the portion of the dataset used to teach the model patterns.

Test data  
Test data is used to evaluate the model after training.

This simulates predicting on **new unseen data**.

Baseline model  
A baseline model is a simple starting model.
It may not be perfect, but it gives you a reference point.

In this exercise you will use **Logistic Regression**, a common beginner classification model.


────────────────────────
Step 1: Create your notebook
────────────────────────

Open a new Jupyter notebook and save it as:

02_first_model.ipynb


────────────────────────
Step 2: Import the libraries
────────────────────────

Libraries are packages that provide tools for working with data and machine learning.

Run the following code:

import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score


Explanation of these tools:

pandas  
Used for working with datasets.

train_test_split  
Splits your dataset into training data and testing data.

LogisticRegression  
A simple model used for **classification problems**.

accuracy_score  
Measures how many predictions the model got correct.


────────────────────────
Step 3: Load the Titanic dataset
────────────────────────

Load the same dataset used in the previous task.

Run:

url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"

df = pd.read_csv(url)

df.head()


────────────────────────
Step 4: Select features and label
────────────────────────

We will use a small number of simple features.

Run:

features = ["Pclass", "Age", "Fare"]

X = df[features]

y = df["Survived"]


Explanation:

X  
This contains the feature columns (inputs).

y  
This contains the label column (what we want to predict).


────────────────────────
Step 5: Handle missing values
────────────────────────

Real datasets often contain missing values.

Missing values can break machine learning models.

We will fill missing Age values with the average age.

Run:

X["Age"] = X["Age"].fillna(X["Age"].mean())


Explanation:

fillna()  
Replaces missing values.

mean()  
Calculates the average value of a column.


────────────────────────
Step 6: Split the dataset
────────────────────────

We now divide the data into training data and testing data.

Run:

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


Explanation:

test_size=0.2  
20% of the data is used for testing.

80% is used for training.

random_state  
Ensures results are reproducible.


────────────────────────
Step 7: Train the model
────────────────────────

Now we train the model on the training data.

Run:

model = LogisticRegression()

model.fit(X_train, y_train)


Explanation:

fit()  
This is where learning happens.

The model analyses the relationship between features and the label.


────────────────────────
Step 8: Make predictions
────────────────────────

Now we ask the model to predict survival for the test data.

Run:

predictions = model.predict(X_test)

predictions[:10]


Explanation:

predict()  
Uses the trained model to generate predictions.


────────────────────────
Step 9: Evaluate the model
────────────────────────

We now check how accurate the predictions were.

Run:

accuracy = accuracy_score(y_test, predictions)

print("Model accuracy:", accuracy)


Explanation:

Accuracy  
The percentage of predictions that were correct.

Example:

accuracy = 0.78

This means the model predicted correctly **78% of the time**.


────────────────────────
Step 10: Understand the result
────────────────────────

Accuracy tells us how well the model performed.

However, it is not perfect because:

• the dataset is small  
• the model is simple  
• we used only three features

In real projects you would improve the model by:

• adding more features
• cleaning the data
• trying different models


────────────────────────
Step 11: Reflection (important)
────────────────────────

At the bottom of your notebook, write answers to these questions.

• What features did you use and why?  
• What accuracy score did you get?  
• What might improve the model?  
• What data issue did you notice?  
• What would good performance mean for a real business?


────────────────────────
Outcome
────────────────────────

You have trained your **first real machine learning model**.

More importantly, you now understand the core ML pipeline:

dataset → features → model → predictions → evaluation

This is the foundation of nearly every machine learning system.

Free Tools
pandas, scikit-learn, Jupyter
`
},

  {
    task: "Explore real-world AI use cases",
    duration: 1,
    id: "tech_switch.ai_foundations.use_cases",
    meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "notes" },
    explanation: `
AI is valuable because it solves business problems.
Understanding use cases improves interviews and project direction.

────────────────────────
Step 1: Research five examples
────────────────────────
Find five examples of AI used in companies.
Examples may include:
• Fraud detection
• Recommendation systems
• Demand forecasting
• Chatbots
• Medical image analysis

────────────────────────
Step 2: Categorise each example
────────────────────────
For each example, identify:
• What is the input?
• What is the output?
• Is it prediction, classification, clustering, or generation?

────────────────────────
Step 3: Write short summaries
────────────────────────
Write 3–4 lines per use case explaining:
• The problem
• The data used
• The outcome

Outcome
Ability to speak clearly about AI in practical, business-relevant terms.

Free Tools
Google, company blogs
`
  },

{
  task: "Evaluate five AI outputs critically",
  duration: 1,
  id: "tech_switch.ai_foundations.eval_outputs",
  meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "notes" },
  explanation: `
Being able to **judge the quality of AI outputs** is one of the most important skills when working with AI.

AI tools can produce useful answers, but they can also produce:
• incorrect information
• weak reasoning
• incomplete answers

In this task you will practise **evaluating AI responses instead of blindly trusting them**.

────────────────────────
Step 1: Open an AI tool
────────────────────────

Use one of the following tools:

• ChatGPT  
• Claude  
• Gemini  

Any conversational AI assistant will work.

Open a new chat.

────────────────────────
Step 2: Generate five different outputs
────────────────────────

Copy and paste the following prompts one by one and record the responses.

Prompt 1 – Summary
"Explain what machine learning is in 5 sentences."

Prompt 2 – Coding
"Write a Python function that returns the largest number in a list."

Prompt 3 – Business idea
"Give me a simple startup idea using artificial intelligence."

Prompt 4 – Data explanation
"Explain what a dataset is and why it matters in machine learning."

Prompt 5 – Writing
"Write a short paragraph describing how AI might change education."

Save the five outputs in a notebook or document.

────────────────────────
Step 3: Evaluate each output
────────────────────────

For each response, ask yourself the following questions.

Accuracy  
Is the information correct?

Clarity  
Is the explanation easy to understand?

Logical consistency  
Does the answer make sense from start to finish?

Completeness  
Is anything important missing?

Possible hallucinations  
Did the AI invent information or make unsupported claims?

Write **1–2 short notes for each output** describing what is good and what could be improved.

────────────────────────
Step 4: Improve one output
────────────────────────

Pick the weakest output and improve it.

You can do this in two ways:

Option 1: Rewrite it yourself  
Rewrite the answer so that it becomes clearer, more accurate, or better structured.

Option 2: Improve the prompt  
Ask the AI again but give a more specific prompt.

Example:
Instead of  
"Explain machine learning"

Try  
"Explain machine learning to a beginner using simple language and one example."

Compare the new response to the old one.

────────────────────────
Step 5: Write short notes in your Learning Hub
────────────────────────

Create a page called:

"Evaluating AI Outputs"

Write 4–5 bullet notes answering:

• What mistakes did the AI make?  
• What made a response good or bad?  
• Did better prompts improve the answer?  
• Why should AI outputs always be checked?

Outcome
You understand that AI outputs must be evaluated critically, not accepted blindly.

Free Tools
ChatGPT, Claude, Gemini
`
},
],



  // ——— 2) ML & MODELING ———
  ml_models: [

    {
  task: "Complete your first end-to-end machine learning project",
  duration: 4,
  id: "tech_switch.ai_foundations.first_project",
  meta: { roadmap: "tech_switch", theme: "ai_foundations", track: "ai", level: "beginner", deliverable: "project" },
  explanation: `
This task turns everything you have learned so far into a single, complete project.

Instead of following a tutorial, you will independently apply the workflow of a real machine learning project:
loading data, preparing it, training a model, and explaining the results.

The goal is not perfection.  
The goal is completing the full process once.

────────────────────────
Step 1: Choose a small dataset
────────────────────────

Select a simple dataset from a public source.

Good places to look:
• Kaggle datasets  
• Google Dataset Search  
• Open government data portals  

Choose a dataset that:
• has fewer than ~20 columns
• fits comfortably in a CSV file
• contains a clear target variable you want to predict

Examples of project ideas:
• Predict house prices
• Predict customer churn
• Predict product ratings
• Predict whether a loan is approved

Outcome
A dataset that will serve as the foundation for your project.

────────────────────────
Step 2: Create your project notebook
────────────────────────

Create a new notebook called:

ml_project.ipynb

Structure the notebook into clear sections:

1. Data loading  
2. Data exploration  
3. Data preparation  
4. Model training  
5. Model evaluation  
6. Project summary

Clear structure makes your work understandable to others.

Outcome
A well-organised notebook ready for your analysis.

────────────────────────
Step 3: Prepare the dataset
────────────────────────

Load the dataset using pandas and examine it.

Your goal in this step is to understand the structure of the data.

Actions to perform:
• inspect the first rows of the dataset
• review column names and data types
• identify missing values
• select the features you want to use
• define the target variable

If missing values exist, apply a simple strategy such as:
• removing rows with missing data
• replacing missing values with the column average or most common value

Outcome
A clean dataset ready for modelling.

────────────────────────
Step 4: Train a baseline model
────────────────────────

Using the modelling approach introduced earlier, train a simple baseline model.

Steps to perform:

1. Split the dataset into:
   • training data
   • testing data

2. Choose a simple model depending on the type of problem:
   • classification model if predicting categories
   • regression model if predicting numbers

3. Train the model on the training data.

4. Generate predictions using the test data.

This first model does not need to be perfect.  
It serves as a baseline; a starting point for improvement.

Outcome
A working machine learning model producing predictions.

────────────────────────
Step 5: Evaluate the model
────────────────────────

Measure how well the model performs using an evaluation metric appropriate for the task.

Examples include:
• accuracy for classification problems
• mean absolute error (MAE) for regression problems

Compare the predicted values with the real values and observe:

• how accurate the predictions are
• where the model makes mistakes
• whether certain patterns appear in the errors

Outcome
A quantitative measure of model performance.

────────────────────────
Step 6: Write a short project explanation
────────────────────────

At the end of the notebook, write a short explanation summarising the project.

Answer the following questions:

• What problem does this model attempt to solve?
• Which features were most useful?
• What challenges did you encounter in the dataset?
• What would you try next to improve the model?

This step is important because real machine learning work always involves communicating results.

Outcome
A clear explanation of your project and your thinking.

────────────────────────
Step 7: Create a simple project README
────────────────────────

Create a file called:

README.md

Include:

• Project title  
• Short description of the problem  
• Dataset source  
• Technologies used (Python, pandas, scikit-learn, Jupyter)  
• Link or screenshots of your notebook  

Outcome
A documented project that can be added to a portfolio or GitHub repository.

────────────────────────
Final outcome
────────────────────────

You now have your **first independent machine learning project**.

More importantly, you have practised the **full workflow** used in real machine learning projects:

dataset → preparation → modelling → evaluation → communication
`
},
{
  task: "Understand core ML concepts",
  duration: 2,
  id: "tech_switch.ml_models.core_concepts",
  meta: { roadmap: "tech_switch", theme: "ml_models", track: "ai", level: "beginner", deliverable: "notes" },
  explanation: `
Conceptual clarity improves interviews and decision-making.

You already know the basic workflow (split data → train → predict → evaluate).
Now you’ll go one level deeper on the ideas that explain *why results look the way they do*.

Create a page in your Learning Hub called:
“Core ML concepts - deeper understanding”

────────────────────────
Step 1: Train/test splits — what can go wrong
────────────────────────

You’ve seen train/test splits. Now learn the common mistakes people make.

1) Learn about “data leakage”
Data leakage is when information from the test set sneaks into training, making results look better than they truly are.

Beginner examples:
• You clean/impute/scale using the full dataset before splitting.
• You accidentally include the target column (or a proxy for it) in your features.
• You split in a way that duplicates the same person/customer in both train and test.

Action (5 minutes):
Write 3 “leakage checks” you will always do:
• Split first, then do prep on train only.
• Double-check feature list (no target/proxies).
• Ensure duplicates / same entity aren’t in both sets.

2) Learn when you need a validation set
Sometimes you need three splits:
• train (learn)
• validation (choose settings / compare models)
• test (final, untouched)

Action (2 minutes):
Write one sentence: “I use validation when I need to make choices before final evaluation.”

3) Learn about stratified splits (classification)
If one class is rare, a random split can accidentally put too many rare examples into train or test.

Action (2 minutes):
Write one line: “If classes are imbalanced, I stratify the split.”

Outcome
You can explain a split confidently *and* avoid the most common evaluation mistake: leakage.

────────────────────────
Step 2: Bias vs variance - the real intuition
────────────────────────

You do NOT need the maths. You need the intuition.

Use this mental model:

• Bias = the model is too simple to capture the pattern (systematically wrong).
• Variance = the model is too sensitive to the training data (changes a lot with small data changes).

How it looks in results:

High bias (underfitting)
• training performance is poor
• test performance is also poor

High variance (overfitting)
• training performance is strong
• test performance is much worse

Action (5 minutes):
Write two examples in plain English:
• “High bias looks like…”
• “High variance looks like…”

Outcome
You can explain why a model fails: “too simple” vs “too fitted to the training sample.”

────────────────────────
Step 3: Overfitting - how to spot it and what to do next
────────────────────────

You already know what overfitting is. Now go one level deeper:

1) How to spot it quickly
• training score much better than test score
• performance drops when you try new data
• model behaves “confidently wrong” on edge cases

2) What you typically try next (beginner-friendly list)
Pick ONE of these actions, not all:

• simplify the model (e.g., fewer features, simpler algorithm)
• collect more data (if possible)
• add regularisation (common for linear models)
• use cross-validation to get a more stable estimate
• improve your features (often the biggest win)

Action (5 minutes):
Write: “If I suspect overfitting, my first move is: ________”
(Choose one and explain why.)

Outcome
You can explain what you would do next. Not just that overfitting exists.

────────────────────────
Step 4: Accuracy vs precision vs recall vs F1 - when each matters
────────────────────────

You already know these are evaluation metrics. Now you’ll learn when to use which.

1) Start with the “mistake cost” question
Before choosing a metric, ask:

• Which mistake is worse: false positive or false negative?

Action (2 minutes):
Write one example for each:
• “A false positive is worse when…”
• “A false negative is worse when…”

2) Use this beginner decision guide
• Accuracy is fine when classes are balanced and mistakes cost about the same.
• Precision matters when you want your positive predictions to be trustworthy.
• Recall matters when missing positives is very costly.
• F1 is useful when you want a balance between precision and recall.

3) Learn the confusion matrix as a *story*
You don’t need to memorise a table, just the four outcomes:

• predicted positive / actually positive
• predicted positive / actually negative
• predicted negative / actually positive
• predicted negative / actually negative

Action (5 minutes):
Draw a simple 2×2 grid in your notes and label it in your own words.

4) Understand thresholds (one level deeper, beginner-friendly)
Many classifiers output a probability (e.g., 0.73).  
You choose a cutoff (threshold) to decide “positive” vs “negative”.

Lower threshold → more positives predicted → higher recall, lower precision  
Higher threshold → fewer positives predicted → higher precision, lower recall

Action (5 minutes):
Write one sentence:
“If I lower the threshold, recall usually ______ and precision usually ______.”

Outcome
You can choose metrics like an analyst, not like a checkbox.

────────────────────────
Step 5: Explain it aloud (interview practice)
────────────────────────

Record a 60–90 second voice note (or speak aloud) answering:

1) “How do you avoid leakage?”
2) “How do you know if you’re overfitting?”
3) “When would you use precision vs recall?”

Keep it simple and human. No jargon.

Outcome
You can explain what your model is doing, not just run code.
`
},

{
  task: "Build two additional mini ML projects",
  duration: 6,
  explanation: `
Repetition builds intuition and speed.

You already completed one full ML project.
Now you will build **two additional smaller projects** to strengthen your modelling workflow and demonstrate range.

These projects should be simpler and faster than your first project.

────────────────────────
Step 1: Choose two different prediction problems
────────────────────────

Select:

• ONE classification problem  
• ONE regression problem  

Choose datasets that allow you to explore topics related to **career growth, wellbeing, or financial independence**.

Example project ideas:

Classification ideas
• Predict whether a job posting is entry-level or senior  
• Predict whether a user completes an online learning course  
• Predict whether a mentorship match is successful based on profiles  
• Predict whether a startup founded by women receives funding (based on features such as industry, team size, etc.)

Regression ideas
• Predict salary range based on job attributes (industry, experience, skills)  
• Predict course completion time for students in an online learning platform  
• Predict engagement score for career-development content  
• Predict monthly savings growth based on spending behaviour features

Outcome
Two clearly defined prediction problems with meaningful real-world context.

────────────────────────
Step 2: Set up each project notebook
────────────────────────

Create two notebooks:

classification_project.ipynb  
regression_project.ipynb  

Follow the same structure used in your previous project so the workflow becomes natural.

Sections to include:

• Problem description  
• Data exploration  
• Data preparation  
• Model training  
• Model comparison  
• Evaluation  
• Short summary

Outcome
Two clean, structured notebooks that are easy to follow.

────────────────────────
Step 3: Train and compare multiple models
────────────────────────

For each project:

1. Train at least **two different models**.
2. Compare their results.
3. Record which performs best.

Write a short explanation answering:

• Which model performed best?  
• What differences did you observe between models?

Outcome
Experience evaluating model performance rather than training only one model.

────────────────────────
Step 4: Add simple visualisations
────────────────────────

Add visualisations that help explain your project.

Examples:

• distribution of the target variable  
• feature relationships  
• predicted vs actual values (regression)  
• confusion matrix (classification)

Ensure charts include titles and labels.

Outcome
Projects that communicate insights clearly.

────────────────────────
Step 5: Publish the projects to GitHub
────────────────────────

Create one repository for each project.

Include:

• the notebook  
• a short README explaining the problem  
• dataset source  
• libraries used  
• key results  

Optional:
Add screenshots of important outputs.

Outcome
Three total ML projects demonstrating range:

• your first ML project  
• one classification project  
• one regression project
`
}

  ],


  // ——— 3) LLMs & GENAI ———
  llm_genai: [

{
  task: "Choose an LLM API provider and generate your first API key",
  duration: 1,
  explanation: `
AI applications use external models through APIs.  
This task helps you connect your code to a large language model so you can start building AI features.

────────────────────────
What is an API?
────────────────────────

An API (Application Programming Interface) is a way for two programs to communicate.

Instead of running a large AI model on your own computer, you send a request to a provider's server.

Your program sends:
• a prompt (text or instructions)

The AI provider sends back:
• a generated response

In simple terms:

your code → API request → AI model → API response → your app

For example, your program might send:
"Summarise this article"

The API returns:
"A short summary generated by the model."

This allows you to use powerful AI systems without hosting the models yourself.

────────────────────────
Step 1: Choose an LLM provider
────────────────────────

Pick ONE provider to start with:

• OpenAI (recommended for beginners)  
• Anthropic (Claude)  
• Google (Gemini)  
• Mistral  

All providers offer APIs that allow your code to send prompts and receive generated text.

OpenAI is usually the easiest for first projects because documentation and examples are widely available.

Outcome
You have selected an LLM provider.

────────────────────────
Step 2: Create an account and access the developer console
────────────────────────

1. Go to the provider’s website.
2. Create a developer account.
3. Open the **API or developer dashboard**.

This dashboard is where you:
• generate API keys  
• track usage  
• manage billing if required

Outcome
You can access the provider’s developer dashboard.

────────────────────────
Step 3: Generate your first API key
────────────────────────

1. Find the **API Keys** section.
2. Click **Create new key**.
3. Copy the key immediately.

API keys usually look like a long string of letters and numbers.

Important:
Treat this key like a **password**.  
Anyone with this key could access the API through your account.

Outcome
You now have your first API key.

────────────────────────
Step 4: Store the key safely using environment variables
────────────────────────

Never place API keys directly inside your code.

Instead store them in a **.env file**.

1. In your project folder create a file called:

.env

2. Add your key like this:

OPENAI_API_KEY=your_key_here

3. Save the file.

Your Python code will later read the key from this file.

Outcome
Your API key is stored securely outside your source code.

────────────────────────
Step 5: Protect the key from GitHub
────────────────────────

API keys must **never be uploaded to GitHub**.

1. Open your .gitignore file.
2. Add the following line:

.env

This ensures the file will never be pushed to your repository.

Outcome
Your API key is protected from accidental exposure.

────────────────────────
Step 6: Add a short security note to your README
────────────────────────

Write a short note explaining how your project handles API keys.

Example:

• API keys are stored in environment variables  
• .env files are excluded using .gitignore
• Keys should be rotated if exposed  

Outcome
Your project follows basic professional security practices.

────────────────────────
Final outcome of this task
────────────────────────

You now have:

• access to an LLM provider  
• a working API key  
• a secure way to store that key  
• a project ready to connect to an AI model
`
},

  {
  task: "Make your first LLM API call from Python",
  duration: 1.5,
  explanation: `
This is your first real integration. The goal is: request → response → repeatable script.

You already have:
• an API key saved in a .env file
• .env added to .gitignore (so it won’t be pushed to GitHub)

Now you will write a small Python script that:
• reads the key securely
• sends one prompt
• prints the response

────────────────────────
Step 1: Create the playground folder
────────────────────────

Inside your ai-learning repo, create a new folder:

llm_playground

If you are using VS Code:
1. Right-click your project folder → New Folder → name it "llm_playground"

Or via terminal (from the ai-learning folder):
mkdir llm_playground

Outcome
A dedicated place to experiment with LLM calls.

────────────────────────
Step 2: Create the Python script
────────────────────────

Inside llm_playground, create a file:

test_call.py

Outcome
A script you can run repeatedly.

────────────────────────
Step 3: Install the libraries you need (once)
────────────────────────

Make sure your virtual environment is active, then run:

pip install openai python-dotenv

Why python-dotenv?
It loads variables from your .env file into your environment, so your script can read OPENAI_API_KEY safely.

Outcome
Your project can read the key and call the API.

────────────────────────
Step 4: Add the code (copy/paste)
────────────────────────

Open test_call.py and paste the code below.

IMPORTANT:
• Do NOT paste your API key anywhere in this file.
• The key must stay in .env only.

--- test_call.py ---

import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

PROMPT = "Write 5 bullet points on how to prepare for a technical interview."

def main():
    # 1) Load environment variables from .env (located at repo root)
    # If your .env is in the repo root, this will usually find it automatically.
    load_dotenv()

    # 2) Read the API key from environment variables
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found.")
        print("Check that:")
        print("1) You created a .env file")
        print("2) It contains: OPENAI_API_KEY=your_key_here")
        print("3) You are running the script from the repo (or .env is discoverable)")
        sys.exit(1)

    # 3) Create the client (uses your API key)
    client = OpenAI(api_key=api_key)

    try:
        # 4) Make the API call
        response = client.responses.create(
            model="gpt-5.2",
            input=PROMPT
        )
    except Exception as e:
        print("ERROR: API request failed.")
        print("Details:", repr(e))
        sys.exit(1)

    # 5) Print the raw response object (useful for debugging)
    print("\\n--- RAW RESPONSE (debug) ---")
    print(response)

    # 6) Print only the final text (clean output)
    print("\\n--- CLEAN OUTPUT ---")
    print(response.output_text)

if __name__ == "__main__":
    main()

Outcome
A working script that securely loads your key and calls the model.

────────────────────────
Step 5: Run the script
────────────────────────

From the ai-learning folder, run:

python llm_playground/test_call.py

If everything is set up correctly, you will see:
• a raw response dump
• then the clean bullet points text

Outcome
Your first successful “hello world” LLM integration.

────────────────────────
Step 6: Add a tiny README (how to run)
────────────────────────

Inside llm_playground, create:

README.md

Include:
1) how to install dependencies
2) how to set OPENAI_API_KEY in .env
3) how to run the script

Example:

# LLM Playground
pip install openai python-dotenv
Create .env in repo root with OPENAI_API_KEY=...
Run: python llm_playground/test_call.py

Outcome
Anyone can run your script (including future you).

────────────────────────
Step 7: Commit to GitHub safely
────────────────────────

Before committing, double-check:
• .env is NOT being tracked
• .gitignore contains .env

Then commit:
• llm_playground/test_call.py
• llm_playground/README.md

Outcome
A portfolio-ready, safe, repeatable integration you can reuse for projects.
`
},

{
  task: "Build a prompt template library (your personal cheat sheet)",
  duration: 1,
  explanation: `
Prompt design is one of the most valuable skills when building AI apps.

Instead of writing a new prompt every time, you will create **reusable prompt templates**.
These templates act like a **personal toolkit** that you can quickly copy into your scripts or AI applications.

Think of them as:
• shortcuts for common AI tasks
• consistent instructions for the model
• building blocks for future AI features

────────────────────────
Step 1: Create your prompt library file
────────────────────────

Inside your ai-learning repository:

1. Create a new file called:

prompts.md

2. Place it in a folder such as:

ai-learning/
prompt_library/prompts.md

or directly in the root of your repo.

Why use Markdown (.md)?
Because it is simple, readable, and commonly used in developer documentation.

Outcome
A dedicated file where all your reusable prompts will live.

────────────────────────
Step 2: Understand prompt templates
────────────────────────

A prompt template is a **structured instruction with placeholders**.

Placeholders allow you to reuse the same prompt with different inputs.

Example template:

"Summarise the following text for [audience] in a [tone] tone:

[text]"

Here:
• [audience]
• [tone]
• [text]

are placeholders you replace later.

Example filled prompt:

"Summarise the following text for university students in a friendly tone."

Outcome
You understand how prompt templates work.

────────────────────────
Step 3: Add your first five prompt templates
────────────────────────

In prompts.md, add five templates that represent common AI tasks.

Example structure:

--------------------------------

## 1. Summariser

Template
Summarise the following text for [audience] in a [tone] tone.
Keep it under [length].

Text:
[text]

--------------------------------

## 2. Extractor

Template
Extract the following fields from this text and return them as JSON:

Fields:
[field1]
[field2]
[field3]

Text:
[text]

--------------------------------

## 3. Rewriter

Template
Rewrite the following text in a [tone] tone.
Keep it under [length] words.

Text:
[text]

--------------------------------

## 4. Interview Coach

Template
Act as an interviewer for a [role] position.
Ask me one question at a time and wait for my answer.

Start with an introductory question.

--------------------------------

## 5. Planner

Template
Turn the following goal into a practical 7-day plan.

Goal:
[goal]

For each day include:
• one clear task
• estimated time required

--------------------------------

Outcome
You now have five reusable prompt templates.

────────────────────────
Step 4: Document when to use each template
────────────────────────

Under each template add a short explanation.

Example:

When to use
Use this prompt when you need to quickly summarise long text such as articles, notes, or transcripts.

Outcome
You know when each prompt is useful.

────────────────────────
Step 5: Add an example input
────────────────────────

Include a short example showing how the prompt would be used.

Example:

Example input

Audience: beginners  
Tone: simple  
Length: 3 bullet points  

Text:
"Large language models are neural networks trained on vast datasets..."

Outcome
Your templates are easier to understand later.

────────────────────────
Step 6: Add an example output
────────────────────────

Below the example input, write a short example of what a good response would look like.

Example output

• Large language models are AI systems trained on huge text datasets.  
• They can generate human-like text and answer questions.  
• They are used in chatbots, coding assistants, and writing tools.

Outcome
You know what kind of output to expect.

────────────────────────
Step 7: Keep templates simple and reusable
────────────────────────

Good prompt templates are:

• short
• structured
• easy to modify
• reusable across different tasks

Avoid overly complex prompts.

Your goal is to build a **toolkit you can reuse across many projects**.

────────────────────────
Outcome of this task
────────────────────────

You now have:

• a personal prompt template library  
• reusable instructions for common AI tasks  
• a reference file you can use in future projects  

As you build more AI tools, you will keep expanding this library.
`
},

  {
  task: "Build an LLM mini-app: CV bullet point improver",
  duration: 5,
  explanation: `
This is a portfolio-friendly mini-app with a clear before/after transformation. It demonstrates practical GenAI usage and safe handling of outputs.

You already have:
• an API key stored in .env
• a working Python LLM test script
• a prompt template library file (prompts.md)

Now you’ll turn that into a small “app” that improves CV bullet points.

────────────────────────
Step 1: Create your project folder + files
────────────────────────

Inside your ai-learning repo, create:

llm_cv_improver/

Inside that folder create:
• app.py
• README.md

Optional (if you build a tiny web UI):
• requirements.txt
• templates/index.html

Outcome
A dedicated mini-app folder with clean structure.

────────────────────────
Step 2: Define your input (what the user provides)
────────────────────────

Your app should accept:

1) Role title (required)
Example: "Data Analyst", "Product Manager", "ML Engineer"

2) Raw bullet points (required)
These are the messy bullets you want improved.
Minimum: 1 bullet
Maximum: ~10 bullets

3) Target job description (optional)
This helps tailor wording to the role.
If the user does not provide it, the app still works.

How to collect input (choose one):

Option A - CLI (simplest)
• Ask for role title
• Ask for bullets (user can paste multiple lines)
• Ask for job description (optional)

Option B - Tiny web page (still small)
• A form with:
  - role title field
  - big text box for bullets
  - optional text box for job description
  - submit button

Outcome
You know exactly what inputs your app needs.

────────────────────────
Step 3: Define your output (what your app returns)
────────────────────────

Your app must output:

• 3–5 improved bullet points (even if user gives many)
• concise, ATS-friendly formatting (plain text bullets)
• each bullet should include a metrics placeholder if none is given

Examples of allowed placeholders:
• “[X%]”
• “£[X]”
• “[X hours/week]”
• “[X stakeholders]”
• “[X] -> [Y] improvement”

Important:
If the user does not give metrics, you must NOT invent them.
You should add placeholders instead.

Outcome
Clear, consistent output format that looks professional.

────────────────────────
Step 4: Create your prompt template for this app
────────────────────────

Add a new template to prompts.md (or define it inside app.py).
Keep it structured and explicit.

Your prompt should:
• say the role title
• include the raw bullets
• include job description if provided
• explicitly say: “do not invent numbers; use placeholders”

Example prompt structure (you can adapt):

- Role: {role_title}
- Raw bullets:
{raw_bullets}

- Job description (optional):
{job_description}

Rules:
1) Rewrite into 3–5 strong CV bullets
2) Use action verbs and clear impact
3) Keep each bullet under 2 lines
4) Do NOT invent metrics. If missing, add placeholders like [X%], £[X], [X hours]
5) Output bullets only (no extra commentary)

Outcome
A reusable prompt you can use in code.

────────────────────────
Step 5: Implement the flow (the core pipeline)
────────────────────────

Your app flow should be:

User text → prompt template → API call → clean output

Implementation checklist:

1) Load API key from .env (same approach as your first API call)
2) Build the final prompt string using the user inputs
3) Call the LLM
4) Extract clean text output only
5) Print or display the final bullets

Outcome
A working end-to-end “input → improved bullets” generator.

────────────────────────
Step 6: Add guardrails (quality + safety)
────────────────────────

Guardrail A - Missing metrics
If the user provides no numbers, output placeholders.

Guardrail B - Concise and ATS-friendly
Ensure the model outputs:
• plain bullet points
• no emojis
• no tables
• no headings like “Here are your bullets:”
• no overly long paragraphs

Guardrail C - Input limits
If the user pastes huge text:
• take only the first ~10 bullets
• or truncate job description to a reasonable size

Outcome
More consistent results and fewer messy outputs.

────────────────────────
Step 7: Add a simple UI (choose one)
────────────────────────

Option A - CLI (recommended for 3-hour task)
In app.py:
• print “Enter role title:”
• ask user to paste bullets
• ask optional job description
• print improved bullets

Option B - Tiny web page (optional)
Use a lightweight framework (e.g. Flask) to create:
• a form page
• a results page

Outcome
An actual mini-app someone can use, not just a script.

────────────────────────
Step 8: Write the README
────────────────────────

In README.md include:

1) What it does
One paragraph explanation.

2) How to run (step-by-step)
• install dependencies
• set .env key
• run the app

3) Example input/output
Paste a short “before” and “after”.

4) Notes on guardrails
Mention:
• “does not invent metrics”
• “outputs ATS-friendly bullets”

Outcome
A portfolio-ready project that others can run.

────────────────────────
Step 9: Push to GitHub and pin it
────────────────────────

Commit:
• app.py
• README.md
• any UI files

Double-check:
• .env is NOT committed
• .gitignore includes .env

Push the repo and pin it on your GitHub profile.

Outcome
A polished, job-relevant GenAI project you can demo in interviews.
`
},

{
  task: "Build an LLM mini-app: ‘Meeting Notes → Action Items’ extractor",
  duration: 3,
  explanation: `
This mini-app demonstrates **structured output**, which is a strong AI engineering signal.
You are not just generating text, you are producing machine-readable JSON that other code can use.

You already have:
• an API key stored in .env
• a working Python LLM call script
• experience printing raw vs clean output

Now you’ll build a small app that turns messy notes into structured action items, risks, and decisions.

────────────────────────
Step 1: Create the project folder + files
────────────────────────

Inside your ai-learning repo, create:

llm_meeting_extractor/

Inside that folder create:
• app.py
• README.md
• example_notes.txt
• outputs/   (a folder to save JSON files)

Outcome
A clean mini-app structure with an examples + outputs folder.

────────────────────────
Step 2: Define the input (what the user provides)
────────────────────────

Input is just one thing:

• Raw meeting notes (messy text)

Notes can include:
• bullet points
• incomplete sentences
• mixed topics
• names, deadlines, random comments

How to feed input (choose one):
Option A - read from a text file (recommended)
• Put notes inside example_notes.txt
• Your code reads that file

Option B - paste into the terminal
• Your code asks the user to paste notes

Outcome
Your app can accept real-world messy meeting notes.

────────────────────────
Step 3: Define the output (exact JSON schema)
────────────────────────

Your app must return ONE JSON object with these keys:

{
  "action_items": [
    { "owner": "...", "task": "...", "due_date": "...", "priority": "low|medium|high" }
  ],
  "risks": ["..."],
  "decisions": ["..."]
}

Rules:
• action_items is always an array (even if empty)
• risks is always an array
• decisions is always an array
• due_date can be:
  - an actual date (e.g. "2026-03-18")
  - or "TBD" if not stated
• owner can be a name or "TBD"
• priority must be only: low, medium, or high

Outcome
A consistent JSON format that is easy to use in real applications.

────────────────────────
Step 4: Create a prompt that forces structure
────────────────────────

Create a prompt template (in your prompts.md or directly in app.py) that:

• tells the model the required JSON schema
• explicitly says “Return valid JSON only”
• says “No markdown, no explanation, no extra text”
• tells it what to do when info is missing (use "TBD")

Example prompt structure:

"You are an assistant that extracts structured action items from meeting notes.

Return valid JSON only using exactly this schema:
{...schema...}

Rules:
1) Return JSON only. No markdown. No commentary.
2) If owner or due_date is missing, use 'TBD'.
3) Priority must be one of: low, medium, high.
4) Keep tasks short and action-oriented.

Meeting notes:
<<<
{notes}
>>>"

Outcome
A prompt that makes the model’s output predictable.

────────────────────────
Step 5: Implement the core flow in app.py
────────────────────────

Your pipeline:

notes text → prompt → API call → JSON parse → save to file

Implementation checklist:

1) Load your API key from .env (do not hardcode)
2) Read meeting notes from example_notes.txt
3) Insert notes into the prompt template
4) Call the LLM
5) Take the model output text and attempt to parse JSON
   • in Python you will use json.loads(output_text)

Outcome
A working extractor that returns structured content.

────────────────────────
Step 6: Validate output + retry once if needed
────────────────────────

Sometimes the model might:
• include extra text
• return invalid JSON
• miss quotes/commas

Add validation:

1) Try to parse output as JSON.
2) If parsing fails, retry ONE time with a correction prompt.

Correction prompt idea:

"The previous output was not valid JSON.
Return the same content again as VALID JSON ONLY.
Do not add any extra text.
Here is the invalid output:
<<<
{bad_output}
>>>"

If the second attempt fails:
• print a clear error message
• save the raw output to a text file for debugging

Outcome
More reliable results and a professional “repair” mechanism.

────────────────────────
Step 7: Save the JSON output with a timestamp
────────────────────────

Create a filename that includes date + time so you keep history.

Example format:
outputs/meeting_actions_2026-03-04_1530.json

Write the parsed JSON object to that file.

Also print:
• file location saved to
• how many action items were extracted

Outcome
A repeatable workflow and a folder of saved outputs.

────────────────────────
Step 8: Add an example notes file
────────────────────────

In example_notes.txt paste realistic messy notes, for example:

• Alex to send Q3 report to the finance team by Friday
• Manager needs to approve database access request
• Risk: timeline may slip if vendor delivery is delayed
• Decision: prioritise the enterprise segment roadmap first

Outcome
Anyone can run your project and see the before/after.

────────────────────────
Step 9: Write a README that makes it easy to run
────────────────────────

Include:

1) What the app does (1 paragraph)
2) Setup:
   • pip install requirements
   • add OPENAI_API_KEY to .env
3) How to run:
   • python llm_meeting_extractor/app.py
4) Example:
   • show sample input notes snippet
   • show sample JSON output snippet
5) Reliability feature:
   • mention JSON validation + one retry

Outcome
A second GenAI project showing structured output + reliability.

────────────────────────
Final outcome
────────────────────────

You now have a portfolio-friendly GenAI project that demonstrates:

• structured JSON output (not just text)
• validation and retry handling
• saving results for real use

This is the kind of pattern used in real AI apps that connect LLMs to workflows.
`
},

  {
  task: "Add production basics: rate limits, retries, and logging",
  duration: 2,
  explanation: `
Even small projects feel professional when they handle real-world issues.

You already have working mini-apps that call an LLM.
Now you’ll add a few “production basics” that make them reliable:
• they don’t crash on a temporary failure
• they handle empty inputs safely
• they record what happened (so you can debug)
• they keep settings in one place (so you can change them easily)

You can apply these improvements to BOTH of your mini-apps.

────────────────────────
Step 1: Add a simple retry strategy (one retry only)
────────────────────────

Goal: if the request fails once, try again after a short wait.

What counts as a “failure” for this step:
• the API request raises an exception
• you receive an error response
• (for structured outputs) the JSON parse fails

Implementation plan:
1) Wrap your API call in a function: call_llm(prompt)
2) Inside it:
   • attempt the request
   • if it fails, wait 1–2 seconds
   • try once more
3) If the second attempt fails, return a clear error message.

Rule:
Do NOT loop forever. Retry once only.

Outcome
Your app can recover from temporary errors without you rerunning it manually.

────────────────────────
Step 2: Add basic logging (so you can debug)
────────────────────────

Logging means writing short “what happened” messages while your program runs.

Add logs for:
• when a request starts
• when it succeeds
• when it fails (include error)
• how long it took

Optional (only if available from your API response):
• usage / tokens consumed

Where to log:
Option A - print statements (fastest)
Option B - Python logging module (more professional)

Minimum logging checklist:
• timestamp
• event name (START / SUCCESS / FAIL)
• duration in seconds

Example of what you want to see in the terminal:

[2026-03-04 15:40:10] START request
[2026-03-04 15:40:12] SUCCESS request duration=2.1s
or
[2026-03-04 15:40:12] FAIL request error="..."

Outcome
You can see exactly what your app did and where it failed.

────────────────────────
Step 3: Add “safe mode” checks (input + output boundaries)
────────────────────────

Safe mode means your app avoids common user mistakes and avoids unbounded output.

Add these checks:

A) Block empty inputs
If the user provides an empty string (or only spaces), do not call the API.
Instead, print a helpful message like:
“Please paste meeting notes first.”

B) Limit output size
Set a maximum output length so responses don’t become huge.

This can be done by:
• setting a max token limit in your API request
• adding a rule in your prompt: “Keep the response under X bullets / X characters”

C) Limit input size (optional but useful)
If the input text is very long, truncate it to a safe limit.
Example: only use the first ~3000–6000 characters.

Outcome
Your mini-app doesn’t waste API calls and behaves predictably.

────────────────────────
Step 4: Add a simple config file (one place to change settings)
────────────────────────

Right now, your model settings might be hardcoded.
Move them into one config file so you can change them without editing app logic.

Create a file called:

config.py

Inside, define settings like:

• MODEL_NAME
• MAX_OUTPUT_TOKENS
• TEMPERATURE

Then in your app.py, import these values.

Benefits:
• consistent settings across apps
• easy to tweak for experimentation
• more professional structure

Outcome
A clean setup where your “knobs” are in one place.

────────────────────────
Step 5: Document settings in your README
────────────────────────

In each project README, add a short “Configuration” section:

Include:
• model name used
• max output length setting
• temperature setting
• retry behaviour (1 retry + 1–2 sec wait)
• what your logging captures

Also include a note:
“If you hit rate limits, wait and try again.”

Outcome
Anyone reading your repo understands how your app behaves and how to adjust it.

────────────────────────
Final outcome
────────────────────────

Your projects now behave like real applications, not demos:

• resilient to temporary failures (retry)
• safe around bad inputs (safe mode)
• debuggable (logging)
• easy to tune (config file)
• documented for others (README)
`
},

...generateDaily({
  title: "Daily AI build session (30–45 mins)",
  duration: 0.5,
  explanation: `
A small daily build habit helps you consistently make progress on your AI projects.

Unlike the earlier foundations stage, this practice now lives in the LLM/GenAI phase because you have enough technical context to actively build, experiment, and improve real applications.

Step-by-step
1. Set a timer for 30–45 minutes.
2. Choose ONE small, concrete improvement to work on:
   • add a small feature to one of your AI apps
   • refine or test a prompt template
   • improve output formatting or error handling
   • update documentation or examples in your README
3. Start with the easiest 5-minute step to build momentum.
4. Focus only on that task until the timer ends.
5. Before finishing, write a short note:
   • “Next step: ____”

This ensures tomorrow’s session starts quickly without decision friction.

Outcome
Consistent progress on real AI projects and a habit of shipping small improvements regularly.
`,
  idBase: "tech_switch.llm_genai.daily_practice",
  meta: { roadmap: "tech_switch", theme: "llm_genai" },
}),


],



devops_skills: [

{
  task: "Understand what DevOps is and why teams use it",
  duration: 1.5,
  explanation: `
Before using DevOps tools, it's important to understand the purpose behind them.

DevOps is not just tools. It is a way of working that connects development and operations so software can be built, tested, and deployed faster and more reliably.

In traditional teams:
• Developers wrote code
• Operations teams deployed and managed servers

This separation often caused delays and mistakes.

DevOps improves this by introducing:
• automation
• continuous integration (CI)
• continuous deployment (CD)
• infrastructure as code
• monitoring

Step-by-step
1. Search for "What is DevOps explained simply".
2. Read one short article or watch one short video.
3. Write 5 bullet notes in your Learning Hub answering:
   • What DevOps is
   • Why companies use it
   • What problems it solves
4. Write down 3 tools commonly used in DevOps (examples: Docker, GitHub Actions, AWS).

Outcome
You understand the purpose of DevOps and the tools you will start learning next.

Free Tools
Google, YouTube
`
},

{
  task: "Learn the basic DevOps workflow used in real teams",
  duration: 1.5,
  explanation: `
Modern teams follow a predictable workflow from writing code to deploying it.

A simplified DevOps workflow looks like this:

1. Write code
2. Push code to GitHub
3. Run automated tests
4. Build the application
5. Deploy to a server or cloud platform
6. Monitor the application

Step-by-step
1. Draw a simple diagram in your Learning Hub showing the workflow:
   Code → GitHub → CI → Build → Deploy → Monitor

2. Under each step write one example tool:
   Code → Python / JavaScript
   Git → GitHub
   CI → GitHub Actions
   Deploy → Docker / cloud platform
   Monitor → logs or monitoring tools

3. Save the diagram.

Outcome
You understand the full lifecycle of software delivery.

Free Tools
Notion, Google Docs
`
},

{
  task: "Install Docker and understand containers",
  duration: 2,
  explanation: `
Docker is one of the most important DevOps tools.

It allows you to package an application together with all its dependencies so it runs the same everywhere.

Without Docker:
• Code may work on your laptop but fail on a server.

With Docker:
• The application runs inside a container with everything it needs.

Step-by-step
1. Download and install Docker Desktop.
2. Open the terminal and run:

   docker --version

3. Pull a simple Docker image:

   docker run hello-world

4. Observe the output message explaining Docker works.

5. Write down in your Learning Hub:
   • What a container is
   • Why containers are useful

Outcome
Docker installed and your first container executed.

Free Tools
Docker Desktop
`
},

{
  task: "Run your first application inside a Docker container",
  duration: 2,
  explanation: `
Now you will run a real application inside a container.

This shows how Docker packages software so it runs consistently.

Step-by-step
1. Create a simple Python file called:

   app.py

2. Add this code:

   print("Hello from a Docker container")

3. Create a file called:

   Dockerfile

4. Add:

   FROM python:3.10
   COPY app.py .
   CMD ["python", "app.py"]

5. Build the image:

   docker build -t my-first-container .

6. Run it:

   docker run my-first-container

Outcome
Your first containerised application.

Free Tools
Docker
`
},

{
  task: "Understand Continuous Integration (CI)",
  duration: 1.5,
  explanation: `
Continuous Integration automatically tests and checks code whenever changes are pushed.

Instead of waiting until later to detect problems, CI catches errors early.

Typical CI tasks include:
• running tests
• checking formatting
• installing dependencies
• building the project

Step-by-step
1. Search: "What is CI in DevOps".
2. Write a short explanation in your Learning Hub.
3. List 3 CI tools:
   • GitHub Actions
   • GitLab CI
   • Jenkins
4. Write one example benefit of CI.

Outcome
You understand why automated checks are important in software development.
`
},

{
  task: "Create your first GitHub Actions workflow",
  duration: 2.5,
  explanation: `
GitHub Actions allows you to automate tasks when code changes.

This is one of the easiest ways to implement CI.

Step-by-step
1. Open one of your GitHub repositories.
2. Create a folder:

   .github/workflows

3. Inside the folder create:

   ci.yml

4. Add a simple workflow:

   name: Python Test

   on: [push]

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v3
         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.10'

         - name: Run script
           run: python app.py

5. Commit and push the file.

6. Open the GitHub "Actions" tab and observe the workflow run.

Outcome
Your first automated CI pipeline.

Free Tools
GitHub
`
},

{
  task: "Understand cloud deployment basics",
  duration: 1.5,
  explanation: `
Most applications today run in the cloud instead of on physical servers.

Cloud platforms provide:
• servers
• storage
• databases
• networking

Examples include:
• AWS
• Google Cloud
• Azure

Step-by-step
1. Search: "What is cloud computing".
2. Write down the difference between:
   • local machine
   • server
   • cloud platform
3. List 3 cloud providers.

Outcome
Basic understanding of cloud infrastructure used in modern applications.
`
},

{
  task: "Deploy a simple project to a cloud platform",
  duration: 3,
  explanation: `
Deployment means making your application accessible online.

For beginners, the easiest platforms are:
• Render
• Railway
• Vercel

Step-by-step
1. Choose one platform.
2. Connect your GitHub account.
3. Select a repository.
4. Follow the platform deployment wizard.
5. Wait for the deployment to complete.
6. Open the public URL.

Outcome
Your project is running on the internet.

Free Tools
Render, Railway, Vercel
`
},

{
  task: "Add basic application logging",
  duration: 1,
  explanation: `
Logging records what happens inside your application.

Logs help you:
• debug errors
• understand behaviour
• monitor performance

Step-by-step
1. Open your Python app.
2. Add:

   import logging

3. Configure logging:

   logging.basicConfig(level=logging.INFO)

4. Add a log line:

   logging.info("Application started")

5. Run the program and observe the log output.

Outcome
Your application now produces basic logs.
`
},

{
  task: "Document your DevOps learning in your portfolio",
  duration: 1,
  explanation: `
Documentation shows employers you understand the workflow, not just the code.

Step-by-step
1. Open the README of your project.
2. Add a section:

   DevOps Setup

3. Describe:
   • Docker container
   • CI pipeline
   • deployment platform
4. Include screenshots if possible.

Outcome
A professional project showing real DevOps practices.
`
}

],

  

  projects_data: [
  { 
  task: "Pick a public dataset and define three analytical questions", 
  duration: 1.5,
  explanation: `
This is the starting point of your first real data project.

In earlier tasks you practised loading datasets, exploring columns, and creating simple charts.  
In this project you will go further: you will choose a dataset and design a **clear analytical objective**.

Real data analysts rarely start with charts.  
They start with **questions that matter**.

────────────────────────
Step 1: Choose a meaningful dataset
────────────────────────

Select a dataset that contains enough rows and multiple variables so meaningful analysis is possible.

Good sources include:
• Kaggle datasets  
• UK Office for National Statistics (ONS)  
• World Bank Open Data  
• UN datasets  
• Government gender equality reports  

Choose a topic that could realistically appear in a **career or social impact analysis**.

Examples of strong dataset themes:

Women & career progression
• Gender pay gap by industry or region  
• Representation of women in leadership roles  
• Women in STEM participation by country  

Workplace & career development
• Promotion rates across industries  
• Salary progression over time  
• Remote work adoption across sectors  

Education & opportunity
• Female university graduation rates by field  
• Access to higher education by gender and region  

Entrepreneurship & leadership
• Female-founded startups by country  
• Venture capital funding for women-led companies  
• Women on corporate boards  

Pick **one dataset that genuinely interests you**.

Download the dataset or save the API link.

────────────────────────
Step 2: Understand the dataset structure
────────────────────────

Before writing questions, inspect the dataset.

Open it in Python or a spreadsheet and review:

• number of rows and columns  
• column names and data types  
• missing values  
• possible relationships between variables  

Ask yourself:

• What does each row represent?  
• What does each column measure?  
• Which variables could explain patterns?

Write a **short dataset description (3–4 sentences)** in your project notes or README.

Example:

"This dataset contains gender pay gap statistics across UK industries from 2015–2023.  
Each row represents an organisation and includes variables such as sector, mean pay gap, median pay gap, and female leadership representation."

────────────────────────
Step 3: Define three analytical questions
────────────────────────

Now design **three clear questions** that your analysis will answer.

Good questions are:
• measurable  
• answerable with the available columns  
• relevant to real-world decisions  

Examples related to careers and empowerment:

Descriptive question (What is happening?)

• Which industries have the largest gender pay gaps?  
• How has female leadership representation changed over time?

Comparison question (How do groups differ?)

• Do women in STEM fields earn more or less than women in other sectors?  
• How does female board representation differ between countries?

Explanatory question (What influences outcomes?)

• Which factors correlate with smaller gender pay gaps?  
• Does female leadership correlate with higher company performance?

Write the **three questions clearly** in your README.

────────────────────────
Step 4: Decide outputs for each question
────────────────────────

For each question, decide **how you will answer it**.

Possible outputs include:

• bar charts comparing industries or countries  
• line charts showing trends over time  
• scatter plots showing relationships between variables  
• correlation analysis  
• a simple regression model  
• written interpretation of the results  

Example:

Question → Output

"Which industries have the highest gender pay gaps?"  
→ Bar chart ranking industries

"Does female leadership correlate with company performance?"  
→ Scatter plot + correlation analysis

Planning outputs in advance keeps your analysis **structured rather than random**.

────────────────────────
Step 5: Set up your project workspace
────────────────────────

Create a simple project structure:

project_folder/

• data/ (dataset files)  
• analysis_notebook.ipynb  
• README.md  

In the README include:

• dataset source  
• dataset description  
• your three analytical questions  

────────────────────────
Outcome
────────────────────────

You now have the foundation of a **real analytical project**:

• a meaningful dataset  
• clearly defined analytical questions  
• planned outputs  
• organised project structure  

This is how real data projects begin:  
with **curiosity, structured questions, and a clear analytical goal**.
`
},
{ 
  task: "Perform exploratory data analysis (EDA) and clean the dataset", 
  duration: 3,
  explanation: `
Exploratory Data Analysis (EDA) is where analysts begin to truly understand their data.

Before building models or drawing conclusions, you must check whether the dataset is reliable, structured correctly, and free from major issues.

This task focuses on two things:
• understanding the dataset  
• cleaning it so it can be used for analysis

Your goal is to produce a **well-structured notebook that documents both the exploration and the cleaning process.**

────────────────────────
Step 1: Create your analysis notebook
────────────────────────

1. Open Jupyter Notebook or Google Colab.
2. Create a notebook called:

   eda_cleaning.ipynb

3. Add the following section headings:

• Project overview  
• Load dataset  
• Initial inspection  
• Data quality checks  
• Exploratory analysis  
• Data cleaning  
• Data quality notes  

Clear structure makes your work easier to understand and review later.

────────────────────────
Step 2: Load the dataset
────────────────────────

Import the libraries you will need.

Typical libraries include:

• pandas  
• numpy  
• matplotlib  
• seaborn  

Load your dataset and display the first few rows.

Check:
• whether the data loads correctly  
• whether column names are readable  
• whether values appear sensible

Example checks to perform:

• df.head()  
• df.columns  
• df.shape  

Ask yourself:
• What does each row represent?
• What type of information does each column contain?

Write 2–3 sentences describing the dataset.

────────────────────────
Step 3: Perform initial dataset inspection
────────────────────────

Next, inspect the dataset structure.

Check:

• data types of each column  
• number of missing values  
• summary statistics for numeric variables  

Typical commands include:

• df.info()  
• df.describe()  
• df.isnull().sum()

Questions to consider:

• Are numeric variables stored as text?  
• Are dates formatted correctly?  
• Are there columns that appear unnecessary?

Write down **any unusual findings**.

────────────────────────
Step 4: Investigate duplicates and inconsistencies
────────────────────────

Real-world datasets often contain duplicate or inconsistent records.

Check for duplicates.

Example tasks:

• Count duplicate rows  
• Identify duplicate IDs or records  
• Investigate repeated values

Decide whether duplicates should be:
• removed  
• kept but flagged  
• investigated further

Explain your reasoning briefly.

────────────────────────
Step 5: Explore distributions and patterns
────────────────────────

EDA is about understanding how the data behaves.

Create basic visualisations to inspect key variables.

Examples include:

• histograms for numeric variables  
• bar charts for categorical variables  
• box plots to detect outliers  
• scatter plots to explore relationships

Questions to ask:

• Which values appear most frequently?  
• Are there unusual spikes or gaps?  
• Are there extreme outliers?  
• Do certain variables appear related?

Write **short observations beneath each chart.**

Example:

"The gender pay gap distribution shows several extreme outliers above 40%, which may represent reporting errors or unusual organisations."

────────────────────────
Step 6: Clean the dataset
────────────────────────

Once you understand the data, begin cleaning it.

Common cleaning steps include:

Fix data types
• convert strings to numbers  
• convert columns to datetime

Handle missing values
• remove rows with excessive missing data  
• fill values where appropriate  
• leave missing values if they carry meaning

Remove or flag duplicates

Standardise column names if needed
• lowercase  
• replace spaces with underscores

Avoid excessive cleaning.  
Your goal is **a usable dataset, not a perfect one.**

────────────────────────
Step 7: Validate the cleaned dataset
────────────────────────

After cleaning, repeat your key checks:

• df.info()  
• df.describe()  
• missing value counts  

Confirm that:

• data types are correct  
• duplicates have been handled  
• missing values are understood

Add a short section explaining what changed.

────────────────────────
Step 8: Write “Data Quality Notes”
────────────────────────

Create a final markdown section called:

Data Quality Notes

Include:

• what issues the dataset had originally  
• what cleaning steps you performed  
• which issues remain unresolved  

Example:

• Some rows contained missing salary values and were removed.  
• Industry categories had inconsistent spelling and were standardised.  
• A small number of extreme outliers remain because they appear valid.

This section demonstrates **analytical thinking and transparency**, which is valued in real data work.

────────────────────────
Outcome
────────────────────────

You will finish this task with:

• a structured EDA notebook  
• a cleaned dataset ready for analysis  
• documented observations about data quality  
• clear charts explaining how the data behaves

This notebook becomes the **foundation of your entire project**, and it mirrors how professional data analysts begin real analytical work.
`
},

  { 
  task: "Feature engineering for one model", 
  duration: 3,
  explanation: `
Feature engineering means creating **better input columns for your model**.

Models learn patterns from the columns you give them.  
Sometimes the original dataset does not show the pattern clearly.

By creating new columns (called *features*), you help the model understand the data better.

In this task you will:
• choose one prediction goal  
• create a few new features from your dataset  
• check that they make sense  
• see whether they improve your model

You do NOT need advanced mathematics for this.  
Simple transformations often make the biggest difference.

────────────────────────
Step 1: Choose your prediction target
────────────────────────

First decide what your model is trying to predict.

Examples:

• Will an employee leave the company?  
• What salary level will someone reach?  
• Will a customer buy a product?  
• What is the expected revenue of a company?

Step-by-step

1. In your notebook create a section called:

   Target variable

2. Write one sentence explaining:

   "The model will predict: ______"

3. Identify the column that contains this value.

Outcome  
You clearly know **what your model is predicting**.

────────────────────────
Step 2: Identify the baseline features
────────────────────────

Baseline features are the columns you already used in your first model.

Examples of typical features:

• age  
• years_experience  
• education_level  
• company_size  
• job_role  

Step-by-step

1. Create a list called:

   baseline_features = [...]

2. Add the columns you believe are useful predictors.

3. Keep the list small (about 5–10 columns).

Outcome  
A clear starting set of columns your model uses.

────────────────────────
Step 3: Create new engineered features
────────────────────────

Now you will create **new columns derived from the existing ones**.

These new columns can help your model see patterns more clearly.

Try creating **3–8 new features**.

Below are simple beginner-friendly ideas.

────────────────────────
A) Extract information from dates
────────────────────────

If your dataset has a date column, you can extract useful information.

Examples:

• month  
• year  
• day_of_week  
• is_weekend (true or false)

Example idea

If analysing career progression:

promotion_year → extract year of promotion

────────────────────────
B) Create ratio features
────────────────────────

Ratios compare two values.

Examples:

• salary_per_year_experience  
• revenue_per_employee  
• engagement_rate = engaged_sessions / total_sessions

Ratios often reveal relationships that raw numbers hide.

────────────────────────
C) Create grouped categories (bins)
────────────────────────

Sometimes numbers work better when grouped.

Example:

Age → age_group

18–25  
26–35  
36–50  
50+

Example:

Years of experience → experience_level

Junior  
Mid  
Senior

────────────────────────
D) Combine two columns
────────────────────────

Sometimes two columns together are useful.

Examples:

• experience * education_level  
• salary / years_experience  

These interactions can capture relationships between variables.

────────────────────────
Step 4: Check that your new features make sense
────────────────────────

Before using the features in your model, check them carefully.

Step-by-step

1. Look at the first few rows:

   df.head()

2. Check for missing values.

3. Check if numbers look reasonable.

Examples of problems to watch for:

• negative values where they shouldn't exist  
• extremely large numbers caused by division errors  
• missing values after calculations

If you see problems, fix them before continuing.

Outcome  
Your engineered features are **clean and sensible**.

────────────────────────
Step 5: Train the model again with the new features
────────────────────────

Now test whether the engineered features help.

You will run two models.

Model 1  
Uses only the baseline features.

Model 2  
Uses baseline + engineered features.

Step-by-step

1. Train the baseline model again.
2. Save its evaluation score (accuracy, RMSE, etc.).
3. Train the new model with the engineered features included.
4. Compare the results.

Ask yourself:

• Did the score improve?  
• Which new feature might be most useful?

Outcome  
You understand whether your new features improved the model.

────────────────────────
Step 6: Document what you created
────────────────────────

At the end of the notebook, write a short summary.

Include:

• list of baseline features  
• list of engineered features  
• why you created them  
• whether they improved the model

Example summary:

"I created three new features: salary_per_year_experience, experience_level, and promotion_gap_years.  
The model accuracy improved from 72% to 78%, suggesting these features added useful signal."

Outcome  
A well-documented feature engineering step that strengthens your model.
`
},
  { 
  task: "Train a baseline model and evaluate it with clear metrics", 
  duration: 3,
  explanation: `
Before improving a machine learning model, you need a **baseline**.

A baseline model is a simple first version of a model.  
It gives you a reference point so you can measure whether later improvements actually help.

Without a baseline, you cannot tell if your model is good or just looks good.

The goal of this task is to:
• train one simple model  
• evaluate it using appropriate metrics  
• record the results clearly  

Later tasks will try to improve on this baseline.

────────────────────────
Step 1: Split your dataset into training and test data
────────────────────────

Machine learning models should be evaluated on **data they have not seen before**.

This helps ensure the model is actually learning patterns rather than memorising the dataset.

Step-by-step

1. Import the train-test split function.

2. Split your data into:
   • training data (used to train the model)  
   • test data (used to evaluate performance)

A common split is:

• 80% training data  
• 20% test data

Example logic:

X = features  
y = target variable

Then split the dataset into X_train, X_test, y_train, y_test.

Outcome  
Your data is properly separated so evaluation is realistic.

────────────────────────
Step 2: Train a simple baseline model
────────────────────────

Your first model should be **simple and easy to understand**.

You do not need a complex algorithm yet.

Examples of beginner-friendly models:

Classification tasks
• Logistic Regression  
• Decision Tree  

Regression tasks
• Linear Regression  
• Decision Tree Regressor  

Step-by-step

1. Import a model from scikit-learn.
2. Initialise the model.
3. Train the model using the training data.

Example process:

model.fit(X_train, y_train)

This step allows the model to learn patterns from the data.

Outcome  
You now have a trained baseline model.

────────────────────────
Step 3: Make predictions on the test data
────────────────────────

Next, use the model to make predictions on the **test dataset**.

This simulates how the model would perform in the real world.

Step-by-step

1. Use the model to generate predictions.

Example:

predictions = model.predict(X_test)

2. Save these predictions for evaluation.

Outcome  
You now have predicted values that can be compared to the real values.

────────────────────────
Step 4: Choose the correct evaluation metric
────────────────────────

Different tasks require different evaluation metrics.

Choose a metric that matches your prediction task.

Classification tasks
(when predicting categories such as yes/no)

Common metrics:

• Accuracy  
How often the model is correct overall.

• F1 score  
Balances precision and recall, useful when classes are imbalanced.

• ROC-AUC  
Measures how well the model separates the classes.

Regression tasks
(when predicting numbers)

Common metrics:

• MAE (Mean Absolute Error)  
Average size of prediction errors.

• RMSE (Root Mean Squared Error)  
Similar to MAE but penalises large errors more strongly.

Choose **one or two metrics**, not many.

Outcome  
You know exactly how model performance will be measured.

────────────────────────
Step 5: Evaluate the model
────────────────────────

Now calculate the evaluation metric using the test data.

Step-by-step

1. Compare predictions with the real values.
2. Calculate your chosen metric.
3. Print the results clearly in the notebook.

Example result:

Accuracy: 0.74  
F1 score: 0.69  

or

MAE: 5.3  
RMSE: 7.8

Make sure the result is easy to read.

Outcome  
You have a clear measurement of how the model performs.

────────────────────────
Step 6: Interpret the results
────────────────────────

Numbers alone are not enough.  
Good analysts explain what the results mean.

Write **three short bullet points** in your notebook:

• What looks decent about the model?  
• What looks weak or disappointing?  
• What might improve the model next?

Example reflection:

• The model predicts most cases correctly but struggles with minority cases.  
• The error is still relatively large for high values.  
• Feature engineering or additional variables might improve predictions.

Outcome  
You begin thinking like a data scientist rather than just running code.

────────────────────────
Outcome
────────────────────────

At the end of this task you will have:

• a trained baseline model  
• clearly defined evaluation metrics  
• a realistic performance score  
• written notes explaining the results  

This baseline becomes your **reference point**.

In later tasks you will try to improve the model through:

• better features  
• different algorithms  
• tuning parameters

Without a baseline, improvements are impossible to measure.
`
},
  { 
  task: "Explainability: simple feature importances", 
  duration: 2,
  explanation: `
A model is only useful if you can explain it.

At this point you already have:
• a dataset cleaned
• a baseline model trained
• evaluation results recorded

Now you will answer a key question:

“Which features are most influencing the model’s predictions?”

This step helps you:
• produce insights (not just a score)
• catch mistakes (like a feature that is secretly giving away the answer)
• build trust in your results

You will keep this simple and beginner-friendly.

────────────────────────
Step 1: Choose your explainability method
────────────────────────

Pick ONE method depending on your model type.

Option A: Built-in feature importance (easiest)
Use this if your model is:
• Decision Tree
• Random Forest
• Gradient Boosting

These models often provide a ready-made importance score.

Option B: Coefficients (for linear models)
Use this if your model is:
• Linear Regression
• Logistic Regression

These models have coefficients. A larger absolute coefficient usually means more influence.

Option C: Permutation importance (works for almost any model)
This method asks:
“What happens to performance if we shuffle one feature?”

If shuffling a feature makes performance worse, that feature was important.

Outcome
You choose one simple approach appropriate for your model.

────────────────────────
Step 2: Create a ranked top-10 list
────────────────────────

Your goal is a clear table (or list) of the most important features.

Step-by-step
1. Calculate importance scores using your chosen method.
2. Build a small table with two columns:
   • feature_name
   • importance_score
3. Sort by importance_score (highest first).
4. Keep only the top 10 features.

Make sure feature names are readable.
If your dataset has many one-hot encoded columns, keep them grouped if possible.

Outcome
A ranked list of the top 10 drivers.

────────────────────────
Step 3: Visualise feature importance
────────────────────────

Create a simple bar chart.

Step-by-step
1. Plot the top 10 features.
2. Add:
   • chart title
   • axis labels
3. Keep it readable:
   • horizontal bars often work best for long feature names

Outcome
A visual summary of what matters most to the model.

────────────────────────
Step 4: Write short interpretation notes (top 3 features)
────────────────────────

Under your chart, write 3 short notes:

For each of the top 3 features:
• What does this feature represent in the real world?
• Why might it help the model predict the target?
• Does it match your intuition?

Example writing style:

“Feature: years_experience
This likely matters because more experience often correlates with higher seniority and salary.”

Keep it simple. You’re practising interpretation, not writing an academic paper.

Outcome
Clear insight into what’s driving predictions.

────────────────────────
Step 5: Flag suspicious drivers (important trust check)
────────────────────────

Sometimes the “most important” feature is actually a warning sign.

Check your top 10 list for features that could be suspicious, for example:

• anything that looks too close to the target variable name
• anything that could only exist after the outcome happens
• IDs (user_id, employee_id) that should not predict outcomes
• columns that indirectly reveal the answer (like “final_grade” when predicting “passed”)

Step-by-step
1. Highlight any suspicious feature names.
2. Write a note:
   • why it might be suspicious
   • what you would do next (remove it and re-train, or investigate)

Outcome
You confirm whether the model is learning legitimate patterns or “cheating”.

────────────────────────
Deliverable (what to include in your notebook)
────────────────────────

Your notebook should include:

• top 10 ranked feature importance table/list
• a bar chart visualisation
• 3 interpretation notes on key drivers
• a “suspicious features” check section

────────────────────────
Outcome
────────────────────────

You now have a clear understanding of:

• what influences the model
• what the model is actually learning
• whether the results are trustworthy enough to use

This is the bridge between “I built a model” and “I can explain and defend this model.”
`
},
{ 
  task: "Create a simple dashboard with your key visualisations", 
  duration: 3,
  explanation: `
Your analysis becomes valuable when other people can understand it quickly.

Instead of scrolling through a long notebook, a dashboard highlights the **most important charts and insights in one place**.

Your goal is to select the most important visualisations and present them in a clean, shareable format.

────────────────────────
Step 1: Select your headline visualisations
────────────────────────

Review your analysis notebook and identify the charts that best answer your project questions.

Choose **3–5 visualisations** that communicate the most important insights.

Typical categories include:

• trends over time (line charts)  
• distributions (histograms or box plots)  
• rankings (bar charts)  
• group comparisons (category comparisons)  
• relationships between variables (scatter plots)

Ask yourself:

• Which charts clearly answer my analytical questions?  
• Which charts reveal the most interesting patterns?

Outcome  
A shortlist of the most important visuals from your project.

────────────────────────
Step 2: Clean up the charts
────────────────────────

Charts used for communication should be easy to understand.

Improve each chart by ensuring it includes:

• clear titles  
• labelled axes  
• readable text  
• appropriate colours  
• legends if needed

Avoid clutter.

Make sure the chart can be understood **without reading the code**.

Outcome  
Professional-looking visualisations.

────────────────────────
Step 3: Combine the charts into one dashboard
────────────────────────

Now combine the charts into one shareable format.

Choose one option:

Option 1: Notebook section
Create a dedicated notebook section called:

"Project Dashboard"

Place the 3–5 charts together in one clean section.

Option 2: Streamlit app
Use Streamlit to create a simple interactive dashboard.

Option 3: Slides or HTML
Export charts into a slide deck or simple HTML report.

For beginners, **a well-structured notebook section is perfectly fine**.

Outcome  
A single place where someone can view all key insights.

────────────────────────
Step 4: Add short insights for each chart
────────────────────────

Under each visualisation, write **1–2 bullet points explaining what the chart shows**.

Example format:

• What pattern does the chart reveal?  
• Why might this pattern exist?

Example writing style:

"Leadership representation increases steadily after 2018, suggesting growing diversity initiatives in this sector."

Keep explanations short and clear.

Outcome  
Your charts now communicate **insights, not just data**.

────────────────────────
Step 5: Export or share the dashboard
────────────────────────

Make your dashboard easy to share.

Options include:

• exporting the notebook as HTML or PDF  
• publishing a Streamlit app  
• including screenshots in your project README

Outcome
A shareable dashboard that communicates your insights clearly without needing to rerun the analysis.
`
},
  { 
  task: "Write a clear summary of findings and limitations", 
  duration: 2,
  explanation: `
A strong data project explains not only what you found, but also what the data cannot tell you.

Good analysts communicate insights clearly and acknowledge limitations honestly.

This task turns your analysis into a **short, readable report**.

────────────────────────
Step 1: Write three key findings
────────────────────────

Review your analysis and identify the **three most important insights**.

Each finding should be supported by:

• a chart  
• a table  
• or a model result

Example structure:

Finding 1  
• What pattern did you observe?  
• Which visualisation supports it?

Finding 2  
• What comparison or trend stands out?

Finding 3  
• What factor appears to influence the outcome?

Keep each finding **2–3 sentences maximum**.

Outcome  
A concise explanation of the most important results.

────────────────────────
Step 2: Explain the practical implications
────────────────────────

Insights are valuable when they answer the question:

"So what?"

Write **1–2 practical implications** of your findings.

Examples:

• What could a company learn from this?  
• What decision might change because of this insight?  
• What trend should people pay attention to?

Outcome  
Your analysis connects data to real-world decisions.

────────────────────────
Step 3: Identify limitations of the analysis
────────────────────────

No dataset is perfect.

Strong analysts acknowledge potential weaknesses.

Write **2–3 limitations**, such as:

• missing data  
• small sample size  
• potential bias in the dataset  
• variables that were not available  
• proxy variables that may not capture the real concept

Example:

"The dataset does not include regional economic conditions, which may influence salary patterns."

Outcome  
A transparent discussion of what your analysis cannot fully explain.

────────────────────────
Step 4: Suggest next steps
────────────────────────

Think about what you would do if you had more time or data.

Possible next steps include:

• collecting additional variables  
• analysing a longer time period  
• testing additional machine learning models  
• expanding the dataset to other regions or industries

Write **2–3 possible next steps**.

Outcome  
A forward-looking conclusion that shows analytical thinking.

────────────────────────
Outcome
────────────────────────

You now have a clear project summary that includes:

• key insights  
• real-world implications  
• honest limitations  
• ideas for future work

This type of write-up demonstrates **critical thinking and communication skills**, which are essential for data roles.
`
},
  { 
  task: "Prepare your repository so others can run the project", 
  duration: 1.5,
  explanation: `
A strong portfolio project should be easy for other people to run.

If a recruiter or reviewer clones your repository, they should be able to follow clear steps and reproduce your results.

This task focuses on making your project **clean, organised, and reproducible**.

────────────────────────
Step 1: Add a requirements file
────────────────────────

Create a file called:

requirements.txt

List the Python libraries used in your project.

Examples:

pandas  
numpy  
matplotlib  
seaborn  
scikit-learn  

If possible, include version numbers.

This ensures other users install the same dependencies.

Outcome  
Your project environment can be recreated.

────────────────────────
Step 2: Add an environment example file (optional)
────────────────────────

If your project uses environment variables (API keys, tokens, etc.):

Create a file called:

.env.example

Include placeholder variables such as:

API_KEY=your_api_key_here

Never upload real secrets.

Outcome  
Other users understand which environment variables are required.

────────────────────────
Step 3: Write clear run instructions
────────────────────────

In your README, add a section called:

How to Run the Project

Include steps such as:

1. Clone the repository  
2. Install dependencies  
3. Open the notebook or run the app  

Example structure:

Install dependencies  
Run analysis notebook  
Launch dashboard

Outcome  
Anyone can follow your instructions.

────────────────────────
Step 4: Organise the project structure
────────────────────────

Create a simple folder structure.

Example:

project_folder/

data/  
notebooks/  
src/  
outputs/  

This keeps files organised and easier to navigate.

Outcome  
A clean, professional repository structure.

────────────────────────
Step 5: Test your instructions
────────────────────────

Pretend you are a new user.

Ask yourself:

• Could someone understand the project from the README alone?  
• Are the instructions clear?  
• Do the files run without errors?

If possible, test the instructions in a fresh environment.

Outcome
A portfolio-quality repository that others can easily run and review.
`
},
 { 
  task: "Publish your notebook or dashboard online", 
  duration: 2,
  explanation: `
Your project becomes valuable when it is visible.

Publishing your work allows recruiters, hiring managers, and peers to see what you have built.

The goal is to create a **public artifact that demonstrates your skills clearly.**

────────────────────────
Step 1: Choose a publishing format
────────────────────────

Pick one of the following options.

Option 1: Notebook export  
Export your notebook as:

• HTML  
• PDF  

Option 2: Streamlit dashboard  
Create a simple interactive app using Streamlit.

Option 3: GitHub preview  
Ensure your notebook renders clearly inside GitHub.

For beginners, **exporting the notebook or building a small Streamlit app is sufficient.**

Outcome  
A chosen format for sharing your project.

────────────────────────
Step 2: Add a clear introduction
────────────────────────

At the beginning of the notebook or app, add a short introduction explaining:

• what dataset you used  
• what questions you analysed  
• what the main findings were

Keep it short (4–6 sentences).

Outcome  
Readers immediately understand the purpose of the project.

────────────────────────
Step 3: Ensure visuals are readable
────────────────────────

Check your charts and dashboard carefully.

Make sure:

• text is readable  
• axis labels are clear  
• titles explain the chart  
• colours are consistent

Outcome  
Visualisations that communicate clearly.

────────────────────────
Step 4: Publish and share the link
────────────────────────

Publish your project.

Examples:

• GitHub repository  
• Streamlit Cloud app  
• exported notebook hosted online

Add the public link to:

• your README  
• your portfolio  
• your LinkedIn profile

Outcome  
Your work is publicly visible.

────────────────────────
Step 5: Add a short "How to use this project" section
────────────────────────

Explain how someone should interact with the project.

Examples:

• how to navigate the dashboard  
• how to run the notebook  
• what questions the project answers

Outcome
A polished, public project that demonstrates your skills and can be easily shared with recruiters.
`
}
],


  projects_frontend: [

{
  task: "Choose a project idea and write a short product brief",
  duration: 2,
  id: "tech_switch.projects_frontend.project_brief",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "doc" },
  explanation: `
A product brief is your “build contract” with yourself.
It prevents scope creep, confusion, and half-finished projects.

You are aiming for a small app with 3 pages:
• List page (browse + filter)
• Detail page (view one item)
• Create/Edit page (form)

────────────────────────
Step 1: Pick ONE project idea
────────────────────────

Choose one:
• Job application tracker
• Habit tracker
• Personal book/movie library
• Simple KPI dashboard

Rule:
Pick the one where you can describe the data easily in plain English.

Example data you can imagine:
• Job tracker: company, role, status, date applied, notes
• Habit tracker: habit name, frequency, last done date, streak
• Library: title, rating, category, notes
• KPI dashboard: date, metric value, channel/market/category

────────────────────────
Step 2: Write a 1-sentence purpose statement
────────────────────────

Fill this in:
“This app helps [USER] to [GOAL] by [HOW].”

Examples:
• “This app helps job seekers track applications and interview stages by keeping statuses and notes in one place.”
• “This app helps people stay consistent with habits by tracking streaks and last completed dates.”

────────────────────────
Step 3: Define the user in 2 lines
────────────────────────

Write:
1) Who they are
2) What problem they have

Example:
• “A job seeker applying to multiple roles.”
• “They lose track of where they applied and what stage each application is in.”

────────────────────────
Step 4: Lock the 3 pages you will build
────────────────────────

Write exactly these three (no extra pages):
1) List page
   • shows all items
   • includes search + filter + sort
2) Detail page
   • shows one item fully
   • includes an Edit button
3) Create/Edit page
   • a form to add a new item OR edit an existing one

If you want extra pages later, put them in “Future ideas” (not in scope).

────────────────────────
Step 5: Define 5 core features (must be specific)
────────────────────────

Write five features that are easy to test.

Good examples:
• Search items by title/name
• Filter items by status/category
• Sort items by newest/oldest (or A–Z)
• Open a detail view from the list
• Create a new item and see it appear in the list
• Edit an item and see it update in the list + detail

Avoid vague features like:
• “Make it look nice”
• “Add lots of functionality”

────────────────────────
Step 6: Write 3 out-of-scope items (to protect your time)
────────────────────────

Pick three “NOT doing this” items.

Examples:
• No user accounts / login
• No payments
• No admin dashboard
• No complex animations
• No backend database (for now)

This is what keeps the project finishable.

────────────────────────
Step 7: Choose your data source (pick the simplest option)
────────────────────────

Pick ONE:
Option A: Local JSON file (recommended)
• You will create /data/items.json with 8–12 example items.
• This lets you build UI and logic without API issues.

Option B: Public API
• Only choose this if you already know the API is stable and easy.
• You still need a fallback plan if the API is rate-limited or unreliable.

────────────────────────
Step 8: Define “done” (your finish line)
────────────────────────

Write 3 “done criteria”:
• “I can add an item using the form, refresh the page, and still see it.”
• “I can search and filter the list and the results update correctly.”
• “I can open a detail page directly via URL and it loads the correct item.”

────────────────────────
Step 9: Save the brief as a deliverable
────────────────────────

1. Create a doc called: “Frontend Project Brief”
2. Paste these sections (in order):
   • Purpose statement
   • User definition
   • Pages
   • Core features
   • Out of scope
   • Data source
   • Done criteria
3. Save it in your project folder (or your Learning Hub if you use one).

Outcome
A clear, locked project scope that you can build without second-guessing.

Deliverable
A short product brief document you can reference while coding.
`
},


{
  task: "Create the project and set up the development structure",
  duration: 2.5,
  id: "tech_switch.projects_frontend.scaffold",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "repo" },
  explanation: `
A clean setup saves hours later.
This task is about getting a working app + a folder structure you won’t regret.

Recommended stack (simple + common):
• Vite + React
• React Router

────────────────────────
Step 1: Create the project
────────────────────────

1. Open a terminal in the folder where you want the project.
2. Run:
   npm create vite@latest
3. Choose:
   • Project name: something simple (e.g. "job-tracker")
   • Framework: React
   • Variant: JavaScript (or TypeScript if you prefer)

────────────────────────
Step 2: Install and run it
────────────────────────

1. Go into the folder:
   cd job-tracker
2. Install dependencies:
   npm install
3. Start the dev server:
   npm run dev
4. Open the URL shown in the terminal and confirm you see the starter page.

If you get errors:
• Close the dev server (Ctrl + C), run npm install again, then npm run dev.

────────────────────────
Step 3: Install React Router
────────────────────────

1. Stop the server (Ctrl + C).
2. Install:
   npm install react-router-dom
3. Restart:
   npm run dev

────────────────────────
Step 4: Create a clean folder structure
────────────────────────

Inside /src create:

/components  
/pages  
/services  
/utils  
/styles  
/data  

Rule of thumb:
• pages = full screens
• components = reusable UI pieces
• services = data loading (API/local storage)
• utils = helper functions
• data = seed JSON

────────────────────────
Step 5: Add a basic layout shell
────────────────────────

1. Create a simple header + main container (can be inside App.jsx for now).
2. Put the app name in the header.
3. Leave space for navigation links (you will add them in the next task).

────────────────────────
Step 6: Set up Git properly
────────────────────────

1. In terminal:
   git init
2. Make sure node_modules is ignored:
   • check there is a .gitignore (Vite usually creates one)
3. First commit:
   git add .
   git commit -m "initial project scaffold"

Outcome
A running React project with sensible folders and a clean first commit.

Deliverable
A GitHub repo with the scaffolded project.

Free Tools
Node.js, Vite, Git, VS Code
`
},

{
  task: "Add routing and create the main application pages",
  duration: 2,
  id: "tech_switch.projects_frontend.routing",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
Routing proves you can build multi-page apps with real navigation.
You are creating the three pages your project will rely on.

────────────────────────
Step 1: Create the page files
────────────────────────

Create these files in /src/pages:

• ListPage.jsx  
• DetailPage.jsx  
• FormPage.jsx  

Add placeholder content to each, e.g.
<h1>List</h1>, <h1>Detail</h1>, <h1>Form</h1>

────────────────────────
Step 2: Set up BrowserRouter
────────────────────────

1. Open main.jsx (or index.jsx depending on Vite version).
2. Wrap <App /> in <BrowserRouter>.

Tip:
If you are unsure, search within your project for "createRoot" and add BrowserRouter around App there.

────────────────────────
Step 3: Create routes in App.jsx
────────────────────────

Create routes:

/ → ListPage  
/item/:id → DetailPage  
/new → FormPage  
/edit/:id → FormPage  

Make sure you can visit each URL manually in the browser.

────────────────────────
Step 4: Add navigation links
────────────────────────

1. Add two links in your header:
   • "All items" → /
   • "Add new" → /new
2. Click each link and confirm it changes the URL and page content.

────────────────────────
Step 5: Commit
────────────────────────

git add .
git commit -m "add routing + core pages"

Outcome
Three pages exist, routing works, navigation links work.

Deliverable
A working list/detail/form page structure with routes.
`
},

{
  task: "Create reusable interface components",
  duration: 2.5,
  id: "tech_switch.projects_frontend.ui_components",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
Reusable components prevent messy UI and repeated code.
You will create a mini component set you can reuse everywhere.

────────────────────────
Step 1: Create the component files
────────────────────────

In /src/components create:

• Button.jsx  
• Input.jsx  
• Card.jsx  

────────────────────────
Step 2: Build Button.jsx
────────────────────────

1. Support variants:
   • primary
   • secondary
2. Support disabled state.
3. Accept props:
   • children (button text)
   • onClick
   • disabled
   • variant

Minimal goal:
A button that looks consistent across the app.

────────────────────────
Step 3: Build Input.jsx
────────────────────────

1. Include:
   • label
   • input
   • optional helper/error text
2. Accept props:
   • label
   • value
   • onChange
   • placeholder
   • error (string)

Rule:
Errors should appear under the input, not as popups.

────────────────────────
Step 4: Build Card.jsx
────────────────────────

1. Make it a simple container with:
   • padding
   • border
   • rounded corners
2. Use Card for list items and for detail sections.

────────────────────────
Step 5: Add simple styling
────────────────────────

1. Create /src/styles/base.css (or App.css if you already have it).
2. Add basic spacing + typography.
3. Make sure text is readable and the layout has breathing room.

────────────────────────
Step 6: Replace raw HTML on your pages
────────────────────────

1. Replace <button> with <Button>
2. Replace <input> with <Input>
3. Wrap list items with <Card>

────────────────────────
Step 7: Commit
────────────────────────

git add .
git commit -m "add reusable UI components"

Outcome
A consistent UI system you can reuse across every page.

Deliverable
Button, Input, Card components integrated into pages.
`
},

{
  task: "Create a data source and render the list page",
  duration: 3,
  id: "tech_switch.projects_frontend.list_page",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
You need data to build the UI.
Start with a local JSON file so you can focus on the app flow.

────────────────────────
Step 1: Create your seed data file
────────────────────────

Create:
/src/data/items.json

Add 8–12 items.

Minimum fields to include:
• id (unique)
• title (string)
• status (string)
• category (string)
• createdAt (string date)
• notes (string)

Example (shape only, adjust values):
{
  "id": "1",
  "title": "Applied to Frontend role",
  "status": "Applied",
  "category": "Job",
  "createdAt": "2026-03-01",
  "notes": "Referred by a friend"
}

────────────────────────
Step 2: Load the data into ListPage
────────────────────────

1. Import items.json in ListPage.
2. Store it in state (even if it’s static for now).
   Why: you’ll later update it via forms.

────────────────────────
Step 3: Render a list
────────────────────────

1. Use map() to render each item.
2. Display each item inside a Card:
   • title
   • status
   • category
   • createdAt (optional on list)

────────────────────────
Step 4: Make items clickable
────────────────────────

1. Wrap each Card with a Link to:
   /item/:id
2. Confirm clicking an item takes you to a detail URL like:
   /item/1

────────────────────────
Step 5: Add “no data” handling
────────────────────────

If items array is empty, show:
• “No items yet, add one.”

────────────────────────
Step 6: Commit
────────────────────────

git add .
git commit -m "render list from seed data"

Outcome
A real list page that displays structured data and links to detail routes.

Deliverable
List page rendering items from /data/items.json.
`
},

{
  task: "Add search, filtering, and sorting",
  duration: 4.5,
  id: "tech_switch.projects_frontend.filters",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
This is a core frontend skill: take a dataset and transform it based on user inputs.
You will build this in a specific order so it doesn’t get confusing.

────────────────────────
Step 1: Add search (text input)
────────────────────────

1. Add an Input above your list with placeholder “Search…”
2. Create state:
   • searchText
3. Filter items by title:
   • convert both title and searchText to lowercase
   • check includes()

Test:
Type a few letters and confirm the list updates.

────────────────────────
Step 2: Add a dropdown filter
────────────────────────

Pick ONE filter type:
• status (Applied / Interview / Offer etc.)
OR
• category (Work / Personal / Health etc.)

1. Add a <select> (or your Input component variant if you have one).
2. Create state:
   • selectedFilter
3. Apply the filter:
   • if “All”, show everything
   • otherwise only show matching items

────────────────────────
Step 3: Add sorting
────────────────────────

Pick ONE sorting approach:
• “Newest first” using createdAt
OR
• “A–Z” using title

1. Add a sort dropdown.
2. Create state:
   • sortMode
3. Apply sorting after filtering.

Important:
Do not mutate the original array. Make a copy before sorting.

────────────────────────
Step 4: Add Reset
────────────────────────

1. Add a button “Reset”.
2. Reset:
   • searchText = ""
   • selectedFilter = "All"
   • sortMode = default

────────────────────────
Step 5: Add a results count
────────────────────────

Show:
“Showing X of Y”

Where:
• Y = total items
• X = filtered items count

────────────────────────
Step 6: Commit
────────────────────────

git add .
git commit -m "add search + filter + sort"

Outcome
A list page that behaves like real apps: searchable, filterable, sortable.

Deliverable
Search + filter + sort working together.
`
},

{
  task: "Build the detail page",
  duration: 3.5,
  id: "tech_switch.projects_frontend.detail",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
The detail page proves you can read route params and show a clean “single item” view.

────────────────────────
Step 1: Read the id from the URL
────────────────────────

1. In DetailPage, use the router hook to read :id.
2. Confirm it prints correctly (you can temporarily console.log it).

────────────────────────
Step 2: Find the matching item
────────────────────────

1. Load your items list (from state, context, or imported JSON for now).
2. Find the item where item.id matches the id from the URL.

Tip:
Route params are strings. If your id is numeric, convert carefully.

────────────────────────
Step 3: Handle “not found”
────────────────────────

If no item matches:
• show “Item not found”
• add a link back to the list

This matters because users can type random URLs.

────────────────────────
Step 4: Display content in clear sections
────────────────────────

Use two Cards:

Card 1: Overview
• title
• status
• category
• createdAt

Card 2: Notes
• notes (or “No notes yet”)

────────────────────────
Step 5: Add actions
────────────────────────

Add two buttons:
• Edit → /edit/:id
• Back → /

────────────────────────
Step 6: Commit
────────────────────────

git add .
git commit -m "build detail page"

Outcome
A structured detail view with correct routing and edge case handling.

Deliverable
Detail page that loads the correct item from the URL.
`
},

{
  task: "Add create and edit functionality using a form",
  duration: 5,
  id: "tech_switch.projects_frontend.form",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
This task turns your UI into an actual product.
You will build ONE FormPage that supports both Create and Edit.

────────────────────────
Step 1: Decide your fields (keep it small)
────────────────────────

Use these fields:
• title (text, required)
• status (select, required)
• category (text or select, optional)
• notes (textarea, optional)
• createdAt (auto-set on create)

────────────────────────
Step 2: Create mode (/new)
────────────────────────

1. When URL is /new:
   • form starts empty
2. On Save:
   • validate required fields
   • create a new item with a new id
   • add it to items list
   • navigate back to the list

Validation rules:
• title must not be empty
• status must be chosen (not “Select…”)

Errors:
Show them under the fields.

────────────────────────
Step 3: Edit mode (/edit/:id)
────────────────────────

1. When URL is /edit/:id:
   • read id from route
   • find the existing item
2. Pre-fill form inputs with existing values.
3. On Save:
   • validate required fields
   • update the item in the list (replace the matching id)
   • navigate to /item/:id or back to list

If item not found:
Show “Item not found” + link back.

────────────────────────
Step 4: Add Cancel
────────────────────────

Add a Cancel button that:
• returns to the list
• does not save changes

────────────────────────
Step 5: Commit in stages
────────────────────────

Commit 1 (optional): "create form page layout"
Commit 2: "add create flow"
Commit 3: "add edit flow"

Outcome
Users can add items and edit items using a real form with validation.

Deliverable
Create/Edit form working across /new and /edit/:id.
`
},

{
  task: "Store data using localStorage",
  duration: 2.5,
  id: "tech_switch.projects_frontend.localstorage",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
localStorage makes your app feel real because it remembers changes after refresh.
You will store the items list as JSON.

────────────────────────
Step 1: Choose a storage key
────────────────────────

Use one key string consistently, e.g.:
"projects_frontend_items"

────────────────────────
Step 2: Load from localStorage on app start
────────────────────────

1. On first render:
   • try to read localStorage.getItem(key)
2. If a value exists:
   • JSON.parse it into an array
3. If nothing exists:
   • use your seed items.json as the starting dataset

Safety tip:
Wrap JSON.parse in try/catch to avoid crashing if storage is corrupted.

────────────────────────
Step 3: Save to localStorage whenever items change
────────────────────────

1. When you add/edit an item:
   • update your items state
2. After state changes:
   • localStorage.setItem(key, JSON.stringify(items))

────────────────────────
Step 4: Test properly
────────────────────────

1. Add a new item.
2. Refresh the page.
3. Confirm it is still there.
4. Edit an existing item.
5. Refresh again and confirm changes remain.

────────────────────────
Step 5: Add an optional “Reset data” button
────────────────────────

This is helpful for demos:
1. localStorage.removeItem(key)
2. reload items from seed data

────────────────────────
Step 6: Commit
────────────────────────

git add .
git commit -m "persist items in localStorage"

Outcome
Your app keeps user-created data across refreshes.

Deliverable
localStorage persistence working end-to-end.
`
},

{
  task: "Improve interface quality with loading, empty, and error states",
  duration: 3,
  id: "tech_switch.projects_frontend.states",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "code" },
  explanation: `
Professional apps communicate clearly when something is loading, empty, or broken.
You will add states on the list page and detail page.

────────────────────────
Step 1: Add a loading state
────────────────────────

Even with local data, implement the pattern:

1. Create state:
   • isLoading
2. Set isLoading = true initially.
3. Use a short timeout (e.g. 300–500ms) to simulate fetch:
   • then set isLoading = false
4. While loading:
   • show “Loading…” or skeleton cards

────────────────────────
Step 2: Add empty states
────────────────────────

List page:
• If there are 0 items total:
  “No items yet, add one.”

Filtered empty:
• If filters return 0 results:
  “No results, try clearing filters.”

Detail page:
• If item not found:
  “Item not found” + link back

────────────────────────
Step 3: Add safe error handling for parsing/storage
────────────────────────

If you use localStorage:
1. Wrap JSON.parse in try/catch
2. If parsing fails:
   • clear the bad storage key
   • fall back to seed data
   • show a small message like:
     “Data reset due to an error.”

────────────────────────
Step 4: Make the UI helpful (not vague)
────────────────────────

Every state message should include a next action:
• “Add a new item”
• “Reset filters”
• “Back to list”

────────────────────────
Step 5: Commit
────────────────────────

git add .
git commit -m "add loading/empty/error states"

Outcome
Your app stays calm and clear under real-world conditions.

Deliverable
Loading, empty, and error states on key screens.
`
},

{
  task: "Deploy the project and create documentation",
  duration: 3.5,
  id: "tech_switch.projects_frontend.deploy",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "public_link" },
  explanation: `
Deploying + documentation is what turns “code” into “portfolio”.
You are making it easy for someone to open the app and understand it fast.

────────────────────────
Step 1: Prepare the project for deployment
────────────────────────

1. Make sure:
   • npm run dev works
   • no console errors on load
2. Run a production build locally:
   npm run build
3. Preview the build:
   npm run preview
4. Confirm the app still works.

────────────────────────
Step 2: Deploy (choose ONE platform)
────────────────────────

Option A: Vercel
1. Push your repo to GitHub.
2. Import repo in Vercel.
3. Framework preset: Vite/React
4. Deploy.

Option B: Netlify
1. Push repo to GitHub.
2. Import repo in Netlify.
3. Build command: npm run build
4. Publish directory: dist
5. Deploy.

────────────────────────
Step 3: Test the live version properly
────────────────────────

Checklist:
□ List loads
□ Search/filter/sort works
□ Clicking an item opens details
□ /item/:id works if you paste URL directly
□ Create works
□ Edit works
□ Refresh does not break localStorage data

────────────────────────
Step 4: Write the README (copy this structure)
────────────────────────

Add these exact sections:

1) What it is (2–3 sentences)
2) Features (bullets)
3) Tech stack (bullets)
4) Screenshots (2–4)
5) How to run locally:
   • npm install
   • npm run dev
6) How to build:
   • npm run build
7) What I’d improve next (3 bullets)

────────────────────────
Step 5: Commit + pin
────────────────────────

1. Commit README + any deploy fixes:
   git add .
   git commit -m "deploy + documentation"
2. Pin the repo on GitHub.
3. Add the live link to the repo description.

Outcome
A live project that is easy to test, understand, and evaluate quickly.

Deliverable
Deployed link + strong README + screenshots.

Free Tools
GitHub, Vercel or Netlify
`
},

{
  task: "Prepare a short case study describing the project",
  duration: 2,
  id: "tech_switch.projects_frontend.case_study",
  meta: { roadmap: "tech_switch", theme: "projects_frontend", type: "project", deliverable: "doc" },
  explanation: `
A case study helps you explain your work clearly in interviews.
It’s also what turns your project into a story (not just code).

Keep it short. Aim for 1 page.

────────────────────────
Step 1: Write the structure (use these headings)
────────────────────────

1) Problem
• What was frustrating or messy for the user?

2) Solution
• What does your app do, in plain language?

3) Key features
• 5 bullets maximum.

4) Screens
• List page: what it shows and why
• Detail page: what it shows and why
• Create/Edit: what it allows

5) Challenges + fixes (pick ONE real challenge)
Examples:
• routing params type mismatch
• form validation logic
• localStorage parsing error
Explain:
• what broke
• how you debugged it
• what you changed

6) Trade-offs
Examples:
• used localStorage instead of backend
• kept scope to 3 pages to ship faster

7) Next improvements (3 bullets)
Examples:
• add backend + auth
• add tests
• add pagination
• improve accessibility further

────────────────────────
Step 2: Create “talking points” for interviews
────────────────────────

Write 6 bullets you can say out loud:
• what you built
• what you learned
• what you’re proud of
• what you’d improve
• how you handled bugs
• what you’d do with more time

────────────────────────
Step 3: Save it in your repo
────────────────────────

1. Create /docs/case-study.md (or put it in README if you prefer).
2. Link to it from the README.

Outcome
A clear story you can reuse in interviews, networking, and portfolio reviews.

Deliverable
1-page case study + 6 talking points.
`
}
],

projects_backend: [

{
task: "Write a backend project specification (API design)",
duration: 2,
explanation: `
Before writing backend code, define how your system will work.

Backend development is about designing how different parts of an application communicate. A short API specification prevents confusion and scope creep.

You will design the structure of your backend before building it.

────────────────────────
Step 1: Define who will use the API
────────────────────────

Think about which systems will interact with your backend.

Examples:
• A React web frontend  
• A mobile app  
• Another internal service  

Write 1–2 sentences describing the main consumer.

Example  
"This API will support a React frontend that allows users to manage tasks."

────────────────────────
Step 2: Define core resources
────────────────────────

Resources represent the main objects your application manages.

Examples:
• users  
• tasks  
• orders  
• products  
• notes  

Choose 2–4 resources for your project.

Example (task manager):
• users  
• tasks  

────────────────────────
Step 3: Design REST endpoints
────────────────────────

For each resource define the basic endpoints.

Example:

GET    /tasks  
GET    /tasks/:id  
POST   /tasks  
PATCH  /tasks/:id  
DELETE /tasks/:id  

Write endpoints in a simple list.

────────────────────────
Step 4: Define request and response structure
────────────────────────

For two endpoints describe the JSON structure.

Example request:

POST /tasks

{
"title": "Finish backend project",
"status": "in_progress"
}

Example response:

{
"id": 15,
"title": "Finish backend project",
"status": "in_progress",
"created_at": "2026-03-04"
}

Also note common status codes:

• 200 OK  
• 201 Created  
• 400 Bad Request  
• 404 Not Found  
• 401 Unauthorized  

────────────────────────
Step 5: Define authentication rules
────────────────────────

Decide which routes require login.

Example:

Public routes
• GET /posts

Protected routes
• POST /tasks
• DELETE /tasks/:id

────────────────────────
Outcome
────────────────────────

A clear API blueprint describing:

• API consumers  
• Core resources  
• REST endpoints  
• Request/response structure  
• Authentication rules

This document will guide your backend implementation.
`
},

{
task: "Design the database schema",
duration: 2,
explanation: `
Backend systems store structured data. Before writing code, define how that data will be organised.

────────────────────────
Step 1: List your entities
────────────────────────

Entities correspond to database tables.

Example (task manager):

• users  
• tasks  

────────────────────────
Step 2: Define fields for each entity
────────────────────────

Example:

users
• id
• email
• password_hash
• created_at

tasks
• id
• title
• description
• status
• user_id
• created_at

────────────────────────
Step 3: Define relationships
────────────────────────

Ask how entities connect.

Example:

One user → many tasks

So tasks table contains:

user_id → references users.id

────────────────────────
Step 4: Draw a simple schema diagram
────────────────────────

You can sketch this or use a tool.

Example:

users
|
| 1
|
tasks

────────────────────────
Outcome
────────────────────────

A clear database structure including:

• tables  
• fields  
• relationships  

This prevents messy database redesign later.
`
},

{
task: "Set up a backend project and framework",
duration: 1.5,
explanation: `
Now you will create the backend project environment.

You may use:

• Node.js + Express  
• FastAPI (Python)  
• Flask (Python)

Choose one stack and set up the project.

────────────────────────
Step 1: Create a project folder
────────────────────────

Example:

backend-project/

────────────────────────
Step 2: Initialise the project

Node example:

npm init -y

Install packages:

• express
• cors
• dotenv

Python example:

pip install fastapi uvicorn

────────────────────────
Step 3: Create main server file

Example structure:

server.js
routes/
controllers/
models/

────────────────────────
Step 4: Start a basic server

Example endpoint:

GET /health

Response:

{
"status": "API running"
}

────────────────────────
Outcome
────────────────────────

A working backend server running locally that responds to at least one test endpoint.
`
},

{
task: "Implement core API endpoints",
duration: 3,
explanation: `
Now you will build the main API endpoints from your specification.

Focus on one resource first.

Example: tasks

────────────────────────
Step 1: Create endpoints
────────────────────────

Implement:

GET /tasks
POST /tasks
GET /tasks/:id
PATCH /tasks/:id
DELETE /tasks/:id

────────────────────────
Step 2: Connect endpoints to database
────────────────────────

Each endpoint should perform a database operation.

Examples:

GET /tasks → return all tasks  
POST /tasks → create new task  
PATCH /tasks/:id → update task  

────────────────────────
Step 3: Validate inputs
────────────────────────

Ensure requests contain required fields.

Example:

title must exist

Return:

400 Bad Request

────────────────────────
Step 4: Test endpoints manually
────────────────────────

Use:

• Postman
• curl
• browser

────────────────────────
Outcome
────────────────────────

A functioning CRUD API for at least one resource.
`
},

{
task: "Add authentication and protected routes",
duration: 2.5,
explanation: `
Most real applications require authentication.

You will implement a basic login system.

────────────────────────
Step 1: Create user registration endpoint

POST /register

Inputs:

• email
• password

Store password securely (hashed).

────────────────────────
Step 2: Create login endpoint

POST /login

Return a token if credentials are correct.

Example:

JWT token

────────────────────────
Step 3: Protect routes

Add middleware that checks authentication token.

Example:

Authorization: Bearer TOKEN

────────────────────────
Step 4: Test protected endpoints

Try calling routes:

• with token
• without token

Ensure unauthorized requests fail.

────────────────────────
Outcome
────────────────────────

A backend that supports authentication and protected endpoints.
`
},

{
task: "Write API tests",
duration: 2,
explanation: `
Testing ensures your API behaves correctly and prevents regressions.

────────────────────────
Step 1: Choose a testing tool

Examples:

Node:
• Jest
• Supertest

Python:
• pytest

────────────────────────
Step 2: Write tests for endpoints

Example tests:

GET /tasks returns 200  
POST /tasks creates a task  
GET /tasks/:id returns correct object  

────────────────────────
Step 3: Test edge cases

Examples:

• invalid input  
• missing fields  
• unauthorized access  

────────────────────────
Step 4: Run the test suite

Confirm all tests pass.

────────────────────────
Outcome
────────────────────────

Automated tests that verify the core behaviour of your API.
`
},

{
task: "Deploy the backend API",
duration: 2,
explanation: `
Deployment turns your backend into a publicly accessible service.

────────────────────────
Step 1: Choose a hosting platform

Examples:

• Render  
• Railway  
• Fly.io  
• AWS  

────────────────────────
Step 2: Prepare environment variables

Store:

• database connection string
• secret keys

────────────────────────
Step 3: Deploy the service

Push code to GitHub and connect repository to hosting platform.

────────────────────────
Step 4: Verify deployment

Visit your API endpoint:

GET /health

Ensure it returns a response.

────────────────────────
Outcome
────────────────────────

A publicly deployed backend API accessible via URL.
`
},

{
task: "Document the API for users",
duration: 1.5,
explanation: `
Good documentation makes your project understandable to others.

────────────────────────
Step 1: Write API overview

Describe:

• what the API does  
• who it is for  

────────────────────────
Step 2: Document endpoints

For each endpoint include:

• method  
• path  
• parameters  
• example request  
• example response  

────────────────────────
Step 3: Add setup instructions

Explain how to run the project locally.

Include:

• installation  
• environment variables  
• start command  

────────────────────────
Step 4: Add deployment link

Provide the live API URL.

────────────────────────
Outcome
────────────────────────

A professional README explaining how the API works and how to use it.
`
},

],


projects_ai: [

  {
    task: "Choose an AI project idea and write a short project brief",
    duration: 2,
    explanation: `
AI is a broad field. Before building a project, decide which type of AI role you want to move toward.

Different roles focus on different types of systems: machine learning models, generative AI applications, or autonomous agents.

Choose ONE direction that interests you.

────────────────────────
Common AI career directions
────────────────────────

AI / Machine Learning Engineer  
Focus: training or applying ML models.

Example projects:
• Customer churn prediction model  
• Product recommendation system  
• Fraud detection model  
• Predictive demand forecasting

Generative AI Engineer (LLM applications)  
Focus: building applications powered by large language models.

Example projects:
• Document Q&A assistant (RAG)  
• Meeting transcript summariser  
• Job description → CV bullet generator  
• Customer support reply generator

AI Automation / Agent Engineer  
Focus: building autonomous systems that perform multi-step tasks.

Example projects:
• Research agent that gathers and summarises sources  
• Email triage and response assistant  
• AI workflow agent that analyses data and writes reports  
• Multi-tool assistant using APIs and tools

Applied AI / AI Product Engineer  
Focus: integrating AI into real user-facing products.

Example projects:
• AI search for a knowledge base  
• Smart support assistant  
• AI analytics copilot  
• AI feature for a productivity app

────────────────────────
Step-by-step
────────────────────────

1. Choose ONE AI direction from the list above.

2. Choose ONE project idea that fits that direction.

3. Write a short project brief containing:

• The user  
• The problem the AI solves  
• The main input to the system  
• The output the AI produces

Example

User: product manager  
Problem: long meeting transcripts are hard to review  
Input: meeting transcript text  
Output: summary + action items

4. Write 2–3 success criteria.

Examples:
• summaries must be short and readable  
• answers must reference source documents  
• classifications must match the expected label

5. Keep the project scope small enough to complete within a few weeks.

────────────────────────
Outcome
────────────────────────

A clearly defined AI project aligned with a real AI career direction and a concrete user problem.
`
  },

  {
    task: "Define the project workflow, inputs, and outputs",
    duration: 1.5,
    explanation: `
Strong AI projects are easier to build when the workflow is clear before you start coding.

This task helps you define exactly what goes into the system, what happens inside it, and what comes out.

────────────────────────
Step 1: Write the project flow
────────────────────────

Describe the project in one simple line:

input → processing → output

Examples:
• support ticket → classifier → priority label  
• user question + documents → retrieval + model → grounded answer  
• request → agent chooses tools → completed task summary  
• customer data → ML model → churn prediction  

────────────────────────
Step 2: Define the input
────────────────────────

Write down what the system will accept.

Examples:
• text  
• CSV rows  
• documents  
• API responses  
• user prompts  

Keep the input small and realistic for version 1.

────────────────────────
Step 3: Define the output
────────────────────────

Write down exactly what the system should return.

Examples:
• label  
• summary  
• recommendation  
• prediction score  
• structured JSON  
• action plan  

────────────────────────
Step 4: Define one success path
────────────────────────

Write one example of a good end-to-end run.

Example:
A user uploads 3 documents, asks a question, and gets a short answer with citations.

────────────────────────
Outcome
────────────────────────

A clear end-to-end workflow that makes the project easier to implement and easier to explain later.
`
  },

  {
    task: "Collect or create a small test dataset",
    duration: 2,
    explanation: `
AI projects become easier to build when you have a small set of realistic examples to test with.

You do not need a huge dataset. You need enough examples to build, test, and improve the project.

────────────────────────
Step 1: Decide what examples you need
────────────────────────

Your dataset depends on the type of AI project.

Examples:
• ML project → labelled rows in CSV  
• GenAI project → documents, prompts, and expected outputs  
• Agent project → tasks, tool inputs, and expected behaviours  
• Classification project → input text + labels  

────────────────────────
Step 2: Gather or create 10–30 examples
────────────────────────

Keep the dataset intentionally small.

The goal is to test behaviour, not to build a production-scale system.

────────────────────────
Step 3: Save the examples clearly
────────────────────────

Use one format such as:
• CSV  
• JSON  
• text files  
• spreadsheet  

Name the files clearly and store them in a dedicated folder.

────────────────────────
Step 4: Add notes about the data
────────────────────────

Write down:
• what the data is  
• where it came from  
• how many examples you have  
• what “good output” looks like

────────────────────────
Outcome
────────────────────────

A small, structured set of examples you can use to build and evaluate your AI project properly.
`
  },

  {
    task: "Set up the project folder and environment",
    duration: 1.5,
    explanation: `
A clean setup reduces friction and makes the project easier to build, test, and present.

────────────────────────
Step 1: Create the project folder
────────────────────────

Example structure:

ai-project/
• data/
• src/ or notebooks/
• outputs/
• README.md

────────────────────────
Step 2: Create a virtual environment
────────────────────────

Set up and activate a dedicated environment for the project.

────────────────────────
Step 3: Install the core libraries
────────────────────────

Choose packages based on your project type.

Examples:
• pandas  
• scikit-learn  
• jupyter  
• openai or another model SDK  
• python-dotenv  
• requests  
• streamlit or gradio  
• sentence-transformers or vector database tools if needed  

────────────────────────
Step 4: Create a starter script or notebook
────────────────────────

Add a small file that:
• loads data  
• runs one simple test  
• confirms the environment works

────────────────────────
Step 5: Add config safely
────────────────────────

If your project uses API keys:
• store them in .env
• do not hardcode them into scripts
• do not commit secrets to Git

────────────────────────
Outcome
────────────────────────

A clean project setup with working dependencies, clear folders, and a runnable foundation.
`
  },

  {
    task: "Build a simple baseline version",
    duration: 3,
    explanation: `
Before building advanced AI behaviour, create the simplest version that works from start to finish.

A baseline helps you prove the idea and gives you something real to improve.

────────────────────────
Step 1: Build the core path only
────────────────────────

Focus on the simplest usable version.

Examples:
• ML: train one simple model and generate predictions  
• GenAI: one prompt in, one response out  
• Agent: one task, one tool, one final result  
• RAG: one query over a very small document set  

────────────────────────
Step 2: Keep the logic simple
────────────────────────

Do not optimise yet.

Use the easiest path that lets you test:
• one input  
• one processing step  
• one output  

────────────────────────
Step 3: Save the outputs
────────────────────────

Store results in:
• notebook cells  
• console output  
• output files  
• CSV or JSON logs  

────────────────────────
Step 4: Run at least 3 examples
────────────────────────

Check whether the system works end to end.

Write down:
• what worked  
• what failed  
• what felt unclear

────────────────────────
Outcome
────────────────────────

A basic working version of the AI project that proves the core idea is possible.
`
  },

  {
    task: "Improve the core AI logic for your chosen direction",
    duration: 4,
    explanation: `
Once the baseline works, strengthen the part of the project that actually makes it feel like an AI system.

This task changes depending on the direction you chose.

────────────────────────
Choose the path that matches your project
────────────────────────

Machine Learning path
1. Clean the input data.  
2. Choose features.  
3. Train a stronger baseline model.  
4. Evaluate it with a simple metric such as accuracy, precision, recall, or RMSE.

GenAI path
1. Improve the prompt structure.  
2. Add clearer constraints.  
3. Ask for structured output.  
4. Compare old vs new responses.

Agentic AI path
1. Define the task steps clearly.  
2. Give the agent access to one or two tools only.  
3. Make the agent decide when to use which tool.  
4. Save the final reasoning or action summary.

Applied AI path
1. Improve the feature logic.  
2. Make the output more useful to the user.  
3. Add better formatting, ranking, or filtering.  
4. Test it in a realistic mini-workflow.

────────────────────────
Step-by-step
────────────────────────

1. Pick the improvement path that matches your project type.
2. Make one meaningful improvement to the AI logic.
3. Test the system again on the same examples.
4. Compare before vs after.
5. Record the improvement in your notes or README.

────────────────────────
Outcome
────────────────────────

A stronger version of the project that better reflects the AI direction you chose.
`
  },

  {
    task: "Add one advanced AI element",
    duration: 4,
    explanation: `
To make the project feel modern and job-relevant, add one advanced element that matches today’s AI roles.

Choose ONE advanced element.

Options:
• Retrieval-Augmented Generation (RAG)  
• tool use  
• agent workflow  
• memory or conversation history  
• model comparison  
• better evaluation logic  
• classification confidence or probability output  
• ranking or recommendation logic  

────────────────────────
Step-by-step
────────────────────────

1. Choose ONE advanced element that fits your project.

Examples:
• ML project → confidence scores or better evaluation  
• GenAI project → retrieval or citations  
• Agent project → multi-step tool use  
• AI assistant → memory or context handling  

2. Keep the scope small.  
   Add one useful improvement, not five.

3. Implement the feature.

4. Test whether it improves the project in a real way.

5. Write down:
   • what you added  
   • why it matters  
   • what limitation still remains

────────────────────────
Outcome
────────────────────────

A more modern AI project that goes beyond a basic demo and better matches in-demand AI work.
`
  },

  {
    task: "Evaluate the system on multiple examples",
    duration: 2.5,
    explanation: `
AI projects should not only run. They should also be evaluated in a structured way.

You do not need a perfect benchmark. You need a repeatable way to judge whether the project is good enough.

────────────────────────
Step 1: Select 8–10 examples
────────────────────────

Use examples from your dataset that represent normal use.

────────────────────────
Step 2: Define what good looks like
────────────────────────

Your evaluation criteria depend on the project.

Examples:
• correct label  
• helpful summary  
• grounded answer  
• sensible tool use  
• clear final output  
• low number of obvious errors  

────────────────────────
Step 3: Run the project on all examples
────────────────────────

Save the outputs in one place so you can compare them.

────────────────────────
Step 4: Review the results honestly
────────────────────────

Ask:
• Was the output correct?  
• Was it useful?  
• Was it too vague?  
• Did it fail in a pattern?  
• Did the agent choose the wrong step?  

────────────────────────
Step 5: Summarise the main failure patterns
────────────────────────

Examples:
• weak on ambiguous input  
• too generic summaries  
• wrong tool choice  
• poor performance on noisy data  
• unstable formatting

────────────────────────
Outcome
────────────────────────

A simple but credible evaluation process that shows you can test AI systems thoughtfully.
`
  },

  {
    task: "Make the project more robust",
    duration: 3,
    explanation: `
Professional AI projects do not only work on perfect input.

They also handle bad input, missing context, or unclear requests in a sensible way.

────────────────────────
Step 1: Choose 2 failure cases
────────────────────────

Examples:
• empty input  
• invalid file  
• too much text  
• missing label  
• query not supported by the documents  
• tool failure  
• low-confidence prediction

────────────────────────
Step 2: Add checks or fallback behaviour
────────────────────────

Examples:
• friendly error message  
• “not enough information” response  
• retry once if formatting fails  
• fallback to simpler logic  
• skip invalid rows safely

────────────────────────
Step 3: Re-test the project
────────────────────────

Run the same failure cases again and confirm behaviour improved.

────────────────────────
Step 4: Document the safeguards
────────────────────────

Add a short note to the README explaining:
• what can go wrong  
• how your system handles it

────────────────────────
Outcome
────────────────────────

A more reliable AI project that behaves better in realistic situations.
`
  },

  {
    task: "Create a simple demo or interface",
    duration: 3,
    explanation: `
A project becomes much easier to understand when someone can actually see how it works.

You do not need a polished product. You need a simple and clear demo flow.

Choose ONE:
• notebook walkthrough  
• Streamlit app  
• Gradio app  
• command-line demo  
• small web UI

────────────────────────
Step-by-step
────────────────────────

1. Decide how a user will interact with the project.
2. Build one clean end-to-end demo flow.
3. Keep the interface minimal and readable.
4. Test the demo from start to finish.
5. Save screenshots or a short screen recording.

Examples:
• upload document → ask question → get cited answer  
• enter customer row → get churn prediction  
• enter task → agent uses tools → returns final result  
• paste transcript → get structured summary

────────────────────────
Outcome
────────────────────────

A clear demo version of your AI project that other people can understand quickly.
`
  },

  {
    task: "Write up the project clearly in the README",
    duration: 2,
    explanation: `
A strong README makes the project easier to understand, easier to test, and more credible in a portfolio.

────────────────────────
Step 1: Add a short overview
────────────────────────

Explain:
• what the project does  
• who it is for  
• which AI direction it belongs to  

────────────────────────
Step 2: Describe the workflow
────────────────────────

Summarise:
• input  
• processing  
• output  

────────────────────────
Step 3: Add setup instructions
────────────────────────

Include:
• install requirements  
• set environment variables  
• run the project  

────────────────────────
Step 4: Add examples
────────────────────────

Include:
• example input  
• example output  
• screenshots if possible

────────────────────────
Step 5: Add evaluation and limitations
────────────────────────

Be honest about:
• where the project works well  
• where it still fails  
• what you would improve next

────────────────────────
Outcome
────────────────────────

A professional README that explains the project clearly and supports portfolio use.
`
  },

  {
    task: "Prepare the project for portfolio use",
    duration: 2,
    explanation: `
The final step is to make the project presentable to recruiters, hiring managers, and interviewers.

A strong project is not only functional. It is also easy to demo and easy to discuss.

────────────────────────
Step 1: Clean up the repository
────────────────────────

Remove:
• unused files  
• confusing experiments  
• messy notebooks you do not want to show

────────────────────────
Step 2: Make the project easy to review
────────────────────────

Ensure:
• file names are clear  
• README is complete  
• outputs are understandable  
• screenshots or gifs are included

────────────────────────
Step 3: Prepare interview talking points
────────────────────────

Write 3–5 bullets covering:
• the problem  
• your chosen AI direction  
• the system design  
• one challenge you solved  
• one improvement you would make next

────────────────────────
Step 4: Add it to your portfolio list
────────────────────────

Pin the repo or add it to your portfolio document with a short summary.

────────────────────────
Outcome
────────────────────────

A portfolio-ready AI project you can confidently show and discuss in interviews.
`
  },

  ...generateDaily({
    title: "Daily AI project ship session (30–45 mins)",
    duration: 0.5,
    explanation: `
AI projects improve through consistent shipping, not endless reading.

Each session should have ONE clear outcome.

Step-by-step
1. Set a timer for 30–45 minutes.
2. Choose ONE small deliverable:
   • clean one data file
   • improve one prompt
   • test one edge case
   • add one tool step
   • improve one model run
   • fix one bug
   • write one README section
3. Work only on that task until the timer ends.
4. Save your work properly and commit changes if relevant.

Outcome
Steady progress toward a finished AI project instead of a half-built prototype.
`,
    idBase: "tech_switch.projects_ai.daily_ship",
    meta: { roadmap: "tech_switch", theme: "projects_ai" },
  }),

],

projects_ux: [

{
task: "Choose a product problem and write a UX project brief",
duration: 2,
explanation: `
This project will become a portfolio case study.

Choose a **real product problem** rather than a vague design idea. Your goal is to redesign or create a product experience that solves a clear user problem.

────────────────────────
Choose ONE project direction
────────────────────────

Examples

• Improve onboarding for a productivity app  
• Redesign a confusing booking flow  
• Improve a food delivery checkout experience  
• Design a budgeting app for young professionals  
• Improve task creation in a project management tool  

Avoid overly broad ideas.

Choose a **single core task** users must complete.

────────────────────────
Step-by-step
────────────────────────

1. Write a short description of the product.

Example  
"A mobile app that helps users track personal habits."

2. Define the **primary user group**.

Examples  
• students  
• freelancers  
• young professionals  

3. Describe the **current user problem**.

Example  
"Users abandon the onboarding process because it asks for too much information."

4. Write the **design objective**.

Example  
"Reduce onboarding friction and help users reach their first success moment faster."

5. Define **success criteria**.

Examples

• users complete onboarding in under 60 seconds  
• the primary action is visible immediately  
• navigation becomes clearer

────────────────────────
Outcome
────────────────────────

A clear project brief defining the product, user, problem, and design goal.
`
},

{
task: "Analyse competing products and existing UX patterns",
duration: 2,
explanation: `
Before designing, study how existing products approach the same problem.

Your goal is to identify **patterns, strengths, and weaknesses**.

────────────────────────
Step-by-step
────────────────────────

1. Identify **3–5 competing products**.

Examples

• apps in the App Store  
• SaaS products  
• websites solving a similar task  

2. Explore their **core task flow**.

Examples

• onboarding  
• search  
• checkout  
• content creation  

3. Take screenshots of key screens.

Examples

• home screen  
• main action screen  
• success screen  

4. Identify patterns.

Ask:

• What works well?  
• What feels confusing?  
• Where are unnecessary steps?

5. Write **5–8 insights**.

Example

"Most apps hide the main action behind secondary navigation."

────────────────────────
Outcome
────────────────────────

A short research document identifying patterns and opportunities for improvement.
`
},

{
task: "Define personas and user goals for this project",
duration: 1.5,
explanation: `
Using the persona framework from the UX skills section, define the users for your project.

Focus on **goals and motivations**, not demographic details.

────────────────────────
Step-by-step
────────────────────────

1. Create **1–2 personas** relevant to your product.

Include:

• role or lifestyle  
• main goals  
• frustrations  
• environment of use  

Example

Persona  
Freelance designer working remotely.

Goal  
Track tasks without opening complex project tools.

Frustration  
Existing tools require too many setup steps.

2. Define the **primary user goal**.

Example

"Log and track tasks in under 10 seconds."

3. Define **key pain points** in existing products.

────────────────────────
Outcome
────────────────────────

Clear personas guiding design decisions throughout the project.
`
},

{
task: "Map the current user journey",
duration: 2,
explanation: `
Use the journey mapping technique learned earlier to understand the **current experience**.

Your goal is to identify where friction happens.

────────────────────────
Step-by-step
────────────────────────

1. Define the **main task** the user wants to complete.

Example

"Create and track a habit."

2. Map the steps users take today.

Example

• open app  
• search feature  
• create entry  
• confirm action  

3. For each step note:

• user goal  
• user emotion  
• potential frustration

4. Highlight moments where the experience breaks down.

5. Mark opportunities for improvement.

────────────────────────
Outcome
────────────────────────

A clear journey map identifying friction points in the current experience.
`
},

{
task: "Design the improved user flow",
duration: 2,
explanation: `
Use your insights to design a **simpler, clearer user flow**.

The goal is to reduce friction and unnecessary steps.

────────────────────────
Step-by-step
────────────────────────

1. Define the **ideal task flow**.

Example

• open app  
• tap primary action  
• complete task  
• receive feedback  

2. Draw a flow diagram connecting screens.

3. Compare the new flow with the old one.

Ask:

• Did steps decrease?  
• Is the primary action clearer?  
• Is navigation easier?

4. Adjust until the flow feels simple and logical.

────────────────────────
Outcome
────────────────────────

A clear user flow describing the improved experience.
`
},

{
task: "Create low-fidelity wireframes for the key screens",
duration: 3,
explanation: `
Wireframes help you focus on **structure and hierarchy** before visual design.

────────────────────────
Step-by-step
────────────────────────

1. Sketch **5–8 key screens**.

Examples

• home screen  
• onboarding  
• main task screen  
• results screen  
• confirmation screen  

2. Focus on:

• layout  
• content hierarchy  
• navigation structure  

3. Avoid colours and visual polish.

4. Ensure the wireframes support the improved user flow.

────────────────────────
Outcome
────────────────────────

A complete set of wireframes representing the product structure.
`
},

{
task: "Build a clickable prototype",
duration: 3,
explanation: `
Turn your wireframes into a **clickable prototype** so users can experience the interaction.

────────────────────────
Step-by-step
────────────────────────

1. Import wireframes into Figma or another design tool.

2. Convert sketches into simple interface screens.

3. Link screens using prototype interactions.

Example

tap → navigate to next screen

4. Simulate the main user journey.

5. Test the flow yourself to ensure it works logically.

────────────────────────
Outcome
────────────────────────

A functional prototype demonstrating the redesigned user experience.
`
},

{
task: "Run usability testing on the prototype",
duration: 2,
explanation: `
Usability testing reveals issues designers often miss.

Even testing with **3 users** can uncover major problems.

────────────────────────
Step-by-step
────────────────────────

1. Ask 2–3 people to test your prototype.

2. Give them a realistic task.

Example

"Create a new habit and track it."

3. Observe behaviour.

Look for:

• hesitation  
• confusion  
• unexpected navigation  

4. Record usability issues.

5. Identify the **top 3 problems**.

────────────────────────
Outcome
────────────────────────

Real feedback identifying usability issues in your design.
`
},

{
task: "Improve the design based on usability insights",
duration: 2,
explanation: `
Professional UX work always includes iteration.

────────────────────────
Step-by-step
────────────────────────

1. Review usability test results.

2. Identify the most common problems.

Examples

• confusing navigation  
• unclear buttons  
• too many steps

3. Update wireframes or prototype.

4. Simplify the interaction where possible.

5. Test the new version quickly yourself.

────────────────────────
Outcome
────────────────────────

A refined prototype based on real user feedback.
`
},

{
task: "Write a UX case study explaining the project",
duration: 3,
explanation: `
UX portfolios rely on strong case studies explaining your thinking.

Your case study should focus on **process and decisions**, not just visuals.

────────────────────────
Structure
────────────────────────

Write sections covering:

• problem definition  
• research insights  
• personas  
• user journey  
• design decisions  
• wireframes  
• prototype  
• usability testing  
• final design improvements  

Include images of screens and diagrams.

Explain **why decisions were made**, not just what was built.

────────────────────────
Outcome
────────────────────────

A full UX case study explaining your design process.
`
},

{
task: "Prepare the project for portfolio presentation",
duration: 2,
explanation: `
The final step is presenting your project clearly to employers.

────────────────────────
Step-by-step
────────────────────────

1. Upload the case study to your portfolio.

Options

• Notion  
• personal website  
• Behance  

2. Include:

• screenshots  
• flow diagrams  
• prototype link  

3. Write **3–5 bullet points summarising the project**.

Examples

• reduced onboarding friction  
• simplified navigation  
• improved task completion flow  

4. Test that links and images display correctly.

────────────────────────
Outcome
────────────────────────

A portfolio-ready UX project demonstrating your design thinking.
`
},

...generateDaily({
title: "Daily UX design practice (30–45 mins)",
duration: 0.5,
explanation: `
UX skills improve through repeated practice.

Step-by-step

1. Set a 30–45 minute timer.

2. Choose ONE activity:

• redesign a screen from an existing app  
• analyse a product flow  
• sketch interface ideas  
• improve your prototype  
• review usability insights  

3. Save your work and note one learning.

Outcome

Steady improvement in UX thinking and design judgement.
`,
idBase: "tech_switch.projects_ux.daily_design",
meta: { roadmap: "tech_switch", theme: "projects_ux" },
}),

],
career_strategy: [
  { 
    task: "Define 6–12 month skill plan (courses, certifications, projects)", 
    duration: 2,
    explanation: `
A skill plan helps you stop learning in random directions and start building toward something concrete.

Without a plan, it is very easy to spend months consuming content, opening endless tabs, and still feeling unsure whether you are actually becoming more employable. This task is about building a learning roadmap that connects directly to the kind of role you want.

Step-by-step
1. Start by choosing your target direction.
   Pick the path you are most interested in right now, such as Data Science, Software Engineering, Product Management, UX, AI, or Data Analytics.

2. Look at 5 real job descriptions for that direction.
   Read them properly, not just the title. Pay attention to which skills, tools, and responsibilities appear again and again.

3. Write down the core skills that repeat most often.
   These will usually include a mix of:
   • technical skills  
   • tools or platforms  
   • ways of working  
   • portfolio or project expectations

4. Choose the learning assets that will help you build those skills.
   Keep this realistic:
   • 1–2 strong courses are enough  
   • 1 certification is optional, not mandatory  
   • 2 portfolio projects are much more valuable than collecting too many certificates

5. Turn this into a simple timeline.
   For example:
   • Months 1–2: build foundations  
   • Months 3–4: complete your first project  
   • Months 5–6: improve your weak areas and build project two  
   • Months 7–12: deepen, refine, and prepare for applications or promotion

6. Add one checkpoint at the end of each month.
   This should be a short review where you check:
   • what you completed  
   • what you learned  
   • what is slipping  
   • what needs to change next month

Outcome
A realistic skill roadmap that connects your learning directly to actual hiring requirements rather than vague self-improvement.

Free Tools
LinkedIn Jobs, Google Sheets, Notion
`
  },

  { 
    task: "Map a promotion path for your target role", 
    duration: 1.5,
    explanation: `
It is much easier to grow when you understand what the next level actually looks like.

A lot of people work hard but aim too vaguely. They know they want to “progress” or “get promoted,” but they have not translated that into the behaviours, scope, and proof that the next level usually requires. This task helps you make the ladder visible.

Step-by-step
1. Choose the role title you want to grow toward.
   This might be something like Senior Data Scientist, Product Manager, Staff Engineer, Lead UX Designer, or another role that feels like your next meaningful milestone.

2. Research the 2–3 levels above your current level.
   Look at how those roles are described in job ads, company career frameworks, or public leveling guides. Pay attention to how the expectations change as seniority increases.

3. Group the expectations into a few clear buckets.
   In most cases, the pattern will fall into areas like:
   • impact  
   • ownership or scope  
   • leadership or collaboration  
   • technical or strategic depth

4. Compare those expectations with where you are today.
   Be honest, but calm. You are not doing this to criticise yourself. You are doing it to identify what is missing between your current position and the next level.

5. Choose 2 gaps that matter most this quarter.
   Do not try to fix everything at once. Pick the areas that would make the biggest difference.

6. Turn those gaps into actions.
   For example:
   • take ownership of a bigger project  
   • improve stakeholder communication  
   • deepen one technical skill  
   • build visibility through demos, updates, or mentoring

Outcome
A practical map of what “next level” really means in your field, and which actions will move you closer to it.

Free Tools
LinkedIn, public career ladders, mentors, company leveling docs if available
`
  },

  { 
    task: "Pick a specialization to sample next (e.g., React/Cloud/SQL)", 
    duration: 1,
    explanation: `
You do not need to commit blindly to a specialization. You can test one properly before deciding whether to go deeper.

This task is about replacing guessing with a small, structured trial. Instead of wondering whether you “should” specialise in something, you will sample it in a way that gives you real evidence.

Step-by-step
1. Choose one specialization you are curious about.
   Pick something relevant to your target path, such as React, Cloud, SQL, Prompt Engineering, Data Modelling, Product Analytics, or UX Research.

2. Define a short two-week trial.
   Keep it intentionally small and manageable.
   A good structure is:
   • 3 focused learning sessions per week  
   • 1 small mini-project or exercise by the end

3. Choose one beginner-friendly resource.
   This can be a free course, playlist, documentation series, or guided tutorial. You only need one good starting point.

4. Decide what your mini-project or output will be.
   It should be small enough to finish, but real enough to test whether you enjoy the work.

5. At the end of the two weeks, review the experience honestly.
   Ask yourself:
   • Did I enjoy working on this?  
   • Did I want to keep going after the session ended?  
   • What part felt most interesting?  
   • What part felt most draining or difficult?

Outcome
A clearer next-step decision based on actual experience instead of uncertainty or trend-chasing.

Free Tools
YouTube, free courses, official docs, Notion
`
  },

  { 
    task: "Create a monthly learning cadence & checkpoints", 
    duration: 1.5,
    explanation: `
A good learning plan is not just about what you want to learn. It is also about when, how often, and how you will know you are actually progressing.

This task turns learning into a rhythm. The goal is to make progress repeatable enough that it survives busy weeks and normal life.

Step-by-step
1. Decide how much time you can realistically give to learning each week.
   Be honest here. A plan you can repeat is far more valuable than an ambitious plan you abandon after two weeks.

2. Block 2–3 learning sessions into your calendar.
   Treat them like real appointments with yourself. Protect them properly.

3. Add one monthly checkpoint.
   This only needs around 30 minutes. Use it to review:
   • what you learned  
   • what you completed  
   • what still feels weak  
   • what your next focus should be

4. Choose one visible output for each month.
   This keeps your learning from becoming invisible.
   Examples:
   • a repo update  
   • a portfolio improvement  
   • a LinkedIn post  
   • a small demo  
   • a write-up of what you built or learned

5. Keep adjusting the rhythm until it feels realistic.
   The goal is not perfection. The goal is consistency.

Outcome
A monthly learning rhythm that creates visible progress and makes growth easier to sustain.

Free Tools
Google Calendar, Notion, Google Sheets
`
  },

  { 
    task: "Plan v2 of your flagship project based on feedback", 
    duration: 2.5,
    explanation: `
A strong project is rarely strongest in version 1.

Version 2 shows maturity. It shows that you can listen, reflect, improve, and make better decisions after real feedback. That is exactly the kind of thinking employers want to see.

Step-by-step
1. Choose your flagship project.
   This should be the project you most want recruiters, hiring managers, or future interviewers to remember.

2. Gather feedback from at least 3 useful angles.
   For example:
   • a peer or friend review  
   • your own walkthrough with a critical eye  
   • a recruiter or hiring-manager lens  
   • a simple usability test if relevant

3. Sort the feedback into three categories:
   • Keep - what is already strong  
   • Fix - what is confusing, weak, or broken  
   • Add - one meaningful improvement that makes the project feel stronger

4. Turn the feedback into a practical v2 plan.
   Break it into 5–10 tasks and put them in priority order.

5. Decide what “v2 shipped” means.
   Define the finish line clearly, so you do not keep polishing forever.

6. Set a realistic release date and complete the update.

Outcome
A stronger, clearer flagship project that demonstrates iteration, judgment, and product thinking rather than just raw effort.

Free Tools
GitHub Issues, Notion, Loom
`
  },

  { 
    task: "Set up a mentorship circle (3–5 peers/mentors)", 
    duration: 2,
    explanation: `
Growth is faster when it is not completely solitary.

A small mentorship circle gives you perspective, accountability, feedback, and momentum. It does not need to be formal or impressive. It just needs to be consistent and useful.

Step-by-step
1. Identify 3–5 people who could form a strong small circle.
   A good mix is usually:
   • 1–2 people who are ahead of you  
   • 1–3 peers who are also growing and building

2. Reach out with a simple invitation.
   Keep the message short. Explain:
   • why you are setting it up  
   • what the purpose is  
   • how often you want to meet  
   • what the time commitment would be

3. Agree on a simple monthly rhythm.
   One 45-minute meeting each month is enough to start.

4. Use the same light structure each time.
   For example:
   • recent wins  
   • current blockers  
   • one feedback request  
   • next month’s focus

5. Keep short notes after each meeting.
   Capture:
   • useful advice  
   • decisions made  
   • actions you want to follow through on

Outcome
A small, supportive career circle that helps you grow faster and feel less isolated while doing it.

Free Tools
Google Calendar, Google Meet, Zoom, Notion
`
  },

  { 
    task: "Pick ONE target junior role + write your role-definition (1 page)",
    duration: 1.5,
    id: "tech_switch.career_strategy.role_definition",
    meta: { roadmap: "tech_switch", theme: "career_strategy", type: "career", level: "beginner", deliverable: "doc" },
    explanation: `
If your target is too vague, your preparation will be vague too.

You are not trying to become “someone in tech.” You are trying to become the kind of person a hiring manager would confidently shortlist for one specific junior role. This task helps you define that role properly.

Step-by-step
1. Choose one target junior role.
   Examples:
   • Junior Frontend Developer  
   • Junior Data Analyst  
   • Junior AI / ML Engineer  
   • Junior UX Designer  
   • Junior Product Manager

2. Pull 5 real job ads for that exact type of role.
   Save them in one place and read them closely.

3. Create a one-page role-definition document.
   Include:
   • the top 8 skills that repeat across those ads  
   • the 3 tools or technologies that appear most often  
   • 3 proof signals employers seem to care about most, such as projects, portfolio quality, communication, certifications, or practical experience

4. Highlight the non-negotiables.
   These are usually the 3–5 things you clearly need in order to be taken seriously for the role.

5. Finish by writing one short summary sentence:
   “A strong candidate for this role usually needs to show…”

Outcome
A clear, focused role definition you can build toward instead of a vague ambition.

Deliverable
1-page “Role Definition” document
`
  },

  {
    task: "Create your “Proof Plan”: 2 portfolio projects + 1 credibility signal",
    duration: 1.5,
    id: "tech_switch.career_strategy.proof_plan",
    meta: { roadmap: "tech_switch", theme: "career_strategy", type: "career", level: "beginner", deliverable: "doc" },
    explanation: `
Hiring is proof-based.

It is not enough to say that you are learning. You need visible evidence that you can do the kind of work the role requires. This task turns your target role into a concrete proof plan.

Step-by-step
1. Choose 2 portfolio projects that fit your target junior role.
   These projects should make sense to a recruiter reviewing your application.

2. For each project, define the essentials clearly.
   Write down:
   • the problem  
   • the user or audience  
   • the key features or tasks  
   • the tech stack or tools  
   • the success metric; what would make this project feel strong and finished

3. Choose one credibility signal to strengthen your profile.
   Examples:
   • a relevant certificate  
   • consistent GitHub activity with clean repos  
   • 2–3 thoughtful LinkedIn posts explaining what you built or learned  
   • a polished portfolio presentation

4. Put the projects and credibility signal into one simple timeline.
   Make the dates realistic enough that you can actually follow through.

Outcome
A practical proof plan that leads toward visible, hireable evidence rather than passive learning.

Deliverable
“Proof Plan” document with projects, credibility signal, and timeline
`
  },

  {
    task: "Create your skills gap tracker (must match job ads)",
    duration: 1.5,
    id: "tech_switch.career_strategy.skills_gap_tracker",
    meta: { roadmap: "tech_switch", theme: "career_strategy", type: "career", level: "beginner", deliverable: "sheet" },
    explanation: `
A skills gap tracker helps you move from “I think I’m improving” to “I can prove I meet real job requirements.”

This task gives you a simple way to compare what employers ask for with what you can already show.

Step-by-step
1. Create a table with these columns:
   Skill | Required by jobs? (Y/N) | My level (0–3) | Evidence | Next action

2. Fill the table using your 5 saved job ads.
   Focus on the skills and tools that come up repeatedly.

3. Be honest about your current level.
   A simple scale is enough:
   • 0 = not started  
   • 1 = basic exposure  
   • 2 = can use with guidance  
   • 3 = can use independently and explain it

4. Add evidence wherever possible.
   This might be:
   • a GitHub repo  
   • a portfolio piece  
   • notes from a project  
   • a small demo  
   • a blog or LinkedIn post

5. Look at the biggest gaps and pick the next 5 actions.
   These actions should come directly from the tracker, not from guesswork.

Outcome
A living skills map you can update over time as your evidence and confidence grow.

Deliverable
Skills gap tracker in Notion or Google Sheets
`
  },

],

networking: [
  { 
    task: "Identify 10 relevant people (alumni, meetups, open-source contributors)", 
    duration: 1.5,
    explanation: `
Networking becomes much easier when it stops being abstract.

A vague thought like “I should network more” usually creates pressure without action. What works better is a small, thoughtful list of real people you genuinely have a reason to reach out to. This task is about building that list in a way that feels intentional, not random.

Step-by-step
1. Create a simple list and call it “Networking 10”.
   This will be your starting circle of people who feel relevant to your career direction.

2. Add 10 people across a few categories.
   A good mix might include:
   • alumni from your university or course  
   • meetup speakers or organisers  
   • people already working in roles you want  
   • open-source contributors or community builders  
   • people whose work or career path feels genuinely interesting to you

3. For each person, write a few notes so the connection feels grounded.
   Include:
   • where you found them  
   • what you admire or find interesting about their work  
   • one specific thing you could ask them

4. Review the full list and choose the 5 people who feel most natural to contact first.
   You are not trying to impress everyone. You are simply choosing the most realistic starting points.

Outcome
A thoughtful shortlist of 10 relevant people, with enough context to make outreach feel easier and more natural.

Free Tools
LinkedIn, GitHub, Meetup, Notion, Google Sheets
`
  },

  { 
    task: "Craft 2 cold-DM templates with value", 
    duration: 1,
    explanation: `
A good message does not need to be clever. It needs to be clear, warm, and respectful.

Templates help reduce anxiety because you are not starting from a blank page every time. The goal is not to sound polished or corporate. The goal is to sound human and make the other person’s time feel respected.

Step-by-step
1. Write your first template for a light conversation request.
   This could be a short message asking for a 15-minute chat.

2. Write your second template for an even lighter ask.
   This could be a message asking one thoughtful question instead of requesting a call.

3. Make sure each template includes four things:
   • why you are reaching out  
   • what specifically you admire or found useful about their work  
   • one simple ask  
   • a gentle close that makes it easy for them to say no without pressure

4. Keep the messages short.
   A good networking message usually feels better when it is concise, personal, and easy to read quickly.

5. Read both templates out loud.
   This is one of the best ways to hear whether the message sounds warm and natural or too formal and stiff.

Outcome
Two reusable outreach templates that feel respectful, human, and easy to personalise.

Free Tools
LinkedIn, Notes, Notion
`
  },

  { 
    task: "Send 5 DMs & book 2 coffee chats", 
    duration: 2,
    explanation: `
Networking improves through momentum, not perfection.

You do not need to send dozens of messages. You need to send a small number of thoughtful messages consistently. This task is about taking action gently but clearly.

Step-by-step
1. Go back to your shortlist and pick 5 people to contact.
   Choose the people who feel most relevant and most realistic to message now.

2. Personalise each message before sending it.
   Add one specific line that shows you really looked at their work, background, talk, or profile.

3. Send the messages and track them.
   Note:
   • date sent  
   • who you contacted  
   • whether they replied  
   • whether a follow-up is needed

4. If someone replies positively, suggest two time options rather than asking them to choose from nothing.
   This makes it easier for them to say yes.

5. Prepare 3 simple questions before each chat.
   Good questions are usually:
   • about their path  
   • about what helped them early on  
   • about what they think matters most in the role

Outcome
Five messages sent with intention, and ideally two real conversations booked from that outreach.

Free Tools
LinkedIn, Google Calendar, Notion, Google Sheets
`
  },

  { 
    task: "Attend 1 meetup & ask a question", 
    duration: 2,
    explanation: `
Networking is not only about messaging people online. It is also about showing up and participating in real spaces.

You do not need to become the loudest person in the room. A single thoughtful question can create far more connection than passively attending several events without engaging.

Step-by-step
1. Choose one meetup, webinar, or community event happening within the next week.
   Pick something aligned with your interests or target role.

2. Join a little early if you can.
   Arriving early often makes it easier to settle in and feel less rushed.

3. Prepare one question in advance.
   This removes pressure in the moment and helps you participate more confidently.

4. Ask your question during the session, Q&A, or chat.
   Keep it short, relevant, and sincere.

5. Afterward, send one short follow-up to a speaker, organiser, or attendee.
   For example:
   “I really liked your point about X - thank you, that gave me something useful to think about.”

Outcome
One real moment of participation that builds confidence, visibility, and the start of a genuine connection.

Free Tools
Meetup, Eventbrite, LinkedIn
`
  },

  { 
    task: "Post a short learning update on LinkedIn", 
    duration: 1,
    explanation: `
You do not need to post deep thought leadership to benefit from LinkedIn.

Small, honest learning updates are enough. They show that you are building, thinking, and making progress. Over time, that visibility helps people understand who you are and what direction you are moving in.

Step-by-step
1. Choose one thing you learned recently.
   This might be:
   • a concept you finally understood  
   • a bug you fixed  
   • a project milestone  
   • a useful insight from a course or event

2. Write a short post in plain language.
   A simple structure works well:
   • what you learned  
   • why it mattered  
   • what you want to explore next

3. Keep the post short enough to feel approachable.
   Around 5–8 lines is enough.

4. Add a screenshot if it helps make the update feel more concrete.

5. After posting, respond kindly to anyone who comments or reacts.
   This is part of networking too.

Outcome
A visible, professional learning update that helps build credibility over time.

Free Tools
LinkedIn
`
  },

  { 
    task: "Follow up with 5 thank-you notes", 
    duration: 1,
    explanation: `
A thank-you note is small, but it is often where a relationship starts to feel real.

Following up shows maturity, attention, and respect. It also helps you stay memorable in a way that does not feel forced or transactional.

Step-by-step
1. List 5 people who have helped you recently in any way.
   This might include:
   • someone who gave advice  
   • someone who replied to your message  
   • someone who made an introduction  
   • someone who reviewed your work  
   • someone who spoke with you at an event

2. Write each person a short thank-you message.
   Include:
   • what you appreciated  
   • what was specifically useful  
   • what you are going to do with that advice or support

3. Keep the message short and clear.
   Under 6 lines is usually enough.

4. Save especially thoughtful or encouraging replies somewhere.
   They can become useful reminders later when your confidence dips.

Outcome
Stronger relationships built through thoughtful, respectful follow-up instead of silent gratitude.

Free Tools
Email, LinkedIn
`
  },

  {
    task: "Build your referral ask list (10 people) + warm intro strategy",
    duration: 1.5,
    id: "tech_switch.networking.referral_list",
    meta: { roadmap: "tech_switch", theme: "networking", type: "career", level: "beginner", deliverable: "list" },
    explanation: `
Referrals work because trust moves faster than cold applications.

That does not mean you should ask everyone for one. It means you should think carefully about who you can approach in a warm, respectful way and what kind of ask feels appropriate for the relationship.

Step-by-step
1. Create a list of 10 people you could reasonably message.
   These might be:
   • former colleagues  
   • classmates  
   • alumni  
   • community contacts  
   • people you have already spoken to once or twice

2. For each person, note three things:
   • their company  
   • how strong the relationship feels right now, on a simple 1–3 scale  
   • what kind of ask would be appropriate

3. Draft one warm, reusable message.
   Include:
   • the role you are applying for  
   • one relevant proof link such as your portfolio, GitHub, or project  
   • a light and respectful ask, such as advice first or a referral if they feel comfortable

4. Keep the tone calm and low-pressure.
   A good referral message should feel considerate, not entitled.

5. Decide who is best to contact first.
   Start with the people where warmth and relevance are strongest.

Outcome
A referral strategy that feels human, thoughtful, and realistic rather than forced or spammy.

Deliverable
Referral ask list plus one message draft
`
  },

  {
    task: "Join 1 community and contribute once (post, answer, small PR, or resource)",
    duration: 1.5,
    id: "tech_switch.networking.community_contribution",
    meta: { roadmap: "tech_switch", theme: "networking", type: "career", level: "beginner", deliverable: "post" },
    explanation: `
One of the best ways to network is to stop thinking only in terms of asking and start contributing.

You do not need to become a major community voice. One useful contribution is enough to begin. The goal is to move from passive observer to visible participant.

Step-by-step
1. Choose one community that feels relevant to your direction.
   This might be:
   • a Slack or Discord group  
   • a Meetup community  
   • a LinkedIn group  
   • a GitHub project or open-source space

2. Decide on one realistic way to contribute.
   Good beginner options include:
   • answering a question  
   • sharing a useful resource  
   • posting your project and asking for feedback  
   • making a small documentation fix or simple PR if relevant

3. Make the contribution and save the link.
   Treat it as evidence that you are participating, not just lurking.

4. Notice what happens afterward.
   Even one contribution can create:
   • replies  
   • visibility  
   • feedback  
   • new people recognising your name

Outcome
A small but real credibility signal that creates visibility and opens the door to future connections.

Deliverable
Link to your contribution
`
  }

],
  // 5) INTERVIEW & JOB SEARCH
  interview_prep: [

{
  task: "Prepare answers for common technical interview questions",
  duration: 2,
  explanation: `
Most interviews include a few predictable questions. Preparing them in advance helps you answer calmly and clearly instead of trying to improvise.

The goal of this task is not to memorise scripts, but to develop clear explanations of your experience, your projects, and how you think through problems.

Step-by-step
1. Prepare one strong project story.
   Choose a project you built or worked on and practice explaining:
   • the problem it solved  
   • the approach you took  
   • the tools or technologies used  
   • the final result or impact

2. Prepare an explanation of one core concept from your field.
   For example:
   • how a system works  
   • a framework you used  
   • a data or design decision you made

3. Practice explaining how you approach solving a new technical problem.
   Focus on how you think rather than jumping directly to the answer.

4. Solve one small coding or logic problem while speaking out loud.

5. Record yourself answering one question and review the explanation.
   Notice whether your answer feels clear, structured, and easy to follow.

Outcome
More confident, structured answers during technical interviews.
`
},

{
  task: "Set up a 30-min daily problem practice routine",
  duration: 0.5,
  explanation: `
Interview preparation becomes much easier when it is built into a small daily habit.

A short and consistent practice routine improves both speed and confidence without requiring long study sessions.

Step-by-step
1. Choose a fixed 30-minute time in your day.

2. Add this session as a recurring event in your calendar for the next two weeks.

3. Choose one problem-practice platform to use consistently.
   Examples include:
   • LeetCode  
   • HackerRank  
   • CodeSignal  
   • NeetCode

4. Set a simple rule for the session:
   solve one problem and then stop.

5. Keep a short log of your practice.
   Write down:
   • the problem name  
   • the date  
   • one insight or mistake you want to remember.

Outcome
A sustainable daily practice habit that gradually builds technical fluency and confidence.

Free Tools
Google Calendar, LeetCode, HackerRank
`
},

{
  task: "Warm-ups: 10 easy array/string problems",
  duration: 4,
  explanation: `
Many interview problems start with arrays or strings. Becoming comfortable with these patterns helps you start solving problems faster and with less stress.

Step-by-step
1. Choose ten beginner-level problems focused on arrays and strings.

2. Set a time limit of about 20–25 minutes per problem.

3. When solving each problem:
   first restate the problem in your own words,
   then write a simple solution,
   and finally try to improve the solution's efficiency.

4. After each problem, write two short notes:
   • the pattern used (for example sliding window or two pointers)  
   • one mistake or insight you want to remember.

5. Return to the three hardest problems again a few days later.

Outcome
Stronger fundamentals and faster recognition of common problem-solving patterns.

Free Tools
LeetCode, Notion
`
},

{
  task: "Hash/stack/queue focused practice (8 problems)",
  duration: 4,
  explanation: `
Certain data structures appear repeatedly in interviews because they simplify many real problems.

Practicing them helps you recognise when a problem can be solved quickly with the right structure.

Step-by-step
1. Select eight practice problems.

A balanced mix could include:
• three hash map or dictionary problems  
• three stack problems  
• two queue or deque problems

2. As you solve each problem, focus on understanding why the data structure works well for that situation.

3. Write a clean implementation.

4. After finishing each problem, write one sentence describing why that data structure was useful.

5. Save a short reusable code template for each structure.

Outcome
Improved ability to recognise and apply common data structure patterns during interviews.

Free Tools
LeetCode, VS Code
`
},

{
  task: "Trees/graphs basics (4–6 problems)",
  duration: 4,
  explanation: `
Tree and graph problems often appear in technical interviews, but many of them rely on just a few traversal patterns.

Once those patterns become familiar, these questions become much easier to approach.

Step-by-step
1. Choose four to six beginner problems involving trees or graphs.

A useful set might include:
• tree traversal using DFS or BFS  
• depth or ancestor problems  
• one graph traversal example  
• optionally a simple shortest path problem

2. Before writing code, sketch the traversal order on paper.

3. Implement the solution using recursion or a stack or queue.

4. Create a small cheat sheet that includes:
• a BFS template  
• a DFS template  
• how to track visited nodes.

Outcome
Confidence working with node-based problems and traversal patterns.

Free Tools
LeetCode, paper, Notion
`
},

{
  task: "2 mock interviews (friend or AI) + notes",
  duration: 3,
  explanation: `
Mock interviews help you become comfortable with the pressure of the real situation.

Practicing the format in advance makes interviews feel more familiar and reduces anxiety.

Step-by-step
1. Schedule two mock sessions lasting around 45–60 minutes.

2. In each session include:
• one technical problem  
• two or three behavioural questions

3. Speak out loud while solving the technical problem so your reasoning is clear.

4. Immediately after the session, write short notes about:
• what went well  
• where you hesitated  
• one improvement for next time.

5. Revisit the same technical problem a few days later.

Outcome
Improved communication and problem-solving confidence during real interviews.

Free Tools
ChatGPT, Google Meet, notes app
`
},

{
  task: "System design basics: latency, throughput, caching",
  duration: 3,
  explanation: `
Even junior roles often include questions about how systems behave at scale.

You do not need deep architecture expertise yet. The goal is simply to understand the vocabulary and basic ideas behind system performance.

Step-by-step
1. Learn the core concepts of latency, throughput, and caching.

2. Choose a familiar product feature such as a feed, chat system, or file upload service.

3. Draw a simple architecture diagram showing how requests move through the system.

4. Ask yourself:
• what might become slow  
• what might break under heavy usage  
• what could be cached.

5. Practice explaining your diagram out loud in two minutes.

Outcome
Basic confidence discussing system behaviour and performance concepts.

Free Tools
Excalidraw, paper, simple system design guides
`
},

{
  task: "Design a feature: API sketch + data model",
  duration: 3,
  explanation: `
Technical interviews often include questions about how you would design a feature or system.

Practicing this skill helps you think about the entire flow from user interaction to data storage.

Step-by-step
1. Choose a simple product feature such as comments, tasks, or favourites.

2. Identify the main user actions.

3. Sketch several API endpoints supporting those actions.

4. Draft a simple data model including tables and key fields.

5. Define at least one rule controlling access or permissions.

6. Write an example request and response.

Outcome
Practice thinking about product features from a system perspective.

Free Tools
Notion, Google Docs, Excalidraw
`
},

{
  task: "Behavioral stories (STAR); write 6 strong examples",
  duration: 3,
  explanation: `
Behavioral interviews evaluate how you collaborate, solve problems, and learn from challenges.

Preparing your stories in advance helps you answer clearly and confidently.

Step-by-step
1. Choose six themes such as conflict, leadership, teamwork, failure, impact, and ambiguity.

2. Write a short story for each theme using the STAR framework.

3. Focus especially on the actions you took and the results achieved.

4. Keep each story short enough to explain in about 90 seconds.

5. Add one short lesson or insight at the end of each story.

Outcome
Six clear examples ready for behavioral interview questions.

Free Tools
Notion, Google Docs
`
},

{
  task: "Build your STAR story bank (8 stories)",
  duration: 2,
  id: "tech_switch.interview_prep.star_story_bank",
  meta: { roadmap: "tech_switch", theme: "interview_prep", type: "interview", level: "beginner", deliverable: "doc" },
  explanation: `
A prepared story bank ensures you never struggle to find examples during interviews.

Instead of relying on memory, you build a small library of experiences demonstrating your skills and growth.

Step-by-step
1. Create eight STAR stories covering different themes.

2. Keep each story concise using bullet points.

3. Practice explaining each story out loud.

Outcome
A ready-to-use set of examples you can adapt to many behavioral interview questions.

Deliverable
STAR story bank document
`
},

{
  task: "Create your 30-second pitch + 2-minute journey story",
  duration: 1,
  id: "tech_switch.interview_prep.pitch_and_journey",
  meta: { roadmap: "tech_switch", theme: "interview_prep", type: "interview", level: "beginner", deliverable: "script" },
  explanation: `
Interviewers often decide within the first minute whether they clearly understand your profile.

Preparing a short introduction helps ensure your story is clear and memorable.

Step-by-step
1. Write a 30-second pitch explaining who you are, your target role, and one key proof of your skills.

2. Expand that into a two-minute journey story describing why you entered this field and what you have built.

3. Record yourself once and refine the explanation.

Outcome
A confident introduction you can use in interviews and networking conversations.

Deliverable
Pitch script and journey story
`
},

{
  task: "Mock interview loop (1 recruiter + 1 technical)",
  duration: 2,
  id: "tech_switch.interview_prep.mock_loop",
  meta: { roadmap: "tech_switch", theme: "interview_prep", type: "interview", level: "beginner", deliverable: "notes" },
  explanation: `
Practicing the full interview loop helps you understand what the hiring process feels like.

Step-by-step
1. Schedule two mock sessions.

2. Session one focuses on recruiter-style questions.

3. Session two focuses on technical questions or project discussions.

4. After each session write short notes describing strengths and improvements.

Outcome
Clearer interview readiness and feedback before real interviews.

Deliverable
Mock interview notes
`
},

{
  task: "Take-home challenge strategy (how to finish + present like a pro)",
  duration: 1.5,
  id: "tech_switch.interview_prep.takehome_strategy",
  meta: { roadmap: "tech_switch", theme: "interview_prep", type: "interview", level: "beginner", deliverable: "checklist" },
  explanation: `
Take-home assignments are common in technical hiring processes.

Strong candidates succeed not just by solving the problem, but by explaining their thinking clearly.

Step-by-step
1. Create a checklist for approaching take-home tasks.

2. Clarify requirements and write assumptions before coding.

3. Focus on implementing the most important features first.

4. Keep commits clean and organised.

5. Write a short README explaining your approach.

6. Prepare a short walkthrough explaining the solution.

Outcome
A structured strategy for completing take-home challenges professionally.

Deliverable
Reusable take-home challenge checklist
`
}

],


jobhunt: [
  { 
    task: "Target list: 20 companies + 2 role titles", 
    duration: 2,
    explanation: `
A focused target list makes job hunting feel much less chaotic.

Without a list, it is easy to apply reactively, chase every new posting, and lose sight of what actually fits you. A strong target list helps your effort compound. It gives you a clear direction, helps you spot patterns, and makes every next step feel more intentional.

Step-by-step
1. Create a simple table to hold your list.
   Include columns such as:
   • Company  
   • Why them  
   • Role titles  
   • Careers link  
   • Notes

2. Add 20 companies you would genuinely be interested in joining.
   These should not just be “big names.” Try to choose places where the product, mission, industry, or team style actually appeals to you.

3. For each company, identify 2 role titles that fit your current profile.
   Keep these realistic and aligned with your experience level.

4. Add the careers page link for each company.
   If job alerts are available, turn them on so new roles come to you automatically.

5. Once the full list is built, rank your top 5 priority companies.
   These will become your starting focus.

Outcome
A strategic target list that gives your job search direction and makes your applications more intentional.

Free Tools
Google Sheets, Notion, LinkedIn
`
  },

  { 
    task: "Write a tailored, scannable resume for your path", 
    duration: 3,
    explanation: `
A strong resume is not a list of responsibilities. It is a clear story about the value you bring.

Recruiters usually scan a CV very quickly, so your resume needs to make sense fast. This task is about shaping it around your target path so that the right signals stand out immediately.

Step-by-step
1. Start by choosing one main path to optimise for.
   This could be software engineering, data analysis, data science, product management, UX, AI, or another role you are actively targeting.

2. Update the top section of your CV first.
   Your summary and skills section should reflect the kind of role you are applying for and the keywords that appear most often in relevant job descriptions.

3. Rewrite your experience bullets so they show action and impact.
   A strong structure is:
   action → result → metric

4. Move the most relevant information higher.
   This may mean reordering bullets within a role or making sure your strongest projects are easier to notice.

5. Make the document easy to scan.
   Keep the formatting clean, the bullets consistent, and the phrasing direct. Aim for clarity over cleverness.

6. Export the final version as a PDF and name it clearly.
   For example:
   Firstname_Lastname_TargetRole.pdf

Outcome
A clear, role-aligned resume that helps recruiters understand your relevance within seconds.

Free Tools
Google Docs, Canva, Word
`
  },

  { 
    task: "Create 3 resume variants (SWE/DA/DS/PM/UX)", 
    duration: 2.5,
    explanation: `
You may be the same person, but different roles need different versions of your story.

A frontend role, a data role, and a product role do not all value the same signals in the same order. This task helps you create a few ready-to-send CV variants so you are not rewriting from scratch every time.

Step-by-step
1. Duplicate your main resume file three times.

2. Choose three role tracks you are genuinely open to.
   For example:
   • data analyst  
   • product manager  
   • UX designer

3. For each version, adjust the story so it matches the track.
   This may include:
   • changing the headline or summary  
   • reordering your skills  
   • moving different bullets or projects higher  
   • adjusting wording so the emphasis fits the role

4. Export each one with a clear filename.
   For example:
   • First_Last_DA.pdf  
   • First_Last_PM.pdf  
   • First_Last_UX.pdf

5. Store all versions in one organised folder so they are easy to access when applying.

Outcome
Three ready-to-use resume variants that fit different role types without last-minute stress.

Free Tools
Google Drive, Google Docs
`
  },

  { 
    task: "Optimise LinkedIn (headline, About, skills, projects)", 
    duration: 2.5,
    explanation: `
LinkedIn is often the first place a recruiter or hiring manager checks after opening your application.

A strong profile makes your work easier to understand and easier to verify. It should feel current, aligned, and searchable.

Step-by-step
1. Update your headline so it reflects your target role and relevant keywords.
   Keep it simple and clear.

2. Rewrite your About section in a more structured way.
   A useful flow is:
   • who you are  
   • what you do well  
   • proof of that work or impact  
   • what kind of opportunities you are looking for

3. Review your skills section and adjust it so the most relevant skills appear clearly.

4. Add 2–3 featured items that strengthen your profile.
   Good options include:
   • your portfolio  
   • a strong GitHub repo  
   • a case study  
   • a project write-up

5. Turn on Open to Work if it feels appropriate for your situation, and make sure your locations are accurate.

Outcome
A LinkedIn profile that supports your applications, improves your search visibility, and makes your work easier to trust.

Free Tools
LinkedIn
`
  },

  { 
    task: "Apply to 5 roles with tailored bullets", 
    duration: 2,
    explanation: `
A small number of strong applications is usually far more effective than a large number of generic ones.

This task is about quality over volume. You want each application to make sense for the role rather than feeling copied and pasted.

Step-by-step
1. Choose 5 roles that genuinely fit your current level, skills, and direction.

2. For each role, read the job description carefully and highlight the key requirements.

3. Tailor your CV before sending it.
   Adjust 3–5 bullets so the most relevant parts of your experience align more clearly with what the role is asking for.

4. Write a short cover note if appropriate.
   Keep it concise and role-specific.

5. Submit the application and immediately save the details.
   Note:
   • the job link  
   • the date  
   • the CV version used  
   • anything important you want to remember later

6. Add a reminder to follow up in 7–10 days if that would be appropriate.

Outcome
Five thoughtful, higher-quality applications that clearly align with the role requirements.

Free Tools
LinkedIn, company job boards, Google Sheets
`
  },

  { 
    task: "Track pipeline in a spreadsheet/Notion", 
    duration: 1,
    explanation: `
A clear job pipeline stops opportunities from disappearing into mental clutter.

When applications, follow-ups, interview stages, and notes all live in your head, the process starts to feel heavier than it needs to. A simple tracker gives you clarity and helps you stay strategic.

Step-by-step
1. Create a tracker with columns such as:
   • Company  
   • Role  
   • Link  
   • Date applied  
   • Stage  
   • Next action  
   • Notes

2. Add each application on the same day you submit it.

3. Update the stage regularly.
   For example:
   Applied → Screening → Interview → Take-home → Offer

4. Add next-action dates so you know when to follow up, prepare, or respond.

5. Review the tracker once a week and clean up anything outdated or unclear.

Outcome
A job search pipeline that gives you clarity on where you stand and what needs attention next.

Free Tools
Google Sheets, Notion
`
  },

  { 
    task: "Referrals: ask 5 warm contacts", 
    duration: 2,
    explanation: `
A referral works best when it feels natural, relevant, and respectful.

You are not trying to pressure people into doing you a favour. You are making it easier for warm contacts to help if they genuinely want to. This task helps you do that in a thoughtful way.

Step-by-step
1. List 5 warm contacts you could reasonably ask.
   This might include:
   • former colleagues  
   • alumni  
   • community contacts  
   • friends of friends  
   • people you already know at least a little

2. Write a short message for each person.
   Include:
   • why you are reaching out  
   • the role or company link  
   • why you think you are a fit  
   • a polite ask for advice, context, or a referral if they feel comfortable

3. Send the messages and track who you contacted.

4. If someone says yes, make it easy for them to help.
   Send:
   • your latest CV  
   • 2–3 role-aligned highlights  
   • any relevant links such as your portfolio

5. Thank them either way.

Outcome
Five respectful referral asks that feel warm, efficient, and professionally handled.

Free Tools
LinkedIn, email, Google Sheets
`
  },

  { 
    task: "Write a 100-word ‘why me’ blurb you can paste fast", 
    duration: 1,
    explanation: `
A short “why me” blurb saves time and makes your message more consistent.

This is useful for applications, recruiter messages, networking chats, and quick intros. Instead of rewriting your story every time, you create one polished version you can adapt quickly.

Step-by-step
1. Write a short paragraph of around 100 words.

2. Structure it in three simple parts:
   • who you are and what your main strength is  
   • what you have done, including one or two proof points  
   • what kind of role or opportunity you are looking for

3. Keep the writing specific.
   Remove vague language and replace it with real signals.

4. Create two slightly different versions:
   • one for applications  
   • one for networking or recruiter outreach

5. Save both in an easy-to-access note so you can paste and adapt them quickly.

Outcome
A polished mini-pitch you can reuse across applications and outreach without rewriting under pressure.

Free Tools
Notes app, Notion, Google Docs
`
  }, 

  {
    task: "Set up your applications tracker + weekly targets",
    duration: 1,
    id: "tech_switch.jobhunt.application_tracker",
    meta: { roadmap: "tech_switch", theme: "jobhunt", type: "career", level: "beginner", deliverable: "sheet" },
    explanation: `
A job search becomes much easier to manage when it runs like a simple system rather than an emotional scramble.

This task is about giving your search a basic structure so you can stay consistent even when motivation fluctuates.

Step-by-step
1. Create a tracker with the core information you need.
   Include:
   Company | Role | Date applied | Status | Follow-up date | Notes | Link

2. Set a few weekly targets that feel realistic for your life.
   For example:
   • number of applications  
   • number of networking outreaches  
   • number of interview prep sessions

3. Add two short admin blocks to your week.
   These can be around 30 minutes each and used for:
   • updating the tracker  
   • reviewing open roles  
   • sending follow-ups  
   • planning the next week

4. Treat the process as something you run steadily, not something you only do when you feel inspired.

Outcome
A job hunt system that feels structured, measurable, and easier to sustain.

Deliverable
Applications tracker plus weekly targets
`
  },

  {
    task: "Create 2 follow-up templates (after applying + after interview)",
    duration: 1.0,
    id: "tech_switch.jobhunt.followup_templates",
    meta: { roadmap: "tech_switch", theme: "jobhunt", type: "career", level: "beginner", deliverable: "templates" },
    explanation: `
Follow-ups are much easier when you do not have to write them from scratch every time.

Good follow-ups help you stay professional, visible, and organised without sounding pushy.

Step-by-step
1. Write your first template for following up after an application.
   This should work around 5–7 days after applying.

2. Write your second template for following up after an interview.
   This should include a thank-you plus one short sentence that reinforces why you are a strong fit.

3. Keep both messages short and easy to personalise.
   Under 120 words is usually enough.

4. Save them somewhere easy to access so they are ready when needed.

5. Read them once out loud to make sure they sound warm and natural.

Outcome
Two reusable follow-up templates that help you stay polished and consistent without extra stress.

Deliverable
Two saved follow-up templates
`
  }

],
// Portfolio & GitHub - shared
portfolio_github: [

{
  task: "Learn Git and publish your first repo",
  duration: 1,
  explanation: `
Recruiters do not just want to hear that you have built things. They want to be able to see them.

Publishing your first repository is an important step because it turns private practice into visible proof. It also helps you get comfortable with the basic workflow of version control, which is expected in almost every technical role.

Step-by-step
1. Create a GitHub account if you do not already have one.
   Choose a clean username you would feel comfortable putting on your CV or LinkedIn profile.

2. Pick a small project or set of files to publish first.
   This does not need to be impressive. A few Python practice files, a small coding exercise, or a simple mini-project is enough.

3. Create a new repository locally and connect it to GitHub.
   This is your first experience of moving work from your laptop into a public, shareable space.

4. Make your first commit and push the files.
   The goal here is simply to understand the flow:
   create → commit → push

5. Add a short README explaining what the project is.
   Keep it simple:
   • what it does  
   • what language or tools it uses  
   • why you made it

6. Open the GitHub link in a browser and check that everything looks correct.
   If possible, send the link to a friend and ask them to confirm they can open it.

Outcome
Your first public repository online and shareable, which gives you visible proof of your work and a foundation for future portfolio projects.
`
},
{
  task: "Choose 3 projects you will showcase",
  duration: 0.5,
  explanation: `
A portfolio is stronger when it is focused.

You do not need to show everything you have ever made. In fact, showing too much often makes your work feel less clear. The goal of this task is to choose the projects that best represent your current strengths.

Step-by-step
1. Start by listing all the projects you have completed or mostly completed.
   Include coursework, self-initiated projects, challenge projects, and anything that feels relevant.

2. Review them with a recruiter mindset rather than a sentimental one.
   Ask yourself:
   • which projects are the most complete  
   • which ones best demonstrate useful skills  
   • which ones are easiest to explain  
   • which ones feel most relevant to the roles you want

3. Choose your best three.
   A strong set usually includes a balance of:
   • something polished  
   • something technically interesting  
   • something that clearly solves a problem or shows product thinking

4. Save these three as your “portfolio set.”
   These will become the projects you prioritise for polishing, README improvements, demos, and interview stories.

Outcome
A focused set of three projects that represent your strongest work and give your portfolio a clearer story.
`
},
{
  task: "Create an AI-focused GitHub portfolio",
  duration: 2,
  explanation: `
Your GitHub profile should help someone quickly understand what kind of builder you are.

If you are targeting AI-related roles, your portfolio should not just show random code. It should show projects that make your interests, technical direction, and level of capability easier to understand within a few minutes.

Step-by-step
1. Review your GitHub profile as if you were a recruiter seeing it for the first time.
   Ask:
   • Is it obvious that I am interested in AI?  
   • Do my best projects stand out quickly?  
   • Would someone know where to click first?

2. Pin your three strongest and most relevant projects.
   Choose projects that best represent your AI direction, such as:
   • machine learning  
   • data-driven modelling  
   • LLM or GenAI experiments  
   • applied AI tools  
   • evaluation or automation workflows

3. Improve the README for each pinned project.
   Make sure each one clearly explains:
   • the problem  
   • the approach  
   • the tools or models used  
   • what the output or result was

4. Add screenshots, diagrams, or short demos where helpful.
   AI projects are often easier to understand when people can see the output or flow rather than only reading code.

5. Create one summary repository or landing repository that links everything together.
   This can act like a portfolio hub and should help someone quickly navigate to your best work.

6. Make sure the profile is public, readable, and easy to scan.
   The overall feeling should be clean, intentional, and current.

Outcome
A more professional and easy-to-navigate GitHub profile that makes your AI-related work feel visible, credible, and much easier to evaluate.
`
},
    {
  task: "Write two project case studies",
  duration: 2,
  explanation: `
Strong projects are more valuable when you can explain them clearly.

A case study helps both technical and non-technical reviewers understand what you built, why it mattered, and how you approached the work. It also makes interview preparation easier because you are turning your project into a clear story rather than trying to improvise later.

Step-by-step
1. Choose two projects that are worth talking about in interviews.
   Ideally these should be projects from your main portfolio set.

2. For each project, start with the context.
   Explain:
   • what problem you were trying to solve  
   • who the project was for  
   • why the project mattered

3. Describe your approach in a simple, structured way.
   Focus on:
   • the main decisions you made  
   • the tools or technologies you used  
   • how you structured the solution

4. Include the outcome.
   This could be:
   • measurable results  
   • a working demo  
   • lessons learned  
   • clearer evidence of your skills

5. Add a short reflection section.
   Explain:
   • what was difficult  
   • what you learned  
   • what you would improve in a second version

6. Keep each case study short enough to stay readable.
   Around one page is enough. The goal is clarity, not length.

Outcome
Two clear, interview-ready project stories that help other people quickly understand the value of your work and help you talk about it more confidently.
`
},
  { 
    task: "Pin 3 best repos; rename with clean titles", 
    duration: 1,
    explanation: `
Your GitHub profile should show your strongest work first. Clean, clear, and easy to scan.

Step-by-step
1. Open your GitHub profile and click “Customize your pins” (or “Pin repositories”).  
2. Pick 3 repos that best represent your current skill level (most complete, most polished, most relevant).  
3. Rename each repo to a human-friendly title (Settings → Repository name).  
   Examples: “Expense Tracker” / “KPI Dashboard” / “Churn Prediction”  
4. Update each repo description (one line on the repo homepage) so a recruiter immediately understands what it is.  
5. Re-order pins so your best project is first.

Outcome
A GitHub profile that highlights your best work instantly, with titles that make sense to humans (not just you).

Free Tools
GitHub
`
  },

  { 
    task: "README makeover: problem -> solution -> demo -> setup", 
    duration: 2,
    explanation: `
A strong README makes your project feel real, usable, and professional; like a mini product page.

Step-by-step
1. Open the repo and edit README.md.  
2. Add a short “Problem” section (2–3 sentences): what pain does this solve?  
3. Add a “Solution” section: what your app does + key features (bullets are fine).  
4. Add a “Demo” section:
   - Add 2–4 screenshots, and/or a short GIF  
   - Add a live link if deployed  
5. Add a “Setup” section with copy/paste steps:
   - Requirements (Node/Python/etc.)  
   - Install commands  
   - Run commands  
6. Add a short “Tech Stack” line (React, FastAPI, Postgres, etc.).  
7. Re-read it like a stranger: can someone run it in 5 minutes?

Outcome
A README that tells a clear story and makes your repo easy to try.

Free Tools
GitHub, Markdown
`
  },

  { 
    task: "Add LICENSE, CONTRIBUTING & issue templates", 
    duration: 2,
    explanation: `
These files signal “this project is mature and ready for collaboration”, even if you are the main contributor.

Step-by-step
1. In the repo, click “Add file” → “Create new file”.  
2. Add a LICENSE:
   - Choose MIT if you want a simple permissive license  
   - GitHub can generate one via “Add a license”  
3. Add CONTRIBUTING.md with:
   - How to run locally  
   - How to propose changes  
   - Expected standards (tests, formatting, etc.)  
4. Add issue templates:
   - Settings → Features → Issues → Set up templates (or create .github/ISSUE_TEMPLATE/)  
   - Create one for “Bug report” and one for “Feature request”  
5. Confirm all links work on the repo homepage.

Outcome
A repo that feels professional, contributor-friendly, and properly “packaged”.

Free Tools
GitHub
`
  },

  { 
    task: "Create project screenshots & a GIF demo", 
    duration: 1.5,
    explanation: `
Visuals make your work feel immediate. People understand your project faster when they can see it.

Step-by-step
1. List the 3–5 most important screens or outputs to capture.  
2. Take clean screenshots (full screen or cropped to the relevant area).  
3. Name files clearly (e.g., dashboard.png, filter.png, empty-state.png).  
4. Create a short GIF demo (10–20 seconds) showing the main flow:
   - open app → key action → result  
5. Add screenshots + GIF to your README under “Demo”.

Outcome
A repo that shows your work instantly, even before anyone reads the code.

Free Tools
Built-in screenshot tool, ScreenToGif (Windows), Kap (Mac), Licecap
`
  },

  { 
    task: "Open your first good-first-issue on an OSS repo", 
    duration: 2,
    explanation: `
This gets you comfortable with open-source etiquette: communication, conventions, and small contributions.

Step-by-step
1. Pick one open-source repo you genuinely use or find interesting.  
2. Read the CONTRIBUTING.md (or README) to understand how they want contributions.  
3. Go to the Issues tab and filter for “good first issue” / “help wanted”.  
4. If none exist, look for a small docs improvement you can propose (typo, clarity, missing example).  
5. Comment on the issue:
   - say you’d like to take it  
   - ask any small clarifying question if needed  
6. Create a branch/fork plan (even if you don’t code yet today).

Outcome
A clear first OSS target + an issue you can realistically complete.

Free Tools
GitHub
`
  },

  { 
    task: "Make 1 merged OSS contribution (docs or small bug)", 
    duration: 3,
    explanation: `
A merged PR is tangible proof you can collaborate and ship improvements in someone else’s codebase.

Step-by-step
1. Fork the repo to your GitHub.  
2. Clone your fork locally and create a new branch.  
3. Make a small improvement:
   - docs fix, clearer example, typo correction, small bug fix  
4. Run any basic checks (lint/tests if available).  
5. Commit with a clear message (e.g., “Improve README setup instructions”).  
6. Open a Pull Request:
   - explain what changed and why  
   - include screenshots if relevant  
7. Respond politely to feedback and make requested edits until merged.

Outcome
One merged open-source contribution you can point to in interviews and on LinkedIn.

Free Tools
GitHub, VS Code, repo’s test/lint scripts
`
  },

  { 
    task: "Create a simple portfolio site & link all repos", 
    duration: 3,
    explanation: `
A portfolio site is a clean front door: who you are, what you build, and where to find it.

Step-by-step
1. Choose a simple format:
   - one-page site is enough  
2. Add 5 sections:
   - Hero: name + role + 1-line focus  
   - About: 3–5 sentences  
   - Projects: 3–6 projects with links + 1-line outcomes  
   - Skills: tech + tools  
   - Contact: LinkedIn + email  
3. Add repo links + live demos (if available).  
4. Deploy (GitHub Pages / Netlify / Vercel).  
5. Add the portfolio link to:
   - GitHub profile  
   - LinkedIn “Featured” section

Outcome
A simple site that makes your work easy to browse and easy to hire.

Free Tools
GitHub Pages, Netlify, Vercel, Notion (optional)
`
  },

  { 
    task: "Polish commit history (squash/reword) on active repo", 
    duration: 2,
    explanation: `
A tidy commit history makes your repo feel disciplined and readable, especially for reviewers.

Step-by-step
1. Pick one active repo where commits are messy or unclear.  
2. Identify commits to:
   - squash (combine small incremental commits)  
   - reword (rename vague messages)  
3. Use interactive rebase locally (git rebase -i) on your feature branch.  
4. Rewrite messages to be specific:
   - “fix stuff” → “Fix login redirect loop on refresh”  
5. Force-push the cleaned branch (only if it’s your branch and safe to do).  
6. Confirm the commit history now reads like a story.

Outcome
A repo that looks professional behind the scenes, not just on the surface.

Free Tools
Git, VS Code
`
  },

{
  task: "Create a portfolio landing page (Notion or simple site)",
  duration: 2,
  id: "tech_switch.portfolio_github.portfolio_landing_page",
  meta: { roadmap: "tech_switch", theme: "portfolio_github", type: "portfolio", level: "beginner", deliverable: "link" },
  explanation: `
Recruiters want one link that explains who you are and shows your best work in 30 seconds.

Step-by-step
1. Create a simple landing page (Notion is fine).
2. Include:
   • 2-line bio + target role
   • your top 2–3 projects with links
   • tech stack + tools list
   • contact + LinkedIn + GitHub
3. Keep it clean and skimmable.
4. Put this link on your CV + LinkedIn Featured section.

Outcome
A single “hire me” link that makes you feel legit.

Deliverable
Portfolio landing page link.
`
},
{
  task: "Add “Recruiter Mode” to every top repo (README checklist)",
  duration: 2.0,
  id: "tech_switch.portfolio_github.recruiter_mode_readme",
  meta: { roadmap: "tech_switch", theme: "portfolio_github", type: "portfolio", level: "beginner", deliverable: "repo" },
  explanation: `
Your README is your product page. Make it impossible to misunderstand.

Step-by-step
For each top project, ensure README includes:
1. Problem (2–3 lines)
2. What you built (features bullets)
3. Demo (screenshots/GIF/video)
4. Tech stack
5. Setup (copy/paste commands)
6. What you learned (3 bullets)
7. Next improvements (optional)

Outcome
Repos that look professional and easy to evaluate.

Deliverable
Updated README for each top repo.
`
},
{
  task: "Record a 60–90 sec demo video for your best project",
  duration: 1,
  id: "tech_switch.portfolio_github.demo_video",
  meta: { roadmap: "tech_switch", theme: "portfolio_github", type: "portfolio", level: "beginner", deliverable: "video" },
  explanation: `
A short demo makes your project feel real and reduces recruiter friction.

Step-by-step
1. Record your screen (phone or laptop).
2. Show: problem → key feature → one “wow” moment → result.
3. Add it to README and/or portfolio page.

Outcome
A portfolio that feels tangible, not theoretical.

Deliverable
1 demo video embedded/linked.
`
},
{
  task: "Write 1 polished case study using a template (copy-paste structure)",
  duration: 1.5,
  id: "tech_switch.portfolio_github.case_study_template",
  meta: { roadmap: "tech_switch", theme: "portfolio_github", type: "portfolio", level: "beginner", deliverable: "doc" },
  explanation: `
Case studies help non-technical reviewers understand your value fast.

Template (fill in)
1) Context + problem
2) Goal + success metric
3) Constraints
4) Approach (high-level)
5) Key decisions (3 bullets)
6) Results (even qualitative)
7) Lessons learned
8) Next iteration

Outcome
A confident project story you can reuse in interviews.

Deliverable
1-page case study.
`
}

],


},

financial_glow_up: {

  budgeting: [
  { 
    task: "Track every expense for 7 days (no judgment)", 
    duration: 1,
    explanation: `
Tracking creates awareness, not guilt. This is observation, not correction.

Step-by-step
1. Choose a tracking method: Notes app, spreadsheet, or budgeting app.  
2. For seven days, log every expense; card, cash, subscriptions, and small treats.  
3. For each entry, record amount, category and how it felt or why you spent it:
   Categories (choose one):
   • Groceries  
   • Eating out, coffee, takeaways  
   • Transport (public transport, fuel, taxis)  
   • Shopping (clothes, beauty, home, personal)  
   • Subscriptions & digital services  
   • Housing (rent, utilities, internet, council tax)  
   • Health & fitness (gym, classes, pharmacy)  
   • Work & education (courses, tools, commuting extras)  
   • Entertainment & social (events, drinks, activities)  
   • Travel (trips, accommodation, transport for trips)  
   • Gifts & giving  
   • Personal care (hair, skincare, treatments)  
   • Admin & fees (bank fees, charges, penalties)  
   • Miscellaneous (rare or one-off items only) 
4. Do not edit, justify, or optimise during the week.

Outcome
A clear, honest snapshot of your real spending habits, which is the foundation for smarter decisions.
`
  },

  { 
  task: "Summarize your first week’s budget insights", 
  duration: 0.5,
  explanation: `
Reflection locks learning in before it fades. This step helps turn raw spending data into practical insight.

Step-by-step
1. Review your expense tracking from the past seven days.
2. Look again at your top spending categories and totals.
3. Write short answers to the following questions:

   • What spending surprised you the most?  
   • Which category felt higher than expected?  
   • Which spending actually added value or enjoyment to your week?

4. Identify one spending habit that seems automatic or convenience-driven.
5. Write one small adjustment you want to test next week (for example: fewer takeaway coffees or cooking one extra meal at home).

Outcome
Clear awareness of your spending patterns and one small, realistic change to test next week.
`
},

{
  task: "Calculate your real monthly spending baseline",
  duration: 0.5,
  explanation: `
Understanding how much money you actually spend each month is the foundation of financial control.

Step-by-step
1. Take your total spending from the 7-day expense tracking exercise.
2. Multiply that number by four to estimate a typical monthly spend.

Example  
If you spent £320 in 7 days → estimated monthly spending = about £1280.

3. Compare this estimate with your monthly net income.

4. Calculate the difference:
   • Income minus spending = surplus (money available for saving or investing)  
   • Spending higher than income = deficit that needs adjustment

Outcome
A realistic estimate of your monthly spending baseline and a clearer understanding of your financial position.
`
},

  { 
    task: "Review your top 5 expense categories", 
    duration: 1,
    explanation: `
This step turns raw data into insight.

Step-by-step
1. Group your tracked expenses by category.  
2. Rank them from highest to lowest total spend.  
3. Identify your top five categories.  
4. For each, ask:
   • Is this essential?  
   • Does it genuinely add value or joy?  
   • Is any part habit or convenience-driven?  
5. Choose ONE category where a small, realistic reduction feels doable this month.

Outcome
Clear visibility into where your money actually goes and where small changes will matter most.
`
  },

{
  task: "Create your first monthly budget (needs / wants / savings)",
  duration: 2,
  checklist: [
    // Needs
    "Needs: Rent or mortgage",
    "Needs: Utilities",
    "Needs: Transport",
    "Needs: Basic groceries",
    "Needs: Phone bill",
    "Needs: Minimum debt repayments",

    // Wants
    "Wants: Eating out, coffee, takeaways",
    "Wants: Shopping, beauty, skincare",
    "Wants: Subscriptions",
    "Wants: Social plans and hobbies",

    // Savings
    "Savings: Emergency fund",
    "Savings: Long-term savings",
    "Savings: Investments",
    "Savings: Sinking funds (travel, gifts, moving, big purchases)"
  ],
  explanation: `
A simple monthly budget gives your money direction. It does not need to be perfect, it just needs to exist.

Using three buckets (needs, wants, savings) makes budgeting easier to understand and maintain.

Step-by-step
1. Open a spreadsheet, notes app, or budgeting app.

2. Add your monthly net income (the amount you receive after tax).

3. Add the categories above to your budget.
Tick each item once you have added it.

4. Estimate a monthly amount for each category based on your recent spending or expense tracking.

5. Group your spending into the three buckets:

• Needs → essential living costs  
• Wants → lifestyle spending  
• Savings → money for future goals

6. Compare your total spending with your income.

7. Adjust amounts until your budget is either:
• balanced, or  
• leaving a small surplus for savings.

Outcome
A clear monthly budget that organises your spending into needs, wants, and savings and gives your money a simple structure.
`
},


{
  task: "Reduce spending in one category this month",
  duration: 0.5,
  explanation: `
Small adjustments are easier to sustain than extreme restrictions.

Step-by-step
1. Review your top five expense categories from your tracking exercise.
2. Choose ONE category where reducing spending feels realistic.

Examples:
• Eating out
• Coffee
• Shopping
• Subscriptions
• Transport

3. Set a simple reduction goal of around **10–15%** for the next month.

Examples:
• 10 fewer takeaway coffees
• 2 fewer restaurant meals
• pause one subscription

4. Write your chosen adjustment and keep it visible in your budgeting notes.

Outcome
A realistic spending adjustment that frees up money without drastically changing your lifestyle.
`
},



  { 
    task: "Add a small buffer line to your budget (5%)", 
    duration: 0.5,
    explanation: `
Buffers prevent emotional overcorrection when life happens.

Step-by-step
1. Calculate 5% of your total monthly income.  
2. Add it as a separate line called “Buffer” or “Contingency”.  
3. Do not pre-assign this money.

Outcome
A calmer budget that absorbs surprises without derailing everything else.
`
  },
 
  {
  task: "Set bill payment reminders and notifications",
  duration: 1,
  explanation: `
Reminders help prevent late fees and missed payments.

Step-by-step
1. List all monthly bills and due dates.  
2. Add reminders to your digital calendar.  
3. Enable notifications 2–3 days before each due date.  
4. Where possible, set up automatic payments.

Outcome
Consistent, on-time payments with minimal effort.

Free Tools
Google Calendar
`
},

  { 
    task: "Automate bill payments for essentials", 
    duration: 1,
    explanation: `
Automation removes decision fatigue entirely.

Step-by-step
1. Identify essential bills (rent, utilities, council tax, broadband, minimum debt).  
2. Enable direct debit or auto-pay for each.  
3. Align payment dates with your salary if possible.  
4. Confirm payments are active.

Outcome
Your essentials run quietly in the background, reliable and stress-free.
`
  },
  { 
    task: "Set category alerts in your budgeting app", 
    duration: 0.5,
    explanation: `
Early warnings beat end-of-month regret.

Step-by-step
1. Open your banking or budgeting app.  
2. Turn on alerts for each spending category.  
3. Set notifications at 75–90% of the limit.  

Outcome
Gentle nudges that help you adjust before overspending.
`
  },
  { 
    task: "Weekly pantry & fridge audit to reduce food waste",
    duration: 0.5,
    recurrence: "weekly",
    explanation: `
A small ritual with outsized financial and mental returns.

Step-by-step
1. Quickly scan fridge, freezer, and pantry.  
2. Group items into:
   • Use now  
   • Use soon  
   • Restock later  
3. Plan 2–3 simple meals around what needs using.  
4. Write a shopping list that only fills the gaps.

Outcome
Lower grocery spend, fewer emergency takeaways, and less decision fatigue.
`
  },
  { 
    task: "Do a no-spend day challenge", 
    duration: 0.5,
    explanation: `
This is a reset, not a punishment.

Step-by-step
1. Choose one day this week.  
2. Spend nothing beyond essentials already paid for.  
3. Cook at home, walk where possible, use what you own.

Outcome
A mental reset around spending, and proof you don’t need to buy to function.
`
  },
  { 
    task: "Create a ‘fun money’ cap and stick to it for 2 weeks", 
    duration: 0.5,
    explanation: `
Boundaries make enjoyment guilt-free.

Step-by-step
1. Choose a realistic weekly fun-money amount.  
2. Track only this category for two weeks.  
3. Spend freely within the limit.  
4. Stop when it’s used. No borrowing from other buckets.

Outcome
Enjoyment without overspending or second-guessing.
`
  },
  { 
    task: "Switch 3 purchases to lower-cost alternatives this week", 
    duration: 0.5,
    explanation: `
Savings compound faster when captured immediately.

Step-by-step
1. Identify three regular purchases.  
2. Find a cheaper alternative (brand, store, timing, size).  
3. Make the swap once.  
4. Transfer the saved amount into savings or a sinking fund.

Outcome
Immediate proof that small optimisations add up.
`
  },
  { 
    task: "Price-compare 3 recurring bills (energy, broadband, mobile)", 
    duration: 1,
    explanation: `
Loyalty is rarely rewarded. Checking is powerful.

Step-by-step
1. List current providers, costs, and contract end dates.  
2. Compare at least two alternatives per bill.  
3. Call your provider and request a better rate.  
4. Switch if it makes sense.  
5. Calendar the next review date.

Outcome
Lower monthly bills and stronger negotiating confidence.
`
  },
  { 
    task: "Create sinking funds (travel, gifts, car, beauty)", 
    duration: 1.0,
    explanation: `
Sinking funds turn future stress into calm readiness.

Step-by-step
1. List irregular but predictable expenses.  
2. Create labelled pots or accounts.  
3. Decide a small weekly or monthly contribution.  
4. Automate transfers if possible.

Outcome
Preparedness instead of scrambling when costs arrive.
`
  },
  { 
    task: "Plan a weekly money review ritual (30 mins)",
    duration: 0.5,
    frequency: "weekly",
    explanation: `
This keeps everything intentional and under control.

Step-by-step
1. Choose a fixed day and time each week.  
2. Open your bank or budgeting app.  
3. Review spending by category.  
4. Move leftovers into savings or sinking funds.  
5. Adjust next week’s limits based on reality, not guilt.

Outcome
Ongoing financial clarity and quiet confidence.
`
  }
],

debt_credit: [
  {
    task: "List all debts: balances, interest rates, due dates",
    duration: 1,
    explanation: `
Clarity reduces anxiety and makes strategy possible. You cannot improve what you have not fully mapped.

Step-by-step
1. Open a spreadsheet, notes app, or document.
2. List every debt you currently have.

Include:
• Credit cards  
• Personal loans  
• Overdrafts  
• Buy now, pay later balances  
• Store cards  
• Any money owed with formal repayment terms

3. For each debt, record:
   • Lender  
   • Current balance  
   • Interest rate (APR)  
   • Minimum monthly payment  
   • Due date  
   • Whether the rate is fixed, variable, or promotional
4. Double-check the numbers against your latest statement or app.
5. Add one final column called “Priority notes”.

Examples:
• highest interest  
• smallest balance  
• promo ends soon  
• easy to clear quickly

Outcome
A complete, honest snapshot of your debt landscape in one place, ready for decision-making.
`
  },

  {
    task: "Check your credit score and note three ways to improve it",
    duration: 1,
    explanation: `
Your credit score influences borrowing, housing options, and sometimes even utilities. The goal here is not to obsess over the number, but to understand what is helping or hurting it.

Step-by-step
1. Check your credit score using a free platform.
2. Write down:
   • your score  
   • the date you checked it  
   • which service you used
3. Review the main factors affecting your score.

Common factors include:
• Payment history  
• Credit utilisation  
• Length of credit history  
• Number of recent applications  
• Errors on your file

4. Write down three ways your score could improve.

Examples:
• Pay every bill on time  
• Reduce credit card utilisation below a safer level  
• Correct any mistakes on your file  
• Stop applying for unnecessary new credit

5. Circle the ONE improvement lever you will prioritise first.
6. Write one sentence explaining why that is your first move.

Outcome
A clearer understanding of your credit position, what affects it, and which improvement step matters most right now.
`
  },

  {
    task: "Order your statutory credit report and scan for errors",
    duration: 1.0,
    explanation: `
Accuracy matters. Even a small mistake on your credit report can affect your score and your options.

Step-by-step
1. Request your official statutory credit report.
2. Review the report slowly, section by section.
3. Check:
   • Personal details  
   • Address history  
   • Electoral roll information if relevant  
   • Open and closed accounts  
   • Payment history  
   • Defaults or missed payments  
   • Credit searches
4. Flag anything that looks wrong.

Examples:
• Wrong balance  
• Closed account shown as open  
• Incorrect missed payment  
• Address that is not yours  
• Duplicate entry

5. Make a note of each suspected error in one list.
6. Submit disputes for anything incorrect and save confirmation screenshots or emails.

Outcome
A credit record that reflects reality, not outdated or incorrect information.
`
  },

  {
    task: "Pick a strategy: snowball or avalanche",
    duration: 1,
    explanation: `
Choosing a payoff strategy removes indecision and helps you stay consistent. There is no perfect strategy for everyone. The best one is the one you can stick to.

Step-by-step
1. Review your full debt list.
2. Understand the two main options:

• Snowball = pay minimums on all debts, then put extra money toward the smallest balance first  
• Avalanche = pay minimums on all debts, then put extra money toward the highest interest debt first

3. Ask yourself:
   • Do I need quick psychological wins to stay motivated?  
   • Or do I care more about reducing total interest paid?

4. Choose your strategy:
   • Choose snowball if motivation and momentum matter most  
   • Choose avalanche if reducing interest cost matters most
5. Reorder your debt list based on the strategy you chose.
6. Write your chosen strategy at the top of your debt tracker.
7. Commit to following it for at least three months before changing course.

Outcome
A clear, committed debt payoff strategy that matches both your finances and your personality.
`
  },

{
  task: "Build your debt payment plan into your monthly budget",
  duration: 1,
  explanation: `
A debt strategy only works when it is attached to a real monthly plan.

Step-by-step
1. List every debt with:
   • balance  
   • minimum payment  
   • APR
2. Calculate your total monthly minimum payments.
3. Add all minimum payments into your monthly budget first.
4. Decide how much extra money you can realistically put toward one priority debt each month.
5. Write your plan in one sentence:
   “I will pay all minimums plus £___ extra toward ___.”
6. Save this plan where you review your budget each week.

Outcome
A debt plan that fits your real cash flow instead of staying vague.
`
},

  {
    task: "Create a payoff timeline visual with milestones",
    duration: 1.0,
    explanation: `
Visible progress makes debt repayment feel more real, more motivating, and less endless.

Step-by-step
1. Look at your debt list and current payment plan.
2. Estimate how long each debt may take to pay off based on:
   • minimum payment  
   • extra payment amount  
   • chosen strategy
3. Create a simple visual timeline.

You can use:
• a spreadsheet  
• a notes app  
• a handwritten tracker  
• a progress bar or checklist

4. Add milestone points.

Examples:
• First debt under £1000  
• First account cleared  
• 25% of total debt gone  
• Halfway point reached  
• Final debt paid off

5. Add target dates next to each milestone.
6. Keep the visual somewhere easy to revisit during your weekly money review.

Outcome
A visible debt payoff path that keeps motivation alive and makes progress easier to recognise.
`
  },

  {
    task: "Set up auto-pay to avoid late fees",
    duration: 0.5,
    explanation: `
Late payments cost money and can damage your credit score. Automation protects you from avoidable mistakes.

Step-by-step
1. Go through each debt account one by one.
2. Enable auto-pay for at least the minimum payment on every debt.
3. Choose a payment date that works with your cash flow.
4. Check that enough money will be in your account before each payment goes out.
5. If you plan to make extra payments, keep those separate so you stay flexible.
6. Confirm all auto-pay settings are active.

Outcome
On-time payments with less stress, less mental effort, and lower risk of missed deadlines.
`
  },

  {
    task: "Align payment due dates within the same week or month",
    duration: 0.5,
    explanation: `
Aligned due dates simplify your cash flow and make debt easier to manage mentally.

Step-by-step
1. Check your current due dates for each debt.
2. See whether your lenders allow due-date changes.
3. Request changes so payments fall:
   • shortly after payday, or  
   • within the same week each month
4. Once changes are confirmed, update your reminders, calendar, or budget.

Outcome
A repayment schedule that feels simpler, calmer, and easier to stay on top of.
`
  },

  {
    task: "Make an extra payment this month (even small)",
    duration: 0.5,
    explanation: `
An extra payment creates immediate momentum. It does not need to be large to matter.

Step-by-step
1. Choose one debt to target based on your strategy.
2. Decide on an extra payment amount.

Examples:
• £10  
• £25  
• £50  
• the money saved from one spending cut

3. Make sure all minimum payments are still covered first.
4. Make the extra payment.
5. Where possible, ensure the payment goes directly toward the balance rather than future minimums.
6. Record the new balance and the date you made the payment.

Outcome
Faster progress, stronger momentum, and proof that even small actions move the debt down.
`
  },

  {
    task: "Automate round-up or micro-payments toward debt",
    duration: 0.5,
    explanation: `
Tiny, consistent actions can reduce debt quietly in the background.

Step-by-step
1. Check whether your bank or app offers:
   • round-ups  
   • spare change transfers  
   • micro-savings or micro-payment features
2. Enable the feature if it is practical for you.
3. Direct the money toward debt repayment where possible.
4. Review after a few weeks to make sure it is helping rather than straining your cash flow.

Outcome
Debt that shrinks gradually through small, low-effort payments.
`
  },

  {
    task: "Call a provider to negotiate a lower interest rate",
    duration: 1,
    explanation: `
Even a modest rate reduction can save meaningful money over time. Asking is worth trying.

Step-by-step
1. Choose one high-interest debt account.
2. Prepare before contacting the provider.
3. Write down:
   • your current interest rate  
   • how long you have had the account  
   • whether you have paid on time  
   • any competitor or promotional offers you have seen
4. Use a short, calm script.

Example:
“I’ve been a reliable customer and I’m reviewing my finances carefully. Is there any lower rate, retention offer, or promotional option available on this account?”

5. Ask clearly whether they can:
   • reduce the rate  
   • offer a temporary promotion  
   • move you to a better plan
6. Record the outcome, even if the answer is no.
7. If the answer is no, ask whether there is any other support or option worth reviewing.

Outcome
A chance to reduce interest costs and stronger confidence in advocating for yourself financially.
`
  },

  {
    task: "Do a consolidation check and compare balance transfer options",
    duration: 1,
    explanation: `
Consolidation can simplify repayment, but only when the total cost and behaviour risk both make sense.

Step-by-step
1. Compare any balance transfer or consolidation options available to you.
2. For each option, write down:
   • transfer fee  
   • promotional period  
   • interest rate during the promo  
   • interest rate after the promo ends  
   • any monthly or annual fees
3. Calculate the likely total cost over time, not just the headline rate.
4. Ask yourself:
   • Will this genuinely reduce interest paid?  
   • Will this simplify repayment?  
   • Am I likely to run up the old balances again if I transfer debt?
5. Only proceed if the savings are clear and the structure supports better behaviour, not just temporary relief.
6. If you do not proceed, write one sentence explaining why.

Outcome
A smarter consolidation decision based on total cost, not marketing language or short-term emotion.
`
  },

  {
    task: "Close or downgrade one unused fee-charging account",
    duration: 1.0,
    explanation: `
Unused accounts can quietly drain money, but closing the wrong one can also affect your credit. This task is about making a careful decision, not rushing.

Step-by-step
1. Identify one account that charges a fee and gives you little or no real benefit.
2. Check the account details:
   • annual or monthly fee  
   • credit limit  
   • age of the account  
   • whether it is still actively used
3. Consider the possible impact of closing it:
   • Will it reduce your total available credit?  
   • Could that increase your utilisation ratio?  
   • Is it one of your oldest accounts?  
   • Is downgrading to a no-fee version possible instead?
4. Compare your options:
   • keep it  
   • downgrade it  
   • close it
5. Choose the option that reduces cost without harming your credit position unnecessarily.
6. If you close or downgrade it, confirm the change in writing and save the confirmation.

Outcome
A cleaner, lower-fee account setup with fewer accidental downsides.
`
  }
],

saving: [
  {
    task: "Open or review a dedicated savings account with good interest",
    duration: 1.0,
    explanation: `
Keeping savings separate from spending reduces temptation and makes your progress easier to see.

Step-by-step
1. Check whether you already have a savings account.
2. Review:
   • interest rate  
   • withdrawal rules  
   • whether the account feels too easy or too difficult to access  
   • whether it is clearly separate from your everyday spending account
3. Compare a few savings options available to you.

Look for:
• competitive interest  
• easy deposits  
• clear withdrawal rules  
• a structure that supports your goal rather than sabotages it

4. Choose one account that feels practical and motivating.
5. Name it something clear and specific.

Examples:
• Emergency Fund  
• Freedom Fund  
• Travel Pot  
• House Deposit  
• New Laptop Fund

6. Save your login details securely and make sure you can access the account when needed.

Outcome
A clearly defined, motivating home for your savings that feels separate from everyday spending.
`
  },

  {
    task: "Build your savings system: emergency fund, sinking funds, and goal pots",
    duration: 1,
    explanation: `
Saving becomes much easier when each pot has a job. A simple system helps you know what you are saving for and why.

Step-by-step
1. Create three types of savings buckets:
   • Emergency fund  
   • Sinking funds  
   • Specific goal pots
2. Define each one:
   • Emergency fund = money for unexpected essential costs  
   • Sinking funds = money for predictable irregular expenses  
   • Goal pots = money for future plans you are actively building toward
3. Add one example to each:
   • Emergency fund  
   • Gifts, annual bills, repairs, travel, beauty top-ups  
   • Deposit, moving fund, laptop, course fees
4. Decide which category matters most for you right now.
5. Set up these pots in your bank, app, or spreadsheet, even if you only start with labels for now.

Outcome
A savings structure that feels organised, intentional, and much easier to maintain.
`
  },

  {
    task: "Calculate your emergency fund target (3–6 months)",
    duration: 1,
    explanation: `
An emergency fund creates stability. It gives you breathing room when life becomes expensive, uncertain, or inconvenient.

Step-by-step
1. List your essential monthly expenses.

Include:
• Rent or mortgage  
• Utilities  
• Basic food  
• Transport  
• Insurance  
• Minimum debt payments  
• Essential phone or internet costs  
• Any other non-negotiable basics

2. Add up one month of essential spending.
3. Multiply that number by:
   • 3 if you want a starter target  
   • 6 if you want a stronger cushion
4. Choose the version that feels realistic for your current stage.
5. Write the number down clearly as your target.

Example:
If essentials are £1,400 per month:
• 3-month emergency fund = £4,200  
• 6-month emergency fund = £8,400

6. Remind yourself that you do not need to build it all at once.

Outcome
A clear emergency fund goal that protects your peace of mind and gives your saving a concrete purpose.
`
  },

  {
    task: "Choose your first sinking fund and calculate the monthly amount",
    duration: 1.0,
    explanation: `
Sinking funds help you prepare for predictable costs before they become stressful.

Step-by-step
1. Choose one irregular expense you know will happen.

Examples:
• gifts  
• annual insurance  
• travel  
• home items  
• beauty maintenance  
• car costs  
• moving costs

2. Estimate the total amount you will need.
3. Estimate when you will need the money.
4. Divide the total by the number of months left.

Example:
£360 needed in 6 months = £60 per month

5. Add this amount to your savings plan.
6. Label the pot clearly so you know exactly what it is for.

Outcome
A realistic plan for one future expense so it does not suddenly disrupt your budget later.
`
  },

  {
    task: "Automate a weekly or monthly transfer",
    duration: 0.5,
    explanation: `
Automation removes willpower from the equation. Saving becomes much easier when it happens before you have time to spend the money elsewhere.

Step-by-step
1. Choose a realistic savings amount.
2. Decide whether weekly or monthly feels better for you.
   • Weekly can feel easier and lighter  
   • Monthly can feel simpler if you are paid monthly
3. Schedule the transfer for just after payday or just after income arrives.
4. Set it up as a standing order or automatic transfer.
5. Confirm the first transfer date.
6. Check after the first payment that it went through correctly.

Outcome
Consistent saving that happens without daily decisions or repeated effort.
`
  },

  {
    task: "Set up round-ups or ‘save the change’ automation",
    duration: 0.5,
    explanation: `
Small, nearly invisible actions add up over time. This is not your whole savings plan, but it is a helpful extra layer.

Step-by-step
1. Check whether your bank offers:
   • round-ups  
   • save the change  
   • micro-savings features
2. Enable the feature for everyday spending.
3. Link it to your chosen savings account.
4. Check how the money is moved so you understand the system.
5. Review after a few weeks to make sure it feels helpful, not confusing.

Outcome
Effortless background savings that grow quietly alongside your main plan.
`
  },

  {
    task: "Cut two recurring expenses and redirect to savings",
    duration: 1,
    explanation: `
Redirecting money immediately is one of the easiest ways to increase savings without waiting for motivation.

Step-by-step
1. Review your recurring charges.

Include:
• subscriptions  
• memberships  
• app fees  
• digital services  
• low-value monthly payments

2. Identify two that are low-value, rarely used, or easy to reduce.
3. Decide whether to:
   • cancel  
   • downgrade  
   • pause  
   • switch to a cheaper version
4. Add up the amount you are freeing up each month.
5. Increase your automated savings transfer by that exact amount.

Example:
Canceling a £9.99 subscription and downgrading a £20 plan to £10 = £19.99 redirected to savings

Outcome
Higher savings without needing to change your whole lifestyle.
`
  },

  {
    task: "Negotiate one subscription discount or cancel it",
    duration: 1.0,
    explanation: `
A single negotiation can lower your monthly costs for much longer than one one-off spending cut.

Step-by-step
1. Choose one flexible subscription or service.

Examples:
• internet  
• mobile  
• gym  
• streaming  
• software  
• insurance renewal if relevant

2. Check competitor prices or cheaper alternatives.
3. Contact the provider politely.
4. Ask whether they can offer:
   • a retention discount  
   • a cheaper plan  
   • a temporary promotion  
   • a better rate for staying
5. Compare the new offer with your actual usage.
6. Accept the better rate if it makes sense, or cancel if it no longer earns its place in your budget.
7. Redirect the savings into your savings pot.

Outcome
Lower monthly costs and stronger confidence in asking for better financial terms.
`
  },

  {
    task: "Do a 7-day food-spend reset with a 5-dinner meal plan",
    duration: 1.0,
    explanation: `
Food spending is one of the easiest places to recover money without making life feel miserable. A short reset helps you save while learning what is realistic for you.

Step-by-step
1. Choose five simple dinners you actually like and will realistically cook.
2. Write one shopping list covering those meals.
3. Buy only what you need for the plan, plus genuine basics.
4. Commit to no takeaways for seven days.
5. Cook once or twice in batches if that makes the week easier.
6. Keep note of what you would usually have spent on:
   • takeaways  
   • delivery fees  
   • convenience meals  
   • last-minute food buys
7. At the end of the week, estimate the money saved and move part or all of it into savings.

Outcome
Lower food spending, better awareness, and a practical way to turn small daily choices into real savings.
`
  },

  {
    task: "Plan three low-cost leisure alternatives",
    duration: 1.0,
    explanation: `
Saving does not have to mean shrinking your life. It works better when you build enjoyable lower-cost defaults.

Step-by-step
1. Think about the situations where you usually spend money socially or for comfort.
2. Create three lower-cost alternatives you would actually use.

Examples:
• coffee instead of cocktails  
• a walk instead of a taxi  
• inviting a friend over instead of eating out  
• movie night at home instead of an expensive plan  
• library, museum, or local event instead of shopping

3. Save these ideas in your phone or notes app.
4. Use them as your first option the next time you want to go out, socialise, or lift your mood.

Outcome
An enjoyable lifestyle that still supports saving, rather than constantly competing with it.
`
  },

  {
    task: "Sell three unused items and move proceeds to savings",
    duration: 1,
    explanation: `
Turning clutter into cash builds momentum and reminds you that savings can come from more than just salary.

Step-by-step
1. Choose three unused items in good condition.

Examples:
• clothes  
• shoes  
• home items  
• tech  
• accessories  
• beauty tools

2. Clean them up if needed.
3. Photograph them in good natural light.
4. Write clear listing titles and honest descriptions.
5. Post them on a marketplace you are comfortable using.
6. When they sell, transfer the money into savings as soon as you receive it.
7. Record the amount so you can see that your savings grew from action, not only restraint.

Outcome
Extra savings created without touching your monthly income.
`
  },

  {
    task: "Set a mini-milestone: first £500 saved target",
    duration: 0.5,
    explanation: `
Small wins create momentum. A visible early target makes saving feel more possible and more rewarding.

Step-by-step
1. Choose your first milestone.

Examples:
• £250  
• £500  
• £1,000

2. Pick an amount that feels meaningful but realistic.
3. Write the target somewhere visible.
4. Track progress visually if possible.
   You could use:
   • a savings tracker  
   • a notes app  
   • a spreadsheet  
   • a simple progress bar
5. Decide in advance how you will celebrate when you hit it.
   Keep the celebration small and not financially self-sabotaging.

Outcome
More motivation, clearer momentum, and an early win that makes saving feel real.
`
  },

  {
    task: "Name your savings pots (psychology boost)",
    duration: 0.5,
    explanation: `
Naming gives money purpose. Savings are easier to protect when they feel connected to something meaningful.

Step-by-step
1. Review each savings pot or account you have.
2. Rename each one based on its actual purpose.

Examples:
• Emergency Fund  
• Freedom Fund  
• Travel Pot  
• Laptop Fund  
• New City Cushion  
• House Deposit

3. Choose names that feel motivating, reassuring, or emotionally clear.
4. Avoid vague names like “Savings 1” or “Account 2”.

Outcome
Savings that feel intentional, personal, and easier to stay committed to.
`
  },

  {
    task: "Do a ‘future you’ letter on what savings allow",
    duration: 0.5,
    explanation: `
Connecting emotionally to your goals makes the habit of saving much easier to sustain.

Step-by-step
1. Write a short note or one-page letter to your future self.
2. Describe what savings make possible.

Examples:
• safety when life changes  
• freedom to leave a bad situation  
• calm during emergencies  
• options for travel, moving, study, or rest  
• less panic and more choice

3. Write in a warm, encouraging tone.
4. Save the letter somewhere easy to revisit.
5. Read it again during low-motivation moments or when saving feels slow.

Outcome
A stronger emotional reason to keep going, even when progress feels gradual.
`
  }
],
wealth_mindset: [
  { 
    task: "Write down your earliest money memory", 
    duration: 0.5, 
    explanation: `
Early money experiences often shape how we think, feel, and behave with finances long before we question them.

Step-by-step
1. Write down your first clear memory involving money.

Examples:
• being given pocket money  
• seeing a parent stress about bills  
• saving for something you wanted  
• being told money was tight  
• feeling proud, guilty, anxious, or excited about spending

2. Describe what happened in a few sentences.
3. Write down how it made you feel at the time.

Examples:
• safe  
• anxious  
• proud  
• ashamed  
• excited  
• restricted  
• confused

4. Ask yourself: what lesson did I unconsciously take from this?
5. Write that lesson down honestly, even if it feels outdated or irrational.
6. Then write one updated belief you want to consciously teach yourself now.

Example:
• Old lesson: “Money disappears quickly, so I should spend it while I can.”  
• New lesson: “I can enjoy money and still make thoughtful long-term choices.”

Outcome
Awareness of where your money patterns may have started, and permission to update them.
`
  },

  { 
    task: "List 3 limiting money beliefs and reframe them", 
    duration: 1.0, 
    explanation: `
Beliefs shape behaviour, even when they are quiet, familiar, or outdated. Reframing them helps create mental space for better choices.

Step-by-step
1. Write down three recurring thoughts you have about money.

Examples:
• “I’m bad with money.”  
• “I’ll never catch up.”  
• “Other people are naturally better at this.”  
• “Saving is too hard for someone like me.”  
• “If I look closely at my finances, I’ll feel worse.”

2. Ask yourself for each one:
   • Is this always true?  
   • Is this a fact, or just a familiar story?  
   • Does this belief help me behave better with money?
3. Rewrite each belief into a more supportive and realistic version.

Example:
• Old: “I’m bad with money.”  
• New: “I am learning to manage money more effectively over time.”

4. Keep the new version believable, not overly dramatic.
5. Save the three reframed beliefs somewhere easy to revisit.

Outcome
Mental scripts that support progress instead of quietly blocking it.
`
  },

  { 
    task: "Define your personal money values", 
    duration: 1.0, 
    explanation: `
Money decisions become clearer when you know what you actually want money to support in your life.

Step-by-step
1. Write down 5 things you want money to make possible for you.

Examples:
• peace  
• freedom  
• security  
• family support  
• beauty and comfort  
• travel  
• generosity  
• rest  
• options  
• independence

2. Circle the top 3 that matter most right now.
3. For each value, write one practical example of how money can support it.

Examples:
• Security → building an emergency fund  
• Freedom → reducing debt  
• Travel → saving into a dedicated pot

4. Compare your recent spending and saving habits with these values.
5. Write one small adjustment that would make your money behaviour match your values more closely.

Outcome
A more grounded relationship with money based on what truly matters to you, not guilt, comparison, or pressure.
`
  },

  { 
    task: "Notice your current money identity and choose an upgrade", 
    duration: 0.5, 
    explanation: `
People often act in line with the identity they believe they have. Changing money behaviour becomes easier when you consciously choose a stronger identity to grow into.

Step-by-step
1. Finish this sentence honestly:
   “Right now, I often act like someone who is…”
2. Write 2–3 words that describe your current money identity.

Examples:
• avoidant  
• impulsive  
• anxious  
• inconsistent  
• learning  
• cautious

3. Then finish this sentence:
   “I want to become someone who is…”
4. Choose 2–3 upgraded identity words.

Examples:
• intentional  
• calm  
• organised  
• self-trusting  
• disciplined  
• thoughtful

5. For each upgraded word, write one behaviour that would prove it.

Example:
• Intentional → I check my budget before making non-essential purchases  
• Calm → I review my finances weekly instead of avoiding them

Outcome
A clearer identity shift that links mindset to real financial behaviour.
`
  },

  { 
    task: "Create 3 grounded money beliefs and one visible reminder", 
    duration: 0.5, 
    explanation: `
Mindset tools work best when they feel believable, calm, and easy to revisit in everyday life.

Step-by-step
1. Write three supportive money beliefs that feel realistic rather than exaggerated.

Examples:
• “I am becoming more intentional with money.”  
• “I can make thoughtful financial decisions without panic.”  
• “Small consistent actions are improving my finances.”  
• “I do not need to be perfect to get better with money.”

2. Choose the one that feels most helpful right now.
3. Turn it into one short reminder you can actually see.
4. Place it somewhere visible:

Examples:
• phone lock screen  
• wallet note  
• desktop sticky note  
• journal cover  
• budgeting spreadsheet header

5. Read it before a moment when you usually spend impulsively or avoid your finances.

Outcome
A practical mindset reminder that quietly supports steadier financial decisions.
`
  },

  { 
    task: "Design a ‘money environment’: desktop or phone widgets for goals", 
    duration: 0.5, 
    explanation: `
Your environment influences your behaviour more consistently than motivation does. Small visual cues can keep your priorities present without making money feel stressful.

Step-by-step
1. Choose 1–2 places you see every day.

Examples:
• phone home screen  
• desktop wallpaper  
• notes widget  
• calendar reminder  
• budgeting app homepage

2. Add one visual cue linked to your financial priorities.

Examples:
• your savings goal name  
• a reminder phrase  
• a screenshot of your tracker  
• your emergency fund target  
• a simple “Spend with intention” note

3. Keep it subtle and supportive, not aggressive or guilt-based.
4. Check whether the visual cue makes you feel focused, calm, and purposeful.
5. Adjust it if it feels stressful or too easy to ignore.

Outcome
A digital environment that quietly reinforces your financial priorities every day.
`
  },

  { 
    task: "Identify 1 trigger that causes overspending and a replacement habit", 
    duration: 0.5, 
    explanation: `
Overspending is often a pattern, not a personality flaw. The goal is to spot one trigger and interrupt it with something gentler and more useful.

Step-by-step
1. Think about a situation where you tend to spend unnecessarily.
2. Identify one trigger.

Examples:
• stress  
• boredom  
• loneliness  
• fatigue  
• scrolling online  
• passing certain shops  
• payday excitement

3. Write down what usually happens next.
   Example:
   “When I feel stressed after work, I open delivery apps and buy food I did not plan.”
4. Choose one replacement habit that meets the same need without spending.

Examples:
• Stress → short walk or shower  
• Boredom → tea and one chapter of a book  
• Scrolling urge → close app and set a 10-minute timer  
• Payday excitement → transfer savings first, then review wants later

5. Try the replacement habit the next time the trigger appears.
6. Note whether it helped, even slightly.

Outcome
A practical interruption that protects your money without relying on shame or harsh restriction.
`
  },

  { 
    task: "Track 1 gratitude moment related to money each day for a week", 
    duration: 0.5, 
    explanation: `
Gratitude helps shift attention from constant scarcity toward evidence of progress, support, and sufficiency.

Step-by-step
1. For seven days, write down one small money-related win or comfort each day.
2. Keep it concrete and ordinary.

Examples:
• brought lunch from home  
• found a discount  
• remembered to cancel a trial  
• automated a savings transfer  
• resisted an impulse buy  
• received helpful advice  
• noticed I already had enough

3. Do not force big or dramatic answers.
4. At the end of the week, read all seven entries together.

Outcome
A calmer, more grounded relationship with money built through noticing what is already working.
`
  },

  { 
    task: "Read 1 chapter or article on money psychology", 
    duration: 0.5, 
    explanation: `
Understanding behaviour makes change easier. When you understand why money decisions feel emotional, habits become easier to shift.

Step-by-step
1. Choose one chapter, essay, podcast transcript, or article focused on money habits or money psychology.
2. Read slowly enough to notice what resonates.
3. Write down one idea that stood out to you.
4. Ask yourself:
   • Why did this resonate?  
   • Where do I see this in my own life?
5. Write one sentence about how you could apply the insight this week.

Outcome
A more informed, compassionate understanding of your financial behaviour.
`
  },

  { 
    task: "Notice proof: one smart habit from others and one from yourself", 
    duration: 0.5, 
    explanation: `
Confidence grows when you collect evidence that financial progress is possible and already happening in small ways.

Step-by-step
1. Read or watch one realistic story of someone improving their finances.
2. Ignore comparison around income, age, or lifestyle.
3. Focus only on the habit or system that helped them.
4. Write down one habit you could borrow.
5. Then list one smart money move you have made yourself recently.

Examples:
• checked my balance before spending  
• cooked instead of ordering  
• negotiated a bill  
• paused a subscription  
• made an extra debt payment

6. Write one sentence about what this says about the kind of person you are becoming.

Outcome
More self-trust, less comparison, and stronger belief that progress is built through habits.
`
  },

  { 
    task: "Write a ‘year from now’ money vision paragraph", 
    duration: 0.5, 
    explanation: `
Clarity creates direction. A useful vision is not fantasy, it is a practical picture of how you want your financial life to feel and function.

Step-by-step
1. Imagine your finances one year from now.
2. Write one short paragraph describing:
   • what has improved  
   • what habits are more consistent  
   • what savings or debt progress has happened  
   • how you feel day to day
3. Include specifics where possible.

Examples:
• “I have a starter emergency fund.”  
• “I know where my money goes each month.”  
• “I do not panic when an unexpected expense appears.”  
• “I feel calmer and more in control.”

4. Keep the tone grounded, warm, and believable.
5. Save the paragraph somewhere you can revisit during monthly reviews.

Outcome
A clear emotional and practical picture of the financial life you are building toward.
`
  },

  { 
    task: "Plan a monthly reflection ritual (journal prompts)", 
    duration: 0.5, 
    explanation: `
Regular reflection keeps money habits intentional instead of reactive. This is where you notice patterns and make small, smart adjustments.

Step-by-step
1. Choose a consistent time each month.
   Example:
   • first Sunday  
   • last Friday evening  
   • payday weekend
2. Set aside 20 minutes.
3. Open your journal, notes app, or budgeting tool.
4. Answer these prompts:
   • What worked this month?  
   • What wobbled?  
   • What felt easier than before?  
   • What triggered stress or avoidance?  
   • What will I adjust next month?
5. End by writing one supportive sentence to yourself rather than criticising everything that was imperfect.

Outcome
A sustainable reflection habit that supports long-term financial growth with more self-awareness and less reactivity.
`
  }
],
career_growth: [
  {
    task: "List your 5-year career and financial goals",
    duration: 1.0,
    explanation: `
Clarity on where you want to go makes short-term decisions easier, more strategic, and less reactive.

Step-by-step
1. Write down where you would ideally like to be in five years professionally.

Examples:
• in a more senior role  
• in a different industry  
• managing projects or people  
• working more independently  
• earning significantly more  
• building a side business alongside your main role

2. Add one or two financial goals linked to that vision.

Examples:
• earn £15,000 more per year  
• build a 6-month emergency fund  
• save for a home deposit  
• create a second income stream

3. Now bring it closer:
   write the next three realistic steps you could take in the next 12 months.

Examples:
• improve one high-value skill  
• update CV and LinkedIn  
• apply for better-paid roles  
• have one promotion conversation  
• complete a certification

4. Keep the list concise and visible.
5. Revisit it during your monthly or quarterly review.

Outcome
A clearer destination that helps your career and money decisions feel more aligned.
`
  },

  {
    task: "Research salary benchmarks for your role",
    duration: 1,
    explanation: `
Knowing the market gives you leverage. It helps you understand whether you are underpaid, fairly paid, or ready to position yourself for more.

Step-by-step
1. Search salary data for your role, level, and region.
2. Use at least two or three sources.

Examples:
• job boards  
• salary websites  
• recruiter reports  
• recent job ads with pay ranges  
• conversations with recruiters or trusted peers

3. Record:
   • job title  
   • level or seniority  
   • location  
   • salary range  
   • any bonus or package details if available
4. Compare the range with your current pay.
5. Write down where you currently sit:
   • below market  
   • around market  
   • above market
6. Save links, screenshots, or notes in one place for future raise or job-search conversations.
7. Write one sentence summarising what you learned.

Example:
“My current salary appears to be at the lower end of the market for my level in London.”

Outcome
A data-backed understanding of your earning potential and stronger confidence in future compensation conversations.
`
  },

  {
    task: "List three skills that boost earning potential in your field",
    duration: 1.0,
    explanation: `
The fastest career growth usually comes from building skills that increase your value, scope, and credibility.

Step-by-step
1. Look at job descriptions for roles one step above your current level or roles you want in the future.
2. Notice which skills appear repeatedly.
3. Choose three skills that:
   • are in demand  
   • fit your interests or strengths  
   • could realistically increase your earning potential
4. For each skill, write:
   • why it matters  
   • how it could increase your value  
   • one way you could start building it
5. Keep the list practical.

Examples:
• stakeholder communication  
• data visualisation  
• project ownership  
• Python / SQL / analytics  
• financial modelling  
• strategy  
• product thinking  
• leadership  
• domain expertise

Outcome
A focused skill-growth plan connected directly to better opportunities and higher earning potential.
`
  },

  {
    task: "Update your CV with two recent achievements",
    duration: 1,
    explanation: `
Your CV should reflect the value you create now, not just the responsibilities you once had.

Step-by-step
1. Choose two strong achievements from the last 6–12 months.
2. For each one, write a bullet point using:
   • what you did  
   • how you did it  
   • what changed as a result
3. Add measurable impact where possible.

Examples:
• improved a process  
• reduced time  
• increased revenue  
• supported a major project  
• influenced decision-making  
• improved quality or efficiency

4. Rewrite vague bullets into stronger outcome-led bullets.
5. Place the strongest, most relevant achievements near the top of the role section.
6. Read the CV back and check that it sounds like someone ready for more responsibility.

Outcome
A CV that reflects your current value and strengthens your position for better opportunities.
`
  },

  {
    task: "Create a brag document (wins, metrics, kudos)",
    duration: 1.0,
    explanation: `
A brag document makes reviews, interviews, promotion cases, and raise conversations much easier because you are no longer relying on memory.

Step-by-step
1. Open a simple document titled “Career Wins” or “Brag Document”.
2. Create sections for:
   • Achievements  
   • Metrics  
   • Positive feedback  
   • Extra responsibilities  
   • Projects delivered
3. Start filling it in with anything relevant from the last 6–12 months.
4. Include:
   • what you did  
   • the outcome  
   • any numbers or business impact  
   • any praise, messages, or feedback you received
5. Copy in exact wording from emails, Slack messages, or review comments when useful.
6. Add dates where possible.
7. Commit to updating it monthly going forward, even if only for 5 minutes.

Outcome
A single source of truth for your professional impact that makes future career conversations faster and stronger.
`
  },

  {
    task: "Update portfolio, GitHub, or Notion case studies",
    duration: 1,
    explanation: `
Visible proof of work builds trust quickly. A clean portfolio or project set shows what you can actually do, not just what you claim.

Step-by-step
1. Choose 1–3 projects that best represent your skills.
2. For each one, check that it clearly explains:
   • the problem  
   • your role  
   • the tools used  
   • the outcome  
   • what you learned
3. Update descriptions so they are concise and easy to skim.
4. Refresh screenshots, links, visuals, or structure if needed.
5. Remove outdated, broken, or low-impact items that weaken the overall impression.
6. Check that all links work and that the layout feels polished and clear.
7. Ask: if someone saw only these 1–3 projects, would they understand my strengths?

Outcome
A more polished body of proof that supports interviews, networking, and career progression.
`
  },

  {
    task: "Revamp LinkedIn headline and About section",
    duration: 1.0,
    explanation: `
Your LinkedIn profile is often the first impression people get of your professional value. It should quickly show what you do, what you are strong at, and where you are going.

Step-by-step
1. Rewrite your headline to include:
   • current role or direction  
   • key strengths  
   • tools, industry, or domain where relevant
2. Avoid vague wording like “motivated professional” if it says nothing concrete.
3. Update your About section with three simple parts:
   • what you do  
   • why it matters or what you are known for  
   • what kind of opportunities or direction you are moving toward
4. Keep it concise, readable, and skimmable.
5. Read it back and remove filler words.

Outcome
A LinkedIn profile that feels sharper, more credible, and more attractive to aligned opportunities.
`
  },

  {
    task: "Reach out to two people for a networking coffee",
    duration: 1,
    explanation: `
Relationships often unlock opportunities before jobs are ever advertised. Networking works best when it feels warm, specific, and low-pressure.

Step-by-step
1. Identify two people whose work, role, or career path genuinely interests you.
2. Choose people you could realistically message:
   • former colleagues  
   • people in your company  
   • alumni  
   • mutual connections  
   • someone you have interacted with before
3. Write a short message that is:
   • polite  
   • specific  
   • easy to say yes to
4. Mention why you are reaching out.

Example:
“I’ve really enjoyed following your work in X and would love to hear a little about your path into Y if you’d be open to a quick coffee or virtual chat.”

5. Offer flexible timing and keep expectations light.
6. If they agree, prepare 2–3 thoughtful questions in advance.
7. After the conversation, send a short thank-you message.

Outcome
Warmer professional connections and a growing network that can lead to insight and opportunity.
`
  },

  {
    task: "Attend one industry event or webinar",
    duration: 1.5,
    explanation: `
Industry events expose you to ideas, trends, and people outside your day-to-day bubble. Even one event can create useful momentum.

Step-by-step
1. Find one upcoming event, webinar, meetup, or panel in your field.
2. Register and add it to your calendar.
3. Attend actively:
   • take notes  
   • notice recurring themes  
   • write down one useful idea or contact
4. If appropriate, connect with one speaker or attendee afterwards.
5. Save one insight from the event into your career notes or brag document.

Outcome
Fresh perspective, increased industry awareness, and a stronger sense of what opportunities exist around you.
`
  },

  {
    task: "Draft three bullet points for a business case (ROI of your work)",
    duration: 1.0,
    explanation: `
Career growth conversations go better when you translate your work into business value. This task helps you move beyond “I work hard” into “here is the impact I create.”

Step-by-step
1. Identify one project, responsibility, or piece of work where you created value.
2. Ask how your work helped the business.

Common areas:
• revenue growth  
• cost savings  
• time saved  
• efficiency gained  
• risk reduced  
• quality improved  
• customer experience improved  
• better decision-making

3. Draft three bullet points linking your work to outcomes.
4. Keep each bullet concise and outcome-focused.
5. Include numbers where possible, even if approximate.

Example structure:
• “Led X, which helped reduce Y by Z%.”
• “Improved A, making B faster / clearer / more reliable.”
• “Supported C, contributing to stronger decision-making / efficiency / delivery.”

6. Remove unnecessary detail and keep the language commercial, not overly technical.

Outcome
A ready-made set of impact bullets you can use in interviews, reviews, promotion cases, and raise conversations.
`
  },

  {
    task: "Draft a script to ask for a raise or promotion",
    duration: 1,
    explanation: `
Preparation makes high-stakes conversations feel much more manageable. You do not need to sound perfect. You need to sound clear, grounded, and specific.

Step-by-step
1. Open a document and write a short script you could say out loud.
2. Include four parts:
   • results you have delivered  
   • how your scope or responsibility has grown  
   • relevant market context if useful  
   • your clear ask
3. Keep it direct and calm.

Example structure:
• “Over the past X months, I’ve delivered…”  
• “My responsibilities have grown to include…”  
• “Based on my contribution and market context, I’d like to discuss…”  
• “What would be the process / timeline for reviewing this?”

4. Make sure the ask is explicit:
   • raise  
   • promotion  
   • title review  
   • compensation review
5. Read it out loud and remove anything that sounds unnatural or apologetic.
6. Edit until it sounds like you on a confident day.

Outcome
A clearer, more confident foundation for a compensation or progression conversation.
`
  },

  {
    task: "Book a mock interview or pay negotiation practice",
    duration: 1,
    explanation: `
Practice reduces nerves and improves delivery. The goal is not to memorise perfect answers, but to feel steadier in the room.

Step-by-step
1. Choose a practice format:
   • trusted colleague  
   • friend  
   • coach  
   • mentor  
   • AI practice tool
2. Decide whether you want to practise:
   • interview answers  
   • salary negotiation  
   • promotion conversation  
   • networking introduction
3. Prepare 3–5 likely questions or scenarios.
4. Do one full practice round out loud.
5. Ask for feedback on:
   • clarity  
   • confidence  
   • structure  
   • pace  
   • whether your examples sound convincing
6. Note two things that worked well and two things to improve.
7. Repeat once more if possible.

Outcome
More composure, stronger delivery, and less fear around high-stakes professional conversations.
`
  },

  {
    task: "Map internal opportunities and target two roles",
    duration: 1.0,
    explanation: `
Internal moves can accelerate growth with less risk because you already understand the company, context, and culture.

Step-by-step
1. Review internal job boards, team structures, or departments that interest you.
2. Identify two roles that align with your longer-term goals.
3. For each role, write down:
   • why it interests you  
   • which of your current skills already match  
   • which skills or experience are missing
4. For each gap, write one action that would help close it.

Examples:
• speak to someone in that team  
• shadow a project  
• take a course  
• ask for related stretch work  
• update your portfolio or examples

5. Save both target roles in your career notes.
6. Revisit them during your monthly or quarterly review.

Outcome
A more proactive internal career strategy built around real opportunities instead of vague hope.
`
  },

  {
    task: "Enroll in one online course or certification",
    duration: 2,
    explanation: `
Structured learning helps you build valuable skills faster than vague good intentions.

Step-by-step
1. Choose one course or certification aligned with your skill-growth goals.
2. Check that it is:
   • relevant  
   • realistic for your schedule  
   • strong enough to support your next step
3. Enrol.
4. Add study sessions to your calendar.
5. Complete at least the first module straight away so momentum begins immediately.
6. Save notes, progress, or outputs somewhere you can reference later.

Outcome
Real progress toward a skill that supports better opportunities and stronger earning potential.
`
  },

  {
    task: "Identify one freelance or side-income idea and first client step",
    duration: 1,
    explanation: `
Side income can increase confidence, optionality, and financial resilience. The goal here is not to build a full business today, just to identify one credible first move.

Step-by-step
1. List skills you could realistically offer independently.

Examples:
• writing  
• tutoring  
• design  
• analytics  
• admin support  
• CV help  
• social media support  
• research  
• consulting  
• editing

2. Choose one skill that feels both useful and realistic.
3. Write a one-line offer.

Example:
“I help small businesses clean up and present their reporting more clearly.”
4. Decide who might need this.
5. Take one first client step.

Examples:
• message a potential client  
• tell your network  
• post a simple offer  
• create a one-page Notion or Canva service page  
• list yourself on a platform

6. Do not overcomplicate branding at this stage. Focus on one real action.

Outcome
A concrete first move toward additional income rather than just thinking about it.
`
  }
],

investing: [
  {
    task: "Learn basics: stocks, bonds, ETFs, index funds",
    duration: 1.5,
    explanation: `
Understanding the building blocks makes investing feel much less mysterious. The goal is not to memorise jargon, but to understand what these things are and why people use them.

Step-by-step
1. Learn the core definitions:
   • Stocks = small pieces of ownership in a company  
   • Bonds = loans to governments or companies that usually pay interest  
   • ETFs = baskets of investments that trade like a single share  
   • Index funds = funds that aim to track a market index, often at low cost
2. Write one short definition of each in your own words.
3. Note what each is generally used for:

Examples:
• Stocks → growth potential  
• Bonds → stability or income  
• ETFs → diversification and convenience  
• Index funds → broad market exposure, often with low fees

4. Notice which ones feel most intuitive to you and which feel less clear.
5. Write one question you still have so you can keep learning actively.

Outcome
A clearer mental model of the main investment building blocks and what role they can play in a portfolio.
`
  },

  {
    task: "Read about compound interest and calculate an example",
    duration: 1,
    explanation: `
Compound growth helps explain why investing rewards consistency and time. This task makes that idea feel real rather than abstract.

Step-by-step
1. Choose a simple monthly contribution amount.

Examples:
• £50  
• £100  
• £200

2. Pick a modest annual return assumption, such as 5–7%.
3. Use an online compound growth calculator.
4. Model how the amount could grow over:
   • 5 years  
   • 10 years  
   • optionally 20 years
5. Write down:
   • total amount contributed  
   • estimated growth from returns  
   • final total
6. Notice how much of the later growth comes from compounding rather than only new contributions.

Outcome
A tangible understanding of why starting early and staying consistent often matters more than starting with a large amount.
`
  },

{
  task: "Learn the order of operations before investing",
  duration: 1.0,
  explanation: `
Investing usually works best after a few financial basics are already in place.

Step-by-step
1. Check whether you have:
   • a starter emergency fund  
   • a plan for high-interest debt  
   • access to any employer pension match
2. Write down which of these are already covered and which are not.
3. Learn why the usual order matters:
   • emergency stability first  
   • expensive debt next  
   • employer match if available  
   • long-term investing after that
4. Decide whether now is the right time to invest or whether one earlier priority needs attention first.

Outcome
A safer and more confident understanding of when investing makes sense in your wider financial plan.
`
},
  {
    task: "Define your risk profile (conservative, balanced, growth)",
    duration: 1,
    explanation: `
Your risk profile should match both your timeline and your temperament. A portfolio only works if you can stay calm enough to stick with it.

Step-by-step
1. Think about when you may need this money.
   • Short-term money usually needs more stability  
   • Long-term money can usually handle more ups and downs
2. Reflect honestly on how you feel when values drop temporarily.
3. Ask yourself:
   • Would I panic if my investments fell 10–20% for a while?  
   • Would I leave the money invested, or feel tempted to pull it out?  
   • Am I investing for long-term growth, stability, or a mix?
4. Choose the profile that feels most realistic:

• Conservative = lower volatility, lower expected growth, more stability  
• Balanced = mix of growth and stability  
• Growth = higher volatility, higher long-term growth potential

5. Write down your chosen profile and why it fits you.
6. Remind yourself that the best risk profile is not the bravest one. It is the one you can stick to consistently.

Outcome
A risk level that supports long-term consistency, not short-term panic.
`
  },

  {
    task: "Check if you have a workplace pension & contributions",
    duration: 1,
    explanation: `
A workplace pension is often one of the most powerful investing tools available because employer contributions can significantly boost the amount invested.

Step-by-step
1. Log into your workplace pension portal, payroll system, or HR platform.
2. Confirm:
   • your contribution rate  
   • your employer contribution or match  
   • the total amount going in each month
3. Check whether you are contributing enough to receive the full employer match, if one exists.
4. Review which fund your pension is invested in, if that information is visible.
5. Write down what you found in simple terms.

Examples:
• “I contribute 5% and my employer adds 5%.”  
• “My pension is invested in the default balanced fund.”

6. If increasing contributions feels affordable, note that as a future option.
7. Do not increase it impulsively if it would destabilise your budget.

Outcome
Confidence that you understand your pension setup and are not missing out on available employer contributions.
`
  },

  {
    task: "Open or verify your investment account (ISA, brokerage, pension)",
    duration: 1.0,
    explanation: `
The account you use matters because it affects tax efficiency, access, and how simple investing feels.

Step-by-step
1. Decide what kind of account best fits your goal.

Examples:
• ISA (UK) for tax-efficient investing  
• pension for long-term retirement investing  
• general brokerage for more flexible investing outside wrappers

2. If you already have an account, verify:
   • it is still active  
   • your details are correct  
   • you know how to log in  
   • your bank account is linked if needed
3. If you do not have an account yet, choose one provider and begin the setup.
4. Complete identity checks if required.
5. Save your login details securely.
6. Write one sentence on why this account type fits your goal.

Outcome
A ready-to-use investment account structure aligned with your current goals and stage.
`
  },

  {
    task: "Compare platform fees and switch if cheaper",
    duration: 1.0,
    explanation: `
Fees may look small, but over time they quietly reduce your returns. This task helps you check whether you are paying more than necessary.

Step-by-step
1. Review the costs on your current platform.

Look for:
• account fee  
• trading fee  
• fund ongoing charges (OCF)  
• custody fee or similar admin charges

2. Compare your platform with one or two alternatives.
3. Write down the main fee differences in simple terms.
4. Estimate the likely yearly cost based on your current or expected account size.
5. Ask yourself:
   • Is the cheaper option still easy to use?  
   • Would switching create unnecessary hassle?  
   • Are the savings meaningful enough to matter over time?
6. Switch only if the savings are clear and the process is manageable.

Outcome
A clearer understanding of fee drag and whether a cheaper platform would meaningfully improve your long-term returns.
`
  },

  {
    task: "Set an investing policy: amount, cadence, funds",
    duration: 1.0,
    explanation: `
A simple investing policy helps you make decisions once and then follow them calmly. This reduces emotion, hesitation, and impulsive changes.

Step-by-step
1. Open a note or document called “My Investing Policy”.
2. Write down:
   • how much you plan to invest  
   • how often you will invest  
   • which fund or funds you plan to use  
   • what account the investments will sit in
3. Keep it simple.

Example:
“I will invest £100 per month into a diversified index fund through my ISA.”

4. Add when you will review the plan.

Example:
• every quarter for a light check-in  
• once a year for bigger decisions

5. Add one sentence about what you will not do.

Examples:
• “I will not react to daily market movements.”  
• “I will not change strategy based on fear or hype.”

Outcome
A calm, repeatable investing framework that makes your actions more consistent.
`
  },

{
  task: "Choose one beginner-friendly fund and explain why it fits",
  duration: 1,
  explanation: `
Theory becomes much easier to trust when you can connect it to one simple example.

Step-by-step
1. Look at one diversified fund option available in your region.
2. Note:
   • what it invests in  
   • whether it is diversified  
   • the fees  
   • why it may suit a beginner
3. Write 3 short reasons it could fit a long-term beginner approach.
4. Write 1 thing you would still want to understand better before investing real money.

Outcome
A more practical understanding of what a simple long-term investing option can look like.
`
},
  {
    task: "Allocate % between core index and satellite picks",
    duration: 0.5,
    explanation: `
A clear split helps you stay grounded while still leaving room for curiosity. The core usually does the heavy lifting; the satellites are optional extras.

Step-by-step
1. Define what “core” means in your portfolio.
   Usually this means diversified, long-term holdings such as broad index funds.
2. Define what “satellite” means.
   Usually this means smaller, more selective positions such as themed ETFs or individual stocks.
3. Decide whether you even want satellites right now.
   For a beginner, it is completely fine to keep everything in the core.
4. If you do want both, choose a split.

Examples:
• 100% core  
• 90% core / 10% satellite  
• 80% core / 20% satellite

5. Write the split down clearly in your investing policy.
6. Keep the satellite portion small enough that it does not disrupt your long-term plan.

Outcome
A portfolio structure that stays anchored in discipline while still allowing measured exploration.
`
  },

  {
    task: "Create a watchlist (5 ETFs / 5 stocks)",
    duration: 0.5,
    explanation: `
Observation before action helps build familiarity. A watchlist lets you notice how different investments move without rushing to buy them.

Step-by-step
1. Choose up to 5 ETFs and 5 stocks you want to understand better.
2. Add them to your platform watchlist.
3. For each one, note what it is in simple terms.

Examples:
• broad global ETF  
• US index ETF  
• technology stock  
• consumer brand stock

4. Watch how prices move over a few weeks.
5. Notice:
   • volatility  
   • headlines  
   • whether the investment still makes sense to you after learning more
6. Do not treat the watchlist as pressure to buy everything on it.

Outcome
Greater familiarity with potential investments before committing real money.
`
  },

  {
    task: "Simulate investing £100 in an index fund",
    duration: 0.5,
    explanation: `
A simple simulation makes investing feel more concrete. It helps you understand what small, regular investing can realistically look like over time.

Step-by-step
1. Choose one broad index fund or ETF.
2. Look up its basic details:
   • what market it tracks  
   • its fee  
   • whether it is diversified
3. Pretend you are investing £100 into it.
4. Estimate what happens under a few simple scenarios over:
   • 1 year  
   • 5 years  
   • 10 years
5. Include approximate fees in your notes.
6. Write down what this exercise teaches you.

Examples:
• growth is gradual  
• fees matter  
• consistency matters more than perfect timing

Outcome
Better comfort with how small, regular investments may behave over time.
`
  },

  {
    task: "Make your first small investment (even £10–50)",
    duration: 0.5,
    explanation: `
Action builds confidence faster than endless theory. The goal is not to invest a huge amount, but to complete the process calmly and learn by doing.

Step-by-step
1. Confirm that:
   • your budget can support this  
   • you understand what you are buying  
   • the amount feels comfortably affordable
2. Choose a simple, diversified fund if possible.
3. Invest a small amount.

Examples:
• £10  
• £25  
• £50

4. Review the transaction details before confirming.
5. Complete the purchase.
6. Check that the transaction appears correctly in your account.
7. Write one sentence about how it felt to take action.

Outcome
A real first investing step completed with clarity and confidence.
`
  },

  {
    task: "Enable dividend reinvestment (if available)",
    duration: 0.5,
    explanation: `
Reinvesting dividends can help compound growth over time without requiring extra effort from you.

Step-by-step
1. Check whether your platform offers automatic dividend reinvestment (sometimes called DRIP).
2. See whether your chosen investments are eligible.
3. Enable the feature if it fits your plan.
4. Save the settings and confirm they are active.

Outcome
Dividends that are quietly put back to work in the background.
`
  },

  {
    task: "Track your portfolio once this week",
    duration: 0.5,
    explanation: `
The goal is awareness without obsession. You want to stay connected to your investments without checking them so often that emotion takes over.

Step-by-step
1. Open your investment account once this week.
2. Note:
   • current balance  
   • your main holdings  
   • whether the allocations still look roughly right
3. Do not overanalyse daily movement.
4. Close the app once you have checked what you needed.

Outcome
A calmer habit of staying informed without slipping into over-monitoring.
`
  },

  {
    task: "Read one page of a fund factsheet and note fees",
    duration: 0.5,
    explanation: `
Knowing what you own builds trust. A fund factsheet helps you understand the basics of where your money is actually invested.

Step-by-step
1. Open the factsheet or key information document for one fund you own or are considering.
2. Read the most important sections:
   • fund objective  
   • what index or assets it tracks  
   • risk rating  
   • ongoing charge (OCF)  
   • top holdings if shown
3. Write down:
   • what the fund is designed to do  
   • the fee  
   • one reason it may or may not suit your goals
4. Translate anything confusing into your own words rather than copying jargon.

Outcome
Stronger confidence in what your money is invested in and what it costs to hold.
`
  },

  {
    task: "Schedule a quarterly investing review",
    duration: 0.5,
    explanation: `
Long-term investing usually needs consistency more than constant adjustment. A quarterly review is often enough to stay intentional without overreacting.

Step-by-step
1. Add a recurring reminder every 3 months.
2. Use the review to check:
   • contributions made  
   • whether your holdings still match your plan  
   • whether fees still look reasonable  
   • whether you have made any emotional or impulsive decisions
3. Only make changes when there is a clear reason, not because the market moved for a few days.
4. Save one short note after each review.

Outcome
A calmer long-term investing habit with regular check-ins and less unnecessary tinkering.
`
  }
],


big_goals: [
  { 
    task: "Pick 1 big financial goal (property, travel, retirement)", 
    duration: 1.0, 
    explanation: `
Choosing one primary financial focus helps concentrate effort and avoid spreading your energy too thin.

Step-by-step
1. Think about what financial outcome would meaningfully improve your life in the next few years.

Common examples:
• Buying property  
• Funding a major trip or life experience  
• Building long-term retirement savings  
• Creating a career-change fund  
• Paying off a major debt  
• Building a large emergency fund

2. Write down 2–3 possibilities.
3. Ask yourself:
   • Which goal would create the most stability or freedom?
   • Which goal excites me enough to stay consistent?
4. Choose ONE primary focus for now.
5. Write one sentence describing the goal clearly.

Example:
“I want to save £20,000 for a home deposit within the next 3 years.”

Outcome
A single, well-defined financial goal that anchors your saving and planning.
`
  },

  { 
    task: "Estimate the cost and timeline", 
    duration: 1, 
    explanation: `
Turning a dream into a number makes planning possible.

Step-by-step
1. Research realistic costs associated with your goal.

Examples:
• property deposit  
• travel budget  
• retirement contributions  
• relocation costs

2. Include hidden or additional costs where possible.

Examples:
• taxes  
• fees  
• insurance  
• equipment  
• legal or admin costs

3. Estimate the total amount required.
4. Choose a realistic timeframe.

Examples:
• 12 months  
• 24 months  
• 3–5 years

5. Write both clearly:

Example:
“Goal: £10,000 travel fund within 24 months.”

Outcome
A clear financial target paired with a defined timeline.
`
  },

  { 
    task: "Open a dedicated savings pot or account", 
    duration: 0.5, 
    explanation: `
Separating goal savings from everyday money makes progress easier to track and protects it from accidental spending.

Step-by-step
1. Open a new savings pot or account specifically for this goal.
2. Give the account a clear name.

Examples:
• House Deposit  
• Freedom Fund  
• Travel Fund  
• Career Break Fund

3. Ensure the account is easy to deposit into.
4. Consider choosing an account that is slightly harder to withdraw from to avoid temptation.

Outcome
A clearly defined savings space reserved exclusively for this goal.
`
  },

  { 
    task: "Calculate monthly contribution needed", 
    duration: 1, 
    explanation: `
Working backwards from your target turns a large goal into manageable monthly steps.

Step-by-step
1. Take the total amount you want to save.
2. Divide it by the number of months until your deadline.

Example:
£12,000 goal ÷ 24 months = £500 per month

3. Add a small buffer (5–10%) in case you miss a month or costs increase.
4. Compare the result with your current budget.
5. Ask yourself:
   • Does this feel realistic?  
   • Would a slightly longer timeline feel more sustainable?

6. Adjust the timeline if necessary.

Outcome
A realistic monthly saving target that feels achievable rather than overwhelming.
`
  },

  {
    task: "Stress-test this goal against your current budget",
    duration: 0.5,
    explanation: `
Ambitious goals are powerful, but they must still fit inside a stable financial life.

Step-by-step
1. Look at your current monthly budget.
2. Add your planned goal contribution.
3. Check whether you can still comfortably cover:
   • essential expenses  
   • minimum debt payments  
   • emergency savings
4. If the number feels too tight, adjust one of these:
   • extend the timeline  
   • lower the monthly contribution  
   • add an income lever

Outcome
A goal plan that supports your financial stability rather than competing with it.
`
  },

  { 
    task: "Set up automatic transfers toward this goal", 
    duration: 0.5, 
    explanation: `
Automation removes decision fatigue and keeps progress steady.

Step-by-step
1. Schedule a transfer from your main account to your goal account.
2. Set the transfer to run shortly after payday.
3. Start with the monthly amount you calculated.
4. Treat this transfer like a fixed bill you pay to your future self.

Outcome
Consistent progress toward your goal without relying on motivation.
`
  },

  { 
    task: "Break goal into quarterly milestones", 
    duration: 1.0, 
    explanation: `
Big goals feel much more manageable when broken into shorter checkpoints.

Step-by-step
1. Divide your total savings target into quarterly milestones.

Example:
£12,000 goal → £3,000 every 6 months or £1,500 per quarter.

2. Write down the milestone amounts.
3. Add milestone dates to your calendar.
4. Track progress toward each milestone rather than the full amount.

Outcome
Shorter checkpoints that make progress visible and motivating.
`
  },

  { 
    task: "Identify 2 levers: earn more or spend less for this goal", 
    duration: 1.0, 
    explanation: `
Financial progress usually comes from two directions: increasing income or adjusting spending.

Step-by-step
1. Choose one income lever.

Examples:
• freelance work  
• overtime or additional shifts  
• selling unused items  
• negotiating a raise  
• starting a small side project

2. Choose one expense lever.

Examples:
• cancel a subscription  
• negotiate a bill  
• reduce takeaway spending  
• change a recurring purchase

3. Write down exactly how much each lever could contribute monthly.

Outcome
A balanced strategy that accelerates progress without requiring extreme sacrifice.
`
  },

  { 
    task: "Create a Pinterest or vision board for motivation", 
    duration: 0.5, 
    explanation: `
Visual reminders make long-term goals emotionally real, which helps maintain consistency.

Step-by-step
1. Collect images that represent the life or experience connected to your goal.
2. Avoid comparison with others and focus on what feels meaningful to you.
3. Create a simple digital board or save the images in a folder.
4. Look at it occasionally when motivation drops.

Outcome
A motivational anchor that reminds you why the goal matters.
`
  },

  { 
    task: "Set a reward for first milestone (low-cost treat)", 
    duration: 0.5, 
    explanation: `
Celebrating progress strengthens habits and keeps long-term goals enjoyable.

Step-by-step
1. Decide on a small reward once you reach your first milestone.
2. Keep it modest and intentional.

Examples:
• dinner with friends  
• a day trip  
• a favourite meal  
• a relaxing experience

3. Make sure the reward does not undo your progress.

Outcome
Positive reinforcement that makes saving feel satisfying rather than restrictive.
`
  },

  { 
    task: "Open a separate pot for closing costs or fees (if property)", 
    duration: 0.5, 
    explanation: `
Major financial goals often come with hidden or secondary costs.

Step-by-step
1. Research typical additional expenses.

Examples for property:
• legal fees  
• surveys  
• taxes  
• moving costs  
• furniture

2. Estimate a realistic amount for these.
3. Open a second savings pot specifically for these costs.
4. Contribute gradually alongside your main goal.

Outcome
Preparedness for hidden costs without derailing your primary savings target.
`
  },

  { 
    task: "Create a checklist of documents you’ll need (proofs, statements)", 
    duration: 1.0, 
    explanation: `
Preparing administrative details early makes later applications far smoother.

Step-by-step
1. List documents you may need for your goal.

Examples:
• bank statements  
• payslips  
• tax returns  
• proof of address  
• ID documents  
• contracts or agreements

2. Check where each document is stored.
3. Create a single folder (digital or physical) for these items.
4. Request any documents that take time to obtain.

Outcome
Smooth progress when applications, approvals, or deadlines appear.
`
  },

  { 
    task: "Book a calendar review for goal in 30/60/90 days", 
    duration: 0.5, 
    explanation: `
Goals stay alive when they are revisited regularly.

Step-by-step
1. Schedule three short review sessions:
   • 30 days  
   • 60 days  
   • 90 days
2. During each review:
   • check current savings progress  
   • compare with milestone targets  
   • adjust contributions if necessary
3. Write one short reflection after each review.

Outcome
A goal that stays visible, adjustable, and actively progressing.
`
  }
],

},


physical_glow_up: {

  baseline_goals: [
  {
    task: "Are you going to work out mainly in the gym or at home?",
    duration: 0.5,
    screen: "PhysicalGlowUpTrack",
    explanation: `
Choose the training setup you are most likely to stick to consistently. The best setup is not the most impressive one, it is the one with the least friction.

Step-by-step
1. Decide which setup feels most realistic for the next 30 days:
   • Gym  
   • Home  
   • Mix of Gym + Home
2. Think about what usually gets in the way.

Common friction points:
• commute time  
• crowded spaces  
• not knowing how to use equipment  
• lack of equipment at home  
• weather  
• energy after work  
• needing too much preparation

3. Pick the option that removes the most friction, not the one that sounds most ambitious.
4. Write one sentence to confirm your setup.

Example:
“I will train 3 times per week, mainly at home.”
5. If you choose a mix, decide exactly what each setting is for.

Example:
• Gym = strength sessions  
• Home = backup workouts and mobility

Outcome
A realistic training setup you can actually sustain 2–4 times per week.
`
  },

  {
    task: "Take starting measurements (weight, waist, hips) and photos",
    duration: 0.5,
    explanation: `
This creates a calm, consistent starting point so progress can be tracked with data instead of mood.

Step-by-step
1. Choose a consistent time and setup.
   Best option:
   • morning  
   • before food if possible  
   • same scale  
   • similar clothing each time
2. Record:
   • weight  
   • waist  
   • hips
3. Measure carefully:
   • keep the tape parallel to the floor  
   • do not pull it too tight  
   • stand naturally and breathe normally
4. Take 3 progress photos:
   • front  
   • side  
   • back
5. Use the same:
   • lighting  
   • distance  
   • pose  
   • outfit or similar clothing
6. Save everything in one album or folder titled something like:
   “Physical Glow-Up - Start”
7. Remind yourself: this is information, not a judgment.

Outcome
Clear “before” data you can compare against later with more confidence and less emotion.
`
  },

  {
    task: "10-min fitness baseline: push-ups, plank, 1-km brisk walk time",
    duration: 0.5,
    explanation: `
A quick baseline shows where you are starting. The goal is not to impress yourself, it is to get honest numbers you can improve over time.

Step-by-step
1. Warm up for 2–3 minutes first.
   Example:
   • arm circles  
   • marching in place  
   • light squats  
   • shoulder rolls
2. Push-ups:
   • do as many controlled reps as you can with good form  
   • incline push-ups are completely fine if full push-ups are too hard  
   • stop when form breaks
   Record the number.
3. Plank:
   • hold a strong plank with good form  
   • stop when your hips drop or form becomes shaky
   Record the time.
4. 1-km brisk walk:
   • walk at a steady, purposeful pace  
   • do not turn it into a run  
   • time the full kilometre
   Record the time.
5. Write one short note after the test:
   “This felt easy / moderate / hard because ___.”

Outcome
Baseline numbers you can improve steadily over the next few weeks without guessing.
`
  },

  {
    task: "Define 1 main goal (e.g., get stronger / feel lighter / energised) + 2 metrics",
    duration: 0.5,
    explanation: `
One clear goal plus two simple metrics keeps you focused. Too many goals create confusion; a small number creates momentum.

Step-by-step
1. Choose ONE main goal for this phase.

Examples:
• get stronger  
• feel more energised  
• build consistency  
• improve stamina  
• feel lighter and more mobile  
• feel more confident in your body

2. Pick 2 simple metrics you can track weekly.
3. Choose metrics that match the goal.

Examples:
• Strength → push-up reps + plank time  
• Energy → steps/day average + bedtime consistency  
• Body composition → waist measurement + weekly training sessions  
• Fitness → 1-km walk time + workouts completed  
• Consistency → training sessions done + habit tracker score

4. Write your full sentence:
“My goal is ___ and I’ll measure progress by ___ and ___.”
5. Save it somewhere visible in your notes, tracker, or app.

Outcome
A clear goal with simple progress markers that keep you focused and motivated.
`
  },

  {
    task: "Pick weekly training slots (2–4) and add to calendar",
    duration: 0.5,
    explanation: `
Consistency is much easier when training is booked like a real appointment rather than left to mood or spare time.

Step-by-step
1. Look at your actual week:
   • work hours  
   • commute  
   • family or social commitments  
   • energy patterns  
   • recovery days
2. Choose 2–4 slots that are genuinely realistic.
3. Be honest about your current season.
   If life is busy, 2 solid sessions is better than planning 5 and doing 1.
4. Add each session to your calendar with reminders.
5. Name them clearly.

Examples:
• Workout - Strength  
• Walk - Cardio  
• Home Session - Plan B  
• Mobility - 15 mins

6. Leave a little flexibility if your week is unpredictable.
7. Treat these sessions like appointments you keep with yourself.

Outcome
Training sessions protected by your calendar, not your mood.
`
  },

  {
    task: "Set up a simple habit tracker (paper/Notes/Notion)",
    duration: 0.5,
    explanation: `
Visible progress makes consistency feel rewarding. A simple tracker helps you notice momentum without becoming obsessive.

Step-by-step
1. Choose a format you will actually use:
   • Notes app  
   • Notion  
   • paper checklist  
   • habit-tracking app
2. Track only 3–5 items maximum.
3. Choose behaviours that matter most.

Examples:
• workout completed  
• daily steps  
• mobility  
• water  
• bedtime  
• protein goal  
• walk completed

4. Keep the tracker tick-based or very simple.
5. Avoid writing long journal entries here.
6. Review it once a week to notice patterns.

Outcome
A lightweight tracking system that keeps momentum visible without adding pressure.
`
  },

  {
    task: "Choose your ‘why’ statement & pin it somewhere visible",
    duration: 0.5,
    explanation: `
Your “why” helps you stay steady when motivation dips. It should feel personal, believable, and emotionally true.

Step-by-step
1. Write one sentence that explains why this matters to you.

Examples:
• “I train for energy and confidence.”  
• “I want to feel strong in my body.”  
• “I am building habits that support my future self.”  
• “I move because I want to feel better, not punished.”

2. Keep it simple and grounded.
3. Put it somewhere visible:
   • lock screen  
   • mirror note  
   • home screen widget  
   • notes app top line

Outcome
A personal anchor that makes consistency easier when life gets busy.
`
  },

  {
    task: "Create a 2-minute pre-work ritual (water, playlist, shoes)",
    duration: 0.5,
    explanation: `
Tiny rituals reduce procrastination. When you repeat the same cues, your body starts to recognise that it is time to begin.

Step-by-step
1. Pick 2–3 cues that feel natural.
   Examples:
   • drink water  
   • put shoes on  
   • start playlist  
   • lay out mat  
   • tie hair up
2. Do them in the same order every time.
3. Start the session immediately after, even if it is only the warm-up.

Outcome
A quick start-up ritual that gets you moving with less negotiation.
`
  },

  {
    task: "Buy/prepare essentials (resistance band, water bottle, comfy shoes)",
    duration: 0.5,
    explanation: `
The easier it is to begin, the more likely you are to follow through. This task is about removing friction, not buying loads of things.

Step-by-step
1. Choose the minimum equipment you actually need for your setup.
2. Check what you already have before buying anything.
3. Build a simple essentials list.

Examples:
• resistance band  
• water bottle  
• comfortable trainers  
• sports bra  
• workout mat  
• leggings or shorts you can move in

4. Buy or prepare only the basics.
5. Store them somewhere visible and easy to grab.
   Examples:
   • by the door  
   • near your desk  
   • next to your bed  
   • in a gym bag
6. Prep them the night before planned workout days.

Outcome
Less friction, less faff, and a setup that makes action easier.
`
  },

  {
    task: "Light 15-min walk to mark Day 1",
    duration: 0.5,
    explanation: `
Day 1 is about momentum, not intensity. Starting small makes the plan real.

Step-by-step
1. Put your shoes on.
2. Set a 15-minute timer.
3. Walk at an easy-to-brisk pace.
4. When you finish, log it with one tick or note:
   “Done.”

Outcome
You have started. The plan is now real, not theoretical.
`
  },

  {
    task: "Reflect: what would a ‘great week’ look like for you?",
    duration: 0.5,
    explanation: `
Defining success in advance helps you focus on wins you can actually control.

Step-by-step
1. Think about what a realistic, strong week would look like for you.
2. Choose 2–3 controllable wins.

Examples:
• 3 workouts  
• 8k steps/day average  
• bed by 23:00 on weekdays  
• 2 home-cooked dinners  
• 1 mobility session  
• no skipped training slots without a Plan B

3. Write them as a short list.
4. Keep the list visible in your notes, tracker, or calendar.
5. Use these as your weekly definition of success instead of relying on mood or perfection.

Outcome
A clear, realistic definition of what a good week looks like for you.
`
  },

  {
    task: "Set injury-prevention rules (warm-up, load, rest)",
    duration: 0.5,
    explanation: `
Staying injury-free is part of progress. Training smart helps you stay consistent for longer.

Step-by-step
1. Write down 3 non-negotiables for your training.
2. Use simple rules such as:
   • warm up 5–8 minutes every session  
   • increase reps, time, or weight gradually  
   • keep at least 1 rest day each week  
   • stop if pain feels sharp or unusual  
   • use good form before adding intensity
3. Save these rules in your tracker or notes.
4. Read them before training if you tend to rush or overdo it.

Outcome
Safer training habits and more sustainable progress over time.
`
  },

  {
    task: "Pick an RPE scale & learn how to use it",
    duration: 0.5,
    explanation: `
RPE helps you train at the right intensity for your current energy and fitness level. It stops every session from feeling too hard or too random.

Step-by-step
1. Learn the basic scale:
   • RPE 1 = very easy  
   • RPE 5 = moderate  
   • RPE 8 = hard but controlled  
   • RPE 10 = maximum effort
2. Use rough targets:
   • strength work = around RPE 6–8  
   • easy cardio = around RPE 4–6
3. After each session, write one number:
   “Today felt like RPE __.”

Outcome
Better intensity control, smarter pacing, and fewer burnout weeks.
`
  },

  {
    task: "Create a ‘Plan B’ 10-min backup workout",
    duration: 0.5,
    explanation: `
A Plan B protects consistency on busy, stressful, or low-energy days. It keeps the habit alive when the full session is not realistic.

Step-by-step
1. Choose 4 simple moves you can do almost anywhere.

Example:
• squats  
• incline push-ups  
• band rows  
• plank

2. Choose a very simple format.

Example:
• 2 rounds  
• 10 minutes total  
• move steadily, not perfectly

3. Save it as a note titled:
   “Plan B - 10 minutes”
4. Decide in advance when to use it.

Examples:
• late workday  
• low energy  
• travel  
• cramps  
• missed gym slot

5. Use Plan B instead of skipping completely.

Outcome
A reliable fallback that protects your consistency and keeps your streak alive.
`
  },

  {
    task: "Block a weekly check-in slot (Sun PM)",
    duration: 0.5,
    explanation: `
A weekly review helps you make small course corrections before small slips turn into lost momentum.

Step-by-step
1. Add a recurring calendar block.
   Sunday evening often works well, but choose what fits your life.
2. Use this slot to review:
   • workouts completed  
   • steps  
   • energy  
   • sleep  
   • nutrition basics
3. Write:
   • 1 win  
   • 1 thing to adjust next week
4. Confirm next week’s training slots and make sure they are still realistic.

Outcome
A steady review rhythm that helps you keep progressing without pressure.
`
  },

  {
    task: "Write 3 barriers + your counter-moves",
    duration: 0.5,
    explanation: `
If you plan for obstacles in advance, they stop feeling like surprises and start feeling manageable.

Step-by-step
1. List your top 3 likely barriers.

Examples:
• late work  
• low energy  
• travel  
• cramps  
• poor sleep  
• social plans  
• bad weather  
• lack of motivation

2. For each barrier, write one simple counter-move.

Examples:
• Late day → Plan B 10-minute workout  
• Low energy → 15–20 minute walk + mobility  
• Travel → hotel or bodyweight session  
• Cramps → gentle walk or stretching  
• Busy week → reduce to 2 sessions, not zero

3. Save this list in your tracker or notes.
4. Use it when the barrier appears instead of deciding from scratch.

Outcome
A practical “if this, then that” plan that keeps you more consistent.
`
  }
],

habits_tracking: [
  {
    task: "Pick 3 core habits to track",
    duration: 0.5,
    explanation: `
Tracking works best when you keep it focused. Too many habits create noise; a small number creates consistency.

How to do it
1. Choose three habits with the biggest impact on your goals right now.
2. Pick habits that are:
   • simple to measure  
   • realistic to repeat  
   • closely linked to your energy, body goals, or consistency
3. Good examples:
   • protein goal  
   • daily steps  
   • bedtime target  
   • workout completed  
   • water intake  
   • mobility session
4. Write down your three habits in one place.
5. Ignore everything else for now. You can always add more later once these feel stable.

Outcome
Focused, manageable habit tracking that supports follow-through instead of overwhelm.
`
  },

  {
    task: "Set up a weekly review template",
    duration: 0.5,
    explanation: `
A weekly review turns effort into insight. Without reflection, it is easy to repeat the same week without learning from it.

How to do it
1. Open your notes app, journal, Notion page, or tracker.
2. Create a simple template you can reuse every week.
3. Include these sections:
   • Wins  
   • Blockers  
   • Energy / mood  
   • Next week’s focus
4. Keep it short and easy to fill in.
5. Add 3–5 prompts if helpful.

Examples:
• What went well this week?  
• What made consistency easier?  
• What got in the way?  
• What do I want to keep the same next week?  
• What one thing do I want to improve?

6. Save it as your default weekly review page.

Outcome
A reusable review system that supports reflection, honesty, and steady course-correction.
`
  },

  {
    task: "Create a visual habit tracker",
    duration: 0.5,
    explanation: `
Seeing progress makes habits feel more real. A visual tracker helps you notice consistency without needing to overthink it.

How to do it
1. Choose a format that feels easy for you.

Examples:
• calendar ticks  
• simple checklist  
• Notion board  
• notes table  
• habit-tracking app

2. Add your three core habits.
3. Create one simple way to mark completion each day.

Examples:
• tick  
• coloured square  
• yes / no  
• number if needed

4. Keep the design clean and lightweight.
5. Update it daily or at the end of the day.
6. Avoid making it so detailed that it becomes another chore.

Outcome
Clear visual feedback on your consistency and a tracker you are actually likely to keep using.
`
  },

  {
    task: "Schedule 2 recurring workouts for 4 weeks",
    duration: 0.5,
    explanation: `
Scheduling removes decision fatigue. When workouts are already booked, you are much less likely to leave them to chance.

How to do it
1. Look at your actual week, not your ideal one.
2. Pick two workout slots that feel realistic for the next month.
3. Choose times you can repeat consistently.
4. Add them as recurring calendar events for the next 4 weeks.
5. Name them clearly.

Examples:
• Workout - Strength  
• Walk - Cardio  
• Home Workout - 30 mins

6. Treat these as fixed appointments with yourself.
7. If needed, choose a backup slot for one of them.

Outcome
Protected workout time that makes consistency easier and more automatic.
`
  },

  {
    task: "Plan 2 breakfast, 2 lunch, 2 dinner defaults",
    duration: 0.5,
    explanation: `
Default meals reduce decision fatigue. You do not need endless variety to eat well consistently.

How to do it
1. Choose:
   • 2 easy breakfasts  
   • 2 easy lunches  
   • 2 easy dinners
2. Pick meals that are:
   • simple  
   • realistic for your schedule  
   • satisfying  
   • easy to shop for repeatedly
3. Write the six meals down in one place.
4. Make a simple shopping list that supports them.
5. Use these defaults on busy days or when motivation is low.

Examples:
• Breakfast: Greek yoghurt bowl / eggs on toast  
• Lunch: chicken wrap / tuna salad  
• Dinner: stir-fry / salmon and potatoes

Outcome
Easier eating decisions, less random spending, and more consistency on busy days.
`
  },

  {
    task: "Set a minimum viable workout (10 min)",
    duration: 0.5,
    explanation: `
A minimum viable workout protects momentum. It gives you a version of success that still counts on low-energy or busy days.

How to do it
1. Decide what your “still counts” workout looks like.
2. Keep it short and realistic.

Examples:
• 10-minute walk  
• 10 minutes of mobility  
• 2 rounds of 4 bodyweight moves  
• 10 minutes on a bike  
• quick resistance-band circuit

3. Write the rule down clearly.

Example:
“If I cannot do the full session, I will still do at least 10 minutes.”

4. Save it in your tracker or notes.
5. Use it instead of skipping completely.

Outcome
Fewer skipped days and a more resilient sense of consistency.
`
  },

  {
    task: "Create a reward menu (5 non-food rewards)",
    duration: 0.5,
    explanation: `
Rewards make progress feel more tangible. A simple reward menu helps you celebrate consistency without undoing it.

How to do it
1. List five rewards you genuinely enjoy.
2. Keep them:
   • affordable  
   • easy to access  
   • non-food based  
   • linked to rest, beauty, fun, or comfort
3. Examples:
   • fresh flowers  
   • new book  
   • long bath  
   • solo coffee date  
   • movie night  
   • face mask and early night  
   • new playlist and walk  
   • a small beauty treat
4. Match rewards to milestones.

Examples:
• 1 week consistent = small reward  
• 1 month consistent = slightly bigger reward

Outcome
A small system of positive reinforcement that supports long-term consistency.
`
  },

  {
    task: "Mid-month re-measurements and reflection",
    duration: 0.5,
    explanation: `
A mid-month check-in gives you feedback before the month is over. It helps you adjust early instead of drifting.

How to do it
1. Re-check a few key markers.
2. Choose the markers that match your current goals.

Examples:
• weight  
• waist measurement  
• step average  
• workouts completed  
• bedtime consistency  
• energy  
• strength numbers

3. Compare them with your starting point or last check-in.
4. Write a short reflection:
   • what is improving?  
   • what feels easier?  
   • what has felt hard?  
   • what needs adjusting?
5. Make one small adjustment if needed.

Outcome
A more responsive, realistic approach that helps you stay engaged and flexible.
`
  },

  {
    task: "Automate one friction point",
    duration: 0.5,
    explanation: `
Small annoyances often break consistency more than lack of motivation does. Removing just one friction point can make habits much easier to repeat.

How to do it
1. Identify one recurring annoyance that gets in the way.
2. Choose something practical and specific.

Examples:
• always forgetting gym clothes  
• not knowing what to eat  
• running out of groceries  
• forgetting water bottle  
• having to decide workouts last-minute

3. Remove that friction in advance.

Examples:
• pack bag the night before  
• create a repeat grocery list  
• lay out clothes  
• keep a filled bottle ready  
• save a simple workout plan in your notes

4. Test the fix for one week.

Outcome
An easier daily routine with less friction and less dependence on motivation.
`
  },

  {
    task: "Write a note to Future You about what’s working",
    duration: 0.5,
    explanation: `
When momentum dips, it helps to hear from the version of you who already knows what works. This note becomes a reminder during slower weeks.

How to do it
1. Write a short note to your future self.
2. Include:
   • what is helping right now  
   • what habits feel easiest to keep  
   • what mindset is making a difference  
   • what not to forget when motivation drops
3. Keep it warm, honest, and practical.

Examples:
• “You feel better when you move in the morning.”  
• “Simple meals are helping more than perfection.”  
• “A short walk still counts.”  
• “You do not need to start over every Monday.”

4. Save it somewhere easy to find later.

Outcome
Encouragement and useful reminders during slower or messier weeks.
`
  },

  {
    task: "Add habit cues to your calendar",
    duration: 0.5,
    explanation: `
Small visual cues help habits stay visible without needing heavy reminders.

How to do it
1. Add emojis, tags, or short labels to calendar events.
2. Keep the cues light and easy to understand.

Examples:
• 💪 workout  
• 🚶 steps  
• 🌙 bedtime  
• 💧 water

3. Use the same cues consistently.

Outcome
Gentle reminders that support action without feeling overwhelming.
`
  },

  {
    task: "Set up a step goal widget",
    duration: 0.5,
    explanation: `
Seeing your step count can gently nudge you toward more movement throughout the day.

How to do it
1. Add a step widget to your phone, smartwatch, or fitness app home screen.
2. Check it casually during the day rather than obsessively.
3. Use it as a prompt to take an extra walk, stretch break, or evening lap if needed.

Outcome
More natural daily movement with less effort.
`
  },

  {
    task: "Create a streak-saver rule",
    duration: 0.5,
    explanation: `
A streak-saver rule protects you from all-or-nothing thinking. It gives you a recovery move after a disrupted day.

How to do it
1. Decide what counts as your minimum recovery action.

Examples:
• 5-minute walk  
• 10 squats  
• 1 protein-focused meal  
• 5 minutes of stretching

2. Write the rule clearly.

Example:
“If I miss the full habit, I still do the smallest version the same day or the next day.”

3. Use it immediately after a miss instead of waiting for the “perfect” restart.

Outcome
Habits that stay alive even during stressful or imperfect weeks.
`
  },

  {
    task: "Quarterly view: mark upcoming disruptions",
    duration: 0.5,
    explanation: `
Planning ahead makes habits more resilient. Looking ahead helps you prepare for disruption instead of being knocked off course by it.

How to do it
1. Look at the next 3 months in your calendar.
2. Mark likely disruptions.

Examples:
• travel  
• deadlines  
• family events  
• holidays  
• busy work periods  
• Ramadan / seasonal routine changes  
• social weekends

3. Decide where you may need:
   • lighter weeks  
   • backup workouts  
   • simpler meal defaults  
   • lower expectations with consistency
4. Note one protective plan for each busy period.

Outcome
More resilient routines that can bend without breaking.
`
  },

  {
    task: "Export a simple weekly progress chart",
    duration: 0.5,
    explanation: `
Patterns become easier to spot when they are visible over time. A simple weekly view can show what is actually working.

How to do it
1. Count your habit completions at the end of each week.
2. Track them in a very simple format.

Examples:
• workouts completed  
• step goal hit days  
• protein goal hit days  
• bedtime target hit days

3. Put the totals into a notes table, spreadsheet, or simple chart.
4. Compare week by week.
5. Look for patterns:
   • which habit is most stable?  
   • where do drop-offs happen?  
   • what improves when life is calmer?

Outcome
A clearer picture of your consistency patterns and what supports them best.
`
  }
],
  mobility_posture: [
  {
    task: "Posture audit (mirror/wall test) + note tight areas",
    duration: 0.5,
    explanation: `
A quick posture check helps you focus your mobility work where it matters most instead of doing random stretches.

Step-by-step
1. Stand normally in front of a mirror first.
2. Notice:
   • are your shoulders rounded forward?  
   • does your head drift forward?  
   • do you feel more weight on one side?  
   • do you naturally lock your knees or tilt your hips?
3. Then do a simple wall test:
   • stand with feet a little away from the wall  
   • bring head, upper back, and hips close to the wall  
   • keep your body relaxed rather than forcing “perfect posture”
4. Notice what feels tight, restricted, or hard to maintain.

Common tight areas:
• neck  
• chest  
• upper back  
• hip flexors  
• glutes  
• calves  
• ankles

5. Write down 2–3 areas to prioritise this week.
6. Keep the list short so your mobility work stays focused.

Outcome
A clear mobility focus list based on your body, not guesswork.
`
  },

  {
    task: "Learn a 10-min daily mobility sequence (neck/shoulders/hips/ankles)",
    duration: 0.5,
    explanation: `
A short routine done often works better than long mobility sessions done once in a while. The goal is to create something simple enough to repeat.

Step-by-step
1. Choose 4–6 moves that cover your main tight areas.

Example sequence:
• gentle neck mobility  
• shoulder circles  
• cat-cow  
• hip opener  
• ankle rocks  
• deep breathing

2. Aim to include:
   • one upper-body move  
   • one spine move  
   • one hip move  
   • one ankle or lower-leg move
3. Set a 10-minute timer.
4. Move slowly and breathe steadily.
5. Keep the routine simple enough that you do not need to rethink it each day.
6. Save the sequence as a note in your phone or tracker.
7. Repeat the same sequence for several days before changing it.

Outcome
A repeatable daily mobility routine that becomes automatic and easy to stick to.
`
  },

  {
    task: "Hip openers (pigeon/90-90) 10–15 min",
    duration: 0.5,
    explanation: `
Hip mobility supports posture, walking comfort, and lower-body training. Tight hips are common, especially if you sit a lot.

Step-by-step
1. Choose either:
   • pigeon stretch  
   • 90-90 hip position  
   • or split time between both
2. Get into the position slowly and gently.
3. Aim for a strong stretch, not pain.
4. Breathe slowly and keep your face, neck, and shoulders relaxed.
5. Spend equal time on both sides.
6. If one side feels much tighter, note it rather than forcing it.
7. Stand up slowly afterwards and walk a few steps to notice the difference.

Outcome
Looser hips, less lower-body tension, and a better base for movement and posture.
`
  },

  {
    task: "Thoracic spine drill (cat-cow + thread-the-needle) 10 min",
    duration: 0.5,
    explanation: `
Mid-back mobility often reduces stiffness through the neck and shoulders. This is especially useful if you spend a lot of time at a desk.

Step-by-step
1. Start on all fours in a comfortable position.
2. Do cat-cow slowly for 60–90 seconds.
   • round the spine gently  
   • then extend gently  
   • move with control rather than speed
3. Move into thread-the-needle.
4. Do 6–10 controlled reps per side, or hold briefly on each side.
5. Keep breathing steadily and avoid rushing.
6. Finish with a few slow shoulder rolls while standing.

Outcome
Better thoracic mobility, less “desk-body” stiffness, and smoother posture mechanics.
`
  },

  {
    task: "Ankle & calf mobility 10 min (wall dorsiflexion, calf raises)",
    duration: 0.5,
    explanation: `
Ankles and calves affect walking, squats, balance, and knee comfort. Better ankle mobility often improves movement quality more than people expect.

Step-by-step
1. Start with a gentle ankle mobility drill such as knee-to-wall dorsiflexion.
2. Keep the heel down and move into a comfortable range.
3. Repeat slowly on both sides.
4. Optional: note how far your toes are from the wall when your knee can still touch without the heel lifting.
5. Then do controlled calf raises:
   • rise slowly  
   • lower slowly  
   • keep balance and control
6. Focus on quality rather than rushing through reps.

Outcome
Improved ankle range, stronger calves, and better lower-body movement quality.
`
  },

  {
    task: "Glute activation (clamshells/bridges) 12–15 min",
    duration: 0.5,
    explanation: `
Activating the glutes helps support the hips and can reduce compensation through the knees and lower back. This is especially useful before lower-body training or after a lot of sitting.

Step-by-step
1. Start with clamshells:
   • move slowly  
   • keep the hips steady  
   • focus on feeling the side glute work
2. Do both sides evenly.
3. Move into glute bridges:
   • feet grounded  
   • ribs down  
   • squeeze gently at the top  
   • pause before lowering
4. Stop before form fades.
5. Focus on quality and control rather than high reps.

Outcome
Better hip stability and stronger support muscles for walking, posture, and training.
`
  },

  {
    task: "Desk reset: 3×/day 2-min stretch timer",
    duration: 0.5,
    explanation: `
Tiny resets done regularly can reduce stiffness much more effectively than one long stretch session at the end of the day.

Step-by-step
1. Set 3 reminders in your day.

Good options:
• morning  
• midday  
• afternoon

2. Keep each reset to 2 minutes so it stays easy.
3. For each reset, include a few simple moves.

Example:
• open chest  
• stretch hip flexors  
• gentle neck mobility  
• shoulder rolls  
• stand and breathe deeply

4. Stop when the timer ends. Do not turn it into a full workout.
5. Treat this as maintenance, not performance.

Outcome
Less stiffness, better posture through the day, and more energy while working.
`
  },

  {
    task: "Breathwork for rib expansion (box breathing) 5–8 min",
    duration: 0.5,
    explanation: `
Breathwork can help reduce tension and improve how your posture feels from the inside out. Calm breathing often makes it easier to stack ribs, shoulders, and head more naturally.

Step-by-step
1. Sit or lie down comfortably.
2. Relax your shoulders and jaw.
3. Use box breathing:
   • inhale for 4  
   • hold for 4  
   • exhale for 4  
   • hold for 4
4. Repeat for 5–8 minutes.
5. Keep the breath gentle rather than dramatic.
6. Finish with one or two slightly longer exhales.

Outcome
A calmer nervous system, easier breathing, and better posture awareness without forcing it.
`
  },

  {
    task: "Short walk with tall posture + arm swing 15 min",
    duration: 0.5,
    explanation: `
Walking is posture practice in real life. It helps you take mobility work out of the stretch and into everyday movement.

Step-by-step
1. Walk for 15 minutes at an easy or easy-to-brisk pace.
2. Keep:
   • chin level  
   • shoulders down  
   • ribs relaxed  
   • arms swinging naturally
3. If you notice tension, reset gently and continue.
4. Do not try to look “perfect”, aim for relaxed tall posture.

Outcome
Better posture awareness carried into real movement instead of only exercise drills.
`
  },

  {
    task: "Re-test posture and note one improvement",
    duration: 0.5,
    explanation: `
Re-testing helps you notice progress that is easy to miss day to day. Small improvements matter because they reinforce the habit.

Step-by-step
1. Repeat the same wall or mirror posture test you did earlier.
2. Compare how it feels now.
3. Notice one improvement.

Examples:
• less neck tension  
• easier chest opening  
• taller stance  
• easier breathing  
• less stiffness in hips or calves

4. Also note one area that still needs attention.
5. Keep the reflection simple and factual.

Outcome
Clear feedback that helps you stay motivated and focused on the right areas.
`
  },

  {
    task: "Foot care: lacrosse ball roll 5–8 min",
    duration: 0.5,
    explanation: `
Tension in the feet can affect the whole chain above them. This is a simple reset that can improve comfort through the calves, knees, and hips.

Step-by-step
1. Roll one foot slowly over a ball for 2–4 minutes.
2. Explore the sole gently rather than crushing into pain.
3. Switch feet.
4. Keep the pressure pleasantly intense, not aggressive.

Outcome
Looser feet and better comfort through the lower body chain.
`
  },

  {
    task: "Neck relief: chin tucks + doorway pec stretch 8–10 min",
    duration: 0.5,
    explanation: `
This combination helps counter common screen posture patterns by gently strengthening the front-of-neck position and opening the chest.

Step-by-step
1. Start with chin tucks:
   • keep the movement small  
   • think “long neck” rather than forcing the chin down  
   • move slowly and gently
2. Do a few controlled reps.
3. Move to a doorway pec stretch:
   • place the arm gently  
   • open through the chest  
   • breathe steadily
4. Repeat 2–3 rounds.
5. Finish with relaxed shoulder rolls.

Outcome
Less neck strain, more open chest posture, and better upper-body alignment after desk time.
`
  },

  {
    task: "Hinge pattern drill with dowel/broom 8 min",
    duration: 0.5,
    explanation: `
A clean hip hinge helps protect the back and improves form for movements like deadlifts, RDLs, and everyday bending.

Step-by-step
1. Place a dowel, broom, or long stick along your spine.
2. Try to keep contact at:
   • head  
   • upper back  
   • tailbone
3. Soften the knees slightly.
4. Push the hips back as you hinge, rather than rounding forward.
5. Move slowly.
6. If the contact points break, reset and try again.
7. Finish with 2–3 reps without the dowel while copying the same pattern.

Outcome
Safer bending mechanics and a stronger movement foundation for training.
`
  },

  {
    task: "Couch stretch (hip flexors) 2×60s/side",
    duration: 0.5,
    explanation: `
Hip flexors often get tight from sitting. This stretch can help with stride, posture, and how the front of the hips feels.

Step-by-step
1. Set up the stretch gently and pad the knee if needed.
2. Keep the body tall without forcing a dramatic arch.
3. Hold 60 seconds on each side.
4. Repeat for a second round.
5. Stand up slowly afterwards and walk a few steps.

Outcome
Less hip tightness and improved comfort through the front of the hips.
`
  },

  {
    task: "Daily mobility streak: 5 days in a row",
    duration: 0.5,
    explanation: `
Consistency is what changes how your body feels. A short streak helps turn mobility from a one-off idea into a real habit.

Step-by-step
1. Choose your 10-minute mobility routine.
2. Pick the 5 days you will do it.
3. Keep the sessions easy enough that you want to come back tomorrow.
4. Tick them off each day.
5. If you miss one day, restart calmly rather than turning it into a failure story.
6. At the end of the streak, note what felt better:
   • stiffness  
   • posture  
   • walking  
   • desk comfort  
   • training warm-ups

Outcome
A real mobility habit built through repetition, not perfection.
`
  }
],

  nutrition: [
  {
    task: "Plan protein targets for a day (~1.4–1.8 g/kg) and sketch meals",
    duration: 1.0,
    explanation: `
Protein supports satiety, recovery, muscle maintenance, and body composition. Planning it in advance makes it much easier to hit without obsessing.

Step-by-step
1. Calculate a rough daily protein target using your body weight in kilograms × 1.4–1.8.
2. Pick a number within that range that feels realistic for your current stage.
3. Divide the total across 3 meals and 1–2 snacks so it feels easier to reach.
4. Sketch a simple day of eating.

For each meal, think:
• protein source  
• veg or fruit  
• carbs and/or fats  
• what will make it filling and realistic

5. Choose meals you would genuinely repeat, not “perfect” meals you will avoid after two days.
6. Save the plan in your notes so you can reuse it.

Outcome
A simple, realistic protein plan that supports your goals without turning food into maths all day.
`
  },

  {
    task: "High-protein breakfast prep (overnight oats/eggs/yogurt alt)",
    duration: 0.5,
    explanation: `
A protein-first breakfast can help steady energy, reduce cravings, and make the rest of the day easier.

Step-by-step
1. Choose 1–2 go-to breakfasts that feel quick, filling, and realistic.
2. Pick options you actually enjoy.

Examples:
• overnight oats with added protein  
• eggs and toast  
• lactose-free or dairy-free high-protein yoghurt alternative with fruit  
• smoothie with protein source  
• tofu scramble  
• cottage cheese alternative or other high-protein option if suitable

3. Prep what you can the night before.

Examples:
• soak oats  
• chop fruit  
• boil eggs  
• portion toppings  
• prep smoothie ingredients

4. Keep one backup breakfast option ready for rushed mornings.

Examples:
• protein shake  
• yoghurt alternative  
• nuts + fruit  
• pre-cooked eggs

Outcome
A reliable breakfast routine that supports energy, recovery, and better appetite control.
`
  },

  {
    task: "Hydration rule: set bottle on desk; 2–2.5L today",
    duration: 0.5,
    explanation: `
Hydration affects energy, focus, appetite, and even training quality. Keeping water visible makes drinking it much more automatic.

Step-by-step
1. Put your bottle where you can see it easily.
2. Refill it before it is fully empty if possible.
3. Set 2–3 reminders if needed.
4. Sip steadily across the day rather than trying to catch up late.

Outcome
More stable energy and fewer moments where tiredness is really just low hydration.
`
  },

  {
    task: "Grocery list: proteins, fibrous veg, whole carbs, healthy fats",
    duration: 0.5,
    explanation: `
A structured grocery list makes your goals easier to follow because it turns good intentions into practical food choices.

Step-by-step
1. Create four headings:
   • Protein  
   • Veg / Fruit  
   • Carbs  
   • Fats
2. Add 3–5 foods to each category that you actually like and will realistically cook or eat.
3. Include a mix of:
   • fresh options  
   • frozen options  
   • cupboard or convenience staples
4. Add quick options for low-energy days.

Examples:
• frozen vegetables  
• tinned beans  
• microwave rice  
• pre-cooked protein  
• wraps  
• oats

5. Build your shop from this list rather than improvising everything in the supermarket.

Outcome
A kitchen that supports your goals with less effort, less decision fatigue, and fewer impulse purchases.
`
  },

  {
    task: "Batch cook 1–2 staples (grains + protein) for the next 3 days",
    duration: 1,
    explanation: `
Batch cooking gives your future self easy wins. It makes balanced meals much faster to assemble when you are tired, busy, or not in the mood to cook.

Step-by-step
1. Choose:
   • 1 grain or starch  
   • 1 protein source
2. Pick simple options you actually use.

Examples:
• rice, potatoes, quinoa, pasta  
• chicken, tofu, turkey mince, beans, lentils

3. Cook enough for roughly 3 days.
4. Portion into containers so meals feel easy to assemble.
5. Add a simple mix-and-match idea:
   • grain + protein + veg + sauce
6. Store clearly so the food is visible and easy to grab.

Outcome
Faster meals, fewer random snack spirals, and better follow-through on busy days.
`
  },

  {
    task: "Swap one sugary snack for fruit+nut or Greek-style yogurt alt",
    duration: 0.5,
    explanation: `
One small swap can steady energy and reduce the crash that often follows very sugary snacks. The goal is not deprivation, it is a more useful default.

Step-by-step
1. Identify your most common sugary snack moment.

Examples:
• afternoon slump  
• post-dinner sweet craving  
• snack while working  
• impulse buy when out

2. Choose one replacement you would actually enjoy.

Examples:
• fruit + nuts  
• high-protein yoghurt alternative + berries  
• apple + peanut butter  
• dates + nuts  
• protein pudding or shake if appropriate

3. Keep the replacement stocked and easy to reach.
4. Try the swap once a day in that usual moment.
5. Notice how your hunger, energy, and satisfaction feel afterwards.

Outcome
A practical snack upgrade that supports steadier energy without making food feel joyless.
`
  },

  {
    task: "Mindful dinner: 20 min, no phone, chew slowly",
    duration: 0.5,
    explanation: `
Eating more slowly often improves satisfaction and helps fullness cues catch up before you overeat by accident.

Step-by-step
1. Put your phone away or out of reach before you start.
2. Sit down properly rather than eating while standing, scrolling, or multitasking.
3. Slow down the first few bites on purpose.
4. Chew slightly more than usual and pause between bites when you remember.
5. Notice:
   • how hungry you were when you started  
   • when you begin to feel satisfied  
   • whether the meal feels more enjoyable when you are actually present
6. Aim to stop at comfortably satisfied rather than very full.

Outcome
Better satisfaction, calmer eating, and a stronger connection to your appetite cues.
`
  },

  {
    task: "Plate method: ½ veg, ¼ protein, ¼ carbs for one meal",
    duration: 0.5,
    explanation: `
The plate method gives you a simple structure for balanced meals without needing to track everything precisely.

Step-by-step
1. Build one meal using:
   • ½ plate vegetables  
   • ¼ plate protein  
   • ¼ plate carbs
2. Add a small amount of healthy fats if needed.

Examples:
• olive oil  
• avocado  
• nuts or seeds  
• dressing

3. Use the method as a flexible guide, not a rule to obsess over.
4. Eat the meal and notice how full and satisfied you feel afterwards.

Outcome
A more balanced meal structure with less overthinking.
`
  },

  {
    task: "Learn label reading: protein/fibre per 100g on 3 items",
    duration: 0.5,
    explanation: `
Basic label reading helps you make better choices quickly without turning shopping into a science project.

Step-by-step
1. Choose 3 packaged foods you buy often.
2. Look at the nutrition panel and check:
   • protein per 100g  
   • fibre per 100g
3. Compare brands or versions of the same type of food.
4. Notice which option gives you more protein or fibre for a similar serving.
5. Save 1–2 strong default picks for future shops.

Examples:
• wraps  
• cereal  
• yoghurt alternatives  
• bread  
• granola  
• ready meals

Outcome
More informed shopping choices and stronger defaults without dieting drama.
`
  },

  {
    task: "Reflection: energy levels & satiety today",
    duration: 0.5,
    explanation: `
Reflection helps you personalise nutrition around what actually works for your body, not just what sounds healthy on paper.

Step-by-step
1. At the end of the day, rate:
   • energy from 1–5  
   • hunger / satiety from 1–5
2. Think back over the day and notice patterns.
3. Write one short sentence:
   “I felt better when I ___.”
4. Or:
   “I noticed my energy dropped when I ___.”
5. Choose one very small adjustment for tomorrow.

Examples:
• more protein at breakfast  
• more water earlier  
• less sugary snacking  
• more fibre at lunch  
• eating dinner more slowly

Outcome
A clearer understanding of your personal “best fuel” and how food affects how you feel.
`
  },

  {
    task: "Set a fibre target (e.g., 25–30g) for today",
    duration: 0.5,
    explanation: `
Fibre supports digestion, fullness, and steadier energy. A simple daily target helps you build meals that are more satisfying.

Step-by-step
1. Choose a fibre target range for the day.
2. Aim to include 2–3 fibre sources across your meals.

Examples:
• vegetables  
• fruit  
• oats  
• legumes  
• whole grains  
• chia seeds  
• berries

3. Add fibre gradually if you are not used to eating much of it.
4. Drink enough water as you increase it.

Outcome
More satisfying meals and better digestion over time.
`
  },

  {
    task: "Prep 2 snack boxes (protein + produce)",
    duration: 0.5,
    explanation: `
Prepared snacks make better choices much easier when you are busy, hungry, or likely to graze randomly.

Step-by-step
1. Choose two snack combinations with:
   • one protein source  
   • one fruit or vegetable
2. Examples:
   • boiled eggs + cherry tomatoes  
   • yoghurt alternative + berries  
   • hummus + carrots  
   • cheese or dairy-free protein option + apple  
   • chicken slices + cucumber
3. Portion them into containers now.
4. Put them at eye level in the fridge or where you will see them first.
5. Use them when hunger hits instead of relying on whatever is nearby.

Outcome
Better snack choices made more automatic and less dependent on willpower.
`
  },

  {
    task: "Try one new veg/whole grain this week",
    duration: 0.5,
    explanation: `
A little variety supports nutrition, keeps meals more interesting, and helps the plan feel less repetitive.

Step-by-step
1. Choose one vegetable or whole grain you do not usually eat.
2. Pick a very simple prep method.

Examples:
• roast  
• steam  
• stir-fry  
• boil and season simply

3. Add it to one meal this week.
4. Decide:
   • keep it in rotation  
   • try it differently next time  
   • swap it for something else

Outcome
More variety and a slightly more flexible, enjoyable food routine.
`
  },

  {
    task: "Reduce liquid calories for 3 days",
    duration: 0.5,
    explanation: `
Liquid calories can add up quickly without adding much fullness. A short reset helps you notice what changes when you reduce them.

Step-by-step
1. Identify your main liquid calories.

Examples:
• sugary coffee drinks  
• juice  
• alcohol  
• fizzy drinks  
• sweetened iced drinks

2. For 3 days, reduce them most of the time.
3. Choose lower-calorie alternatives that still feel realistic.

Examples:
• water  
• sparkling water  
• tea  
• black coffee  
• sugar-free options

4. Keep the goal realistic rather than extreme.

Outcome
A simple nutrition win that supports your broader goals without overhauling your meals.
`
  },

  {
    task: "Create 3 ‘default’ quick dinners under 20 min",
    duration: 0.5,
    explanation: `
Default dinners protect consistency. When you already know what “easy and decent” looks like, busy nights stop turning into random choices.

Step-by-step
1. Choose 3 dinners you can make in under 20 minutes.
2. Keep the structure simple:
   • protein  
   • veg  
   • carb
3. Pick meals you would genuinely repeat.

Examples:
• stir-fry with protein and rice  
• eggs or tofu with potatoes and salad  
• salmon or chicken with microwave grains and veg  
• bean bowl with wraps and avocado

4. Write down the ingredients for each meal.
5. Keep those ingredients stocked most weeks.
6. Save these as your fallback dinners for nights when energy is low.

Outcome
Reliable, nourishing dinners that reduce decision fatigue and make consistency easier.
`
  }
],

sleep: [
  {
    task: "Choose a fixed wind-down alarm (same time nightly)",
    duration: 0.5,
    explanation: `
A consistent wind-down cue helps your body and brain learn when sleep is approaching. This is often easier to follow than trying to force an exact bedtime straight away.

Step-by-step
1. Choose a realistic wind-down time that fits your life.
2. Aim for something you can repeat most nights, not only on “perfect” days.
3. Set a repeating alarm on your phone, watch, or smart speaker.
4. Label it clearly.

Examples:
• Wind-down starts  
• Screens off soon  
• Start evening routine

5. When it rings, begin shifting out of work mode, scroll mode, or productivity mode.
6. Treat the alarm as the cue to start slowing down, not as something to ignore five times.

Outcome
A reliable signal that helps your evening become more predictable and sleep-friendly.
`
  },

  {
    task: "Cut screens 45–60 min before bed",
    duration: 1,
    explanation: `
Reducing screen exposure before bed can help your brain settle and make it easier to feel sleepy at the right time.

Step-by-step
1. Choose a realistic screen-free window before bed.
   • 45 minutes is a strong starting point  
   • 60 minutes is even better if it feels doable
2. Decide what “screens off” means for you.

Examples:
• no scrolling  
• no work laptop  
• no YouTube in bed  
• phone on charge outside the room

3. Put your phone away or switch it to airplane mode if needed.
4. Choose 1–2 replacement activities in advance so you do not default back to screens.

Examples:
• reading  
• stretching  
• journaling  
• shower  
• tea  
• preparing clothes for tomorrow

5. Expect the first few nights to feel a bit strange if you are used to winding down with screens.
6. Notice whether sleep feels easier after a few days.

Outcome
Less stimulation before bed and an easier transition into sleep.
`
  },

  {
    task: "Evening routine: stretch 8–10 min + warm shower",
    duration: 0.5,
    explanation: `
A predictable evening routine helps your nervous system shift from alert mode into rest mode. The goal is not a perfect ritual, just a repeatable one.

Step-by-step
1. Set aside 10–15 minutes before bed.
2. Do 8–10 minutes of gentle stretching.

Keep it simple:
• neck rolls  
• shoulder stretches  
• cat-cow  
• hip opener  
• forward fold  
• child's pose

3. Move slowly and keep the goal relaxation, not performance.
4. Take a warm shower or bath afterwards if that feels good for you.
5. Keep lighting soft and movements calm.
6. Use the same rough sequence each night so it becomes familiar.

Outcome
A smoother, calmer transition from being “on” all day to being ready for sleep.
`
  },

  {
    task: "Caffeine cut-off: none after 14:00 today",
    duration: 0.5,
    explanation: `
Caffeine can affect sleep later than many people realise, even when you do not feel obviously wired.

Step-by-step
1. Notice the time of your last caffeine today.
2. Set a cut-off of 14:00.
3. After that, switch to:
   • water  
   • herbal tea  
   • decaf  
   • sparkling water
4. Observe whether falling asleep feels easier tonight.

Outcome
A simple sleep-supportive habit that may improve sleep onset and sleep quality.
`
  },

  {
    task: "Bedroom audit: cool, dark, quiet (earplugs/eye mask if needed)",
    duration: 0.5,
    explanation: `
Your sleep environment matters more than people often realise. Small adjustments to light, temperature, and noise can make a noticeable difference.

Step-by-step
1. Look at your bedroom as if you were checking it for sleep obstacles.
2. Check temperature:
   • does the room feel too warm or stuffy?
3. Check light:
   • streetlight  
   • charger lights  
   • hallway light  
   • early morning brightness
4. Check noise:
   • traffic  
   • flatmates  
   • neighbours  
   • devices humming
5. Make simple upgrades where needed.

Examples:
• open a window slightly  
• use an eye mask  
• use blackout curtains  
• wear earplugs  
• add white noise  
• move bright electronics away

Outcome
A bedroom setup that supports deeper, less interrupted sleep.
`
  },

  {
    task: "Write tomorrow’s 3 priorities to offload mind",
    duration: 0.5,
    explanation: `
Writing tomorrow’s priorities down helps stop your brain from trying to keep everything active while you are supposed to be sleeping.

Step-by-step
1. Take a notebook, sticky note, or notes app.
2. Write down your top three priorities for tomorrow.
3. Keep them short and concrete.
4. Do not turn this into a full to-do list spiral.
5. Close the notebook or app once you are done.
6. Remind yourself:
   “It is captured. I do not need to rehearse it in bed.”

Outcome
A quieter mind at bedtime and less mental looping once the lights are off.
`
  },

  {
    task: "Try magnesium or herbal tea if appropriate",
    duration: 0.5,
    explanation: `
Some people find gentle sleep-supporting options helpful. The aim is support, not dependence.

Step-by-step
1. Choose either:
   • a caffeine-free herbal tea  
   • a supplement that is appropriate for you
2. Take it 30–60 minutes before bed.
3. Notice how your body responds.
4. Stop if it makes digestion, sleep, or next-day energy worse.

Outcome
An optional relaxation aid that may support winding down more gently.
`
  },

  {
    task: "Wake at the same time (no snooze rule)",
    duration: 0.5,
    explanation: `
Wake-time consistency is one of the strongest ways to stabilise your body clock. It often matters even more than chasing a perfect bedtime.

Step-by-step
1. Choose a wake-up time that fits your life most days.
2. Set one alarm only.
3. Put the alarm somewhere that encourages you to get up rather than keep negotiating.
4. When it rings, get out of bed as soon as you can.
5. Avoid snoozing, even after a shorter night.
6. Remind yourself that the goal is rhythm, not one perfect morning.

Outcome
A stronger circadian rhythm and often easier sleep at night over time.
`
  },

  {
    task: "10-min morning light exposure (outdoors if possible)",
    duration: 0.5,
    explanation: `
Morning light helps anchor your body clock and can improve how sleepy you feel later that night.

Step-by-step
1. Try to get light exposure within the first hour after waking.
2. Go outside if possible.
3. Spend at least 10 minutes in daylight.
4. You do not need to stare at the sun, just be outside and exposed to natural light.
5. If the weather is dull, outside light is still useful.
6. Combine this with a short walk if that helps you stay consistent.

Outcome
A stronger sleep-wake signal that supports better sleep later in the day.
`
  },

  {
    task: "Charge phone outside the bedroom",
    duration: 0.5,
    explanation: `
Keeping your phone outside the bedroom reduces the chance of late-night scrolling, emotional checking, or picking it up the moment you wake.

Step-by-step
1. Choose a charging spot outside the bedroom.
2. Plug your phone in before your wind-down routine begins or during it.
3. If needed, use:
   • a physical alarm clock  
   • a watch alarm  
   • a smart speaker alarm
4. Expect this to feel slightly uncomfortable at first if you are used to sleeping beside your phone.
5. Remind yourself that the goal is less temptation, not punishment.

Outcome
Less late-night screen time and a bedroom that feels more restful.
`
  },

  {
    task: "Set devices to dark mode / night shift at sunset",
    duration: 0.5,
    explanation: `
If you do use screens in the evening, softer light settings are a helpful backup.

Step-by-step
1. Turn on night shift, blue-light reduction, or dark mode on your devices.
2. Schedule it to come on automatically around sunset or early evening.
3. Lower the brightness too, not just the colour tone.

Outcome
A gentler visual environment in the evening, especially if some screen use is unavoidable.
`
  },

  {
    task: "2-minute breathing before bed (4-7-8 or box)",
    duration: 0.5,
    explanation: `
Slow breathing helps calm the nervous system and can make it easier to settle into sleep.

Step-by-step
1. Lie down or sit comfortably.
2. Choose one breathing pattern:
   • 4-7-8  
   • box breathing
3. Keep the breath smooth and relaxed.
4. Focus especially on the exhale becoming slower and softer.

Outcome
A simple calming tool that helps reduce bedtime tension.
`
  },

  {
    task: "Keep bedroom ~18–20°C and ventilated",
    duration: 0.5,
    explanation: `
A cooler room often supports deeper, more comfortable sleep.

Step-by-step
1. Check whether your room feels too warm at night.
2. Adjust heating, bedding, or airflow if you can.
3. Open a window slightly or ventilate the room earlier in the evening if appropriate.
4. Use breathable bedding if heat tends to wake you.

Outcome
A cooler, more sleep-supportive environment.
`
  },

  {
    task: "Weekend schedule within ±1 hour",
    duration: 0.5,
    explanation: `
Large weekend shifts in sleep timing can make Monday feel like jet lag. Keeping things roughly consistent helps protect your rhythm.

Step-by-step
1. Aim to keep bedtime and wake time within about one hour of your weekday pattern.
2. Avoid very long lie-ins when possible.
3. If you go to bed later socially, try to keep the next morning from shifting too far.
4. Keep morning light exposure in place on weekends too.

Outcome
A smoother weekly rhythm and easier Monday recovery.
`
  },

  {
    task: "Log sleep: bedtime/wake time + 1 tweak for tomorrow",
    duration: 0.5,
    explanation: `
A tiny sleep log helps you notice patterns without turning sleep into a stressful performance project.

Step-by-step
1. Each morning or evening, note:
   • bedtime  
   • wake time
2. Optionally add one quick note about:
   • how rested you felt  
   • whether you woke during the night  
   • whether anything seemed to affect sleep
3. Write one tiny adjustment for tomorrow.

Examples:
• no caffeine after lunch  
• phone out earlier  
• wind-down starts 15 minutes sooner  
• cooler room tonight

4. Keep it brief and neutral.

Outcome
Steady sleep improvement through small observations and low-pressure adjustments.
`
  }
],
  fitness: [
  {
    task: "Learn form: hinge, squat, push, pull (video + mirror)",
    duration: 1,
    explanation: `
Good form helps you train more safely and progress faster. You do not need perfect technique on day one. You need clear, repeatable movement patterns.

Step-by-step
1. Pick one short beginner-friendly video for each movement pattern:
   • hinge  
   • squat  
   • push  
   • pull
2. Watch one pattern at a time rather than all at once.
3. Practice each pattern slowly with no weight or very light resistance.
4. Use a mirror or record a short clip to check what you are doing.
5. For each movement, choose ONE simple cue.

Examples:
• Hinge → “hips back”  
• Squat → “knees track toes”  
• Push → “ribs down”  
• Pull → “shoulders away from ears”

6. Focus on smooth, controlled reps rather than lots of reps.
7. Repeat until each pattern feels more familiar, not perfect.

Outcome
Cleaner movement patterns you can build strength on more safely and confidently.
`
  },

  {
    task: "Full-body A (bodyweight): squats, push-ups (incline), rows (band), plank (20–30s ×3)",
    duration: 1,
    explanation: `
This is a simple full-body session that covers major movement patterns without needing a lot of equipment.

Step-by-step
1. Warm up for 5 minutes with:
   • marching or light cardio  
   • shoulder rolls  
   • hip circles  
   • a few bodyweight squats
2. Do 3 rounds of:
   • squats  
   • incline push-ups  
   • band rows  
   • plank 20–30 seconds
3. Use controlled reps on every exercise.
4. Rest 60–90 seconds between rounds.
5. Focus on form cues:
   • Squat → chest relaxed, knees track naturally  
   • Push-up → body stays in one line  
   • Row → squeeze shoulder blades gently  
   • Plank → ribs down, hips level
6. Stop before form breaks.
7. Log what you completed.

Outcome
A complete beginner-friendly strength session that feels effective, structured, and manageable.
`
  },

  {
    task: "Walk 20–30 min at brisk pace (RPE ~6/10)",
    duration: 0.5,
    explanation: `
Brisk walking builds fitness, supports recovery, and improves energy without adding much stress to the body.

Step-by-step
1. Set a timer for 20–30 minutes.
2. Walk at a pace that feels purposeful but sustainable.
3. Use the talk test:
   • you should be able to speak in short sentences  
   • but not sing comfortably
4. Keep posture tall and shoulders relaxed.
5. Let your arms swing naturally.
6. At the end, log:
   • time  
   • pace feeling  
   • energy afterwards

Outcome
Improved endurance, daily movement, and recovery support without overtraining.
`
  },

  {
    task: "Full-body B: hip hinge (RDL with backpack), split squat, overhead press (light), dead bug",
    duration: 1.0,
    explanation: `
This session builds strength, control, and stability through slightly different patterns than Full-body A.

Step-by-step
1. Warm up for 5 minutes, especially hips and shoulders.
2. Do 2–3 rounds of:
   • backpack RDL  
   • split squat  
   • light overhead press  
   • dead bug
3. Keep every rep slow and controlled.
4. Use these form cues:
   • RDL → hips back, neutral spine  
   • Split squat → steady balance, controlled depth  
   • Overhead press → ribs down, no leaning back  
   • Dead bug → breathe slowly, move opposite arm and leg with control
5. Rest 60–90 seconds between rounds.
6. Keep the load light enough that technique stays clean.

Outcome
Stronger movement patterns with better stability, balance, and body control.
`
  },

  {
    task: "Add progressive overload: +1–2 reps or slightly more load",
    duration: 0.5,
    explanation: `
Progressive overload means asking your body to do a little bit more over time. The key word is little.

Step-by-step
1. Look at your last session.
2. Only progress if form stayed clean and the session felt manageable.
3. Choose ONE progression method for today:
   • add 1–2 reps per set  
   • use slightly more load  
   • add one extra set  
   • slow the tempo slightly for more control
4. Do not change everything at once.
5. Log exactly what you changed so progress stays measurable.
6. If the previous session already felt hard or messy, repeat it instead of progressing.

Outcome
Steady strength gains built through small, safe, measurable upgrades.
`
  },

  {
    task: "Core focus: side plank 3×20–30s each side + bird dog",
    duration: 0.5,
    explanation: `
Core work is not just about abs. Stability work supports posture, protects the back, and improves how the rest of your body moves.

Step-by-step
1. Start with side planks:
   • 3 rounds each side  
   • 20–30 seconds per round  
   • keep hips level and neck relaxed
2. Rest briefly between sides if needed.
3. Then do bird dog:
   • move slowly  
   • reach long through opposite arm and leg  
   • keep the torso stable
4. Focus on control, not speed.
5. Keep breathing throughout instead of holding tension.

Outcome
A stronger, more stable core that supports training and everyday movement.
`
  },

  {
    task: "Full-body A again (repeat with small progression)",
    duration: 1.0,
    explanation: `
Repeating a session is how skill and confidence grow. You do not need constant variety. You need practice plus one small upgrade.

Step-by-step
1. Repeat the same Full-body A session.
2. Choose only ONE progression:
   • one extra rep  
   • one extra set  
   • slightly slower tempo  
   • slightly better range or control
3. Keep everything else the same.
4. Compare how the session feels versus last time.
5. Log the small progression.

Outcome
A measurable improvement built through repetition and control rather than constant change.
`
  },

  {
    task: "Optional finisher: 5×(30s fast/60s easy) cardio",
    duration: 0.5,
    explanation: `
A short finisher can add fitness without turning the session into an exhausting marathon. It should feel challenging but controlled.

Step-by-step
1. Choose one cardio option:
   • bike  
   • incline walk  
   • jog  
   • rower  
   • stepper
2. Do 5 rounds of:
   • 30 seconds faster effort  
   • 60 seconds easy recovery
3. Keep “fast” controlled, not reckless.
4. You should still feel like you could stop cleanly at the end.
5. Skip the finisher if your main workout was already enough for today.

Outcome
A short cardio boost that supports fitness without draining recovery.
`
  },

  {
    task: "Stretch 10 min post-workout (hamstrings/hip flexors/chest)",
    duration: 0.5,
    explanation: `
A short post-workout stretch can help reduce tightness and make the next day feel better.

Step-by-step
1. Pick 3 areas to stretch:
   • hamstrings  
   • hip flexors  
   • chest
2. Hold each stretch gently.
3. Breathe slowly and avoid forcing range.
4. Aim to finish feeling better, not pushed.

Outcome
Less stiffness and easier movement after training.
`
  },

  {
    task: "Log lifts in notes (sets/reps/feel)",
    duration: 0.5,
    explanation: `
Logging removes guesswork and makes progress easier to see.

Step-by-step
1. Write down:
   • exercises  
   • sets  
   • reps  
   • weight if used
2. Add one short note:
   • easy  
   • moderate  
   • hard  
   • one useful form cue
3. Keep it short. Thirty seconds is enough.

Outcome
A simple training record that helps you progress more intelligently.
`
  },

  {
    task: "Tempo focus: 3-1-3 squats + push-ups (control)",
    duration: 0.5,
    explanation: `
Tempo training builds control and strength using lighter loads. Slowing down helps you feel the movement and clean up technique.

Step-by-step
1. Use this tempo:
   • 3 seconds down  
   • 1 second pause  
   • 3 seconds up
2. Apply it to:
   • squats  
   • push-ups or incline push-ups
3. Reduce reps if needed so control stays high.
4. Focus on smooth movement all the way through.
5. Stop before the tempo turns sloppy.

Outcome
Better control, better technique, and more strength from simple movements.
`
  },

  {
    task: "Unilateral day: split squats + single-arm rows",
    duration: 0.5,
    explanation: `
Single-side training helps reveal and reduce weak links. It builds balance, coordination, and more even strength across the body.

Step-by-step
1. Start with split squats:
   • same reps each side  
   • controlled lowering  
   • steady balance
2. Then do single-arm rows:
   • slow pull  
   • brief squeeze  
   • controlled return
3. Start lighter than you think you need.
4. Notice whether one side feels less stable or less strong.
5. Do not rush to match the stronger side with sloppy form.

Outcome
Improved balance, stability, and strength symmetry across both sides of the body.
`
  },

  {
    task: "Posterior chain mini: hip hinge + glute bridge ladder",
    duration: 0.5,
    explanation: `
The posterior chain includes the glutes, hamstrings, and back side of the body. Strengthening it supports posture, lower-body power, and back-friendly movement.

Step-by-step
1. Start with slow hip hinges:
   • hips move back  
   • spine stays neutral  
   • movement stays controlled
2. Then do a glute bridge ladder:
   • begin with a small set  
   • add reps gradually only if form stays clean
3. Keep ribs down and feel the glutes working.
4. Stop if the lower back starts to take over.
5. Focus on clean mechanics over high numbers.

Outcome
A stronger posterior chain with cleaner movement and better support for posture and training.
`
  },

  {
    task: "Core anti-rotation: dead bug + suitcase carry (indoor)",
    duration: 0.5,
    explanation: `
Anti-rotation core training teaches your body to resist unwanted twisting. This builds real-life stability and supports back health.

Step-by-step
1. Start with dead bug:
   • slow reps  
   • steady breathing  
   • low back stays controlled
2. Then do a suitcase carry:
   • hold weight on one side only  
   • walk tall and steady  
   • keep ribs down and shoulders level
3. Switch sides and repeat evenly.
4. Use a manageable load that lets you stay controlled.

Outcome
A more stable core that resists twisting and supports posture, walking, and lifting.
`
  },

  {
    task: "Grease-the-groove: 3×daily micro-sets (2–3 reps) safe moves",
    duration: 0.5,
    explanation: `
Grease-the-groove means practising a movement often without fatigue. It is a skill-building approach, not a hard workout.

Step-by-step
1. Choose 1–2 safe, simple moves.

Examples:
• incline push-up  
• air squat  
• band row

2. Do 2–3 easy reps at a time.
3. Repeat this 3 times during the day:
   • morning  
   • midday  
   • evening
4. Never take the reps close to failure.
5. Treat it as practice, not training exhaustion.
6. Stop immediately if form becomes rushed or strained.

Outcome
Better movement skill, more familiarity, and extra consistency with almost no recovery cost.
`
  }
],

  cardio_endurance: [
  {
    task: "Find your easy pace: 20-min conversational walk/jog",
    duration: 0.5,
    explanation: `
Easy pace is the foundation of endurance training. It builds your aerobic base, supports recovery, and teaches you what sustainable effort actually feels like.

Step-by-step
1. Set a 20-minute timer.
2. Choose whether you will:
   • walk  
   • jog  
   • alternate walk and jog
3. Move at a pace where you could hold a conversation in full sentences.
4. Keep your effort comfortable.
   This should feel steady, not like a test.
5. If you notice yourself getting breathless, slow down.
6. At the end, log one short note:
   • “easy pace felt like ___”
   • “I could / could not talk easily”
   • “walking felt better than jogging today”

Outcome
A stronger cardio foundation and a clearer sense of what your true easy pace feels like.
`
  },

  {
    task: "Intervals: 6×(1 min fast / 1 min easy)",
    duration: 0.5,
    explanation: `
Intervals help build cardio fitness without needing a long session. The key is controlled effort, not going all-out.

Step-by-step
1. Warm up for 5 minutes at an easy pace.
2. Do 6 rounds of:
   • 1 minute faster effort  
   • 1 minute easy recovery
3. Use “fast” to mean challenging but controlled, not sprinting.
4. During the easy minute, slow down enough to recover your breathing.
5. Keep posture relaxed and movement smooth.
6. Finish with a 3–5 minute cool-down at an easy pace.
7. Log how the fast effort felt:
   • too easy  
   • just right  
   • too hard

Outcome
Improved cardio capacity and growing confidence with changing pace.
`
  },

  {
    task: "Low-impact option: bike/row 25 min steady",
    duration: 0.5,
    explanation: `
Low-impact cardio is often easier on the joints while still building endurance and work capacity.

Step-by-step
1. Choose:
   • bike  
   • rower
2. Set a 25-minute timer.
3. Keep the effort moderate and sustainable.
   You should feel worked, but still in control.
4. Focus on smooth rhythm rather than chasing speed.
5. Keep posture tall and breathing steady.
6. Finish feeling like you could have done a little more if needed.

Outcome
Solid cardio work with less joint stress and a more sustainable training load.
`
  },

  {
    task: "Hills or stairs: 10–12 min steady effort",
    duration: 0.5,
    explanation: `
Hills and stairs build both cardio and lower-body strength. They are a simple way to make walking more powerful without needing to run.

Step-by-step
1. Warm up with 5 minutes of easy walking.
2. Choose a hill, stairwell, or incline treadmill.
3. Work steadily for 10–12 minutes.
4. Walking is completely fine. This does not need to be a run.
5. Keep the effort consistent rather than turning the first minute into a race.
6. Focus on:
   • strong posture  
   • steady breathing  
   • controlled pace
7. Cool down for 5 minutes afterwards.

Outcome
Better leg endurance, stronger cardio capacity, and more confidence with incline work.
`
  },

  {
    task: "Longer aerobic session: 35–45 min easy",
    duration: 1.0,
    explanation: `
Longer easy sessions build endurance, patience, and recovery capacity. They teach your body to sustain movement without unnecessary stress.

Step-by-step
1. Choose your mode:
   • walk  
   • bike  
   • jog  
   • elliptical
2. Keep the pace easy enough that conversation would still be possible.
3. Start slower than you think you need.
4. Stay relaxed:
   • shoulders soft  
   • jaw relaxed  
   • breathing steady
5. Do not try to “prove” fitness in this session.
6. Hydrate afterwards and note how your energy feels later in the day.

Outcome
Improved endurance, better aerobic conditioning, and stronger recovery capacity.
`
  },

  {
    task: "Tempo taste: 10 min warm, 8 min moderate, 5 min cool",
    duration: 0.5,
    explanation: `
A short tempo session teaches pacing. Moderate effort should feel noticeably harder than easy pace, but still sustainable for the full block.

Step-by-step
1. Warm up for 10 minutes at an easy pace.
2. Increase to a moderate effort for 8 minutes.
3. Moderate means:
   • breathing is heavier  
   • talking is harder  
   • but you still feel in control
4. Avoid starting too hard.
5. Finish with 5 minutes easy to cool down.
6. Afterwards, note:
   • too hard  
   • just right  
   • too easy

Outcome
Better pacing instincts and a stronger sense of how moderate effort should feel.
`
  },

  {
    task: "Mobility recovery: calves/hips 12–15 min",
    duration: 0.5,
    explanation: `
Recovery work helps reduce tightness between cardio sessions and can make your next workout feel much better.

Step-by-step
1. Spend a few minutes on calves:
   • gentle calf stretch  
   • slow calf raises if they feel good
2. Spend a few minutes on hips:
   • hip flexor stretch  
   • light hip opener  
   • gentle figure-four or 90-90 position if appropriate
3. Breathe slowly and keep the intensity low.
4. Aim for “better after,” not “painful now.”

Outcome
Less tightness and better recovery between cardio sessions.
`
  },

  {
    task: "Walk-everywhere day (step goal 8–10k)",
    duration: 0.5,
    explanation: `
Daily movement matters. A walk-focused day helps build endurance and energy without needing a formal workout session.

Step-by-step
1. Choose a realistic step target based on your current baseline.

Examples:
• 6k if you are currently quite inactive  
• 8k as a solid target  
• 10k if it feels genuinely doable

2. Build the steps in through the day.

Examples:
• walk part of an errand  
• take stairs  
• add a 10-minute loop after meals  
• walk during calls  
• do a final evening lap if needed

3. Check your steps once around midday and once in the evening.
4. If you are behind, top up with one easy walk rather than stressing about it.

Outcome
Higher daily movement and stronger cardio habits without needing a formal training block.
`
  },

  {
    task: "Intervals: 8×(45s fast / 75s easy)",
    duration: 0.5,
    explanation: `
This interval session adds a slightly sharper challenge while still staying controlled and beginner-friendly.

Step-by-step
1. Warm up for 5 minutes easy.
2. Do 8 rounds of:
   • 45 seconds faster effort  
   • 75 seconds easy recovery
3. Keep the fast effort controlled.
   You should feel challenged, but not sprinting or losing form.
4. Let the easy recovery actually feel easy.
5. Finish with a 3–5 minute cool-down.
6. Log whether you stayed consistent or faded too early.

Outcome
Improved speed-endurance and better control over harder cardio efforts.
`
  },

  {
    task: "Reflect: resting HR/energy trends this week",
    duration: 0.5,
    explanation: `
Your body gives you recovery feedback all the time. This task helps you notice it so you can train more intelligently.

Step-by-step
1. Think back over the last week.
2. Rate your overall energy from 1–5.
3. If you track resting heart rate, glance at the trend.
4. Ask:
   • do I feel fresh, flat, or unusually tired?  
   • is my motivation normal or unusually low?  
   • am I recovering well between sessions?
5. Write one simple conclusion:
   • “I’m recovering well”  
   • “I may need a lighter week”  
   • “Sleep or stress seems to be affecting me”
6. Adjust next week if needed:
   • reduce intensity  
   • keep more sessions easy  
   • prioritise sleep and walking

Outcome
Smarter training decisions based on recovery signals instead of forcing it blindly.
`
  },

  {
    task: "Fartlek play: 20–25 min (mix speeds by landmarks)",
    duration: 0.5,
    explanation: `
Fartlek is unstructured pace play. It helps build fitness and pace awareness in a way that feels lighter and more playful than formal intervals.

Step-by-step
1. Choose a 20–25 minute route.
2. Pick visual landmarks:
   • lamp post  
   • corner  
   • next street  
   • tree  
   • bench
3. Speed up to one landmark, then recover to the next.
4. Mix the pace naturally.
5. Keep the effort playful rather than punishing.
6. Slow down fully whenever needed.
7. Finish feeling energised, not flattened.

Outcome
Improved fitness, better pace changes, and a more enjoyable relationship with cardio.
`
  },

  {
    task: "Zone 2 check: 30 min at nose-breath pace",
    duration: 0.5,
    explanation: `
Zone 2-style work builds endurance without draining you too much. Nose breathing is a simple cue to help keep the effort easy enough.

Step-by-step
1. Choose your mode:
   • walk  
   • bike  
   • jog
2. Move for 30 minutes.
3. Keep the effort easy enough that you can breathe through your nose most of the time.
4. If nose breathing becomes difficult, slow down.
5. Do not turn this into a hidden hard workout.
6. Note how steady and sustainable the pace felt.

Outcome
A stronger aerobic base and better awareness of sustainable endurance effort.
`
  },

  {
    task: "Recovery walk + nasal breathing 20 min",
    duration: 0.5,
    explanation: `
Recovery sessions are real training. They help bring stress down, support circulation, and help you feel better for your next harder session.

Step-by-step
1. Set a 20-minute timer.
2. Walk at a gentle pace.
3. Focus on:
   • relaxed shoulders  
   • soft jaw  
   • nasal breathing where comfortable
4. Keep the pace easy enough that you finish feeling calmer than when you started.
5. Use this as active recovery, not cardio competition.

Outcome
Lower stress, better recovery, and useful movement without extra strain.
`
  },

  {
    task: "Crosstrain sampler: 10 min each bike/row/elliptical",
    duration: 0.5,
    explanation: `
Cross-training reduces boredom, spreads load across the body, and helps you explore which cardio modes feel best for you.

Step-by-step
1. Start with 10 minutes on the bike at a moderate pace.
2. Move to 10 minutes on the rower at a steady effort.
3. Finish with 10 minutes on the elliptical at a comfortable pace.
4. Keep transitions simple.
5. Treat the whole session as exploration, not a performance test.
6. Notice:
   • which machine feels most natural  
   • which one feels hardest  
   • which one you would repeat willingly

Outcome
A more varied cardio session with less repetitive impact and better self-knowledge about what works for you.
`
  },

  {
    task: "Stretch + foam roll combo 15–20 min",
    duration: 0.5,
    explanation: `
This combo can help release tight spots and improve how your body feels between cardio sessions, especially if your calves, quads, or hips get tight.

Step-by-step
1. Start with gentle foam rolling.

Common areas:
• calves  
• quads  
• glutes

2. Roll slowly and avoid turning it into a pain contest.
3. After rolling, do a few stretches for:
   • calves  
   • hip flexors  
   • glutes or hamstrings if needed
4. Breathe slowly and keep the whole session calming rather than intense.
5. Stop once you feel looser rather than chasing a huge range.

Outcome
Less tightness and a more comfortable body for tomorrow’s movement.
`
  }
],

  

wellness: [
  {
    task: "10-min breathing/meditation for calm energy",
    duration: 0.5,
    explanation: `
Short calming practices can reduce mental noise, improve focus, and help your body come out of stress mode. The goal is not to “do meditation perfectly”. It is to create a few minutes of steadiness.

Step-by-step
1. Sit or lie down somewhere reasonably comfortable.
2. Set a 10-minute timer.
3. Choose one simple focus:
   • slow breathing  
   • counting breaths  
   • a short guided meditation  
   • noticing body sensations
4. Keep your shoulders and jaw relaxed.
5. If your mind wanders, gently bring your attention back without judging yourself.
6. When the timer ends, take one slower breath before getting up.

Outcome
Calmer energy, less internal noise, and a short reset for your nervous system.
`
  },

  {
    task: "Digital detox: 60-min offline block",
    duration: 1,
    explanation: `
Reducing digital input gives your brain a break from constant stimulation. Even one offline hour can improve focus, mood, and recovery.

Step-by-step
1. Choose a one-hour window that feels realistic.

Examples:
• after work  
• during the evening  
• weekend morning  
• lunch break on a quieter day

2. Put your phone on silent, airplane mode, or leave it in another room.
3. Avoid:
   • scrolling  
   • email  
   • YouTube  
   • background digital noise
4. Decide in advance what you will do instead.

Examples:
• reading  
• tidying  
• journaling  
• stretching  
• walking  
• cooking  
• making tea and sitting quietly

5. Notice how your energy feels before and after the hour.

Outcome
Reduced mental fatigue, more spaciousness, and a break from constant input.
`
  },

  {
    task: "Nature walk / park lap 20 min",
    duration: 0.5,
    explanation: `
Outdoor movement can help regulate stress, improve mood, and gently restore energy. It does not need to be long or intense to help.

Step-by-step
1. Go outside for 20 minutes.
2. Walk at an easy or easy-to-brisk pace.
3. Choose a route with as much greenery or open space as possible.
4. As you walk, notice a few things around you:
   • trees  
   • sky  
   • sounds  
   • air temperature  
   • light
5. Let the walk be simple. No need to turn it into a workout unless you want to.

Outcome
Improved mood, reduced stress, and a calmer nervous system through simple outdoor movement.
`
  },

  {
    task: "Book/check a health or dental appointment",
    duration: 0.5,
    explanation: `
Preventive care reduces future stress. Handling small health admin now is often much easier than dealing with something later when it becomes urgent.

Step-by-step
1. Think about whether there is a routine check-up you have been postponing.

Examples:
• dental check-up  
• GP visit  
• eye test  
• blood test if advised  
• hygiene appointment

2. Check when your last appointment was.
3. If needed, book the next one or confirm an existing appointment.
4. Save the date, time, and location in your calendar.
5. Save any confirmation email or message in one easy-to-find place.

Outcome
Health admin handled proactively, with less future stress and less mental clutter.
`
  },

  {
    task: "Protein-centric lunch + 2 veg colours",
    duration: 0.5,
    explanation: `
A balanced lunch can support steadier afternoon energy and reduce the crash that often follows very light or very carb-heavy meals.

Step-by-step
1. Choose one clear protein source.

Examples:
• chicken  
• tuna  
• eggs  
• tofu  
• beans  
• lentils  
• yoghurt-based option if suitable for you

2. Add two vegetables in different colours.

Examples:
• spinach + carrots  
• cucumber + peppers  
• broccoli + tomatoes  
• lettuce + beetroot

3. Add carbs or fats too if needed so the meal actually feels complete.
4. Eat without rushing if possible.
5. Notice how your afternoon energy feels compared with a less balanced lunch.

Outcome
More stable afternoon energy and a lunch that supports recovery and wellbeing.
`
  },

  {
    task: "Gratitude or wins journal (3 lines)",
    duration: 0.5,
    explanation: `
A few lines of reflection can gently shift your focus toward progress, steadiness, and what is already working.

Step-by-step
1. Write three short lines.
2. Choose either:
   • things you are grateful for  
   • things that went well  
   • things you handled better than before
3. Keep it honest and simple.

Examples:
• “I went for my walk even though I was tired.”  
• “Lunch kept me full longer today.”  
• “I felt calmer after putting my phone away.”

Outcome
Improved mood, stronger perspective, and more emotional resilience.
`
  },

  {
    task: "Evening self-care routine (20–30 minutes)",
    duration: 0.5,
    explanation: `
A consistent self-care routine can help your body and mind downshift. It does not need to be glamorous, it just needs to feel calming and repeatable.

Step-by-step
1. Set aside 20–30 minutes in the evening.
2. Choose 1–3 calming activities.

Examples:
• shower or bath  
• skincare  
• stretching  
• herbal tea  
• reading  
• tidying your space  
• journaling  
• soft music

3. Keep the routine low-stimulation.
4. Try to repeat roughly the same sequence a few times a week so it starts to feel familiar.
5. Focus on how you want to feel afterwards:
   • calmer  
   • cleaner  
   • softer  
   • less rushed  
   • more ready for sleep

Outcome
Lower stress, better recovery, and an evening rhythm that feels more supportive.
`
  },

  {
    task: "Engage in a calming hobby for 20 minutes",
    duration: 0.5,
    explanation: `
Low-stimulation hobbies help your mind recover from constant doing, scrolling, and problem-solving. They are a form of restoration, not wasted time.

Step-by-step
1. Choose one calming activity you genuinely enjoy or want to return to.

Examples:
• reading  
• knitting  
• sketching  
• colouring  
• baking  
• gardening  
• journaling  
• puzzles  
• calligraphy  
• quiet crafting

2. Set a 20-minute timer.
3. Do the activity without multitasking if possible.
4. Stop when the timer ends or continue if it feels nourishing and you have the time.
5. Notice whether you feel mentally clearer afterwards.

Outcome
More mental balance, less overstimulation, and a stronger sense of restoration.
`
  },

  {
    task: "Hydration streak: 3 consecutive days",
    duration: 0.5,
    explanation: `
Short streaks help build confidence. Three steady days of hydration can improve energy, focus, and how your body feels overall.

Step-by-step
1. Set a realistic daily water target.
2. Keep it visible:
   • water bottle on desk  
   • tracker in notes  
   • simple ticks on paper
3. Aim to hit the target for three days in a row.
4. Sip steadily through the day instead of leaving most of it until the evening.
5. If you miss one day, restart without drama.

Outcome
Improved physical wellbeing and a stronger sense that you can build simple healthy habits consistently.
`
  }
],


style_confidence: [
  {
    task: "Define three style words you want to embody",
    duration: 0.5,
    explanation: `
Your style becomes easier when you know the feeling you want to project.

Step-by-step
1. Think about how you want to show up in daily life.
2. Choose three words that describe that energy.

Examples
• polished  
• relaxed  
• confident  
• effortless  
• elegant  
• sporty  
• calm  
• creative

3. Write the three words in your notes or journal.
4. When getting dressed, ask: “Does this outfit match one of my three words?”

Outcome
Clearer outfit decisions and a stronger sense of personal style.
`
  },

  {
    task: "Mini closet audit: remove 5 tired items",
    duration: 0.5,
    explanation: `
Editing your wardrobe, even slightly, can immediately make getting dressed easier.

Step-by-step
1. Open your wardrobe and scan it quickly.
2. Choose five items that:
   • no longer fit well  
   • feel worn out  
   • don’t reflect how you want to look now
3. Remove them from your main wardrobe.
4. Place them in a donation, resale, or storage pile.
5. Notice how the remaining clothes feel slightly clearer.

Outcome
Less wardrobe clutter and easier outfit choices.
`
  },

  {
    task: "Assemble 3 go-to gym/active outfits (photo them)",
    duration: 0.5,
    explanation: `
Pre-planned outfits reduce friction on workout days and help you feel put together quickly.

Step-by-step
1. Build three complete workout outfits.

Include:
• top  
• leggings/shorts  
• sports bra if needed  
• socks  
• shoes  
• optional layer (hoodie/jacket)

2. Try each outfit on quickly.
3. Adjust anything that feels uncomfortable or impractical.
4. Take a quick photo of each outfit on your phone.
5. Save them in an album called “Gym outfits.”

Outcome
Fast, confident workout preparation without last-minute decisions.
`
  },

  {
    task: "Plan 2 smart-casual looks for work or coffee",
    duration: 0.5,
    explanation: `
Having default outfits removes decision fatigue and helps you look polished with less effort.

Step-by-step
1. Choose two outfits that feel comfortable but slightly elevated.

Examples
• trousers + knit + clean sneakers  
• jeans + blazer + simple top  
• dress + cardigan + boots

2. Try them on fully with shoes.
3. Check that the outfit works for walking, sitting, and daily movement.
4. Take a quick photo or note the combination in your phone.

Outcome
Reliable go-to outfits for workdays, meetings, or coffee plans.
`
  },

  {
    task: "Learn a 5-minute glow makeup or hair routine",
    duration: 0.5,
    explanation: `
A quick grooming routine can help you feel polished without needing a full beauty routine.

Step-by-step
1. Choose one simple routine you can repeat most days.

Examples
• light makeup: concealer, brows, mascara, lip balm  
• hair: quick blow-dry front pieces, bun, or sleek ponytail

2. Practice the routine once without rushing.
3. Keep the products or tools in one place for easy access.
4. Aim for something that feels natural and quick.

Outcome
A consistent, low-effort routine that boosts everyday confidence.
`
  },

  {
    task: "Walk with tall posture for one full outing",
    duration: 0.5,
    explanation: `
Posture strongly affects both how you feel and how others perceive you.

Step-by-step
1. During one outing today, occasionally check your posture.
2. Think about three simple cues:

• chin level  
• shoulders relaxed  
• chest open

3. Walk with steady breathing and natural arm swing.
4. If you notice slouching, gently reset without tension.

Outcome
Stronger physical presence and improved body awareness.
`
  },

  {
    task: "Wear one confidence accessory today",
    duration: 0.5,
    explanation: `
Small details can subtly shift how you feel in your clothes.

Step-by-step
1. Choose one accessory you enjoy wearing.

Examples
• watch  
• earrings  
• necklace  
• scarf  
• sunglasses

2. Wear it intentionally today.
3. Notice whether it slightly improves how put-together you feel.

Outcome
A small confidence lift through personal style.
`
  },

  {
    task: "Create a feel-good playlist for training",
    duration: 0.5,
    explanation: `
Music can lower the barrier to starting a workout and boost your energy during it.

Step-by-step
1. Open your music app.
2. Create a short playlist (10–15 songs).
3. Choose songs that make you feel:
   • energised  
   • focused  
   • positive
4. Use the same playlist for workouts or walks.

Outcome
Easier workout starts and a more motivating training atmosphere.
`
  },

  {
    task: "Tiny treat after a workout streak (non-food if you like)",
    duration: 0.5,
    explanation: `
Small rewards reinforce habits and help your brain associate consistency with positive feelings.

Step-by-step
1. Decide what counts as a streak.

Examples
• 5 workouts  
• 7 days of movement  
• completing a training week

2. Choose a small reward.

Examples
• new socks  
• skincare  
• book  
• coffee date  
• new playlist  
• relaxing bath

3. Enjoy the reward intentionally rather than rushing past it.

Outcome
Positive reinforcement that supports consistent habits.
`
  },

  {
    task: "Note 1 way your self-image is improving",
    duration: 0.5,
    explanation: `
Recognising progress helps strengthen confidence.

Step-by-step
1. Write one short sentence about something that feels better.

Examples
• “I feel stronger during workouts.”  
• “My posture is improving.”  
• “I feel more comfortable in my clothes.”  
• “I showed up even when I didn’t feel like it.”

2. Keep the tone factual and kind.

Outcome
Greater awareness of progress and stronger self-belief.
`
  },

  {
    task: "Quick selfie before & after a session (optional)",
    duration: 0.5,
    explanation: `
Visual tracking can sometimes help reinforce progress and effort.

Step-by-step
1. Take a quick photo before your workout or walk.
2. Take another photo afterwards if you want.
3. Keep the photos private unless you choose to share them.

Outcome
A personal visual progress record.
`
  },

  {
    task: "Pick a signature gym layer (jacket or hat)",
    duration: 0.5,
    explanation: `
A small signature item can help create a positive identity around training.

Step-by-step
1. Choose one simple item you enjoy wearing to workouts.

Examples
• light jacket  
• hoodie  
• cap  
• headband

2. Use it consistently when going to training sessions.
3. Let it become part of your “ready to train” routine.

Outcome
A small identity cue that supports workout consistency.
`
  },

  {
    task: "5-minute posture primer before meetings",
    duration: 0.5,
    explanation: `
Short posture resets can improve both physical comfort and confidence.

Step-by-step
1. Before a meeting or call, take 2–5 minutes to reset your posture.
2. Stand or sit tall.
3. Roll shoulders slowly backward a few times.
4. Relax your jaw and take 3 slow breaths.

Outcome
Calmer energy and a more confident presence during conversations.
`
  },

  {
    task: "Plan one active date (walk, class, hike)",
    duration: 0.5,
    explanation: `
Movement becomes easier when it is part of your social life.

Step-by-step
1. Choose one activity involving light movement.

Examples
• park walk  
• yoga class  
• hiking trail  
• long coffee walk  
• museum visit with walking

2. Invite a friend or go solo.
3. Add the activity to your calendar.

Outcome
Fitness integrated into everyday life rather than feeling like a chore.
`
  },

  {
    task: "Write a 3-line pep talk you’ll reuse",
    duration: 0.5,
    explanation: `
Prepared self-talk can help on low-energy or low-confidence days.

Step-by-step
1. Write three short supportive sentences to yourself.

Examples
• “Showing up matters more than perfection.”  
• “Small actions build real change.”  
• “I can start small and still make progress.”

2. Save the lines in your notes.
3. Read them when motivation dips.

Outcome
A simple mental reset tool you can return to whenever needed.
`
  },

  // Workout sessions come AFTER all foundation tasks so the user
  // has learned form, taken base measurements, and planned sessions first.
  ...generateEveryNDays({
    title: "Workout session",
    daysTotal: 90,
    every: 2,
    duration: 1,
    includeDayInTitle: false,
    explanation: `
Show up for one focused session. The goal is not to destroy yourself, it is to build a repeatable training rhythm that works over time.

Step-by-step
1. Start with a 5–8 minute warm-up.
   Include:
   • light cardio  
   • joint mobility  
   • one or two easy versions of the movements you are about to do
2. Follow your planned session for the day.
   This might be:
   • strength  
   • cardio  
   • mixed training  
   • a shorter backup session if energy is low
3. Keep the main workout focused for around 40–45 minutes.
4. Use good form and stop a set if technique starts to fall apart.
5. Finish with a 5–8 minute cool-down:
   • easy walking  
   • breathing  
   • light stretching
6. Log one short line afterwards:
   • what you did  
   • how it felt  
   • one thing to remember next time

Outcome
A consistent workout rhythm that builds fitness, strength, and confidence over time.
`,
    idBase: "physical_glow_up.fitness.workout",
    meta: { roadmap: "physical_glow_up", theme: "fitness" },
  }),
],

  
},

mental_glow_up: {
 self_awareness: [
{
task: "Journal your current state (3 lines: emotion, thought, body cue)",
duration: 0.5,
explanation: `
A tiny self-check creates awareness before reacting.

Step-by-step
1. Open a notebook or notes app.
2. Write three short lines:

Emotion → “Right now I feel ___.”
Thought → “The loudest thought in my mind is ___.”
Body cue → “In my body I notice ___.”

Examples
• tight jaw  
• shallow breathing  
• heavy chest  
• relaxed shoulders  

3. Don’t analyze or fix anything yet. Just observe.

Outcome
You become aware of your internal state instead of running on autopilot.
`
},

{
task: "List your top 5 values and why they matter (1 line each)",
duration: 0.5,
explanation: `
Values are your internal compass. When you know them, decisions become clearer.

Step-by-step
1. Write down five values that matter most to you.

Examples
• faith  
• family  
• freedom  
• growth  
• peace  
• curiosity  
• contribution

2. For each value write:
• one behaviour that expresses it  
• one boundary that protects it

Example
Value: Growth  
Behaviour: I read or learn weekly  
Boundary: I protect time for learning

Outcome
A clear sense of what truly matters, guiding your daily choices.
`
},

{
task: "Take a short strengths/personality test and capture 3 usable insights",
duration: 1.0,
explanation: `
Self-knowledge becomes powerful when it translates into action.

Step-by-step
1. Take a short strengths or personality test you enjoy.
2. Review the results without overthinking them.
3. Choose three insights that feel accurate.

For each insight write:
“I will use this strength by ___.”

Example
Insight: I am naturally analytical.  
Action: I will use this by planning my week every Sunday.

Outcome
Self-awareness that translates into practical life improvements.
`
},

{
task: "Write a compassionate letter to your past self",
duration: 0.5,
explanation: `
This exercise helps release self-criticism and build compassion toward yourself.

Step-by-step
1. Imagine writing to a younger version of yourself.
2. Write a short letter including:

• “I’m proud of you for ___.”  
• “I forgive you for ___.”  
• “Thank you for ___.”  
• “From now on, we will ___.”

3. Keep the tone gentle and supportive.

Outcome
Reduced shame and a stronger sense of emotional closure.
`
},

{
task: "Energy audit: list 5 drains vs 5 chargers (then star the top 2 of each)",
duration: 0.5,
explanation: `
Your energy patterns reveal what supports or exhausts you.

Step-by-step
1. Draw two columns: Energy Drains and Energy Chargers.
2. List five items in each column.

Examples  
Drains:  
• constant notifications  
• poor sleep  
• negative conversations  

Chargers:  
• nature walks  
• deep conversations  
• prayer/meditation  
• creative work  

3. Star the two biggest drains and chargers.
4. This week:
• reduce one drain  
• schedule one charger

Outcome
A life that supports your energy instead of constantly draining it.
`
},

{
task: "Define your ideal day in 10 bullets (2 non-negotiables + 1 micro-joy)",
duration: 0.5,
explanation: `
Designing your ideal day helps clarify what actually makes life feel good.

Step-by-step
1. Write 10 bullet points describing a realistic ideal day.

Examples
• morning routine  
• movement  
• focused work block  
• social connection  
• restful evening

2. Circle two non-negotiables.
3. Add one small “micro-joy.”

Examples
• tea ritual  
• music while getting ready  
• evening walk

Outcome
A day structure that feels supportive rather than chaotic.
`
},

{
task: "Map triggers and early warning signs + first response",
duration: 0.5,
explanation: `
Understanding triggers helps you respond earlier and more calmly.

Step-by-step
1. List three situations that commonly trigger stress or emotional reactions.

Examples
• conflict  
• fatigue  
• social media  
• work pressure

2. For each trigger identify:
• early warning sign (body or mood)  
• first response action

Example
Trigger: work overload  
Warning sign: tight shoulders  
Response: step outside for 5 minutes

Outcome
You catch stress earlier and respond intentionally.
`
},

{
task: "Assemble a tiny soothe kit (items/phrases/contacts)",
duration: 0.5,
explanation: `
A soothe kit gives you quick emotional support during stressful moments.

Step-by-step
Choose three types of support:

Physical comfort  
• tea bag  
• lip balm  
• calming scent  

Digital comfort  
• relaxing playlist  
• saved note  
• calming video  

Human support  
• a friend to text  
• a supportive family member

Add three phrases that comfort you.

Examples
• “This moment will pass.”  
• “I’ve handled difficult things before.”  

Outcome
A ready-to-use support system during stressful moments.
`
},

{
task: "Create a seasonal vision or moodboard",
duration: 1,
explanation: `
Visualising your intentions makes them emotionally motivating.

Step-by-step
1. Gather images or words that represent how you want this season of life to feel.
2. Identify three themes.

Examples
• calm  
• confidence  
• discipline  
• connection

3. Arrange the images digitally or on paper.
4. Place the moodboard somewhere visible.

Outcome
A visual reminder of the life direction you want to move toward.
`
},

{
task: "Reflect on one proud moment and what it says about you",
duration: 0.5,
explanation: `
Confidence grows when you recognise evidence of your strengths.

Step-by-step
1. Write about one moment you felt proud of yourself.
2. Describe:
• what happened  
• what action you took
3. Identify the quality behind it.

Examples
• courage  
• persistence  
• creativity  
• kindness

4. Plan one small way to repeat that quality this week.

Outcome
A stronger sense of identity based on real evidence.
`
},

{
task: "Life timeline: 8–10 shaping moments with one lesson each",
duration: 1.0,
explanation: `
Your life story contains patterns and lessons worth understanding.

Step-by-step
1. Write a simple timeline of 8–10 moments that shaped you.
2. Include both positive and challenging events.
3. For each moment write one lesson you learned.
4. Circle:
• two lessons you want to keep  
• one pattern you want to change

Outcome
Clearer understanding of your personal growth and patterns.
`
},

{
task: "Write a 1-sentence mission for this season",
duration: 0.5,
explanation: `
A simple mission statement helps guide your priorities.

Step-by-step
Use this formula:

“This season I will ___ so that ___.”

Example
“This season I will protect my peace so that I feel steady and focused.”

Outcome
A clear guiding intention for the next phase of your life.
`
},

{
task: "Choose one identity shift (e.g., “I am consistent”) + evidence habit",
duration: 0.5,
explanation: `
Identity changes through repeated actions.

Step-by-step
1. Choose a new identity statement.

Examples
• I am consistent  
• I am calm under pressure  
• I take care of my body  

2. Choose a small daily habit that proves it.
3. Attach it to a cue.

Example
After morning coffee → I journal for 2 minutes.

Outcome
Your identity gradually changes through consistent evidence.
`
},

{
task: "Values in action: note 3 ways you lived a value this week",
duration: 0.5,
explanation: `
Noticing your behaviour builds self-trust.

Step-by-step
1. Choose one or two values from your list.
2. Write three examples from the week where you lived those values.

Examples
• helped a friend  
• protected personal time  
• chose honesty in a difficult moment

Outcome
Confidence built through recognising your real actions.
`
},

{
task: "Create a red/amber/green self-check map with supports",
duration: 0.5,
explanation: `
This creates a simple emotional dashboard.

Step-by-step
Green → feeling good  
• what helps you stay here?

Amber → feeling overwhelmed  
• list two quick support actions

Red → feeling very distressed  
• write your support plan and who to contact

Outcome
A compassionate plan for different emotional states.
`
},

{
task: "Future-self postcard: write a 90-day message to you",
duration: 0.5,
explanation: `
Writing to your future self strengthens hope and motivation.

Step-by-step
1. Write today’s date plus the date 90 days from now.
2. Write a short message describing:
• what improved  
• what habits you kept  
• what you are proud of

3. Include one sentence starting with:
“I’m proud of you for ___.”

4. Set a reminder to read the note in 90 days.

Outcome
A hopeful vision that makes your future feel real and reachable.
`
}
],

  mindfulness: [
{
task: "2-minute breath check-in (box breathing)",
duration: 0.5,
explanation: `
A quick nervous-system reset you can use anywhere during the day.

Step-by-step
1. Sit or stand comfortably.
2. Inhale slowly for 4 seconds.
3. Hold your breath for 4 seconds.
4. Exhale slowly for 4 seconds.
5. Hold again for 4 seconds.
6. Repeat for 2–3 rounds.

Tip
If you feel stressed, slightly lengthen the exhale.

Outcome
Your breathing slows, your body relaxes, and your mind becomes clearer.
`
},

{
task: "5-minute body scan (head-to-toe soften)",
duration: 0.5,
explanation: `
A body scan helps you notice tension and gently release it.

Step-by-step
1. Sit or lie comfortably and close your eyes if you like.
2. Take two slow breaths.
3. Slowly move your attention through your body:

• scalp and forehead  
• jaw and neck  
• shoulders and chest  
• belly and lower back  
• hips and legs  
• feet

4. When you notice tension, imagine letting it soften slightly.
5. There is nothing to fix, just observe and relax.

Outcome
Less physical tension and a stronger connection to your body.
`
},

{
task: "Mindful tea/coffee using all 5 senses",
duration: 0.5,
explanation: `
Turn a simple drink into a moment of presence.

Step-by-step
1. Prepare a cup of tea or coffee.
2. Before drinking, pause for a moment.
3. Notice the drink using your senses:

• sight (steam, color)  
• smell  
• warmth of the cup  
• taste of the first sip  
• surrounding sounds

4. Take a few slow sips without using your phone.

Outcome
A small everyday ritual that trains your attention to stay in the present moment.
`
},

{
task: "Set 3 micro-pause alarms to take 3 breaths",
duration: 0.5,
explanation: `
Small pauses throughout the day prevent stress from building up.

Step-by-step
1. Set three reminders on your phone.

Example times
• late morning  
• mid-afternoon  
• evening

2. When the reminder goes off:
• stop what you are doing  
• take three slow breaths  
• ask yourself: “What do I need right now?”

Outcome
You interrupt autopilot and bring awareness back into your day.
`
},

{
task: "10-minute seated meditation (timer app)",
duration: 0.5,
explanation: `
Meditation strengthens your ability to notice thoughts without being controlled by them.

Step-by-step
1. Sit comfortably with a straight but relaxed posture.
2. Set a timer for 10 minutes.
3. Focus on the sensation of breathing.
4. When your mind wanders (which it will), gently notice it.
5. Label it “thinking” and return attention to the breath.

Outcome
Improved focus, emotional regulation, and awareness of your thoughts.
`
},

{
task: "Mindful walk 10–15 min (no phone, notice details)",
duration: 0.5,
explanation: `
Walking mindfully reconnects you with your surroundings and body.

Step-by-step
1. Leave your phone in your pocket.
2. Walk at a relaxed pace for 10–15 minutes.
3. Focus on different senses for short periods:

Minute 1–3: notice colors and shapes around you  
Minute 4–6: notice sounds in the environment  
Minute 7–10: focus on your footsteps and breathing

Outcome
Your mind slows down and your surroundings become more vivid.
`
},

{
task: "Name-it-to-tame-it once today",
duration: 0.5,
explanation: `
Naming emotions helps reduce their intensity.

Step-by-step
1. When you notice a strong feeling today, pause.
2. Say or write the sentence:

“I feel ___ because ___.”

Example
“I feel frustrated because my workload is high.”

3. Take one slow breath afterwards.

Outcome
More emotional clarity and less overwhelm.
`
},

{
task: "Create an anchor phrase for stress spikes",
duration: 0.5,
explanation: `
An anchor phrase helps interrupt spiralling thoughts.

Step-by-step
1. Choose a short phrase that feels believable.

Examples
• “Breathe. Then choose.”  
• “This moment will pass.”  
• “I can handle this step.”

2. Write it in your notes or somewhere visible.
3. Repeat it during stressful moments.

Outcome
A mental reset tool you can use instantly when stress rises.
`
},

{
task: "One mindful meal (slow, chew, savor)",
duration: 0.5,
explanation: `
Mindful eating helps your body register fullness and enjoyment.

Step-by-step
1. Choose one meal today to eat mindfully.
2. Put your phone away.
3. Take a slow first bite and notice the flavour.
4. Put your fork down between bites.
5. Eat slightly slower than usual.

Outcome
Greater meal satisfaction and improved awareness of hunger and fullness.
`
},

{
task: "Reflection: which practice grounded you most?",
duration: 0.5,
explanation: `
Mindfulness works best when you discover which practices suit you.

Step-by-step
1. Think about the mindfulness exercises you tried today.
2. Choose the one that helped you feel most calm or present.
3. Write one sentence explaining why it worked.
4. Plan to repeat it tomorrow.

Outcome
You build a personal “calm toolkit” based on what actually works.
`
},

{
task: "Square breathing before a meeting (2 rounds)",
duration: 0.5,
explanation: `
A quick breathing exercise can help you enter conversations more calmly.

Step-by-step
1. Before a meeting or call, pause for 30–60 seconds.
2. Do two rounds of square breathing:

• inhale 4 seconds  
• hold 4 seconds  
• exhale 4 seconds  
• hold 4 seconds

3. Relax your shoulders and begin the meeting.

Outcome
A calmer voice, clearer thinking, and more composed presence.
`
},

{
task: "Unguided silence: 7 minutes",
duration: 0.52,
explanation: `
Quiet time without input allows your mind to settle naturally.

Step-by-step
1. Sit comfortably and set a 7-minute timer.
2. Close your eyes or soften your gaze.
3. Notice breathing, sounds, or the feeling of sitting.
4. When thoughts appear, simply let them pass.

Outcome
A gentle mental reset and improved tolerance for stillness.
`
},

{
task: "Body gratitude: thank 3 body parts out loud",
duration: 0.5,
explanation: `
Gratitude toward your body strengthens a healthier self-relationship.

Step-by-step
1. Choose three parts of your body.

Examples
• eyes  
• lungs  
• legs  
• hands  
• heart

2. Say one sentence of appreciation for each.

Example
“Thank you legs for carrying me through the day.”

Outcome
More kindness toward your body and less self-criticism.
`
},

{
task: "Mindful shower (temperature & breath focus)",
duration: 0.5,
explanation: `
Turning everyday routines into mindful moments reduces stress.

Step-by-step
1. During your shower, pause for a moment.
2. Notice the sensation of water on your skin.
3. Take slower breaths than usual.
4. Relax your shoulders and jaw.
5. Focus on the feeling of the water for a few breaths.

Outcome
You finish the shower feeling calmer and mentally refreshed.
`
},

{
task: "Loving-kindness mini: send goodwill to 3 people",
duration: 0.55,
explanation: `
This practice builds compassion and emotional warmth.

Step-by-step
1. Close your eyes and take a slow breath.
2. Think of three people:

• someone you love  
• someone neutral  
• yourself

3. Silently repeat:

“May you be safe.”  
“May you be healthy.”  
“May you feel at ease.”

Outcome
Greater compassion, emotional balance, and reduced irritation.
`
}
],

routines_energy: [
  {
    task: "Pick a consistent wake time (±30 minutes)",
    duration: 0.5,
    explanation: `
Your energy stabilises when your wake time does. A consistent morning anchor often improves sleep, focus, and mood more than trying to perfect everything else at once.

Step-by-step
1. Choose a wake time that genuinely fits your life most days.
2. Keep it realistic rather than aspirational.
3. Aim to stay within about 30 minutes of that time each day.
4. Focus on consistency first, even if the rest of your routine is imperfect.
5. Try this for three days before adjusting anything.

Outcome
More stable energy, less grogginess, and a stronger daily rhythm.
`
  },

  {
    task: "Get 10 minutes of morning light or a quick stroll",
    duration: 0.5,
    explanation: `
Morning light helps regulate your body clock and can improve alertness, mood, and sleep later on.

Step-by-step
1. Try to get outside within an hour of waking.
2. Spend at least 10 minutes in natural light.
3. If possible, combine it with a short walk.
4. If it is cloudy or dark, still go outside for light and fresh air.

Outcome
A clearer energy rhythm and stronger daytime alertness.
`
  },

  {
    task: "Hydration + protein at breakfast (plan it)",
    duration: 0.5,
    explanation: `
Steadier mornings usually start with steadier fuel. Planning this in advance makes it much easier to follow on busy days.

Step-by-step
1. Decide what you will drink shortly after waking.

Examples:
• a glass of water  
• water with breakfast  
• water before coffee

2. Choose one simple protein source for breakfast.

Examples:
• eggs  
• Greek-style yoghurt or alternative  
• protein oats  
• cottage cheese alternative  
• tofu  
• protein shake

3. Pick one breakfast option you can realistically repeat 3–4 times this week.
4. Write it down so you do not have to decide in the moment.
5. Keep the ingredients visible and easy to reach.

Outcome
More stable morning energy, better focus, and fewer early crashes.
`
  },

  {
    task: "Set a 5-minute tidy/reset after work",
    duration: 0.5,
    explanation: `
A short reset helps you mentally leave the workday behind. It creates a small sense of closure and makes your evening feel less cluttered.

Step-by-step
1. Set a 5-minute timer when work finishes.
2. Clear one visible area.

Examples:
• desk  
• kitchen counter  
• handbag  
• bedroom chair pile

3. Prep one small thing for tomorrow.

Examples:
• refill water bottle  
• put laptop away  
• lay out tomorrow’s clothes  
• clear your workspace

4. Stop when the timer ends. The goal is reset, not perfection.

Outcome
Evenings that feel lighter, calmer, and more spacious.
`
  },

  {
    task: "Evening wind-down: stretch 8–10 min + warm shower",
    duration: 0.5,
    explanation: `
A repeatable wind-down routine helps your body shift out of alert mode and makes rest feel easier and more natural.

Step-by-step
1. Set aside 10–15 minutes before bed.
2. Do 8–10 minutes of gentle stretching.

Examples:
• neck and shoulders  
• cat-cow  
• hip opener  
• forward fold  
• child’s pose

3. Keep the stretching soft and calming, not intense.
4. Take a warm shower afterwards if that feels supportive.
5. Dim the lights once you are done so your body gets a clearer signal that the day is ending.

Outcome
A calmer nervous system, easier sleep, and a more grounded end to the day.
`
  },

  {
    task: "Caffeine rule: none after 14:00 today",
    duration: 0.5,
    explanation: `
Caffeine can affect sleep and next-day energy more than people realise. A simple cut-off can help reduce wired-but-tired evenings.

Step-by-step
1. Make your last caffeinated drink before 2pm.
2. After that, switch to:
   • water  
   • herbal tea  
   • decaf  
   • sparkling water
3. Notice whether sleep or evening calm improves.

Outcome
Better sleep support and fewer late-day energy spikes.
`
  },

  {
    task: "Plan tomorrow (3 priorities) to offload mind",
    duration: 0.5,
    explanation: `
Your brain relaxes more easily when tomorrow feels contained and clear.

Step-by-step
1. Write down your top three priorities for tomorrow.
2. Keep them specific and realistic.
3. Circle the one you want to start with.
4. Once written down, close the notebook or app.
5. Remind yourself that you do not need to keep rehearsing tomorrow in your head.

Outcome
Less bedtime mental chatter and a clearer start to the next day.
`
  },

  {
    task: "Screens-off 45 minutes before bed",
    duration: 1,
    explanation: `
Less screen time before bed can help your mind slow down and make sleep feel more natural.

Step-by-step
1. Set a reminder 45 minutes before bedtime.
2. Decide what “screens off” means for you.

Examples:
• no scrolling  
• no work laptop  
• no YouTube in bed  
• phone on charge away from the bed

3. Choose one or two replacement activities in advance.

Examples:
• reading  
• journaling  
• prayer  
• stretching  
• tea  
• preparing for tomorrow

4. Expect it to feel slightly unusual at first if screens are part of your usual routine.
5. Stick with it for a few nights before judging whether it helps.

Outcome
A calmer evening, easier sleep onset, and a gentler start to the next morning.
`
  },

  {
    task: "Weekly reset: review wins and set one gentle focus",
    duration: 0.5,
    explanation: `
A weekly reset helps you reflect without turning your life into a strict performance review. The goal is clarity, not criticism.

Step-by-step
1. Set aside 10–15 minutes once a week.
2. Write down three wins from the past week.

Examples:
• I slept better  
• I followed my wake time more often  
• I protected one focus block  
• I drank more water  
• I handled stress better

3. Choose one gentle focus for the coming week.

Examples:
• better bedtime consistency  
• morning light  
• fewer afternoon slumps  
• more realistic evenings

4. Add one small supportive action to your calendar.

Outcome
Steady progress with more self-trust and less pressure.
`
  },

  {
    task: "Note your energy 1–5; what helped most?",
    duration: 0.5,
    explanation: `
This helps you learn what genuinely supports your energy rather than guessing based on habit or mood.

Step-by-step
1. Rate your energy today from 1 to 5.
2. Ask yourself what most influenced that number.
3. Write one short sentence:

Examples:
• “Energy was higher because I got outside early.”  
• “Energy was lower because I slept late and skipped breakfast.”  
• “I felt better when I took a short walk after work.”

4. Keep it simple and factual.

Outcome
Clearer insight into the habits and conditions that actually support your energy.
`
  },

  {
    task: "Plan two peak-focus blocks this week (timer on)",
    duration: 0.5,
    explanation: `
Your best energy deserves protection. Focus blocks help you use your sharper hours intentionally instead of losing them to distraction.

Step-by-step
1. Think about when your energy or concentration is usually best.
2. Choose two realistic focus sessions this week.
3. Add them to your calendar like real appointments.
4. During each block:
   • turn on Do Not Disturb  
   • set a timer  
   • work on one important task only
5. Start with a manageable length if needed.

Examples:
• 25 minutes  
• 45 minutes  
• 60 minutes

Outcome
More meaningful work completed with less stress and less mental scatter.
`
  },

  {
    task: "Prepare tomorrow’s outfit/bag the night before",
    duration: 0.55,
    explanation: `
Removing small morning decisions protects your energy and helps the next day start more smoothly.

Step-by-step
1. Lay out your outfit for tomorrow.
2. Pack your bag with what you need.

Examples:
• laptop  
• charger  
• keys  
• headphones  
• water bottle  
• gym clothes

3. Place everything in one easy-to-reach spot.
4. Check that the essentials are ready before bed.

Outcome
A calmer, more composed start to the day with less rushing.
`
  },

  {
    task: "Set water reminders (3 times/day)",
    duration: 0.5,
    explanation: `
Hydration supports focus and energy, but it is easy to forget when the day gets busy.

Step-by-step
1. Set three reminders across the day.
2. Space them out in a way that fits your routine.

Examples:
• morning  
• after lunch  
• mid-afternoon

3. Drink a full glass each time or use the reminder to refill your bottle.

Outcome
More consistent hydration and fewer low-energy dips caused by simply forgetting to drink water.
`
  },

  {
    task: "Create a 10-minute energy-snack (walk + stretch + sip)",
    duration: 0.5,
    explanation: `
An energy-snack is a short reset you can use instead of automatically reaching for more caffeine or just pushing through.

Step-by-step
1. Use this when your energy dips during the day.
2. Spend 2–5 minutes walking.
3. Do 2–3 minutes of stretching.

Examples:
• shoulder rolls  
• chest opener  
• calf stretch  
• forward fold  
• neck release

4. Drink water or tea.
5. Keep the whole reset to about 10 minutes.
6. Notice whether it helps your mind and body come back online.

Outcome
A simple, caffeine-free reset that refreshes your energy without overstimulation.
`
  },

  {
    task: "Sunday preview: scan calendar and choose 1 anchor habit/day",
    duration: 0.5,
    explanation: `
A small weekly preview helps you shape the week before it starts shaping you.

Step-by-step
1. Look at the week ahead in your calendar.
2. Notice any busy days, late evenings, travel, or energy-draining events.
3. For each day, choose one small anchor habit.

Examples:
• morning water  
• 10-minute walk  
• screens off by a set time  
• protein breakfast  
• evening reset

4. Keep each anchor habit simple and realistic.
5. Write them down where you will see them.

Outcome
A steadier week with more consistency and much less overwhelm.
`
  }
],
cognitive_habits: [
  {
    task: "Spot a thinking trap you used today",
    duration: 0.5,
    explanation: `
Awareness creates space. When you can name a thinking pattern, you are less likely to treat it as absolute truth.

How to do it
1. Think about one stressful or emotionally charged thought you had today.
2. Identify whether it fits a common thinking trap.

Examples:
• all-or-nothing thinking  
• mind-reading  
• catastrophizing  
• overgeneralising  
• fortune-telling  
• personalising

3. Write down the thought.
4. Then write:
   “A more balanced view could be ___.”
5. Keep the balanced view realistic, not overly positive.

Example:
Thought: “I messed this up, so the whole day is ruined.”  
Balanced view: “One difficult moment does not define the whole day.”

Outcome
You stop automatically believing every thought and start responding with more perspective.
`
  },

  {
    task: "Do a quick thought record: situation → thought → feeling",
    duration: 0.5,
    explanation: `
A thought record helps you turn vague mental fog into something clear enough to work with.

How to do it
1. Draw three simple columns:
   • Situation  
   • Thought  
   • Feeling (1–10)
2. Fill them in using one recent moment.

Example:
Situation: My manager sent a short message  
Thought: “She’s unhappy with me”  
Feeling: Anxiety 7/10

3. Keep it brief.
4. Do not try to solve it yet, just map it clearly.

Outcome
Faster clarity about what happened, what you told yourself, and what emotion followed.
`
  },

  {
    task: "Write evidence for/against a sticky thought (5 bullets)",
    duration: 0.5,
    explanation: `
When a thought feels sticky, the goal is not to force positivity. It is to test whether the thought is fully accurate.

How to do it
1. Write down one recurring or emotionally sticky thought.
2. Make two short lists:
   • Evidence for  
   • Evidence against
3. Aim for up to 5 bullets on each side.
4. Be honest on both sides. Do not make the “against” side fake or overly optimistic.
5. Then write one “middle truth” sentence.

Example:
Thought: “I always mess things up.”  
Middle truth: “I sometimes make mistakes, but I also handle many things well and can correct what went wrong.”

Outcome
A more balanced, grounded perspective without pretending everything is perfect.
`
  },

  {
    task: "Reframe one worry into a balanced alternative",
    duration: 0.5,
    explanation: `
Worries often jump straight to the worst-case version of reality. Reframing helps you move toward something more likely and more useful.

How to do it
1. Write down one worry exactly as it appears in your mind.
2. Ask yourself:
   • Is this the worst-case version?  
   • What is a more realistic alternative?
3. Write:
   “A more balanced view is ___.”
4. Keep the new version believable.

Example:
Worry: “If this conversation goes badly, everything will fall apart.”  
Balanced alternative: “This conversation may feel uncomfortable, but I can handle it and it is unlikely to ruin everything.”

Outcome
Less emotional intensity and a more realistic starting point for action.
`
  },

  {
    task: "Schedule ‘worry time’ (10 minutes) instead of ruminating",
    duration: 0.5,
    explanation: `
This helps contain worry so it does not take over your entire day. You are not suppressing it, you are giving it a container.

How to do it
1. Choose a 10-minute slot later in the day.
2. Put it in your calendar or notes.

Example:
“Worry time: 18:00”

3. When worries show up earlier, say to yourself:
   “Not now. I will think about this at 6pm.”
4. During worry time, write the worries down rather than looping through them endlessly.
5. When the 10 minutes end, stop and move to the next part of your day.

Outcome
More mental space during the day and less endless rumination.
`
  },

  {
    task: "Implementation intention: ‘If X, then I will Y’",
    duration: 0.5,
    explanation: `
This is a simple way to pre-decide your response to a common challenge so you do not have to invent a plan in the moment.

How to do it
1. Identify one situation that often throws you off.

Examples:
• feeling anxious  
• getting tired  
• starting to overthink  
• wanting to procrastinate

2. Write one “if-then” plan.

Examples:
• If I start spiralling, then I will take 3 slow breaths and write one sentence.  
• If I feel overwhelmed by a task, then I will do the first 2 minutes only.  
• If I want to scroll instead of resting, then I will put my phone down and stand up first.

3. Keep the “then” step small and realistic.

Outcome
A ready-made response that replaces spiralling with structure.
`
  },

  {
    task: "Habit-stack one good cue (after tea → 3 breaths)",
    duration: 0.5,
    explanation: `
Habit-stacking helps calm or focus become more automatic by attaching them to something you already do.

How to do it
1. Choose an existing habit you do most days.

Examples:
• after tea  
• after brushing teeth  
• after opening your laptop  
• after sitting at your desk

2. Add one very small action right after it.

Examples:
• 3 slow breaths  
• one stretch  
• one sentence in your journal  
• one posture reset

3. Keep it short enough that it feels easy to repeat.

Outcome
Small positive habits become easier because they are anchored to something already familiar.
`
  },

  {
    task: "Pomodoro 25/5 for a task you are avoiding",
    duration: 0.5,
    explanation: `
Avoidance often shrinks when you make the task time-bound and finite. You do not need motivation first, you need a clear starting container.

How to do it
1. Choose one task you have been putting off.
2. Set a timer for 25 minutes.
3. Work on that task only until the timer ends.
4. Take a 5-minute break afterwards.
5. If needed, do one more round, but one round already counts.

Tips
• Put your phone on Do Not Disturb  
• Close extra tabs  
• Focus on progress, not perfection

Outcome
You reduce avoidance by starting, and starting creates momentum.
`
  },

  {
    task: "Values-based action: take one step aligned with a value",
    duration: 0.5,
    explanation: `
When you act in line with your values, you build confidence and self-trust. Even a very small action can reinforce who you want to be.

How to do it
1. Choose one value that matters to you today.

Examples:
• growth  
• honesty  
• faith  
• discipline  
• kindness  
• courage

2. Identify one small action that reflects that value.
3. Make it concrete and doable today.

Examples:
• Growth → read 2 pages or watch one lesson  
• Kindness → send a thoughtful message  
• Discipline → begin the task you have been avoiding  
• Faith → take a few minutes for prayer or reflection

4. Complete the action and note that you did it.

Outcome
You strengthen your identity through action, not only intention.
`
  },

  {
    task: "Weekly review: identify which tools helped most",
    duration: 0.5,
    explanation: `
A weekly review helps you keep what works and stop forcing what does not. It turns random self-help into a more personal system.

How to do it
1. Think back over the past week.
2. List up to three tools, habits, or mental strategies you used.

Examples:
• thought record  
• breathing  
• walking before reacting  
• Pomodoro  
• journaling  
• if-then plan

3. For each one, decide:
   • keep  
   • adjust  
   • drop
4. Write one sentence about why.
5. Choose one cognitive tool to focus on next week.

Outcome
A more sustainable, personalised toolkit for calmer and clearer thinking.
`
  },

  {
    task: "Catch catastrophizing and write a ‘most likely’ outcome",
    duration: 0.5,
    explanation: `
Catastrophizing jumps straight to the worst possible outcome. This task helps you come back to what is more likely and more manageable.

How to do it
1. Write down the feared worst-case scenario.
2. Ask yourself:
   • Has this actually happened before?  
   • What usually happens in situations like this?  
   • What is the most likely outcome?
3. Write:
   “Most likely, ___.”
4. Then add one constructive action you can take today.

Outcome
Reduced anxiety and a stronger sense of control through realism.
`
  },

  {
    task: "Behavioral experiment: test one feared prediction",
    duration: 0.5,
    explanation: `
Sometimes the best way to challenge a thought is not to debate it endlessly, but to test it gently in real life.

How to do it
1. Write one prediction.

Examples:
• “If I speak up, people will think I’m stupid.”  
• “If I send the message, it will go badly.”  
• “If I start, I won’t cope.”

2. Choose a small, low-risk version of the situation.
3. Test it safely.
4. Afterwards, write down:
   • what you predicted  
   • what actually happened  
   • what you learned

Outcome
More confidence built from evidence instead of assumption.
`
  },

  {
    task: "Socratic question: consider alternative explanations",
    duration: 0.55,
    explanation: `
This helps loosen rigid thinking by reminding you that there is usually more than one possible explanation.

How to do it
1. Write one stressful thought.
2. Ask:
   “What else could be true?”
3. Write three alternative explanations.

Example:
Thought: “She replied late because she is upset with me.”  
Alternatives:
• She is busy  
• She forgot  
• She saw it and plans to reply later

4. Choose the explanation that feels most balanced, not most comforting.

Outcome
More flexible thinking and less emotional certainty around one negative story.
`
  },

  {
    task: "Opposite action for 5 minutes (safe context)",
    duration: 0.52,
    explanation: `
When emotions push you toward an unhelpful behaviour, a small opposite action can shift the momentum.

How to do it
1. Notice one urge that is not helping.

Examples:
• isolating  
• scrolling  
• procrastinating  
• snapping at someone  
• hiding from a task

2. Choose a safe, healthy opposite action.
3. Do it for 5 minutes only.

Examples:
• stand up and walk  
• send one message  
• begin one tiny task step  
• open the curtains  
• make tea and sit away from your phone

Outcome
A small shift in behaviour that can change mood, momentum, and direction.
`
  },

  {
    task: "Reduce a task to a 2-minute starting point",
    duration: 0.5,
    explanation: `
Starting is often the hardest part. Making the first step tiny lowers resistance and makes action more likely.

How to do it
1. Choose one task you have been avoiding.
2. Ask:
   “What is the smallest possible version of starting?”
3. Define a 2-minute version.

Examples:
• open the document  
• write one sentence  
• tidy one corner  
• reply to one email  
• read one page

4. Do only that step.
5. You may continue if you want, but you do not have to.

Outcome
Reduced avoidance and easier task initiation through a much lower entry barrier.
`
  }
],
  emotional_resilience: [
  {
    task: "Name and validate your top emotion today",
    duration: 0.5,
    explanation: `
Naming and validating an emotion can reduce shame and make it easier to respond wisely instead of reacting automatically.

How to do it
1. Pause for a moment and ask yourself:
   “What am I feeling most strongly right now?”
2. Choose one main emotion.

Examples:
• anxious  
• sad  
• frustrated  
• disappointed  
• overwhelmed  
• lonely  
• angry

3. Say or write:
   “I feel ___, and that makes sense because ___.”
4. Keep the second half kind and factual, not dramatic.

Example:
“I feel overwhelmed, and that makes sense because I have had a demanding day and have not had much rest.”

Outcome
Less self-judgment and more emotional steadiness through simple self-validation.
`
  },

  {
    task: "5–7 minute breathing practice (physiological sighs)",
    duration: 0.5,
    explanation: `
This is a fast way to help calm a buzzy or overstimulated nervous system. It works by helping your body downshift first.

How to do it
1. Sit or stand comfortably.
2. Take:
   • one inhale through the nose  
   • a second small top-up inhale through the nose  
   • one long slow exhale through the mouth
3. Repeat this rhythm for 2–5 minutes to start.
4. If it feels good, continue up to 5–7 minutes.
5. Keep shoulders relaxed and avoid forcing the breath.

Important
Stop if you feel dizzy or uncomfortable. Slow it down if needed.

Outcome
A calmer body state that makes clear thinking and emotional regulation easier.
`
  },

  {
    task: "Design a 10-minute calm circuit (stretch + breath + tea)",
    duration: 0.5,
    explanation: `
A calm circuit gives you a repeatable way to regulate yourself when stress rises. The goal is to practise it when calm so it is easier to use when you need it.

How to do it
1. Build a 10-minute routine using three simple parts:
   • 3–5 minutes gentle stretch  
   • 2 minutes breathing  
   • a warm drink or short sit-down moment
2. Choose easy, calming elements.

Examples:
• neck stretch  
• shoulder rolls  
• child’s pose  
• box breathing  
• tea or warm water

3. Write your sequence down in order.
4. Practise it once when you are already relatively calm.
5. Save it as “My calm circuit” in your notes.

Outcome
A simple emotional regulation ritual you can return to instead of spiralling.
`
  },

  {
    task: "Write a coping plan for one recurring stressor",
    duration: 0.5,
    explanation: `
A coping plan makes recurring stress feel less chaotic because you already know your first steps.

How to do it
1. Choose one recurring stressor.

Examples:
• work overload  
• conflict with someone  
• loneliness in the evening  
• poor sleep leading to overwhelm  
• family pressure  
• anxious waiting

2. Fill in this structure:
   Trigger → Early sign → First step → Backup step → Who to contact
3. Keep each part practical.

Example:
Trigger → difficult email  
Early sign → tight chest, doom-thinking  
First step → 3 slow breaths + step away for 2 minutes  
Backup step → write draft, do not send yet  
Who to contact → trusted friend / colleague

4. Save the plan somewhere easy to find.

Outcome
More structure, less panic, and a clearer response to repeat stress.
`
  },

  {
    task: "Practice urge surfing for one craving/impulse",
    duration: 0.5,
    explanation: `
Urge surfing helps you learn that an urge can rise and fall without needing to control you immediately.

How to do it
1. Notice one urge or impulse.

Examples:
• scroll  
• text impulsively  
• binge eat  
• overreact  
• check something repeatedly

2. Pause before acting.
3. Set a timer for 60–90 seconds.
4. Breathe slowly and observe the urge like a wave:
   • where do you feel it in the body?  
   • is it rising, peaking, softening?
5. After the pause, choose intentionally what to do next.

Outcome
More self-control and less automatic reacting, without harshness or suppression.
`
  },

  {
    task: "Watch a short resilience talk and note one takeaway",
    duration: 0.5,
    explanation: `
One useful idea applied well is more valuable than lots of inspiration you never use.

How to do it
1. Watch or listen to something short on resilience, stress, or emotional regulation.
2. Keep it brief: 5–15 minutes is enough.
3. Write down one takeaway that actually felt relevant.
4. Add one line:
   “I will test this by ___ this week.”

Outcome
A resilience idea turned into a small real-life experiment instead of passive inspiration.
`
  },

  {
    task: "Self-soothing session (bath, music, prayer) 15–20 min",
    duration: 0.5,
    explanation: `
Self-soothing is a skill. This task helps you intentionally create safety and comfort instead of waiting until you are completely overwhelmed.

How to do it
1. Choose one soothing activity.

Examples:
• bath or shower  
• prayer  
• quiet music  
• tea in silence  
• wrapped in a blanket  
• low lighting and breathing  
• gentle recitation or reflection

2. Set aside 15–20 minutes.
3. Put your phone away if possible.
4. Focus on helping your body feel safe, calm, and supported.
5. Let this be simple rather than performative.

Outcome
A gentler nervous system and a stronger ability to soothe yourself with care.
`
  },

  {
    task: "Forgive a small recent mistake-in writing",
    duration: 0.5,
    explanation: `
Forgiving yourself for a small mistake helps close the emotional loop. It is not about pretending it did not matter, it is about responding with self-respect instead of endless self-punishment.

How to do it
1. Choose one recent mistake or moment you are still holding against yourself.
2. Write three lines:
   • “I’m sorry for ___.”  
   • “I learned ___.”  
   • “Next time, I will try ___.”
3. Keep the tone honest and kind.
4. Sign it with your name if that helps it feel more real.

Outcome
Less rumination, more self-respect, and a healthier response to being human.
`
  },

  {
    task: "Phone-free walk 15–20 min to reset",
    duration: 0.5,
    explanation: `
Walking can help metabolise stress. Removing your phone makes the walk more restorative and less mentally crowded.

How to do it
1. Leave your phone behind, put it on airplane mode, or keep it out of your hand.
2. Walk for 15–20 minutes at an easy pace.
3. Focus on:
   • long exhales  
   • relaxed shoulders  
   • steady steps  
   • what feels different by the end
4. Notice whether the intensity of the emotion softens, even slightly.

Outcome
A calmer baseline and a reset that works through movement rather than overthinking.
`
  },

  {
    task: "Celebrate one emotional win this week",
    duration: 0.5,
    explanation: `
Emotional regulation is a skill, and skills strengthen when you notice improvement instead of only spotting what still feels hard.

How to do it
1. Think of one moment this week that you handled better than you might have before.
2. Write down:
   • what happened  
   • what you felt  
   • what you did differently
3. Finish with:
   “Next time I will repeat ___.”
4. Keep it specific and grounded.

Outcome
More confidence in your emotional growth and stronger reinforcement of what is working.
`
  },

  {
    task: "Create a stress early-signs checklist",
    duration: 0.5,
    explanation: `
The earlier you catch stress, the easier it is to respond kindly and effectively. This task helps you notice your own warning signs sooner.

How to do it
1. List 5 signs that usually appear when stress is rising.

Examples:
• tight chest  
• jaw clenching  
• doom scrolling  
• snapping at people  
• racing thoughts  
• shallow breathing  
• urge to isolate

2. For each sign, write one helpful response.

Examples:
• 3 breaths  
• glass of water  
• step outside  
• pause before replying  
• text someone  
• prayer or grounding

3. Save the checklist in your notes or tracker.

Outcome
A simple early-warning system that helps stop stress escalating so far.
`
  },

  {
    task: "Write 3 comfort phrases for tough moments",
    duration: 0.5,
    explanation: `
Supportive words can interrupt harsh inner dialogue and give you something steadier to lean on.

How to do it
1. Write three short phrases you actually believe.

Examples:
• “This is hard, and I can handle it.”  
• “One step at a time.”  
• “I am safe in this moment.”  
• “I do not need to solve everything right now.”

2. Save them somewhere visible.
3. Read one when emotions rise.

Outcome
A gentler internal script for difficult moments.
`
  },

  {
    task: "Cold/contrast splash 30–45s (if safe) to reset arousal",
    duration: 0.5,
    explanation: `
A cool splash can act as a short physical reset when your body feels overactivated.

How to do it
1. Use cool water on your face or wrists for 30–45 seconds.
2. Keep your breathing slow while you do it.
3. Towel off and pause for a moment afterwards.

Important
Only do this if it feels safe and comfortable for you.

Outcome
A quick physical interrupt that can help shift panic energy into calmer clarity.
`
  },

  {
    task: "Make a call tree: 3 people + when to reach out",
    duration: 0.5,
    explanation: `
Support is easier to use when you decide in advance who helps with what. This removes hesitation when you are already stressed.

How to do it
1. List three people you trust.
2. For each one, write:
   • best contact method  
   • what kind of support they are good for  
   • when to reach out
3. Example:
   • Call X if I am spiralling  
   • Text Y if I need distraction  
   • Message Z if I need practical help
4. Save the list somewhere easy to find.

Outcome
A clearer, faster path to support when you need it.
`
  },

  {
    task: "Post-stress debrief: what helped / what didn’t (5 lines)",
    duration: 0.5,
    explanation: `
A short debrief helps you learn from stressful moments instead of only feeling wrung out by them.

How to do it
1. After a stressful moment has passed, write five short lines:
   1) What happened  
   2) What I felt  
   3) What helped  
   4) What did not help  
   5) What I’ll try next time
2. Keep it brief and factual.
3. Treat it like learning, not self-criticism.

Outcome
Each stressful event becomes useful information for building resilience.
`
  }
],

  boundaries_balance: [
  {
    task: "Identify 3 boundaries you need right now",
    duration: 0.5,
    explanation: `
Boundaries are not about being cold or difficult. They are small protective structures that help you keep your time, energy, and peace.

How to do it
1. Choose one boundary for each category:
   • time boundary  
   • energy boundary  
   • tech boundary
2. For each one, write:
   • the boundary itself  
   • where it applies  
   • why you need it
3. Keep them specific.

Examples:
• Time boundary → “I do not take calls after 8pm.”  
• Energy boundary → “I do not say yes immediately when I am already stretched.”  
• Tech boundary → “I keep my phone out of reach during focused work.”

4. Save the three boundaries somewhere visible.

Outcome
Clearer limits that reduce resentment, protect your energy, and make life feel more manageable.
`
  },

  {
    task: "Draft 2 boundary scripts (friendly and firm)",
    duration: 0.5,
    explanation: `
When you know what to say in advance, boundaries become much easier to hold. This task helps you prepare words for real situations.

How to do it
1. Think of one situation where you often struggle to set a boundary.
2. Write two versions of your response:
   • friendly version = warm and clear  
   • firm version = shorter and more final
3. Keep both polite and simple.

Example:
Friendly:
“Thank you for thinking of me, I can’t do that this week.”

Firm:
“I’m not available for that.”

4. Practice saying both out loud once.
5. Save the scripts in your notes so you can reuse them.

Outcome
More confidence in the moment because you already know what your boundary sounds like.
`
  },

  {
    task: "Say no to something small today (guilt-free)",
    duration: 0.5,
    explanation: `
A small no helps build the skill of protecting your time and energy. You do not need to start with a dramatic boundary to practise one.

How to do it
1. Choose one low-stakes thing to decline today.

Examples:
• an extra favour  
• a social plan you do not want  
• a request you do not have capacity for  
• staying longer than you planned

2. Say no politely and briefly.
3. Do not over-explain if it is not necessary.
4. Afterwards, notice what the no protected:
   • time  
   • energy  
   • calm  
   • focus

Outcome
A real-life boundary practice that helps “no” feel more available and less dramatic.
`
  },

  {
    task: "Calendar block 30–60 min of ‘you time’ this week",
    duration: 0.5,
    explanation: `
If personal time only happens accidentally, it usually gets pushed aside. Booking it makes it more real and more likely to happen.

How to do it
1. Look at your calendar for this week.
2. Choose one 30–60 minute block just for yourself.
3. Name it clearly.

Examples:
• Reset  
• Walk + tea  
• Quiet hour  
• Solo recharge

4. Add it to your calendar like any other important appointment.
5. Protect it with Do Not Disturb if needed.
6. Decide in advance what the time is for.

Outcome
A protected pocket of time that reminds you that your needs matter too.
`
  },

  {
    task: "Turn off non-essential notifications for 24h",
    duration: 1,
    explanation: `
Constant pings keep your nervous system slightly on alert. Turning off non-essential notifications helps you notice how much calmer your attention can feel.

How to do it
1. Open your notification settings.
2. Turn off anything non-essential for the next 24 hours.

Examples:
• social media  
• shopping apps  
• news alerts  
• promotional emails  
• low-priority group chats

3. Keep only the notifications you genuinely need.
4. Batch-check messages once or twice instead of constantly reacting.
5. Notice what changes in:
   • focus  
   • stress  
   • mood  
   • urge to check your phone

Outcome
More calm, more focus, and less reactive energy throughout the day.
`
  },

  {
    task: "List 5 energy leaks and 5 protectors (then fix one leak)",
    duration: 0.5,
    explanation: `
Energy leaks are the things that drain you quietly and repeatedly. Protectors are the habits or conditions that help you stay steady.

How to do it
1. Write two lists:
   • 5 energy leaks  
   • 5 energy protectors
2. Be specific.

Examples of leaks:
• open tabs everywhere  
• doom scrolling  
• overcommitting  
• skipping lunch  
• replying immediately to everything

Examples of protectors:
• lunch away from your desk  
• short walks  
• prayer or stillness  
• phone on Do Not Disturb  
• getting ready the night before

3. Circle the biggest leak.
4. Make one simple change to reduce it today.

Outcome
More energy and capacity without needing to “try harder” at everything.
`
  },

  {
    task: "Create a work shutdown ritual (5–10 min)",
    duration: 0.5,
    explanation: `
A shutdown ritual helps your brain understand that work is done for now. Without one, work thoughts can leak into the rest of your evening.

How to do it
1. Set aside 5–10 minutes at the end of your workday.
2. Follow the same short sequence each time.

Example:
• close tabs  
• write tomorrow’s top 3 priorities  
• tidy one surface  
• put laptop away  
• physically leave the work area

3. Keep the routine simple and repeatable.
4. Treat it as a signal, not another task to perfect.

Outcome
Less evening anxiety and a cleaner mental transition out of work mode.
`
  },

  {
    task: "Ask directly for what you need",
    duration: 0.5,
    explanation: `
Directness is often kinder than hoping people will guess. This task helps you practise clear requests without over-explaining.

How to do it
1. Think of one need you have right now.

Examples:
• more time  
• more clarity  
• a change of plan  
• support  
• quiet  
• more notice

2. Use this structure:
   “Could we ___ by ___ because ___?”
3. Keep the request specific and realistic.

Example:
“Could we move this to tomorrow because I need more focused time to finish it properly?”

4. Say it once clearly.
5. Let the other person respond without rushing to fill the silence.

Outcome
A stronger ability to state your needs clearly and respectfully.
`
  },

  {
    task: "Plan a mini balance day (rest + one joy activity)",
    duration: 0.5,
    explanation: `
Balance does not need to mean a whole perfect weekend. A mini balance day is a lighter, more realistic way to restore yourself.

How to do it
1. Choose one form of genuine rest.

Examples:
• slow morning  
• nap  
• gentle movement  
• reading  
• quiet time without pressure

2. Add one joy activity.

Examples:
• coffee with a friend  
• park walk  
• museum  
• baking  
• browsing a bookshop  
• favourite meal at home

3. Keep the day light rather than over-planned.
4. Let it feel restorative rather than productive.

Outcome
More emotional balance and a nervous system that feels less constantly “on.”
`
  },

  {
    task: "Reflect: where did a boundary help this week?",
    duration: 0.5,
    explanation: `
Reflecting on boundaries helps you notice their benefits so they become easier to repeat and trust.

How to do it
1. Think of one moment this week where you held or tried a boundary.
2. Write three short parts:
   • Situation  
   • Boundary  
   • Payoff
3. Example:
   Situation → late message  
   Boundary → replied the next morning  
   Payoff → better rest and less reactive energy
4. Then decide:
   • keep  
   • strengthen  
   • adjust

Outcome
More trust in your boundaries because you can see what they actually protected.
`
  },

  {
    task: "Write a polite decline template (email/DM)",
    duration: 0.5,
    explanation: `
A saved template makes it easier to say no gracefully when you are caught off guard.

How to do it
1. Write one reusable decline message.
2. Keep the structure simple:
   • thanks  
   • clear no  
   • optional alternative
3. Example:
   “Thank you for thinking of me. I’m not able to take this on right now, but I appreciate you reaching out.”
4. Save it in your notes for future use.

Outcome
An easy way to decline requests without awkward over-explaining.
`
  },

  {
    task: "Define contact windows (e.g., no replies after 8 pm)",
    duration: 0.5,
    explanation: `
You are allowed to have communication limits. Defining contact windows helps protect your evenings, focus, and rest.

How to do it
1. Choose one simple communication boundary.

Examples:
• no replies after 8pm  
• no checking messages before breakfast  
• no email on Sundays  
• respond to non-urgent messages during set hours only

2. Write the boundary down clearly.
3. Communicate it where needed, if relevant.
4. Practise sticking to it at least once this week.

Outcome
More control over your time and less reactive messaging.
`
  },

  {
    task: "Block one deep-work session with DND on",
    duration: 0.5,
    explanation: `
Deep work is hard to access when you are constantly interrupted. This task helps you practise focused attention in a protected block.

How to do it
1. Choose one task that needs real concentration.
2. Book a focused session in your calendar.
3. Turn on Do Not Disturb.
4. Keep only one task open.
5. Set a timer.

Examples:
• 25 minutes  
• 45 minutes  
• 60 minutes

6. When the session ends, stop and note what you completed.

Outcome
More progress with less stress and a stronger sense of control over your attention.
`
  },

  {
    task: "Create a stop-doing list (3 items)",
    duration: 0.5,
    explanation: `
Sometimes the fastest way to create peace is not adding more, but deciding what you are no longer available for.

How to do it
1. Write down three things you want to stop doing.

Examples:
• over-explaining  
• checking messages late at night  
• saying yes too quickly  
• doom scrolling when tired  
• carrying work into bedtime

2. Keep the items realistic and specific.
3. Put the list near your to-do list or somewhere visible.
4. Treat it as a protection list, not a self-criticism list.

Outcome
More energy and peace through clear subtraction.
`
  },

  {
    task: "Practice a 10-second pause before saying yes",
    duration: 0.5,
    explanation: `
The pause gives you space to choose instead of agreeing automatically and regretting it later.

How to do it
1. The next time someone asks you for something, pause before answering.
2. Breathe, check in with yourself, and if needed say:
   • “Let me check and come back to you.”  
   • “I need a moment to think about that.”
3. Only say yes after checking:
   • time  
   • energy  
   • desire  
   • capacity

Outcome
Fewer automatic yeses, better boundaries, and more aligned decisions.
`
  }
],

  digital_detox: [
  {
    task: "Log off social media for 60 minutes",
    duration: 1,
    explanation: `
Even one hour away from social media can improve focus, calm, and mood. The goal is to feel the difference, not to prove perfect discipline.

How to do it
1. Set a timer for 60 minutes.
2. Log out of social media apps or put your phone in another room.
3. Do not keep the phone nearby “just in case” if possible.
4. Choose one replacement activity before you begin.

Examples:
• walk  
• read  
• tidy a space  
• journal  
• make tea  
• call someone  
• sit quietly without input

5. When the timer ends, notice how your mind and mood feel compared with constant checking.

Outcome
A real hour returned to your life, with clearer focus and less digital noise.
`
  },

  {
    task: "Hide or delete one draining app from home screen",
    duration: 0.5,
    explanation: `
A little friction can reduce automatic app-opening far more than willpower alone.

How to do it
1. Choose one app you open reflexively but rarely enjoy afterwards.
2. Decide whether to:
   • move it off your home screen  
   • bury it in a folder  
   • delete it temporarily if you want a stronger reset
3. Replace its old spot with something more helpful.

Examples:
• notes  
• calendar  
• podcast app  
• audiobook  
• prayer or journaling app  
• reminders

4. Notice how often you try to open it out of habit.

Outcome
Less mindless opening and more intentional phone use.
`
  },

  {
    task: "30 minutes of reading or journaling instead of scrolling",
    duration: 0.5,
    explanation: `
This task gives your attention something deeper and steadier than endless short-form content.

How to do it
1. Choose either:
   • reading  
   • journaling
2. Pick the material or prompt in advance so you do not drift back to your phone.
3. Set a 30-minute timer.
4. Keep the phone out of reach or on Do Not Disturb.
5. Focus on only that one activity for the full block.
6. At the end, notice whether you feel calmer, clearer, or more like yourself.

Outcome
A more nourishing use of your attention and a noticeable drop in scroll-fatigue.
`
  },

  {
    task: "Inbox hygiene: unsubscribe from 10 emails",
    duration: 0.5,
    explanation: `
Unnecessary emails create daily mental clutter. A short cleanup now makes future days quieter.

How to do it
1. Open your email inbox.
2. Search for the word:
   • unsubscribe
3. Look through promotional, sales, or low-value emails.
4. Unsubscribe from 10 senders you do not genuinely want.
5. Delete or archive the emails afterwards.
6. Stop once you reach 10, this is a reset, not an endless cleanup.

Outcome
Less inbox noise and fewer attention-grabbing emails in the days ahead.
`
  },

  {
    task: "Screens-off 45–60 minutes before bed",
    duration: 1,
    explanation: `
Reducing screens before bed can make evenings feel softer and help your brain shift into rest mode more easily.

How to do it
1. Set a wind-down alarm for 45–60 minutes before bed.
2. When it rings, put away:
   • phone  
   • laptop  
   • tablet  
   • TV if possible
3. Decide in advance what will replace screen time.

Examples:
• shower  
• stretch  
• read  
• pray  
• journal  
• tidy lightly  
• make tea

4. Keep the lighting lower if you can.
5. Try it for a few nights before deciding whether it helps.

Outcome
A calmer evening rhythm, easier sleep onset, and more peaceful mornings.
`
  },

  {
    task: "Set daily app limits for two worst offenders",
    duration: 0.5,
    explanation: `
App limits create gentle guardrails. They help you notice when your use has stopped being intentional.

How to do it
1. Identify your two biggest time-wasting apps.
2. Set a daily usage limit for each one.
3. Choose a limit that feels realistic, not performative.
4. Decide in advance what you will do when the limit is reached.

Examples:
• close the app and go for a walk  
• switch to reading  
• text a friend instead of scrolling  
• stretch, tidy, or make tea

5. Treat the limit as information and support, not punishment.

Outcome
More awareness of where your time goes and less time lost in apps you do not even enjoy.
`
  },

  {
    task: "Single-task one chore with full attention",
    duration: 0.5,
    explanation: `
Single-tasking helps retrain attention. A simple chore is an easy place to practise focus without pressure.

How to do it
1. Choose one chore.

Examples:
• washing dishes  
• folding clothes  
• wiping counters  
• tidying a shelf  
• making the bed

2. Do it without:
   • scrolling  
   • podcasts  
   • TV  
   • multitasking
3. Give the chore your full attention until it is finished.
4. Notice the feeling of completion afterwards.

Outcome
A small but useful focus practice that makes your attention feel steadier.
`
  },

  {
    task: "Phone-free meal with someone you like",
    duration: 0.5,
    explanation: `
Phone-free conversation often feels fuller, calmer, and more connecting than half-eating while half-scrolling.

How to do it
1. Choose one meal to share with someone you enjoy.
2. Put both phones away or out of reach if possible.
3. Stay present with the meal and the conversation.
4. Ask one slightly deeper question if it feels natural.
5. Listen fully without preparing your reply while they speak.

Outcome
A more satisfying social moment and a nervous system that feels less fragmented.
`
  },

  {
    task: "Create a focus zone (clear desk + Do Not Disturb)",
    duration: 0.5,
    explanation: `
Your environment affects your attention. A simple focus zone makes it easier to begin and stay with one task.

How to do it
1. Clear one small surface where you will work.
2. Remove visual clutter that does not need to be there.
3. Turn on Do Not Disturb on your phone and devices.
4. Add one focus cue.

Examples:
• timer  
• study playlist  
• glass of water  
• notebook open to today’s task

5. Decide on the one task you are doing in that space.
6. Start before you feel perfectly ready.

Outcome
Less overwhelm, cleaner focus, and an easier transition into deep work.
`
  },

  {
    task: "Reflect: mood and focus differences today",
    duration: 0.5,
    explanation: `
Reflection helps you notice whether reducing digital noise actually changed anything for you.

How to do it
1. At the end of the day, write two short lines:
   1) What changed in my mood or focus today?
   2) What helped most?
2. Keep it simple and honest.

Examples:
• “I felt less scattered after the social media break.”  
• “My evening was calmer without my phone nearby.”  
• “The app limits helped more than I expected.”

3. Treat this as data, not judgment.

Outcome
A clearer picture of how digital habits affect your mood, focus, and energy.
`
  },

  {
    task: "Move distracting apps to the last page",
    duration: 0.5,
    explanation: `
Making distraction less convenient helps reduce impulsive checking.

How to do it
1. Choose the apps you open most reflexively.
2. Move them to the last page of your phone.
3. Put them inside a folder if you want one extra step.
4. Keep your first screen for tools that actually support your life.

Examples:
• calendar  
• notes  
• maps  
• reading app  
• reminders  
• podcast app

Outcome
Less impulse scrolling and more intentional phone use.
`
  },

  {
    task: "Set grayscale mode for one afternoon",
    duration: 0.5,
    explanation: `
Removing bright colours can make your phone less stimulating and less addictive for a while.

How to do it
1. Turn on grayscale mode for the afternoon.
2. Use your phone only for essentials if possible.
3. Notice whether the urge to keep checking it drops.
4. Pay attention to how your brain responds when the screen feels less “rewarding.”

Outcome
A clearer sense of how much colour and visual stimulation drive phone cravings.
`
  },

  {
    task: "Batch notifications: summaries twice per day",
    duration: 0.5,
    explanation: `
When you decide when to check messages, your attention stops being constantly interrupted by other people’s timing.

How to do it
1. Turn off instant notifications where possible.
2. Choose two check-in windows for the day.

Examples:
• midday  
• early evening

3. Check messages only during those windows unless something is genuinely urgent.
4. Let the rest of the day be quieter and more protected.
5. Notice how your focus and nervous system feel without constant interruption.

Outcome
More calm, fewer interruptions, and a greater sense of control over your attention.
`
  },

  {
    task: "Try a 25-minute ‘forest’ focus timer",
    duration: 0.5,
    explanation: `
A short focus timer makes starting easier and gives your brain a clear container for one task.

How to do it
1. Choose one task only.
2. Set a 25-minute focus timer in your preferred app or with a normal timer.
3. Turn off distractions and begin.
4. Work until the timer ends.
5. Take a 5-minute break afterwards.
6. Repeat once more if you want, but one round already counts.

Outcome
A simple, low-drama way to build focus and reduce phone temptation.
`
  },

  {
    task: "Write a 3-item daily focus list (paper)",
    duration: 0.55,
    explanation: `
A short paper list helps reduce overwhelm and keeps your mind anchored to what actually matters today.

How to do it
1. Take a piece of paper or notebook.
2. Write down only 3 priorities for today.
3. Make them clear and specific.
4. Circle the first one.
5. Start with just 2 minutes on that first item.
6. Let the list stay small. The goal is direction, not pressure.

Outcome
Clearer priorities, less mental clutter, and an easier path into action.
`
  }
],

  confidence_mindset: [
    {
      task: "Write 10 things you are proud of (big or tiny)",
      duration: 0.5,
      explanation: `
Confidence grows from remembering your own evidence. This exercise helps you notice progress you may normally overlook.

How to do it
1. Open a notebook or notes app.
2. Write a list of 10 things you are proud of.
3. Include a mix of:
   • achievements  
   • effort you showed  
   • promises you kept  
   • moments you handled well

Examples
• finished a difficult project  
• kept a workout commitment  
• supported a friend  
• stayed calm in a stressful situation  
• learned a new skill

4. Small wins count. Often they matter most.
5. Read the list once when finished.

Outcome
A written reminder of your strengths and progress, which helps counter self-doubt.
`
    },

    {
      task: "Mirror moment: say one kind sentence to yourself",
      duration: 0.5,
      explanation: `
The way you speak to yourself affects your mood, posture, and confidence. Practising kind self-talk can gradually shift your internal tone.

How to do it
1. Stand in front of a mirror.
2. Look at yourself calmly.
3. Say one kind and believable sentence.

Examples
• “I’m doing my best today.”  
• “I’m learning and improving.”  
• “I handled a lot this week.”

4. Keep the sentence simple and honest.
5. Notice any shift in your posture or breathing.

Outcome
A small but powerful improvement in your inner dialogue.
`
    },

    {
      task: "Wear an outfit/accessory that boosts your stride",
      duration: 0.5,
      explanation: `
What you wear can influence how you carry yourself. Small style cues can subtly improve posture and confidence.

How to do it
1. Choose one item that makes you feel more put together.

Examples
• a favourite jacket  
• watch or jewellery  
• well-fitting shoes  
• a colour you enjoy wearing

2. Put it on intentionally.
3. Stand tall for 10 seconds and take a slow breath.
4. Notice how your posture and energy feel.

Outcome
A subtle physical cue that reinforces confident body language.
`
    },

    {
      task: "Power-posture drill for 2 minutes",
      duration: 0.5,
      explanation: `
Confidence is not only mental, it is also physical. Practising confident posture can influence how you feel internally.

How to do it
1. Stand with both feet grounded.
2. Relax your shoulders and open your chest slightly.
3. Keep your chin level and breathe slowly.
4. Hold this posture for about two minutes.
5. If helpful, practise before a meeting, conversation, or work task.

Outcome
A steadier, calmer physical presence that supports confident behaviour.
`
    },

    {
      task: "Record a 30-second hype voice note",
      duration: 0.5,
      explanation: `
A short encouraging message from yourself can be surprisingly powerful when motivation dips.

How to do it
1. Open your phone’s voice recorder.
2. Record a short message including:
   • one strength you have  
   • one piece of evidence for it  
   • one next action you will take

Example
“I’m persistent because I kept learning even when things were difficult. Today I’ll take the next step and keep going.”

3. Save the recording.
4. Replay it when you feel uncertain.

Outcome
A personalised pep talk you can access anytime.
`
    },

    {
      task: "Do one bold small action (send/apply/ask)",
      duration: 0.5,
      explanation: `
Confidence grows through action. Even small acts of bravery help your brain update its expectations.

How to do it
1. Choose one slightly uncomfortable but safe action.

Examples
• send a message you have been delaying  
• apply for an opportunity  
• ask a question in a meeting  
• share an idea  
• reach out to someone you admire

2. Do it even if it feels imperfect.
3. Focus on completing the action rather than controlling the outcome.

Outcome
Real-life evidence that you can act despite discomfort.
`
    },

    {
      task: "Create a ‘wins’ note and add two items",
      duration: 0.5,
      explanation: `
Tracking wins helps build long-term confidence by collecting proof of progress.

How to do it
1. Open a notes app.
2. Create a note titled “Wins”.
3. Add two things that went well today or this week.
4. Keep them short and factual.

Examples
• completed a workout  
• spoke up in a meeting  
• cooked a healthy meal

5. Continue adding to this list over time.

Outcome
A growing record of accomplishments you can revisit on difficult days.
`
    },

    {
      task: "Craft a personal affirmation you believe",
      duration: 0.5,
      explanation: `
Affirmations work best when they feel believable rather than exaggerated.

How to do it
1. Write one sentence that reflects progress or effort.

Examples
• “I am learning to trust myself.”  
• “I show up and keep improving.”  
• “I handle challenges one step at a time.”

2. Keep the sentence realistic.
3. Save it somewhere visible or repeat it quietly.

Outcome
A supportive inner statement that reinforces growth.
`
    },

    {
      task: "Build a hype playlist for focus or getting ready",
      duration: 0.5,
      explanation: `
Music can influence energy and mood quickly. A dedicated playlist can become a useful confidence ritual.

How to do it
1. Create a playlist with 8–12 songs that lift your mood or focus.
2. Choose music that energises or steadies you.
3. Use the playlist before:
   • workouts  
   • work sessions  
   • social events  
   • getting ready in the morning

Outcome
A reliable way to boost energy and motivation when needed.
`
    },

    {
      task: "Reflect: where did you act with courage today?",
      duration: 0.5,
      explanation: `
Noticing courage helps reinforce confident behaviour.

How to do it
1. Think about your day.
2. Write three short points:

What I did  
How it felt  
What it proved about me

Example
• I spoke up in a meeting  
• It felt uncomfortable at first  
• It proved I can share ideas even when nervous

Outcome
Greater awareness of your growing courage.
`
    },

    {
      task: "Write 3 evidence-based compliments to yourself",
      duration: 0.5,
      explanation: `
Compliments supported by evidence feel more believable and lasting.

How to do it
1. Write three sentences using this structure:

“I am ___ because I ___.”

Examples
• “I am disciplined because I showed up to train even when tired.”  
• “I am supportive because I helped a friend this week.”  
• “I am persistent because I kept learning despite setbacks.”

Outcome
A stronger and more grounded self-image.
`
    },

    {
      task: "Role-model study: list 3 traits to emulate",
      duration: 0.5,
      explanation: `
Studying role models can inspire behaviours you want to practise yourself.

How to do it
1. Choose one person you admire.
2. Identify three traits they demonstrate.

Examples
• calm communication  
• discipline  
• curiosity  
• generosity

3. For each trait, write one behaviour you could try this week.

Outcome
Clear examples of behaviours you can practise to grow your confidence.
`
    },

    {
      task: "Micro-exposure: 5-minute safe task that scares you",
      duration: 0.52,
      explanation: `
Small exposures help reduce fear gradually and safely.

How to do it
1. Choose a tiny task that feels slightly uncomfortable.

Examples
• introducing yourself to someone  
• asking a question  
• sharing an idea  
• sending a message you delayed

2. Set a 5-minute timer.
3. Do the task without worrying about perfection.
4. Stop once the timer ends.

Outcome
Reduced fear through small repeated experiences of courage.
`
    },

    {
      task: "Compliment a stranger or friend sincerely",
      duration: 0.5,
      explanation: `
Offering kindness can increase your own sense of social confidence.

How to do it
1. Notice something genuine you appreciate about someone.

Examples
• their style  
• their effort  
• their work  
• their kindness

2. Share a short sincere compliment.
3. Observe the positive interaction that follows.

Outcome
Improved social ease and more positive interactions.
`
    },

    {
      task: "Capture one ‘small win’ photo today",
      duration: 0.5,
      explanation: `
Visual reminders of progress can strengthen motivation.

How to do it
1. Take a photo of something positive you did today.

Examples
• workout completed  
• tidy workspace  
• meal you cooked  
• book you read  
• a peaceful walk

2. Save it in a folder called “Wins”.

Outcome
A visual record of progress you can revisit whenever motivation dips.
`
    }
  ],

  

social_nourish: [
  {
    task: "Send a thoughtful message to someone you appreciate",
    duration: 0.5,
    explanation: `
Small expressions of appreciation can strengthen connection very quickly. They also shift your focus toward warmth instead of isolation or overthinking.

Step-by-step
1. Choose one person you genuinely appreciate.
2. Write a short message that includes:
   • what you appreciate  
   • one specific reason why
3. Keep it simple and sincere.

Examples:
• “I really appreciate how supportive you’ve been lately.”  
• “I was thinking about how kind you were when I needed encouragement.”  
• “You make things feel lighter, and I’m grateful for that.”

4. Send it without expecting a big conversation or reply.

Outcome
A warm moment of connection and a small increase in positive social energy.
`
  },

  {
    task: "Schedule one low-pressure coffee or conversation",
    duration: 0.5,
    explanation: `
Relationships often grow through small, repeated moments of contact rather than dramatic big plans.

Step-by-step
1. Choose one person you would genuinely enjoy seeing or speaking with.
2. Suggest something simple and low-pressure.

Examples:
• quick coffee  
• short walk  
• tea after work  
• 20-minute catch-up call

3. Offer 1–2 time options so it feels easy to reply to.
4. Keep the tone light and flexible.

Example:
“Would you fancy a quick coffee sometime this week? I’m free Wednesday after work or Saturday afternoon.”

Outcome
A realistic connection point that strengthens relationships without social pressure.
`
  },

  {
    task: "Attend one group, class, or community space",
    duration: 1.5,
    explanation: `
Shared spaces can help you feel more connected without needing to perform or force instant friendship.

Step-by-step
1. Choose one group, class, or space aligned with your interests, lifestyle, or values.

Examples:
• fitness class  
• community event  
• faith space  
• book club  
• volunteering  
• creative workshop  
• professional meetup

2. Attend once with no pressure to stay long or impress anyone.
3. Focus on simply showing up.
4. Participate at your comfort level.
5. Afterwards, note:
   • how it felt  
   • whether you would return  
   • whether the space felt nourishing, neutral, or draining

Outcome
A stronger sense of belonging and more confidence in entering shared spaces.
`
  },

  {
    task: "Do one small act of kindness (anonymous if you like)",
    duration: 0.5,
    explanation: `
Kindness often improves your own emotional state as much as the other person’s. Small acts matter.

Step-by-step
1. Choose one simple act of kindness.

Examples:
• send an encouraging message  
• help someone with a small task  
• buy someone a coffee  
• donate quietly  
• check in on someone  
• compliment someone sincerely

2. Keep it simple and genuine.
3. Let the act end there. No recognition required.

Outcome
More warmth, more outward focus, and less self-focused stress.
`
  },

  {
    task: "Call a family member and really listen",
    duration: 0.5,
    explanation: `
Feeling connected often depends less on talking a lot and more on being present while someone else speaks.

Step-by-step
1. Choose one family member you would like to feel closer to.
2. Call them with the intention to be present, not just efficient.
3. Ask one open-ended question.

Examples:
• “How have you really been lately?”  
• “What has been on your mind recently?”  
• “How are things feeling for you these days?”

4. Let them answer fully.
5. Try not to rush in with advice or change the subject too quickly.

Outcome
A deeper sense of closeness and more emotionally present connection.
`
  },

  {
    task: "Plan a walk-and-talk (20–30 min) with a friend",
    duration: 0.5,
    explanation: `
Walking side by side often makes conversation feel easier, lighter, and less intense than sitting face to face.

Step-by-step
1. Invite one friend for a short walk.
2. Keep it casual and time-bound.

Example:
“Fancy a 20-minute walk and catch-up this week?”
3. Choose a simple route.
4. Let the conversation flow naturally.
5. Focus on presence rather than trying to make it a “perfect” catch-up.

Outcome
Connection that feels easier, lighter, and more natural.
`
  },

  {
    task: "Set a boundary around one draining interaction",
    duration: 0.5,
    explanation: `
Healthy connection includes protecting your own energy. Boundaries help relationships feel safer and less resentful.

Step-by-step
1. Identify one interaction that often leaves you drained.
2. Choose one specific adjustment.

Examples:
• shorter visit  
• earlier end time  
• different setting  
• less frequent replies  
• not engaging in one topic

3. Decide how you will communicate it, if needed.
4. Keep your wording polite and clear.
5. Notice what the boundary protects:
   • time  
   • energy  
   • calm  
   • emotional space

Outcome
More preserved energy and healthier connection without unnecessary guilt.
`
  },

  {
    task: "Send a gratitude note or voice message",
    duration: 0.5,
    explanation: `
Gratitude deepens relationships quickly because it makes people feel seen and valued.

Step-by-step
1. Choose one person.
2. Send either:
   • a short written note  
   • a quick voice message
3. Include one specific reason for your gratitude.

Examples:
• “Thank you for always checking in on me.”  
• “I appreciated how calm you were with me that day.”  
• “You made a hard week feel easier.”

4. Keep it short and sincere. Length is not what makes it meaningful.

Outcome
More warmth, more appreciation, and stronger mutual goodwill.
`
  },

  {
    task: "Curate your feeds: follow 5 uplifting accounts",
    duration: 0.5,
    explanation: `
Your digital environment affects your mood and social energy. A more nourishing feed can make online time feel less draining.

Step-by-step
1. Look at the accounts you currently see most often.
2. Follow five accounts that leave you feeling:
   • calmer  
   • inspired  
   • grounded  
   • uplifted  
   • connected to your values
3. Examples:
   • faith-based reflection  
   • learning  
   • wellness  
   • beauty  
   • art  
   • thoughtful humour  
   • gentle motivation
4. If you are ready, mute or unfollow one account that consistently drains you.

Outcome
A more supportive digital space that feels lighter on your nervous system.
`
  },

  {
    task: "Reflect: how full or empty is your social cup?",
    duration: 0.5,
    explanation: `
Not all social energy works the same way. This reflection helps you notice whether you need more connection, more rest, or more selective connection.

Step-by-step
1. Rate your current social cup from 1–5.
   • 1 = very empty / disconnected  
   • 5 = socially full and nourished
2. Ask yourself:
   • Do I need more connection?  
   • Do I need quieter connection?  
   • Do I need less social output and more recovery?
3. Choose one small “pour-in” action based on your answer.

Examples:
• message someone warm  
• plan a coffee  
• take a rest evening instead of forcing plans  
• call family  
• attend a group space

Outcome
More intentional connection that matches your real capacity instead of guilt or pressure.
`
  },

  {
    task: "Invite someone to co-work or study together",
    duration: 0.5,
    explanation: `
Shared presence can create connection without the pressure of constant conversation. It is a low-effort way to feel less alone while staying productive.

Step-by-step
1. Choose one person you would feel comfortable working or studying alongside.
2. Suggest a simple plan.

Examples:
• café  
• library  
• quiet room at home  
• shared virtual focus session

3. Keep the invitation light.

Example:
“Would you like to co-work for an hour sometime this week?”
4. Agree that chatting can be minimal if needed.
5. Focus on the shared presence as much as the task itself.

Outcome
A useful mix of motivation, accountability, and connection.
`
  },

  {
    task: "Plan a small shared hobby session (cook, read, create)",
    duration: 1.0,
    explanation: `
Shared activities often make connection feel easier because the focus is not entirely on conversation.

Step-by-step
1. Choose one simple activity.

Examples:
• cook together  
• read in the same space  
• paint or draw  
• bake  
• do a puzzle  
• craft  
• go to a bookshop or market

2. Set a clear time and duration.
3. Keep the expectations relaxed.
4. Let the activity create the connection rather than forcing deep conversation.

Outcome
A more natural and enjoyable sense of connection through shared experience.
`
  },

  {
    task: "Reconnect with one old friend (message or call)",
    duration: 0.5,
    explanation: `
Reconnection does not need a dramatic explanation. Often one small message is enough to reopen the door.

Step-by-step
1. Think of one old friend you would genuinely like to reconnect with.
2. Send a simple message.

Examples:
• “I thought of you today. How have you been?”  
• “You crossed my mind and I wanted to say hi.”  
• “It’s been a while, but I’d love to hear how you are.”

3. Avoid over-apologising or over-explaining.
4. Let the other person’s response guide the next step.

Outcome
A revived connection without extra emotional weight or pressure.
`
  },

  {
    task: "Offer help on a small task to a colleague",
    duration: 0.5,
    explanation: `
Small acts of support can build trust, ease, and warmer professional relationships.

Step-by-step
1. Identify one concrete way you could help a colleague.

Examples:
• review something quickly  
• answer a question  
• share a useful resource  
• offer a second pair of eyes  
• help them think through a small issue

2. Offer briefly and clearly.
3. Keep the gesture realistic and manageable.
4. Accept yes or no without overthinking it.

Outcome
Stronger professional goodwill and more ease in your working relationships.
`
  },

  {
    task: "Plan one phone-free catch-up this week",
    duration: 0.5,
    explanation: `
Undivided attention can make a short catch-up feel much more meaningful. This task is about quality of presence, not length of time.

Step-by-step
1. Choose one catch-up this week:
   • coffee  
   • meal  
   • walk  
   • call in person
2. Decide in advance to keep phones away or out of reach.
3. If helpful, say it out loud:
   “Let’s do this one phone-free.”
4. Stay present with the conversation.
5. Notice how the interaction feels compared with half-checking your phone.

Outcome
A more grounded, nourishing interaction with stronger emotional presence.
`
  }
],


 }
};


/**
 * Reorders a task array so that no two recurring tasks appear consecutively.
 * At least one non-recurring task will always sit between any two recurring tasks.
 *
 * Strategy:
 *  1. Split tasks into two buckets: recurring and non-recurring.
 *  2. Walk through and whenever a recurring task would follow another recurring
 *     task, insert the next available non-recurring task first.
 *  3. Append any leftover tasks (maintaining relative order within each bucket).
 *
 * If there are not enough non-recurring tasks to fully separate all recurring
 * tasks the function does its best and places the remaining recurring tasks at
 * the end rather than forcing invalid gaps.
 */
function separateRecurringTasks(tasks = []) {
  const isRecurring = (t) =>
    t?.meta?.kind === 'recurring' || t?.meta?.kind === 'recurring_weekly';

  const recurring    = tasks.filter(isRecurring);
  const nonRecurring = tasks.filter((t) => !isRecurring(t));

  const result = [];
  let ri = 0; // index into recurring
  let ni = 0; // index into nonRecurring

  while (ri < recurring.length || ni < nonRecurring.length) {
    // Check whether the last item placed was recurring
    const lastWasRecurring =
      result.length > 0 && isRecurring(result[result.length - 1]);

    if (lastWasRecurring && ri < recurring.length && ni < nonRecurring.length) {
      // Must insert a non-recurring task before the next recurring one
      result.push(nonRecurring[ni++]);
    } else if (ri < recurring.length) {
      result.push(recurring[ri++]);
    } else {
      result.push(nonRecurring[ni++]);
    }
  }

  return result;
}

function buildPremiumRoadmapStructure(source) {
  const result = {};

  for (const [roadmapKey, themeGroups] of Object.entries(source || {})) {
    const flat = [];

    for (const [themeKey, tasks] of Object.entries(themeGroups || {})) {
      (tasks || []).forEach((task, index) => {
        flat.push({
          ...task,
          themeKey,
          originalThemeOrder: Object.keys(themeGroups).indexOf(themeKey),
          originalTaskOrder: index,
        });
      });
    }

    result[roadmapKey] = separateRecurringTasks(flat);
  }

  return result;
}

/**
 * Apply the same separation to the free (per-theme) structure so that
 * roadmapTasksFree also has no two consecutive recurring tasks within a theme.
 */
function separateFreeRoadmapTasks(source) {
  const result = {};
  for (const [roadmapKey, themeGroups] of Object.entries(source || {})) {
    result[roadmapKey] = {};
    for (const [themeKey, tasks] of Object.entries(themeGroups || {})) {
      result[roadmapKey][themeKey] = separateRecurringTasks(tasks || []);
    }
  }
  return result;
}

let _free = null;
let _premium = null;

function getFree() {
  if (!_free) _free = separateFreeRoadmapTasks(baseRoadmapTasks);
  return _free;
}

function getPremium() {
  if (!_premium) _premium = buildPremiumRoadmapStructure(baseRoadmapTasks);
  return _premium;
}

export const roadmapTasksFree    = new Proxy({}, { get: (_, k) => getFree()[k] });
export const roadmapTasksPremium = new Proxy({}, { get: (_, k) => getPremium()[k] });

export const roadmapTasksByPlan = {
  get free()    { return getFree(); },
  get premium() { return getPremium(); },
};

export function getRoadmapTasksForPlan(plan = 'free') {
  return plan === 'premium' ? getPremium() : getFree();
}

export const roadmapTasks = roadmapTasksFree;




// Create a stable id for each task. If a task already has .id, we use it.
// Otherwise we build one from roadmapKey + themeKey + a slug of task text.
export const getTaskId = (roadmapKey, themeKey, taskObj) => {
  if (taskObj?.id) return taskObj.id;
  const slug = slugify(taskObj?.task || '');
  return `${roadmapKey}.${themeKey}.${slug}`; // e.g., new_city.finances.create-a-city-specific-monthly-budget
};

// Very small slugify to keep ids stable-ish
const slugify = (s='') =>
  s.toLowerCase()
   .replace(/['’]/g, '')
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '')
   .slice(0, 80);

// Central explanations dictionary (reusable across all tasks/screens).
// Add keys using getTaskId() pattern; values are strings (explanations).
export const taskExplanations = {
  // --- EXAMPLES (fill in as you go) ---
  'new_city.finances.create-a-city-specific-monthly-budget':
    "Budgets help you translate your new city's cost-of-living into choices. Start with rent, utilities, and transport, then add your real weekly spends.",
  'new_city.jobhunt.create-your-updated-cv':
    "Your CV is your first impression. Keep it one page if you are sub-7 years experience, emphasize impact (metrics!), and tailor to UK market keywords.",
  // Add more as needed...
};