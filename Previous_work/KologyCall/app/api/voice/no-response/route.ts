import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');

  const twiml = `
    <Response>
      <Say voice="Polly.Joey" language="en-US">
        I didn't quite catch that. Could you please repeat?
      </Say>
      <Gather input="speech" action="/api/voice/respond?leadId=${leadId}" speechTimeout="auto" />
      <Redirect>/api/voice/no-response?leadId=${leadId}</Redirect>
    </Response>
  `;

  return new Response(twiml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
