import dotenv from 'dotenv';
import path from 'path';

// Load environment configurations from root directories or project roots
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

import app from './app';
import { connectRedis } from './config/redis';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || '3001';

const startServer = async () => {
  try {
    // Connect cache client
    await connectRedis();

    // Verify database connection pool
    await prisma.$connect();
    console.log('CONNECTED: PostgreSQL database connection pool verified');

    app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`🚀 BuildrX Backend Server running on port ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log(`========================================`);
    });
  } catch (error) {
    console.error('FATAL STARTUP FAILURE:', error);
    process.exit(1);
  }
};

startServer();
