import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const formData = await req.formData();
  const transcript = formData.get('SpeechResult') as string;
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');

  if (!transcript) {
    return new Response('<Response><Redirect href="/api/voice/no-response" /></Response>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  // 1. Log interaction in Supabase
  await supabase.from('calls').update({
    transcript: transcript
  }).eq('lead_id', leadId).order('created_at', { ascending: false }).limit(1);

  // 2. AI Decision Engine (Brain)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { 
        role: "system", 
        content: `You are an AI Loan Qualification Agent. 
        Current Goal: Qualify the lead for a $50k loan.
        Status: If they say yes/interested, ask for their annual income.
        If they are busy, ask when to call back.
        If they are not interested, thank them and end the call.
        Keep responses extremely concise and natural for voice.` 
      },
      { role: "user", content: transcript }
    ],
  });

  const aiResponse = completion.choices[0].message.content;

  // 3. Check for intent to end or transfer
  let actionTwiml = '';
  if (aiResponse?.toLowerCase().includes('thank you') || aiResponse?.toLowerCase().includes('goodbye')) {
    actionTwiml = '<Hangup />';
  } else {
    actionTwiml = `
      <Gather input="speech" action="/api/voice/respond?leadId=${leadId}" speechTimeout="auto" />
      <Redirect>/api/voice/no-response?leadId=${leadId}</Redirect>
    `;
  }

  const twiml = `
    <Response>
      <Say voice="Polly.Joey" language="en-US">${aiResponse}</Say>
      ${actionTwiml}
    </Response>
  `;

  return new Response(twiml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
