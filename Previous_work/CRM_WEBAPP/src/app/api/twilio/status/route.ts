import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    let callStatus = '';
    let callSid = '';
    let duration = '';
    
    // Twilio sends form-data by default
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      callStatus = formData.get('CallStatus') as string;
      callSid = formData.get('CallSid') as string;
      duration = formData.get('CallDuration') as string;
    } else {
      const body = await request.json();
      callStatus = body.CallStatus;
      callSid = body.CallSid;
      duration = body.CallDuration;
    }
    
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room');

    console.log(`[Twilio Status Update] Room: ${room}, SID: ${callSid}, Status: ${callStatus}, Duration: ${duration}`);

    if (room) {
      // Map Twilio statuses to our status
      let status = 'INITIATING';
      if (['ringing', 'queued'].includes(callStatus)) status = 'RINGING';
      if (['in-progress', 'answered'].includes(callStatus)) status = 'IN_PROGRESS';
      if (callStatus === 'completed') status = 'COMPLETED';
      if (['busy', 'no-answer', 'canceled', 'failed'].includes(callStatus)) status = callStatus.toUpperCase().replace('-', '_');

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (duration) {
        updateData.duration_sec = parseInt(duration);
      }

      await supabaseAdmin
        .from('calls')
        .update(updateData)
        .eq('room_name', room);
        
      // If call failed/declined, ensure it's reflected
      if (['BUSY', 'NO_ANSWER', 'FAILED', 'CANCELED'].includes(status)) {
         console.log(`Call ${room} ended with status ${status}`);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Twilio Status Callback Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
