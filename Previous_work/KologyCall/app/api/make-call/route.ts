import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { supabase } from '@/lib/supabase';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const appUrl = process.env.APP_URL;

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // 1. Fetch lead from Supabase
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // 2. Initialize Twilio
    const client = twilio(accountSid, authToken);

    // 3. Trigger the call
    const call = await client.calls.create({
      url: `${appUrl}/api/voice?leadId=${leadId}`,
      to: lead.phone,
      from: fromPhone || '',
      statusCallback: `${appUrl}/api/call-status?leadId=${leadId}`,
      statusCallbackEvent: ['completed', 'failed', 'busy', 'no-answer'],
    });

    // 4. Log initial call in Supabase
    await supabase.from('calls').insert({
      lead_id: leadId,
      call_status: 'initiated',
    });

    return NextResponse.json({ success: true, callSid: call.sid });
  } catch (error: any) {
    console.error('Twilio Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
