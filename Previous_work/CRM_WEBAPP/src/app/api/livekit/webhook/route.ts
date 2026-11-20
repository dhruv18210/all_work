import { WebhookReceiver } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeCall } from '@/app/actions/analysis';

export async function POST(req: NextRequest) {
  const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  );

  const body = await req.text();
  const sig = req.headers.get('Authorization');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  try {
    const event = await receiver.receive(body, sig);

    if (event.event === 'room_finished') {
      const roomName = event.room?.name;
      if (!roomName) return NextResponse.json({ success: true });

      // Find the call associated with this room
      const { data: call, error: callError } = await supabase
        .from('calls')
        .select('*')
        .eq('room_name', roomName)
        .single();

      if (call && !callError) {
        // Trigger analysis (assuming transcript is captured by the agent or provided in events)
        // For now, we'll use the transcript stored during the call session
        await analyzeCall(call.id, call.transcript || "Call ended naturally.");
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
