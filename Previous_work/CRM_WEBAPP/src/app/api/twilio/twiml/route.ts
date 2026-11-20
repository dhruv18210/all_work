import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');

  if (!room) {
    return new NextResponse('Missing room parameter', { status: 400 });
  }

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Connect the call to LiveKit via <Connect><Stream> or <Sip>
  // In a standard LiveKit-Twilio setup, we use a <Stream> to send audio to the LiveKit agent
  const connect = response.connect();
  const stream = connect.stream({
    url: `${(process.env.LIVEKIT_URL || '').replace('https://', 'wss://')}`,
    name: 'LiveKitStream'
  });

  // Pass the room name as a parameter so the agent knows where to join
  stream.parameter({ name: 'room', value: room });

  return new NextResponse(response.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
