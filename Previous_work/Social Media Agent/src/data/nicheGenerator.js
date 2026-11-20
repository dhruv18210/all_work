// Dynamic niche-specific content generator
// Generates full pipeline data for any industry/department

const nicheTemplates = {
  pharmacy: {
    label: "Pharmacy",
    emoji: "💊",
    sources: ["PubMed", "FDA News", "PharmacyTimes"],
    discovered: [
      { title: "FDA Approves New Gene Therapy for Rare Blood Disorder", source: "FDA News", date: "2026-03-22", summary: "The FDA has approved a groundbreaking gene therapy that could revolutionize treatment for sickle cell disease, offering a one-time cure." },
      { title: "Telepharmacy Adoption Surges 300% Post-Pandemic", source: "PharmacyTimes", date: "2026-03-21", summary: "Remote pharmacy consultations are becoming the norm, with 78% of patients preferring virtual medication reviews." },
      { title: "AI Drug Discovery Cuts Development Time by 60%", source: "PubMed", date: "2026-03-22", summary: "Machine learning models are identifying promising drug candidates in weeks instead of years, reshaping the pharmaceutical pipeline." },
      { title: "New Regulations on Pharmacy Benefit Managers Take Effect", source: "FDA News", date: "2026-03-20", summary: "Landmark PBM transparency laws aim to reduce prescription drug costs for consumers by eliminating hidden rebate structures." },
      { title: "Compounding Pharmacy Market Reaches $15B Globally", source: "PharmacyTimes", date: "2026-03-21", summary: "Personalized medicine drives demand for custom-compounded medications, especially in hormone therapy and dermatology." },
      { title: "Pharmacists Now Authorized to Prescribe Contraceptives in 30 States", source: "PubMed", date: "2026-03-22", summary: "Expanded scope of practice allows pharmacists to directly prescribe certain medications, improving healthcare access." },
      { title: "Blockchain Technology Transforms Drug Supply Chain Tracking", source: "FDA News", date: "2026-03-19", summary: "Pharmaceutical companies adopt blockchain for end-to-end drug traceability, reducing counterfeit medications by 90%." },
      { title: "Mental Health Medication Demand Hits Record High", source: "PharmacyTimes", date: "2026-03-22", summary: "Antidepressant and anti-anxiety prescriptions increase 40% year-over-year, straining pharmacy inventories nationwide." }
    ],
    posts: [
      { platform: "LinkedIn", topic: "Telepharmacy Growth", content: "🏥 Telepharmacy isn't the future — it's the NOW.\n\n300% growth since the pandemic. 78% of patients prefer virtual consultations.\n\nHere's what smart pharmacy owners are doing:\n\n1️⃣ Offering 24/7 virtual medication reviews\n2️⃣ Implementing AI-powered drug interaction checks\n3️⃣ Building patient loyalty through convenience\n4️⃣ Reducing overhead costs by 35%\n\nThe pharmacies that adapt will thrive.\nThe ones that don't? They'll lose patients to those that do.\n\nIs your pharmacy ready for the virtual shift? 👇", hashtags: "#Telepharmacy #PharmacyInnovation #HealthcareTech #DigitalHealth #Pharmacist", hooks: "Stat Hook + Urgency", cta: "Comment engagement" },
      { platform: "Instagram", topic: "AI Drug Discovery", content: "🧬 AI is rewriting the rules of drug discovery.\n\nTraditional drug development: 10-15 years\nAI-powered discovery: Under 4 years\n\nThat's a 60% reduction in development time.\n\n✨ ML models scan millions of molecular compounds\n✨ AI predicts drug efficacy before clinical trials\n✨ Personalized medicine becomes reality\n\nThe next breakthrough drug? It might be designed by an algorithm.\n\nThe future of pharmacy is here. 🚀", hashtags: "#AIinPharma #DrugDiscovery #PharmacyFuture #MedTech #Innovation", hooks: "Comparison + Stat Hook", cta: "Save for later" },
      { platform: "Twitter", topic: "Pharmacist Prescribing Rights", content: "🧵 BREAKING: Pharmacists can now prescribe contraceptives in 30 states.\n\nHere's why this matters:\n\n→ 45M women gain easier access to contraception\n→ No doctor visit required\n→ Reduces healthcare costs by up to $300/patient/year\n→ Pharmacists are the most accessible healthcare providers\n\nThis is just the beginning of expanded pharmacy scope.\n\nWhat prescribing rights should pharmacists have next? 🔥", hashtags: "#PharmacyPractice #ScopeOfPractice #WomensHealth #Healthcare #Pharmacist", hooks: "Breaking News + Thread", cta: "Retweet + Follow" },
      { platform: "LinkedIn", topic: "Drug Supply Chain", content: "📦 Counterfeit drugs kill 1 million people annually.\n\nBlockchain is changing that.\n\nPharmaceutical companies are now tracking every pill from factory to pharmacy:\n\n• Real-time verification of drug authenticity\n• Temperature monitoring throughout the supply chain\n• Automatic recalls in minutes, not weeks\n• 90% reduction in counterfeit medications\n\nThis isn't just technology — it's saving lives.\n\nEvery pharmacy should demand supply chain transparency. 💪", hashtags: "#PharmacySupplyChain #Blockchain #DrugSafety #PatientSafety #Healthcare", hooks: "Stat Hook + Mission-driven", cta: "Share your thoughts" }
    ],
    designs: [
      { type: "IG Post", topic: "Telepharmacy Growth", tool: "DALL·E" },
      { type: "Infographic", topic: "AI Drug Discovery", tool: "Canva API" },
      { type: "Quote Card", topic: "Pharmacist Rights", tool: "Stable Diffusion" },
      { type: "Carousel", topic: "Drug Supply Chain", tool: "DALL·E" }
    ]
  },

  hotel: {
    label: "Hotel & Hospitality",
    emoji: "🏨",
    sources: ["Hospitality Net", "Hotel News Now", "TripAdvisor Insights"],
    discovered: [
      { title: "AI-Powered Check-in Reduces Wait Times by 80%", source: "Hotel News Now", date: "2026-03-22", summary: "Hotels implementing facial recognition and mobile check-in see guest satisfaction scores increase by 45%." },
      { title: "Sustainable Hotels See 60% Higher Booking Rates", source: "Hospitality Net", date: "2026-03-21", summary: "Eco-certified properties outperform traditional hotels in occupancy, with Gen Z travelers prioritizing sustainability." },
      { title: "Boutique Hotel Market Grows 25% Year-Over-Year", source: "TripAdvisor Insights", date: "2026-03-22", summary: "Unique, experience-driven accommodations dominate traveler preferences over large chain hotels." },
      { title: "Robot Concierges Now Serve 500+ Hotels Worldwide", source: "Hotel News Now", date: "2026-03-20", summary: "AI-powered robots handle room service delivery, luggage transport, and guest inquiries 24/7." },
      { title: "Direct Booking Strategies Save Hotels $2B in OTA Commissions", source: "Hospitality Net", date: "2026-03-21", summary: "Hotels investing in loyalty programs and direct booking perks reduce dependency on third-party platforms." },
      { title: "Wellness Tourism Drives $900B Market Opportunity", source: "TripAdvisor Insights", date: "2026-03-22", summary: "Hotels adding spa, meditation, and fitness packages see 35% higher average daily rates." },
      { title: "Smart Room Technology Becomes Standard in Luxury Hotels", source: "Hotel News Now", date: "2026-03-19", summary: "Voice-controlled rooms, IoT sensors, and personalized climate settings are the new baseline for 5-star properties." },
      { title: "Hotel Staff Shortage Crisis: Solutions That Work", source: "Hospitality Net", date: "2026-03-22", summary: "Innovative staffing models combining AI automation with competitive wages are solving the hospitality labor shortage." }
    ],
    posts: [
      { platform: "LinkedIn", topic: "Guest Experience Tech", content: "🏨 Your guests judge your hotel in the first 3 minutes.\n\nAI-powered check-in reduces wait times by 80%.\nGuest satisfaction? Up 45%.\n\nHere's what leading hotels are implementing:\n\n1️⃣ Mobile check-in before arrival\n2️⃣ Facial recognition for keyless room access\n3️⃣ AI concierge for instant recommendations\n4️⃣ Smart room controls via voice commands\n5️⃣ Personalized welcome based on guest history\n\nThe hotel that makes check-in seamless wins the review.\nAnd reviews win the bookings.\n\nWhat guest tech has impressed you most? 👇", hashtags: "#HotelTech #GuestExperience #Hospitality #HotelManagement #Innovation", hooks: "Stat Hook + List Format", cta: "Comment engagement" },
      { platform: "Instagram", topic: "Sustainable Hotels", content: "🌿 Sustainability isn't a trend — it's the future of hospitality.\n\nEco-certified hotels see 60% higher booking rates.\n\nWhat guests really want:\n✨ Refillable amenity dispensers (not plastic bottles)\n✨ Locally-sourced breakfast menus\n✨ Energy-efficient smart rooms\n✨ Carbon offset programs for stays\n✨ Linen reuse programs that actually work\n\nGoing green doesn't cost more.\nIt earns more. 📈\n\nYour hotel's sustainability story is your strongest marketing tool.", hashtags: "#SustainableHotel #EcoTravel #GreenHospitality #HotelDesign #Sustainability", hooks: "Empowerment + Practical Tips", cta: "Save for later" },
      { platform: "Twitter", topic: "Boutique Hotels", content: "🧵 Boutique hotels are CRUSHING big chains. Here's why:\n\n→ 25% YoY growth vs 3% for chains\n→ Guests pay 40% premium for unique experiences\n→ Instagram-worthy design = free marketing\n→ Local partnerships create authentic stays\n→ Personal touches > loyalty points\n\nThe lesson? Travelers don't want a room.\nThey want a STORY.\n\nWhich boutique hotel blew your mind? 🏨", hashtags: "#BoutiqueHotel #TravelTrends #Hospitality #HotelDesign #TravelExperience", hooks: "Contrarian View + Data", cta: "Retweet + Reply" },
      { platform: "LinkedIn", topic: "Direct Bookings", content: "💰 Hotels paid $18B in OTA commissions last year.\n\nThe smart ones are fighting back.\n\nDirect booking strategies that actually work:\n\n• Best rate guarantee on hotel website\n• Exclusive perks (free upgrade, late checkout)\n• Loyalty points worth 3x OTA rewards\n• Retargeting campaigns for website visitors\n• Post-stay emails with return offers\n\nResult? Hotels save 15-25% on distribution costs.\n\nThe future belongs to hotels that own their guest relationship. 🎯", hashtags: "#DirectBooking #HotelMarketing #RevenueManagement #Hospitality #HotelBusiness", hooks: "Pain Point + Solutions", cta: "Share your experience" }
    ],
    designs: [
      { type: "IG Post", topic: "Guest Experience Tech", tool: "DALL·E" },
      { type: "Carousel", topic: "Sustainable Hotels", tool: "Canva API" },
      { type: "Quote Card", topic: "Boutique Hotels", tool: "Stable Diffusion" },
      { type: "IG Post", topic: "Direct Bookings", tool: "DALL·E" }
    ]
  },

  restaurant: {
    label: "Restaurant & Food",
    emoji: "🍽️",
    sources: ["Restaurant Business", "Food & Wine", "Nation's Restaurant News"],
    discovered: [
      { title: "Ghost Kitchens Generate $80B in Revenue Globally", source: "Restaurant Business", date: "2026-03-22", summary: "Delivery-only restaurants continue to boom, with cloud kitchen operators expanding into suburban markets." },
      { title: "AI Menu Optimization Increases Restaurant Revenue by 22%", source: "Nation's Restaurant News", date: "2026-03-21", summary: "Machine learning algorithms analyze customer preferences and seasonal data to create high-margin menu configurations." },
      { title: "Plant-Based Menu Items Now Standard at 70% of Restaurants", source: "Food & Wine", date: "2026-03-22", summary: "Consumer demand for plant-forward dining drives restaurants to expand vegetarian and vegan offerings." },
      { title: "QR Code Ordering Reduces Labor Costs by 30%", source: "Restaurant Business", date: "2026-03-20", summary: "Digital ordering systems improve efficiency and order accuracy while addressing the ongoing staffing shortage." },
      { title: "Farm-to-Table Movement Reaches Fast Casual Segment", source: "Food & Wine", date: "2026-03-21", summary: "Fast casual chains are partnering with local farms, proving that fresh ingredients work at scale." },
      { title: "Restaurant Social Media Marketing: ROI Hits 400%", source: "Nation's Restaurant News", date: "2026-03-22", summary: "Restaurants investing in TikTok and Instagram content see 4x return on marketing spend compared to traditional advertising." },
      { title: "Robotic Kitchen Assistants Deployed in 1,000+ Locations", source: "Restaurant Business", date: "2026-03-19", summary: "Automated cooking systems handle prep work and consistent dishes while human chefs focus on creativity." },
      { title: "Experiential Dining Drives 50% Higher Ticket Averages", source: "Food & Wine", date: "2026-03-22", summary: "Immersive dining concepts combining food, entertainment, and storytelling command premium pricing." }
    ],
    posts: [
      { platform: "LinkedIn", topic: "Restaurant Technology", content: "🍽️ The restaurants winning in 2026 aren't just cooking great food.\n\nThey're running tech companies that serve dinner.\n\n5 technologies transforming restaurants:\n\n1️⃣ AI menu optimization → +22% revenue\n2️⃣ QR code ordering → -30% labor costs\n3️⃣ Kitchen display systems → 95% order accuracy\n4️⃣ Predictive inventory → 40% less food waste\n5️⃣ CRM-powered marketing → 400% ROI\n\nThe tech stack matters as much as the recipe book.\n\nWhat restaurant tech has changed your business? 👇", hashtags: "#RestaurantTech #FoodBusiness #RestaurantManagement #FoodIndustry #Innovation", hooks: "Reframe + List Format", cta: "Comment engagement" },
      { platform: "Instagram", topic: "Plant-Based Movement", content: "🌱 70% of restaurants now offer plant-based options.\n\nThis isn't a fad. This is the new normal.\n\nWhy it matters for YOUR restaurant:\n✨ Attracts the 42% of consumers 'flexitarian' diners\n✨ Plant-based dishes have 15% higher margins\n✨ Instagram-worthy presentations drive free marketing\n✨ Appeal to corporate catering (ESG requirements)\n\nYou don't need to be a vegan restaurant.\nYou just need to not ignore 42% of your potential customers.", hashtags: "#PlantBased #RestaurantTrends #FoodIndustry #VeganFood #MenuDesign", hooks: "Stat Hook + Practical", cta: "Save for later" },
      { platform: "Twitter", topic: "Ghost Kitchens", content: "🧵 Ghost kitchens are an $80B industry. Here's the playbook:\n\n→ Launch a delivery-only brand in 2 weeks (not 6 months)\n→ Test menus without risking your main brand\n→ Share kitchen space = 60% lower overhead\n→ Data-driven menus optimize for your delivery zone\n→ Multiple brands, one kitchen\n\nThe smartest restaurant owners run 3-4 virtual brands.\n\nAre ghost kitchens the future or a bubble? 💭", hashtags: "#GhostKitchen #CloudKitchen #FoodDelivery #RestaurantBusiness #FoodTech", hooks: "Data + Debate", cta: "Retweet + Reply" },
      { platform: "LinkedIn", topic: "Experiential Dining", content: "🎭 A meal is no longer enough. Guests want an EXPERIENCE.\n\nExperiential dining drives 50% higher ticket averages.\n\nWhat's working right now:\n\n• Chef's table with live storytelling\n• Interactive tasting menus with AR pairings\n• Themed pop-up dinners (sold out in hours)\n• Open kitchen theater\n• Personalized menu cards for special occasions\n\nRestaurants selling experiences don't compete on price.\nThey compete on memories.\n\nAnd memories are worth a premium. ✨", hashtags: "#ExperientialDining #RestaurantMarketing #FoodExperience #Hospitality #ChefLife", hooks: "Insight + Examples", cta: "Share your best dining experience" }
    ],
    designs: [
      { type: "IG Post", topic: "Restaurant Tech", tool: "DALL·E" },
      { type: "Carousel", topic: "Plant-Based Movement", tool: "Canva API" },
      { type: "Infographic", topic: "Ghost Kitchens", tool: "Stable Diffusion" },
      { type: "IG Post", topic: "Experiential Dining", tool: "DALL·E" }
    ]
  },

  fitness: {
    label: "Fitness & Wellness",
    emoji: "💪",
    sources: ["ACSM Health", "Men's Health", "Fitness Business"],
    discovered: [
      { title: "AI Personal Trainers Gain 10M Users in 2026", source: "ACSM Health", date: "2026-03-22", summary: "AI-powered fitness apps provide personalized workout plans and real-time form correction through phone cameras." },
      { title: "Hybrid Gym Memberships Now 65% of All Sign-Ups", source: "Fitness Business", date: "2026-03-21", summary: "Members want both in-gym and virtual class access, pushing gyms to invest in digital infrastructure." },
      { title: "Wearable Tech Drives 40% Better Workout Adherence", source: "Men's Health", date: "2026-03-22", summary: "Smartwatches and fitness rings with AI coaching features help users stick to exercise routines long-term." },
      { title: "Recovery & Wellness Services Grow 200% at Gyms", source: "Fitness Business", date: "2026-03-20", summary: "Cryotherapy, red light therapy, and meditation rooms become major revenue drivers for fitness facilities." },
      { title: "Corporate Wellness Programs Worth $100B by 2027", source: "ACSM Health", date: "2026-03-21", summary: "Companies investing in employee fitness see 25% reduction in healthcare costs and 18% productivity gains." },
      { title: "Women's Strength Training Participation Up 85%", source: "Men's Health", date: "2026-03-22", summary: "The stigma around women lifting weights is gone, driving growth in strength-focused gym programs." },
      { title: "Micro-Gym Model Proves More Profitable Than Big Box", source: "Fitness Business", date: "2026-03-19", summary: "Small boutique gyms with 1,500-3,000 sq ft are generating higher revenue per square foot than large facilities." },
      { title: "Sleep Optimization Becomes Core Fitness Pillar", source: "ACSM Health", date: "2026-03-22", summary: "Fitness coaches now prescribe sleep protocols alongside exercise, recognizing recovery as foundational to results." }
    ],
    posts: [
      { platform: "LinkedIn", topic: "AI Fitness Coaching", content: "🤖 AI personal trainers now have 10M+ users.\n\nAnd here's the thing — they're not replacing human trainers.\nThey're making fitness accessible to EVERYONE.\n\nWhat AI fitness coaching offers:\n\n1️⃣ Personalized plans that adapt in real-time\n2️⃣ Form correction through your phone camera\n3️⃣ Progress tracking with predictive analytics\n4️⃣ 24/7 availability at $10/month vs $100/session\n5️⃣ Zero intimidation factor for beginners\n\nSmart trainers are USING AI to scale their impact.\nScared trainers are fighting it.\n\nWhich side are you on? 👇", hashtags: "#FitnessTech #AICoaching #PersonalTraining #FitnessIndustry #GymBusiness", hooks: "Contrarian + List", cta: "Comment engagement" },
      { platform: "Instagram", topic: "Recovery & Wellness", content: "❄️ The gym of 2026 isn't just about lifting.\n\nRecovery services grew 200% at gyms this year.\n\nHere's what your members actually want:\n✨ Cryotherapy chambers (-110°C for 3 minutes)\n✨ Red light therapy beds (skin + muscle recovery)\n✨ Meditation & breathwork rooms\n✨ Infrared saunas\n✨ Compression therapy lounges\n\nRecovery isn't a luxury anymore.\nIt's the reason members stay. 💎\n\nWhich recovery modality is your favorite?", hashtags: "#Recovery #Wellness #GymLife #FitnessRecovery #ColdPlunge", hooks: "Reframe + Visual", cta: "Save + Comment" },
      { platform: "Twitter", topic: "Hybrid Gym Model", content: "🧵 65% of gym sign-ups are now HYBRID memberships.\n\nHere's what winning gyms are doing:\n\n→ Live-stream classes with real instructors\n→ On-demand library of 500+ workouts\n→ In-app booking for in-person sessions\n→ Wearable integration for tracking everywhere\n→ Community challenges (virtual + in-gym)\n\nMembers don't want either/or.\nThey want BOTH. 🏋️‍♀️📱\n\nIs your gym ready?", hashtags: "#HybridGym #FitnessBusiness #GymOwner #DigitalFitness #FitTech", hooks: "Data + Actionable", cta: "Retweet + Reply" },
      { platform: "LinkedIn", topic: "Women in Strength Training", content: "💪 Women's strength training is up 85%.\n\nLet that number sink in.\n\nThe old narrative: \"Lifting makes women bulky.\"\nThe truth: Strength training is the #1 way to:\n\n• Build bone density (critical for long-term health)\n• Boost metabolism by 15%\n• Improve mental health and confidence\n• Reduce injury risk by 40%\n• Live longer and more independently\n\nGyms that create welcoming strength areas for women aren't being \"inclusive.\"\n\nThey're being SMART. 📈\n\nBecause that 85% growth? It's just getting started.", hashtags: "#WomenInFitness #StrengthTraining #GymCulture #FitnessIndustry #WomenWhoLift", hooks: "Stat + Myth-busting", cta: "Share your story" }
    ],
    designs: [
      { type: "IG Post", topic: "AI Fitness Coaching", tool: "DALL·E" },
      { type: "Carousel", topic: "Recovery & Wellness", tool: "Canva API" },
      { type: "Quote Card", topic: "Hybrid Gym Model", tool: "Stable Diffusion" },
      { type: "IG Post", topic: "Women in Strength", tool: "DALL·E" }
    ]
  },

  education: {
    label: "Education & EdTech",
    emoji: "🎓",
    sources: ["EdSurge", "THE", "EdTech Magazine"],
    discovered: [
      { title: "AI Tutors Improve Student Outcomes by 35%", source: "EdSurge", date: "2026-03-22", summary: "Personalized AI tutoring adapts to each student's pace and learning style, showing significant improvement in test scores." },
      { title: "Micro-Credentials Replace Traditional Degrees for 40% of Employers", source: "THE", date: "2026-03-21", summary: "Skills-based hiring accelerates as employers value certifications and portfolio work over four-year degrees." },
      { title: "VR Classrooms Deployed in 10,000+ Schools", source: "EdTech Magazine", date: "2026-03-22", summary: "Virtual reality brings immersive learning experiences to subjects like history, science, and geography." },
      { title: "Teacher AI Assistants Save 10 Hours Per Week", source: "EdSurge", date: "2026-03-20", summary: "AI tools handle grading, lesson planning, and progress reporting, freeing teachers for direct student interaction." },
      { title: "Online Learning Market Reaches $400B", source: "THE", date: "2026-03-21", summary: "Post-pandemic digital learning continues to grow, with professional development courses leading demand." },
      { title: "Gamification Increases Student Engagement by 60%", source: "EdTech Magazine", date: "2026-03-22", summary: "Game mechanics in educational platforms (points, badges, leaderboards) dramatically improve participation rates." },
      { title: "Social-Emotional Learning Programs Show 27% ROI", source: "EdSurge", date: "2026-03-19", summary: "Schools investing in SEL programs see improved attendance, reduced disciplinary issues, and higher academic performance." },
      { title: "Coding Becomes Mandatory in 25 Countries' Curricula", source: "THE", date: "2026-03-22", summary: "Programming education starts as early as age 6, with Python and block-based coding leading school adoption." }
    ],
    posts: [
      { platform: "LinkedIn", topic: "AI in Education", content: "🎓 AI tutors improve student outcomes by 35%.\n\nBut here's what most people miss:\n\nAI doesn't replace teachers — it gives them superpowers.\n\n📚 AI handles:\n• Personalized practice problems\n• Instant feedback on assignments\n• Progress tracking per student\n• Identifying learning gaps early\n\n👩‍🏫 Teachers focus on:\n• Mentoring and motivation\n• Creative problem-solving\n• Social-emotional development\n• Human connection\n\nThe best classrooms of 2026 use AI AND great teachers.\n\nNot one or the other. 🤝", hashtags: "#EdTech #AIinEducation #Teaching #FutureOfLearning #Education", hooks: "Stat + Reframe", cta: "Comment engagement" },
      { platform: "Instagram", topic: "Micro-Credentials", content: "📜 The 4-year degree isn't dead.\nBut it's no longer the ONLY path.\n\n40% of employers now accept micro-credentials.\n\nHere's what's changing:\n✨ 3-month bootcamps → job-ready skills\n✨ Industry certifications > generic degrees\n✨ Portfolio work speaks louder than GPA\n✨ Stackable credentials = lifelong learning\n✨ $500 certification vs $100K degree\n\nThe future of education is:\nLearn what you need, when you need it.\n\nHave you earned a micro-credential? Share below! 👇", hashtags: "#MicroCredentials #SkillsBasedHiring #EdTech #OnlineLearning #CareerGrowth", hooks: "Contrarian + List", cta: "Save + Comment" },
      { platform: "Twitter", topic: "VR Classrooms", content: "🧵 10,000 schools now have VR classrooms.\n\nImagine learning history by WALKING through ancient Rome.\n\n→ Students retain 75% more in VR vs textbooks\n→ Science labs without expensive equipment\n→ Virtual field trips to anywhere on Earth\n→ Special needs students access experiences safely\n→ Cost: $200/headset (down from $1,000 in 2022)\n\nVR in education isn't sci-fi anymore.\nIt's happening NOW. 🌍", hashtags: "#VREducation #EdTech #FutureOfLearning #VirtualReality #STEM", hooks: "Imagination + Data", cta: "Retweet + Follow" },
      { platform: "LinkedIn", topic: "Teacher AI Assistants", content: "⏰ Teachers spend 50% of their time on NON-TEACHING tasks.\n\nGrading. Paperwork. Reporting. Lesson planning.\n\nAI teaching assistants save 10 hours per week.\n\nThat's 10 hours BACK for what matters:\n• One-on-one student mentoring\n• Creative lesson design\n• Professional development\n• Actually going home on time\n\nTeacher burnout is at all-time highs.\nAI isn't a luxury — it's a necessity.\n\nEvery school should invest in AI tools for teachers. Period. 💪", hashtags: "#TeacherLife #AIinSchools #EdTech #TeacherBurnout #Education", hooks: "Pain Point + Solution", cta: "Share if you agree" }
    ],
    designs: [
      { type: "IG Post", topic: "AI in Education", tool: "DALL·E" },
      { type: "Infographic", topic: "Micro-Credentials", tool: "Canva API" },
      { type: "Carousel", topic: "VR Classrooms", tool: "Stable Diffusion" },
      { type: "Quote Card", topic: "Teacher AI Tools", tool: "DALL·E" }
    ]
  },

  realestate: {
    label: "Real Estate",
    emoji: "🏠",
    sources: ["Zillow Research", "Realtor.com", "Inman News"],
    discovered: [
      { title: "Virtual Tours Now Required for 80% of Listings", source: "Zillow Research", date: "2026-03-22", summary: "Buyers expect 3D walkthrough experiences before scheduling in-person visits, making virtual staging essential." },
      { title: "AI Property Valuation Accuracy Reaches 97%", source: "Inman News", date: "2026-03-21", summary: "Machine learning models analyzing comparable sales, market trends, and property features rival professional appraisers." },
      { title: "First-Time Buyers Represent 45% of Market Despite Rates", source: "Realtor.com", date: "2026-03-22", summary: "Creative financing options and down payment assistance programs open doors for millennial and Gen Z buyers." },
      { title: "Commercial Real Estate Pivots to Mixed-Use Developments", source: "Zillow Research", date: "2026-03-20", summary: "Former office buildings transform into live-work-play communities combining residential, retail, and coworking spaces." },
      { title: "Social Media Marketing Generates 52% of Real Estate Leads", source: "Inman News", date: "2026-03-21", summary: "Agents who post consistently on Instagram and TikTok generate more leads than traditional advertising methods." },
      { title: "Smart Home Features Add 5-8% to Property Values", source: "Realtor.com", date: "2026-03-22", summary: "Homes with smart thermostats, security systems, and automated lighting command premium prices from tech-savvy buyers." },
      { title: "Blockchain-Based Property Transactions Cut Closing Time 70%", source: "Zillow Research", date: "2026-03-19", summary: "Smart contracts automate title searches, escrow, and documentation, reducing the average closing from 45 to 14 days." },
      { title: "Suburban Migration Reverses: Urban Cores See Renaissance", source: "Inman News", date: "2026-03-22", summary: "Downtown areas offering walkability, culture, and remote work hubs attract young professionals back to city living." }
    ],
    posts: [
      { platform: "LinkedIn", topic: "Social Media for Agents", content: "📱 52% of real estate leads now come from social media.\n\nThe top-producing agents aren't cold calling anymore.\nThey're creating content.\n\nHere's the winning formula:\n\n1️⃣ Market update videos (weekly, 60 seconds)\n2️⃣ Before/after staging transformations\n3️⃣ Neighborhood spotlight guides\n4️⃣ First-time buyer education series\n5️⃣ Behind-the-scenes of closings\n\nConsistency > perfection.\nPost 4x/week and leads will come to YOU.\n\nWhat's your best-performing content type? 👇", hashtags: "#RealEstateMarketing #RealtorLife #SocialMediaMarketing #RealEstateAgent #LeadGeneration", hooks: "Stat + Action Plan", cta: "Comment engagement" },
      { platform: "Instagram", topic: "Virtual Tours", content: "🏠 80% of buyers won't visit a home without a virtual tour first.\n\nIf your listings don't have 3D tours, you're losing buyers.\n\nThe virtual tour checklist:\n✨ Matterport 3D scan (the gold standard)\n✨ Drone footage for curb appeal\n✨ Virtual staging for vacant homes\n✨ Floor plan with room dimensions\n✨ Neighborhood walk-through video\n\nCost: $200-400 per listing\nROI: Sell 31% faster with 49% fewer price reductions\n\nVirtual tours aren't optional anymore. They're expected.", hashtags: "#VirtualTour #RealEstateTech #HomeForSale #RealEstatePhotography #ListingAgent", hooks: "Stat + Checklist", cta: "Save for later" },
      { platform: "Twitter", topic: "AI Property Valuation", content: "🧵 AI property valuations are now 97% accurate.\n\nHere's what this means for real estate:\n\n→ Instant pricing for sellers (no 2-week wait)\n→ Buyers can verify if a home is fairly priced\n→ Appraisal disputes drop by 60%\n→ Investors analyze 1,000 properties in minutes\n→ Agents win listings with data-backed CMAs\n\nThe days of \"I think it's worth...\" are over.\n\nData wins. Every time. 📊", hashtags: "#PropTech #RealEstateAI #PropertyValuation #RealEstateInvesting #HomeValue", hooks: "Disruption + Thread", cta: "Retweet + Follow" },
      { platform: "LinkedIn", topic: "Smart Homes", content: "🏡 Smart home features add 5-8% to property values.\n\nThat's $15K-$25K on a $300K home.\n\nThe ROI-positive upgrades sellers should make:\n\n• Smart thermostat ($250) → Saves $150/year in energy\n• Video doorbell ($200) → #1 requested security feature\n• Smart lighting ($500) → Automated ambiance + energy savings\n• Smart lock ($300) → Keyless entry appeals to 78% of buyers\n• Leak detector ($100) → Prevents $10K+ water damage claims\n\nTotal investment: ~$1,350\nValue added: $15,000+\n\nThe math speaks for itself. 💰", hashtags: "#SmartHome #RealEstateTips #HomeImprovement #PropertyValue #HomeAutomation", hooks: "ROI Focus + Specifics", cta: "Share with a seller" }
    ],
    designs: [
      { type: "IG Post", topic: "Social Media Leads", tool: "DALL·E" },
      { type: "Carousel", topic: "Virtual Tours", tool: "Canva API" },
      { type: "Quote Card", topic: "AI Valuation", tool: "Stable Diffusion" },
      { type: "Infographic", topic: "Smart Homes", tool: "DALL·E" }
    ]
  }
};

// Generate a generic template for any custom niche
function generateCustomNiche(nicheName) {
  const name = nicheName.trim();
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  return {
    label: capitalized,
    emoji: "🚀",
    sources: [`${capitalized} Daily`, `${capitalized} Insider`, `Industry Today`],
    discovered: [
      { title: `AI Transforms ${capitalized} Industry Operations`, source: `${capitalized} Daily`, date: "2026-03-22", summary: `Artificial intelligence adoption in ${name} leads to 40% efficiency gains across major operations.` },
      { title: `${capitalized} Market Sees Record Growth in 2026`, source: `Industry Today`, date: "2026-03-21", summary: `The global ${name} sector reaches new heights with innovative business models and digital transformation.` },
      { title: `Sustainability Trends Reshape ${capitalized} Sector`, source: `${capitalized} Insider`, date: "2026-03-22", summary: `Green practices and ESG compliance become baseline requirements for ${name} businesses.` },
      { title: `Customer Experience Revolution in ${capitalized}`, source: `${capitalized} Daily`, date: "2026-03-20", summary: `Personalization and digital-first strategies redefine customer expectations in the ${name} industry.` },
      { title: `Top 5 ${capitalized} Innovations Changing the Game`, source: `Industry Today`, date: "2026-03-21", summary: `From automation to AI, five breakthrough technologies are disrupting traditional ${name} workflows.` },
      { title: `Remote & Hybrid Models Gain Traction in ${capitalized}`, source: `${capitalized} Insider`, date: "2026-03-22", summary: `Flexible work arrangements and digital tools enable ${name} professionals to work more efficiently.` },
      { title: `${capitalized} Professionals: Skills That Matter in 2026`, source: `${capitalized} Daily`, date: "2026-03-19", summary: `Data literacy, AI fluency, and adaptability top the list of in-demand skills for ${name} careers.` },
      { title: `Social Media Marketing ROI Soars for ${capitalized} Brands`, source: `Industry Today`, date: "2026-03-22", summary: `${capitalized} businesses using content marketing see 3x higher engagement and lead generation.` }
    ],
    posts: [
      { platform: "LinkedIn", topic: `AI in ${capitalized}`, content: `🚀 AI is revolutionizing the ${name} industry.\n\nCompanies that adopt AI see 40% efficiency gains.\n\nHere's how forward-thinking ${name} leaders are using it:\n\n1️⃣ Automating repetitive workflows\n2️⃣ Predictive analytics for better decisions\n3️⃣ Personalized customer experiences\n4️⃣ Cost reduction through smart optimization\n5️⃣ Real-time data insights\n\nThe ${name} businesses that embrace AI today will lead tomorrow.\n\nThe ones that don't? They'll be playing catch-up.\n\nWhat AI tools are you using in ${name}? 👇`, hashtags: `#${capitalized} #AI #Innovation #DigitalTransformation #Industry`, hooks: "Stat Hook + List", cta: "Comment engagement" },
      { platform: "Instagram", topic: `${capitalized} Trends`, content: `✨ The ${name} industry is changing FAST.\n\nTop trends you need to know:\n\n🔹 Digital-first customer experiences\n🔹 Sustainability as a core value\n🔹 AI-powered operations\n🔹 Community-driven marketing\n🔹 Skills-based team building\n\nThe companies adapting to these trends are growing 3x faster.\n\nDon't get left behind. 💡\n\nWhich trend excites you most?`, hashtags: `#${capitalized}Trends #Industry #Growth #Innovation #Business`, hooks: "Urgency + Visual List", cta: "Save for later" },
      { platform: "Twitter", topic: `${capitalized} Growth`, content: `🧵 The ${name} industry is booming in 2026.\n\nHere's what's driving the growth:\n\n→ Digital transformation accelerating\n→ AI & automation reducing costs\n→ Customer expectations at all-time high\n→ Sustainability driving premium pricing\n→ Social media ROI at 3x\n\nThe opportunity has never been bigger.\n\nAre you positioned to capture it? 🎯`, hashtags: `#${capitalized} #BusinessGrowth #Trends #Opportunity #Strategy`, hooks: "Thread + Data", cta: "Retweet + Reply" },
      { platform: "LinkedIn", topic: `${capitalized} Marketing`, content: `📈 ${capitalized} brands using content marketing see 3x higher engagement.\n\nThe playbook that works:\n\n• Share industry insights weekly\n• Showcase behind-the-scenes content\n• Highlight customer success stories\n• Educate your audience (not just sell)\n• Be consistent — 4 posts/week minimum\n\nThe best marketing doesn't feel like marketing.\nIt feels like VALUE.\n\nStart creating content today. Your future customers are watching. 👀`, hashtags: `#${capitalized}Marketing #ContentMarketing #BrandBuilding #SocialMedia #Growth`, hooks: "Stat + Practical Guide", cta: "Share your strategy" }
    ],
    designs: [
      { type: "IG Post", topic: `AI in ${capitalized}`, tool: "DALL·E" },
      { type: "Carousel", topic: `${capitalized} Trends`, tool: "Canva API" },
      { type: "Infographic", topic: `${capitalized} Growth`, tool: "Stable Diffusion" },
      { type: "Quote Card", topic: `${capitalized} Marketing`, tool: "DALL·E" }
    ]
  };
}

// Resolve a niche by name — uses templates if available, else generates custom
function resolveNiche(nicheName) {
  const key = nicheName.toLowerCase().replace(/[^a-z]/g, '');
  // Check aliases
  const aliases = {
    pharmacy: 'pharmacy', pharma: 'pharmacy', pharmaceutical: 'pharmacy', drugstore: 'pharmacy', medical: 'pharmacy',
    hotel: 'hotel', hospitality: 'hotel', resort: 'hotel', motel: 'hotel', lodge: 'hotel', accommodation: 'hotel',
    restaurant: 'restaurant', food: 'restaurant', cafe: 'restaurant', dining: 'restaurant', catering: 'restaurant', bakery: 'restaurant',
    fitness: 'fitness', gym: 'fitness', wellness: 'fitness', health: 'fitness', yoga: 'fitness', exercise: 'fitness',
    education: 'education', edtech: 'education', school: 'education', university: 'education', teaching: 'education', learning: 'education',
    realestate: 'realestate', property: 'realestate', housing: 'realestate', realtor: 'realestate', real: 'realestate'
  };

  const resolved = aliases[key] || null;
  if (resolved && nicheTemplates[resolved]) {
    return nicheTemplates[resolved];
  }
  return generateCustomNiche(nicheName);
}

// Generate full pipeline data for a niche
export function generateNicheData(nicheName) {
  const niche = resolveNiche(nicheName);

  const discovered = niche.discovered.map((item, i) => ({
    id: i + 1,
    title: item.title,
    source: item.source,
    link: `https://${item.source.toLowerCase().replace(/\s+/g, '')}.com/article-${i + 1}`,
    date: item.date,
    summary: item.summary
  }));

  const filtered = discovered.slice(0, 5).map((item, i) => ({
    id: i + 1,
    title: item.title,
    source: item.source,
    relevance: Math.floor(Math.random() * 15) + 80,
    virality: Math.floor(Math.random() * 20) + 75,
    usefulness: Math.floor(Math.random() * 15) + 78,
    totalScore: 0,
    engagementPotential: i < 2 ? "Very High" : i < 4 ? "High" : "Medium",
    recency: i === 0 ? "Today" : i === 1 ? "Yesterday" : `${i + 1} days ago`
  }));
  // Compute total scores
  filtered.forEach(f => { f.totalScore = parseFloat(((f.relevance + f.virality + f.usefulness) / 3).toFixed(1)); });
  // Sort by score
  filtered.sort((a, b) => b.totalScore - a.totalScore);

  const posts = niche.posts.map((p, i) => ({
    id: i + 1,
    topic: p.topic,
    platform: p.platform,
    content: p.content,
    hashtags: p.hashtags,
    hooks: p.hooks,
    cta: p.cta
  }));

  const designs = niche.designs.map((d, i) => ({
    id: i + 1,
    type: d.type,
    topic: d.topic,
    url: `cdn/${niche.label.toLowerCase().replace(/\s+/g, '-')}-img${String(i + 1).padStart(2, '0')}.png`,
    tool: d.tool
  }));

  const approvalSheet = posts.map((p, i) => ({
    id: String(i + 1).padStart(3, '0'),
    topic: p.topic,
    postContent: p.content.substring(0, 60) + '...',
    imageLink: designs[i] ? designs[i].url : `cdn/img${String(i + 1).padStart(2, '0')}.png`,
    platform: p.platform,
    approval: null,
    schedule: ['Mon 9am', 'Mon 12pm', 'Tue 10am', 'Tue 2pm'][i] || 'Wed 9am'
  }));

  const apiMap = { LinkedIn: 'LinkedIn API', Twitter: 'Twitter API', Instagram: 'Meta Graph API', Facebook: 'Meta Graph API' };
  const schedule = approvalSheet.map(a => ({
    id: a.id,
    topic: a.topic,
    platform: a.platform,
    time: a.schedule.replace('am', ':00 AM').replace('pm', ':00 PM'),
    api: apiMap[a.platform] || 'REST API',
    status: 'Queued'
  }));

  const publishResults = schedule.map((s, i) => ({
    id: s.id,
    topic: s.topic,
    platform: s.platform,
    status: i === 2 ? 'Failed' : 'Posted',
    time: s.time.replace(':00', ':01'),
    success: i !== 2
  }));

  return {
    niche,
    discovered,
    filtered,
    posts,
    designs,
    approvalSheet,
    schedule,
    publishResults
  };
}

// Export available preset niches
export const presetNiches = [
  { key: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { key: 'hotel', label: 'Hotel', emoji: '🏨' },
  { key: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { key: 'fitness', label: 'Fitness', emoji: '💪' },
  { key: 'education', label: 'Education', emoji: '🎓' },
  { key: 'realestate', label: 'Real Estate', emoji: '🏠' }
];
