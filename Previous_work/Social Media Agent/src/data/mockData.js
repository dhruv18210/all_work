// Mock data for all 7 pipeline stages

export const mockDiscoveredContent = [
  {
    id: 1,
    title: "OpenAI Releases GPT-5 with Multimodal Reasoning",
    source: "Google News",
    link: "https://news.example.com/gpt5-release",
    date: "2026-03-22",
    summary: "OpenAI announces GPT-5, featuring advanced multimodal reasoning capabilities that can process text, images, and audio simultaneously."
  },
  {
    id: 2,
    title: "Remote Work Productivity Hits All-Time High in 2026",
    source: "Reddit",
    link: "https://reddit.com/r/technology/remote-work-2026",
    date: "2026-03-21",
    summary: "A new Stanford study shows remote workers are 23% more productive than their in-office counterparts, reshaping the future of work."
  },
  {
    id: 3,
    title: "5 Emerging Social Media Trends Reshaping Marketing",
    source: "Twitter",
    link: "https://twitter.com/marketingpro/trends2026",
    date: "2026-03-22",
    summary: "Short-form video, AI-generated content, and community-driven marketing are the top trends driving engagement this year."
  },
  {
    id: 4,
    title: "Apple Vision Pro 2 Launches with Enterprise AR Features",
    source: "Google News",
    link: "https://news.example.com/apple-visionpro2",
    date: "2026-03-20",
    summary: "Apple unveils the second generation Vision Pro with enterprise-focused features including collaborative AR workspaces."
  },
  {
    id: 5,
    title: "Sustainable AI: How Green Computing Is Reducing Carbon Footprint",
    source: "Reddit",
    link: "https://reddit.com/r/environment/green-ai",
    date: "2026-03-21",
    summary: "Tech giants commit to carbon-neutral AI operations by 2028, introducing new energy-efficient training methods."
  },
  {
    id: 6,
    title: "LinkedIn Introduces AI-Powered Networking Recommendations",
    source: "Twitter",
    link: "https://twitter.com/linkedin/ai-networking",
    date: "2026-03-22",
    summary: "LinkedIn's new AI algorithm suggests meaningful professional connections based on career goals and industry trends."
  },
  {
    id: 7,
    title: "The Rise of Personal Branding: Why Every Professional Needs One",
    source: "Google News",
    link: "https://news.example.com/personal-branding-2026",
    date: "2026-03-19",
    summary: "Personal branding is no longer optional. 89% of hiring managers check candidates' social media presence before making decisions."
  },
  {
    id: 8,
    title: "Creator Economy Surpasses $500B Valuation",
    source: "Twitter",
    link: "https://twitter.com/creator_economy/500b",
    date: "2026-03-22",
    summary: "The global creator economy reaches half a trillion dollars, with AI tools enabling more creators to monetize their content."
  }
];

export const mockFilteredContent = [
  {
    id: 1,
    title: "5 Emerging Social Media Trends Reshaping Marketing",
    source: "Twitter",
    relevance: 95,
    virality: 88,
    usefulness: 92,
    totalScore: 91.7,
    engagementPotential: "Very High",
    recency: "Today"
  },
  {
    id: 2,
    title: "OpenAI Releases GPT-5 with Multimodal Reasoning",
    source: "Google News",
    relevance: 90,
    virality: 96,
    usefulness: 85,
    totalScore: 90.3,
    engagementPotential: "Very High",
    recency: "Yesterday"
  },
  {
    id: 3,
    title: "The Rise of Personal Branding: Why Every Professional Needs One",
    source: "Google News",
    relevance: 88,
    virality: 80,
    usefulness: 94,
    totalScore: 87.3,
    engagementPotential: "High",
    recency: "3 days ago"
  },
  {
    id: 4,
    title: "Creator Economy Surpasses $500B Valuation",
    source: "Twitter",
    relevance: 82,
    virality: 90,
    usefulness: 78,
    totalScore: 83.3,
    engagementPotential: "High",
    recency: "Today"
  },
  {
    id: 5,
    title: "Remote Work Productivity Hits All-Time High in 2026",
    source: "Reddit",
    relevance: 75,
    virality: 82,
    usefulness: 88,
    totalScore: 81.7,
    engagementPotential: "Medium",
    recency: "2 days ago"
  }
];

export const mockGeneratedPosts = [
  {
    id: 1,
    topic: "Social Media Trends",
    platform: "LinkedIn",
    content: `🚀 5 Social Media Trends You Can't Ignore in 2026:

1️⃣ Short-form video is KING — but storytelling matters more than ever
2️⃣ AI-generated content is going mainstream (yes, even your competitors are using it)
3️⃣ Community-driven marketing > influencer marketing
4️⃣ Social commerce will hit $1.2T this year
5️⃣ Authenticity beats perfection — raw, real content wins

The brands that adapt to these trends will dominate.
The ones that don't? They'll wonder what happened.

Which trend are you most excited about? 👇`,
    hashtags: "#SocialMediaMarketing #DigitalMarketing #MarketingTrends #ContentStrategy #2026Trends",
    hooks: "Pattern Interrupt + List Format",
    cta: "Comment engagement"
  },
  {
    id: 2,
    topic: "GPT-5 Launch",
    platform: "Twitter",
    content: `GPT-5 just dropped and it's a GAME CHANGER 🧵

Here's what you need to know:

→ True multimodal reasoning (text + image + audio in ONE prompt)
→ 10x faster than GPT-4o
→ Native tool use — it can browse, code, and analyze in real-time
→ Context window: 1M tokens

The AI race just shifted into overdrive.

Who's already building with it? 🔥`,
    hashtags: "#GPT5 #AI #OpenAI #ArtificialIntelligence #TechNews",
    hooks: "Breaking News + Thread",
    cta: "Retweet + Follow"
  },
  {
    id: 3,
    topic: "Personal Branding",
    platform: "Instagram",
    content: `Your personal brand is your superpower. 💫

89% of hiring managers check your socials before even reading your resume.

Here's the truth:
✨ You don't need a million followers
✨ You don't need to post every day
✨ You just need to be INTENTIONAL

Start with these 3 steps:
1. Define your unique value proposition
2. Share one insight daily from your expertise
3. Engage genuinely with your community

Your personal brand isn't about being famous.
It's about being KNOWN for something that matters.`,
    hashtags: "#PersonalBranding #CareerGrowth #LinkedInTips #ProfessionalDevelopment #BrandYourself",
    hooks: "Empowerment + Practical Tips",
    cta: "Save for later"
  },
  {
    id: 4,
    topic: "Creator Economy",
    platform: "LinkedIn",
    content: `The creator economy just hit $500 BILLION. 📈

Let that sink in.

5 years ago, "content creator" wasn't even a job title.
Today, it's one of the fastest-growing career paths globally.

What's driving this explosive growth?
• AI tools lowering the barrier to entry
• Direct monetization (no middleman needed)
• Brands shifting budgets from traditional ads to creators
• Community > audience

The message is clear:
If you're not creating, you're consuming.
And consumers don't build wealth.

Time to start creating. 🚀`,
    hashtags: "#CreatorEconomy #ContentCreation #DigitalEntrepreneur #FutureOfWork #BuildInPublic",
    hooks: "Stat Hook + Contrarian View",
    cta: "Share your thoughts"
  }
];

export const mockDesigns = [
  { id: 1, type: "IG Post", topic: "Social Media Trends", url: "cdn/img01.png", tool: "DALL·E" },
  { id: 2, type: "Quote Card", topic: "GPT-5 Launch", url: "cdn/img02.png", tool: "Canva API" },
  { id: 3, type: "Carousel", topic: "Personal Branding", url: "cdn/img03.png", tool: "Stable Diffusion" },
  { id: 4, type: "IG Post", topic: "Creator Economy", url: "cdn/img04.png", tool: "DALL·E" }
];

export const mockApprovalSheet = [
  {
    id: "001",
    topic: "Social Media Trends",
    postContent: "🚀 5 Social Media Trends You Can't Ignore in 2026...",
    imageLink: "cdn/img01.png",
    platform: "LinkedIn",
    approval: null,
    schedule: "Mon 9am"
  },
  {
    id: "002",
    topic: "GPT-5 Launch",
    postContent: "GPT-5 just dropped and it's a GAME CHANGER 🧵...",
    imageLink: "cdn/img02.png",
    platform: "Twitter",
    approval: null,
    schedule: "Mon 12pm"
  },
  {
    id: "003",
    topic: "Personal Branding",
    postContent: "Your personal brand is your superpower. 💫...",
    imageLink: "cdn/img03.png",
    platform: "Instagram",
    approval: null,
    schedule: "Tue 10am"
  },
  {
    id: "004",
    topic: "Creator Economy",
    postContent: "The creator economy just hit $500 BILLION. 📈...",
    imageLink: "cdn/img04.png",
    platform: "LinkedIn",
    approval: null,
    schedule: "Tue 2pm"
  }
];

export const mockSchedule = [
  { id: "001", topic: "Social Media Trends", platform: "LinkedIn", time: "Mon 9:00 AM", api: "LinkedIn API", status: "Queued" },
  { id: "002", topic: "GPT-5 Launch", platform: "Twitter", time: "Mon 12:00 PM", api: "Twitter API", status: "Queued" },
  { id: "003", topic: "Personal Branding", platform: "Instagram", time: "Tue 10:00 AM", api: "Meta Graph API", status: "Queued" },
  { id: "004", topic: "Creator Economy", platform: "LinkedIn", time: "Tue 2:00 PM", api: "LinkedIn API", status: "Queued" }
];

export const mockPublishResults = [
  { id: "001", topic: "Social Media Trends", platform: "LinkedIn", status: "Posted", time: "Mon 9:01 AM", success: true },
  { id: "002", topic: "GPT-5 Launch", platform: "Twitter", status: "Posted", time: "Mon 12:00 PM", success: true },
  { id: "003", topic: "Personal Branding", platform: "Instagram", status: "Failed", time: "Tue 10:02 AM", success: false },
  { id: "004", topic: "Creator Economy", platform: "LinkedIn", status: "Posted", time: "Tue 2:01 PM", success: true }
];
