import { Response } from 'express';
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup separate clients for pub/sub connections to avoid blocking the main client
const pubClient = createClient({ url: redisUrl });
const subClient = createClient({ url: redisUrl });

let pubSubInitialized = false;

const initPubSub = async () => {
  if (!pubSubInitialized) {
    await pubClient.connect();
    await subClient.connect();
    pubSubInitialized = true;
    console.log('CONNECTED: SSE Redis Pub/Sub clients initialized');
  }
};

export const subscribeBuildProgress = async (buildId: string, res: Response) => {
  await initPubSub();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const channel = `build:${buildId}`;
  
  // Send initial keep-alive
  res.write(`data: ${JSON.stringify({ status: 'SUBSCRIBED', progress: 0 })}\n\n`);

  const listener = (message: string) => {
    res.write(`data: ${message}\n\n`);
  };

  await subClient.subscribe(channel, listener);

  reqCloseHandler(res, async () => {
    try {
      await subClient.unsubscribe(channel, listener);
    } catch (e) {
      console.error('SSE Unsubscribe Error:', e);
    }
  });
};

export const publishBuildProgress = async (buildId: string, data: any) => {
  await initPubSub();
  const channel = `build:${buildId}`;
  await pubClient.publish(channel, JSON.stringify(data));
};

const reqCloseHandler = (res: Response, cleanup: () => void) => {
  res.on('close', () => {
    cleanup();
    res.end();
  });
};
