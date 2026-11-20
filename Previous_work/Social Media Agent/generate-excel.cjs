const XLSX = require('xlsx');
const path = require('path');

// Create workbook
const wb = XLSX.utils.book_new();

// ─── Sheet 1: Workflow Overview ───
const overviewData = [
  ['Social Media Agent — Full Workflow'],
  [''],
  ['Stage', 'Agent Name', 'Description', 'Inputs', 'Outputs', 'APIs / Tools', 'Status'],
  [1, 'Content Discovery Agent', 'Discovers trending content from multiple sources', 'Niche/Topic, Keywords, Sources', 'Title | Source | Link | Date | Summary', 'Google News, Twitter, Reddit', 'Pending'],
  [2, 'Content Filtering Agent', 'Deduplicates and scores content by relevance, virality, usefulness', 'Discovered content', 'Top 10-20 filtered posts (ranked)', 'Dedup, Scoring Algorithm, Ranking', 'Pending'],
  [3, 'Content Generation Agent (LLM)', 'Rewrites content for each social platform with hooks, hashtags, CTA', 'Filtered posts', 'Post text + Platform + Hashtags', 'OpenAI GPT, Claude, LLM API', 'Pending'],
  [4, 'Design Generation Agent', 'Creates visual assets — IG posts, carousels, quote images', 'Generated posts', 'Image URLs (cdn/imgXX.png)', 'DALL·E, Stable Diffusion, Canva API', 'Pending'],
  [5, 'Approval Sheet (Human-in-the-Loop)', 'User reviews posts, sets Approval = Yes/No, sets Schedule Time', 'Posts + Image URLs', 'Approved posts with schedule times', 'Excel / Google Sheets', 'Pending'],
  [6, 'Scheduling Agent', 'Queues approved posts for publishing at scheduled times', 'Approved posts', 'Queued posts + Scheduled time', 'Buffer API, Hootsuite API, Meta Graph API, LinkedIn API', 'Pending'],
  [7, 'Publishing Agent', 'Posts content + image to platforms, confirms success/failure', 'Scheduled posts', 'Status → Posted / Failed', 'LinkedIn API, Instagram API, Twitter API, Facebook API', 'Pending'],
];
const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
wsOverview['!cols'] = [
  { wch: 8 }, { wch: 38 }, { wch: 55 }, { wch: 30 }, { wch: 35 }, { wch: 45 }, { wch: 10 }
];
wsOverview['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
XLSX.utils.book_append_sheet(wb, wsOverview, 'Workflow Overview');

// ─── Sheet 2: Content Discovery ───
const discoveryData = [
  ['Agent 1 — Content Discovery'],
  [''],
  ['ID', 'Title', 'Source', 'Link', 'Date', 'Summary'],
  [1, 'FDA Approves New Gene Therapy for Rare Blood Disorder', 'FDA News', 'https://fdanews.com/article-1', '2026-03-22', 'The FDA has approved a groundbreaking gene therapy for sickle cell disease.'],
  [2, 'Telepharmacy Adoption Surges 300% Post-Pandemic', 'PharmacyTimes', 'https://pharmacytimes.com/article-2', '2026-03-21', 'Remote pharmacy consultations are becoming the norm, with 78% of patients preferring virtual reviews.'],
  [3, 'AI Drug Discovery Cuts Development Time by 60%', 'PubMed', 'https://pubmed.com/article-3', '2026-03-22', 'Machine learning models identify promising drug candidates in weeks instead of years.'],
  [4, 'New Regulations on Pharmacy Benefit Managers Take Effect', 'FDA News', 'https://fdanews.com/article-4', '2026-03-20', 'Landmark PBM transparency laws aim to reduce prescription drug costs.'],
  [5, 'Compounding Pharmacy Market Reaches $15B Globally', 'PharmacyTimes', 'https://pharmacytimes.com/article-5', '2026-03-21', 'Personalized medicine drives demand for custom-compounded medications.'],
  [6, 'Pharmacists Now Authorized to Prescribe Contraceptives in 30 States', 'PubMed', 'https://pubmed.com/article-6', '2026-03-22', 'Expanded scope of practice allows pharmacists to directly prescribe certain medications.'],
  [7, 'Blockchain Technology Transforms Drug Supply Chain Tracking', 'FDA News', 'https://fdanews.com/article-7', '2026-03-19', 'Pharmaceutical companies adopt blockchain for end-to-end drug traceability.'],
  [8, 'Mental Health Medication Demand Hits Record High', 'PharmacyTimes', 'https://pharmacytimes.com/article-8', '2026-03-22', 'Antidepressant and anti-anxiety prescriptions increase 40% year-over-year.'],
];
const wsDiscovery = XLSX.utils.aoa_to_sheet(discoveryData);
wsDiscovery['!cols'] = [
  { wch: 5 }, { wch: 55 }, { wch: 18 }, { wch: 40 }, { wch: 14 }, { wch: 70 }
];
wsDiscovery['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
XLSX.utils.book_append_sheet(wb, wsDiscovery, 'Content Discovery');

// ─── Sheet 3: Content Filtering ───
const filterData = [
  ['Agent 2 — Content Filtering (Score = Relevance + Virality + Usefulness)'],
  [''],
  ['Rank', 'Title', 'Source', 'Relevance (%)', 'Virality (%)', 'Usefulness (%)', 'Total Score', 'Engagement Potential', 'Recency'],
  [1, 'Telepharmacy Adoption Surges 300%', 'PharmacyTimes', 95, 88, 92, 91.7, 'Very High', 'Today'],
  [2, 'AI Drug Discovery Cuts Development Time by 60%', 'PubMed', 90, 96, 85, 90.3, 'Very High', 'Yesterday'],
  [3, 'Pharmacists Authorized to Prescribe in 30 States', 'PubMed', 88, 80, 94, 87.3, 'High', '3 days ago'],
  [4, 'Compounding Pharmacy Market Reaches $15B', 'PharmacyTimes', 82, 90, 78, 83.3, 'High', 'Today'],
  [5, 'FDA Approves New Gene Therapy', 'FDA News', 75, 82, 88, 81.7, 'Medium', '2 days ago'],
];
const wsFilter = XLSX.utils.aoa_to_sheet(filterData);
wsFilter['!cols'] = [
  { wch: 6 }, { wch: 50 }, { wch: 18 }, { wch: 14 }, { wch: 13 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 12 }
];
wsFilter['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
XLSX.utils.book_append_sheet(wb, wsFilter, 'Content Filtering');

// ─── Sheet 4: Content Generation ───
const genData = [
  ['Agent 3 — Content Generation (LLM)'],
  [''],
  ['ID', 'Topic', 'Platform', 'Post Content (Preview)', 'Hashtags', 'Hook Type', 'CTA'],
  [1, 'Telepharmacy Growth', 'LinkedIn', '🏥 Telepharmacy isn\'t the future — it\'s the NOW. 300% growth since the pandemic...', '#Telepharmacy #PharmacyInnovation #HealthcareTech #DigitalHealth', 'Stat Hook + Urgency', 'Comment engagement'],
  [2, 'AI Drug Discovery', 'Instagram', '🧬 AI is rewriting the rules of drug discovery. Traditional: 10-15 years. AI: Under 4 years...', '#AIinPharma #DrugDiscovery #PharmacyFuture #MedTech', 'Comparison + Stat Hook', 'Save for later'],
  [3, 'Pharmacist Prescribing Rights', 'Twitter', '🧵 BREAKING: Pharmacists can now prescribe contraceptives in 30 states...', '#PharmacyPractice #ScopeOfPractice #WomensHealth', 'Breaking News + Thread', 'Retweet + Follow'],
  [4, 'Drug Supply Chain', 'LinkedIn', '📦 Counterfeit drugs kill 1 million people annually. Blockchain is changing that...', '#PharmacySupplyChain #Blockchain #DrugSafety', 'Stat Hook + Mission-driven', 'Share your thoughts'],
];
const wsGen = XLSX.utils.aoa_to_sheet(genData);
wsGen['!cols'] = [
  { wch: 5 }, { wch: 28 }, { wch: 12 }, { wch: 70 }, { wch: 50 }, { wch: 25 }, { wch: 20 }
];
wsGen['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
XLSX.utils.book_append_sheet(wb, wsGen, 'Content Generation');

// ─── Sheet 5: Design Generation ───
const designData = [
  ['Agent 4 — Design Generation'],
  [''],
  ['ID', 'Design Type', 'Topic', 'Image URL', 'Tool Used'],
  [1, 'IG Post', 'Telepharmacy Growth', 'cdn/pharmacy-img01.png', 'DALL·E'],
  [2, 'Infographic', 'AI Drug Discovery', 'cdn/pharmacy-img02.png', 'Canva API'],
  [3, 'Quote Card', 'Pharmacist Rights', 'cdn/pharmacy-img03.png', 'Stable Diffusion'],
  [4, 'Carousel', 'Drug Supply Chain', 'cdn/pharmacy-img04.png', 'DALL·E'],
];
const wsDesign = XLSX.utils.aoa_to_sheet(designData);
wsDesign['!cols'] = [
  { wch: 5 }, { wch: 15 }, { wch: 28 }, { wch: 30 }, { wch: 18 }
];
wsDesign['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
XLSX.utils.book_append_sheet(wb, wsDesign, 'Design Generation');

// ─── Sheet 6: Approval Sheet (Human-in-the-loop) ───
const approvalData = [
  ['Agent 5 — Approval Sheet ✅ Human-in-the-Loop'],
  ['User reviews · sets Approval = Yes/No · sets Schedule Time'],
  [''],
  ['ID', 'Topic', 'Post Content (Preview)', 'Image Link', 'Platform', 'Approval', 'Schedule'],
  ['001', 'Telepharmacy Growth', '🏥 Telepharmacy isn\'t the future — it\'s the NOW...', 'cdn/pharmacy-img01.png', 'LinkedIn', '✓ Yes', 'Mon 9am'],
  ['002', 'AI Drug Discovery', '🧬 AI is rewriting the rules of drug discovery...', 'cdn/pharmacy-img02.png', 'Instagram', '✓ Yes', 'Mon 12pm'],
  ['003', 'Pharmacist Prescribing Rights', '🧵 BREAKING: Pharmacists can now prescribe...', 'cdn/pharmacy-img03.png', 'Twitter', '✓ Yes', 'Tue 10am'],
  ['004', 'Drug Supply Chain', '📦 Counterfeit drugs kill 1 million people...', 'cdn/pharmacy-img04.png', 'LinkedIn', '✓ Yes', 'Tue 2pm'],
];
const wsApproval = XLSX.utils.aoa_to_sheet(approvalData);
wsApproval['!cols'] = [
  { wch: 6 }, { wch: 30 }, { wch: 50 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 14 }
];
wsApproval['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
];
XLSX.utils.book_append_sheet(wb, wsApproval, 'Approval Sheet');

// ─── Sheet 7: Scheduling ───
const schedData = [
  ['Agent 6 — Scheduling Agent'],
  ['Runs every hour/day · filter: Approval = Yes AND Status = Approved'],
  [''],
  ['ID', 'Topic', 'Platform', 'Scheduled Time', 'API', 'Status'],
  ['001', 'Telepharmacy Growth', 'LinkedIn', 'Mon 9:00 AM', 'LinkedIn API', 'Queued'],
  ['002', 'AI Drug Discovery', 'Instagram', 'Mon 12:00 PM', 'Meta Graph API', 'Queued'],
  ['003', 'Pharmacist Prescribing Rights', 'Twitter', 'Tue 10:00 AM', 'Twitter API', 'Queued'],
  ['004', 'Drug Supply Chain', 'LinkedIn', 'Tue 2:00 PM', 'LinkedIn API', 'Queued'],
];
const wsSched = XLSX.utils.aoa_to_sheet(schedData);
wsSched['!cols'] = [
  { wch: 6 }, { wch: 30 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 10 }
];
wsSched['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
];
XLSX.utils.book_append_sheet(wb, wsSched, 'Scheduling');

// ─── Sheet 8: Publishing ───
const pubData = [
  ['Agent 7 — Publishing Agent'],
  ['Posts content + image · confirms success/failure · Updates sheet: Status → Posted'],
  [''],
  ['ID', 'Topic', 'Platform', 'Status', 'Published Time', 'Success'],
  ['001', 'Telepharmacy Growth', 'LinkedIn', 'Posted', 'Mon 9:01 AM', '✅'],
  ['002', 'AI Drug Discovery', 'Instagram', 'Posted', 'Mon 12:00 PM', '✅'],
  ['003', 'Pharmacist Prescribing Rights', 'Twitter', 'Failed', 'Tue 10:02 AM', '❌'],
  ['004', 'Drug Supply Chain', 'LinkedIn', 'Posted', 'Tue 2:01 PM', '✅'],
  [''],
  ['', '', '', 'Summary', '', ''],
  ['', '', '', 'Posted: 3', 'Failed: 1', 'Success Rate: 75%'],
];
const wsPub = XLSX.utils.aoa_to_sheet(pubData);
wsPub['!cols'] = [
  { wch: 6 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 }
];
wsPub['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
];
XLSX.utils.book_append_sheet(wb, wsPub, 'Publishing');

// Write file
const outputPath = path.join('d:\\Social Media Agent', 'Social_Media_Agent_Workflow.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`✅ Excel file created: ${outputPath}`);
