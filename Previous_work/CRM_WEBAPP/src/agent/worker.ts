import { cli, WorkerOptions } from '@livekit/agents';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = new WorkerOptions({
  agent: path.join(__dirname, 'agent.ts'),
  agentName: 'sarah-sales-agent',
});

cli.runApp(options);
