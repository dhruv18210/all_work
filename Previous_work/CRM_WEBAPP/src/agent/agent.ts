import {
  type JobContext,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for the agent
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    console.log('Connected to room', ctx.room.name);

    // Mark call as IN_PROGRESS immediately on agent connection
    await supabase
      .from('calls')
      .update({ status: 'IN_PROGRESS' })
      .eq('room_name', ctx.room.name);

    const participant = await ctx.waitForParticipant();
    console.log('Starting agent for participant', participant.identity);

    let fullTranscript = "";

    const agent = new voice.Agent({
      instructions: "You are 'Sarah', a friendly AI sales agent for AI-CRM. Your goal is to qualify the lead and book a demo. Be concise, professional, and empathetic.",
    });

    const session = new voice.AgentSession({
      stt: new deepgram.STT(),
      llm: new google.LLM(),
      tts: new elevenlabs.TTS(),
    });

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (ev) => {
      if (ev.isFinal) {
        fullTranscript += ev.transcript + " ";
        // Sync transcript to Supabase periodically or on change
        supabase
          .from('calls')
          .update({ transcript: fullTranscript })
          .eq('room_name', ctx.room.name)
          .then(({ error }) => {
            if (error) console.error('Failed to sync transcript:', error);
          });
      }
    });

    await session.start({ agent, room: ctx.room });

    // Handle session end
    ctx.room.on('disconnected', async () => {
      console.log('Call ended, running AI analysis...');
      
      try {
        const { analyzeCall } = await import('@/app/actions/analysis');
        const analysis = await analyzeCall(fullTranscript, ctx.room.name);

        if (analysis.success) {
          console.log('Call analysis saved successfully');
        }
      } catch (err) {
        console.error('Failed to analyze/save call:', err);
      }
    });
  },
});
