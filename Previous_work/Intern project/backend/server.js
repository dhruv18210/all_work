const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper for simulating delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// MOCK DATA (Pending Real API Integrations)
// ==========================================

const getMockStrategy = (url) => ({
  positioning: {
    title: "Core Positioning",
    body: "Shift from generic medical updates to empathetic, patient-centric educational content. Emphasize 'Trust & Advanced Care' over standard promotional messaging."
  },
  competitorInsight: {
    title: "Competitor Insight",
    body: "Local competitors focus heavily on facilities. We will focus on humanizing the doctors and the patient experience to build immediate trust."
  },
  pillars: [
    { title: "Medical Excellence", desc: "Behind-the-scenes of advanced procedures." },
    { title: "Patient Voices", desc: "Anonymous success stories or verified testimonials." },
    { title: "Preventative Care", desc: "High-value quick tips for everyday health." },
    { title: "Emergency Readiness", desc: "Establishing the 24/7 reliability of the practice." }
  ]
});

const getMockAsset = () => ({
  // Returning the path to the asset we generated during the dev process 
  // and placed in the frontend's public folder
  imageUrl: "/healthcare_poster.png", 
  copy: `Your health isn't on a schedule, and neither are we. 🩺✨\n\nExperience advanced medical care with trusted professionals who put your well-being first. Our state-of-the-art clinical environment is designed for your comfort and recovery.\n\n🔹 24/7 Emergency Support\n🔹 Board-certified Specialists\n🔹 Compassionate Care\n\nWait times are currently under 15 minutes. Link in bio to pre-register. 🏥\n\n#Healthcare #MedicalClinic #AdvancedCare #PatientFirst #EmergencyCare`
});

const getMockSchedule = () => ({
  date: "OCT 14",
  time: "6:30 PM (Local)",
  reason: "Historical data shows local individuals searching for urgent care options spike during evening hours after standard clinics close."
});


// ==========================================
// ROUTES
// ==========================================

// 1. Analyze existing profile and generate strategy
app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    // TODO: Wire up to OpenAI / LangChain 
    // e.g. const strategy = await openai.chat.completions.create(...)
    
    // Simulating processing time for LangChain tool calling & LLM inference
    await delay(3500); 
    
    const strategy = getMockStrategy(url);
    
    res.json({ success: true, strategy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Modify existing strategy
app.post('/api/strategy/modify', async (req, res) => {
  try {
    const { url, comments } = req.body;
    
    // Simulate re-running inference with new prompt instructions
    await delay(2000);
    
    const modifiedStrategy = getMockStrategy(url);
    modifiedStrategy.positioning.body = `[UPDATED via user request: ${comments}] ` + modifiedStrategy.positioning.body;

    res.json({ success: true, strategy: modifiedStrategy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Generate image and copy based on accepted strategy
app.post('/api/generate-asset', async (req, res) => {
  try {
    // TODO: Wire up to OpenAI DALL-E 3 or Midjourney API
    // e.g. const image = await openai.images.generate(...)
    
    // Simulating image generation payload time
    await delay(4000); 
    
    const asset = getMockAsset();
    res.json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Retrieve scheduling recommendation
app.post('/api/schedule', async (req, res) => {
  try {
    // Simulate calculating the best time
    await delay(1000);
    
    const schedule = getMockSchedule();
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI Backend API running on http://localhost:${PORT}`);
  console.log('Ready to connect to OpenAI / Midjourney once configured.');
});
