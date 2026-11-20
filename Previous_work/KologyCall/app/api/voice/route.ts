import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');

  // Fetch lead name for personalized intro
  const { data: lead } = await supabase
    .from('leads')
    .select('name')
    .eq('id', leadId)
    .single();

  const name = lead?.name || 'there';

  const twiml = `
    <Response>
      <Say voice="Polly.Joey" language="en-US">
        Hello ${name}, this is an automated assistant from the loan department. 
        I'm calling to follow up on your recent application. Are you interested in discussing your options now?
      </Say>
      <Gather input="speech" action="/api/voice/respond?leadId=${leadId}" speechTimeout="auto" />
      <Redirect>/api/voice/no-response?leadId=${leadId}</Redirect>
    </Response>
  `;

  return new Response(twiml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
