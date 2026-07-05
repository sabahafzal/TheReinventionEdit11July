// config/roadmapsConfig.js

export const roadmapsConfig = {
  new_city: {
    label: "Starting Over in a New City",
    description: "Land smoothly in your new city with checklists, finances, and a social sparkle",

    screen: "RoadmapPlan",

    jobStatus: {
      storageKey: "newCityJobStatus",
      title: "What's your job situation?",
      options: [
        {
          key: "job_secured",
          title: "I already have a job",
          emoji: "✅",
          presets: {
            prependThemes: ["job", "finances", "admin", "home"],
            hideThemes: ["jobhunt"],
          },
          blurb: "We’ll focus on onboarding, payroll, and settling fast",
        },
        {
          key: "job_needed",
          title: "I need to secure a job",
          emoji: "💼🔍",
          presets: {
            prependThemes: ["jobhunt", "finances", "prep", "home", "friends"],
            hideThemes: ["job"],
          },
          blurb: "We’ll focus on runway, housing basics, and meeting people fast",
        },
      ],
    },

    tracks: {
      moving_country: {
        label: "Moving Country & City",
        themes: [
          { key: "jobhunt", title: "📝 Job Hunt & Interviews" },
          { key: "job", title: "💼 Job & Onboarding" },
          { key: "finances", title: "💳 Money & Bills" },
          { key: "prep", title: "📦 Prep & Logistics" },
          { key: "visa", title: "📝 Visa & Legal Setup" },
          { key: "admin", title: "🛂 Settling Admin" },
          { key: "home", title: "🏡 Finding Home" },
          { key: "friends", title: "🤝 Making Friends" },
          { key: "culture", title: "🌆 Exploring & Culture" },
          { key: "energy", title: "👠 The New YOU" },
        ],
      },
      moving_city: {
  label: "Moving City (Same Country)",
  themes: [
    { key: "jobhunt", title: "📝 Job Hunt & Interviews" },
    { key: "job", title: "💼 Job & Onboarding" },
    { key: "finances", title: "💳 Money & Bills" },
    { key: "prep", title: "📦 Prep & Logistics" },
    { key: "admin", title: "🛂 Settling Admin" },   // ← add this line
    { key: "home", title: "🏡 Finding Home" },
    { key: "friends", title: "🤝 Making Friends" },
    { key: "culture", title: "🌆 Exploring & Culture" },
    { key: "energy", title: "👠 The New YOU" },
  ],
},
    },
  },

  tech_switch: {
    label: "Switching Into Tech",
    description: "Explore tech roles, build portfolio skills, and prepare for a chic career switch",

    screen: "RoadmapPlan",

    /**
     * deferTrackSelection: true
     * Track/role selection happens INSIDE the task "Explore common tech roles and pick your first track".
     * RoadmapPlanScreen and any other screen must NOT auto-prompt or redirect to TechSwitchRole
     * when no track is set. Show general themes until the task is completed.
     */
    deferTrackSelection: true,

    // ✅ Align to roadmapTasks.js THEME_FLOW (truth). Keep these as the "pre-track" themes.
    generalThemes: [
      { key: "mindset", title: "🧠 Mindset & Foundations" },
      { key: "exploration", title: "🔍 Tech Exploration & Role Discovery" },
      { key: "career_strategy", title: "🧭 Career Strategy" },
      { key: "networking", title: "🤝 Networking" },
      { key: "interview_prep", title: "🎤 Interview Prep" },
      { key: "jobhunt", title: "📝 Job Hunt" },
      { key: "portfolio_github", title: "🗂️ Portfolio & GitHub" },
    ],

    // ✅ Track-specific themes must be keys that exist in roadmapTasks.js AND follow THEME_FLOW order
    tracks: {
      data: {
        label: "Data (Analytics / Science / ML)",
        themes: [
          { key: "mindset", title: "🧠 Mindset & Foundations" },
          { key: "exploration", title: "🔍 Tech Exploration & Role Discovery" },
          { key: "cs_basics", title: "🧩 CS Basics" },
          { key: "data_skills", title: "📈 Core Data Skills" },
          { key: "projects_data", title: "💼 Projects: Data" },
          { key: "career_strategy", title: "🧭 Career Strategy" },
          { key: "networking", title: "🤝 Networking" },
          { key: "interview_prep", title: "🎤 Interview Prep" },
          { key: "jobhunt", title: "📝 Job Hunt" },
          { key: "portfolio_github", title: "🗂️ Portfolio & GitHub" },
        ],
      },

      ai: {
        label: "AI / Machine Learning",
        themes: [
          { key: "mindset", title: "🧠 Mindset & Foundations" },
          { key: "exploration", title: "🔍 Tech Exploration & Role Discovery" },
          { key: "cs_basics", title: "🧩 CS Basics" },
          { key: "ai_foundations", title: "🤖 AI Foundations" },
          { key: "ml_models", title: "📉 ML Models" },
          { key: "llm_genai", title: "🧠 LLMs & GenAI" },
          { key: "projects_ai", title: "💼 Projects: AI" },
          { key: "career_strategy", title: "🧭 Career Strategy" },
          { key: "networking", title: "🤝 Networking" },
          { key: "interview_prep", title: "🎤 Interview Prep" },
          { key: "jobhunt", title: "📝 Job Hunt" },
          { key: "portfolio_github", title: "🗂️ Portfolio & GitHub" },
        ],
      },

      frontend: {
        label: "Frontend",
        themes: [
          { key: "mindset", title: "🧠 Mindset & Foundations" },
          { key: "exploration", title: "🔍 Tech Exploration & Role Discovery" },
          { key: "cs_basics", title: "🧩 CS Basics" },
          { key: "frontend_skills", title: "💻 Core Frontend Skills" },
          { key: "projects_frontend", title: "💼 Projects: Frontend" },
          { key: "career_strategy", title: "🧭 Career Strategy" },
          { key: "networking", title: "🤝 Networking" },
          { key: "interview_prep", title: "🎤 Interview Prep" },
          { key: "jobhunt", title: "📝 Job Hunt" },
          { key: "portfolio_github", title: "🗂️ Portfolio & GitHub" },
        ],
      },

      product: {
        label: "Product Management",
        themes: [
          { key: "mindset", title: "🧠 Mindset & Foundations" },
          { key: "exploration", title: "🔍 Tech Exploration & Role Discovery" },
          { key: "product_skills", title: "🛠️ Product Skills" },
          { key: "projects_product", title: "💼 Projects: Product" },
          { key: "career_strategy", title: "🧭 Career Strategy" },
          { key: "networking", title: "🤝 Networking" },
          { key: "interview_prep", title: "🎤 Interview Prep" },
          { key: "jobhunt", title: "📝 Job Hunt" },
          { key: "portfolio_github", title: "🗂️ Portfolio & GitHub" },
        ],
      },

      ux: {
        label: "UX / Product Design",
        themes: [
          { key: "mindset", title: "🧠 Mindset & Foundations" },
          { key: "exploration", title: "🔍 Tech Exploration & Role Discovery" },
          { key: "ux_skills", title: "🎯 UX Skills" },
          { key: "projects_ux", title: "💼 Projects: UX" },
          { key: "career_strategy", title: "🧭 Career Strategy" },
          { key: "networking", title: "🤝 Networking" },
          { key: "interview_prep", title: "🎤 Interview Prep" },
          { key: "jobhunt", title: "📝 Job Hunt" },
          { key: "portfolio_github", title: "🗂️ Portfolio & GitHub" },
        ],
      },

      devops: {
        label: "DevOps / Platform",
        themes: [
          { key: "mindset", title: "🧠 Mindset & Foundations" },
          { key: "exploration", title: "🔍 Tech Exploration & Role Discovery" },
          { key: "cs_basics", title: "🧩 CS Basics" },
          { key: "devops_skills", title: "🛠️ DevOps Skills" },
          { key: "projects_backend", title: "💼 Projects: Backend" },
          { key: "career_strategy", title: "🧭 Career Strategy" },
          { key: "networking", title: "🤝 Networking" },
          { key: "interview_prep", title: "🎤 Interview Prep" },
          { key: "jobhunt", title: "📝 Job Hunt" },
          { key: "portfolio_github", title: "🗂️ Portfolio & GitHub" },
        ],
      },
    },
  },

  financial_glow_up: {
    label: "Financial Glow-Up",
    description: "Upgrade your money game with budgeting, saving, investing, and career growth",

    screen: "RoadmapPlan",

    // ✅ Match roadmapTasks.js THEME_FLOW exactly
    themes: [
      { label: "📝 Budgeting Basics & Tracking", key: "budgeting" },
      { label: "💳 Debt & Credit Mastery", key: "debt_credit" },
      { label: "🏦 Saving & Emergency Fund", key: "saving" },
      { label: "🧠 Wealth Mindset & Habits", key: "wealth_mindset" },
      { label: "🚀 Career Growth & Income Boost", key: "career_growth" },
      { label: "📈 Investing & Wealth Building", key: "investing" },
      { label: "🏡 Big Goals: Property, Travel, Retirement", key: "big_goals" },
    ],
  },

  physical_glow_up: {
    label: "Physical Glow-Up",
    description: "Level up your fitness, energy, and daily routines",

    screen: "RoadmapPlan",

    tracks: {
      gym: {
        title: "Working out in a Gym",
        // ✅ Match roadmapTasks.js THEME_FLOW exactly
        themes: [
          { key: "baseline_goals", title: "📊 Baseline & Goals" },
          { key: "habits_tracking", title: "📅 Habits & Tracking Systems" },
          { key: "mobility_posture", title: "🤸 Mobility & Posture" },
          { key: "nutrition", title: "🥗 Nutrition Fundamentals" },
          { key: "sleep", title: "😴 Sleep & Recovery" },
          { key: "fitness", title: "🏋️ Strength Training (Gym)" },
          { key: "cardio_endurance", title: "🏃 Cardio & Conditioning" },
          { key: "wellness", title: "🌱 General Wellness" },
          { key: "style_confidence", title: "✨ Style & Confidence" },
        ],
      },

      home: {
        title: "Working out at Home",
        // ✅ Match roadmapTasks.js THEME_FLOW exactly
        themes: [
          { key: "baseline_goals", title: "📊 Baseline & Goals" },
          { key: "habits_tracking", title: "📅 Habits & Tracking Systems" },
          { key: "mobility_posture", title: "🤸 Mobility & Posture" },
          { key: "nutrition", title: "🥗 Nutrition Fundamentals" },
          { key: "sleep", title: "😴 Sleep & Recovery" },
          { key: "fitness", title: "💪 Bodyweight & Minimal Equipment" },
          { key: "cardio_endurance", title: "🏃 Cardio & Conditioning" },
          { key: "wellness", title: "🌱 General Wellness" },
          { key: "style_confidence", title: "✨ Style & Confidence" },
        ],
      },
    },
  },

  mental_glow_up: {
    label: "Mental Glow-Up",
    description: "Boost calm, clarity, and confidence with mindset, balance, and wellness rituals",

    screen: "RoadmapPlan",

    // ✅ Match roadmapTasks.js THEME_FLOW exactly
    themes: [
      { label: "📝 Self Awareness", key: "self_awareness" },
      { label: "🌬️ Mindfulness & Presence", key: "mindfulness" },
      { label: "⏰ Routines & Energy", key: "routines_energy" },
      { label: "🧩 Cognitive Habits (CBT)", key: "cognitive_habits" },
      { label: "💪 Emotional Resilience", key: "emotional_resilience" },
      { label: "🛡️ Boundaries & Balance", key: "boundaries_balance" },
      { label: "📵 Digital Detox & Focus", key: "digital_detox" },
      { label: "✨ Confidence Mindset", key: "confidence_mindset" },
      { label: "🤝 Social Nourish", key: "social_nourish" },
    ],
  },
};