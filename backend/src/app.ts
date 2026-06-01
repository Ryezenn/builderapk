import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import Routers
import authRouter from './routes/auth';
import builderRouter from './routes/builder';
import marketplaceRouter from './routes/marketplace';
import keysRouter from './routes/keys';
import analyticsRouter from './routes/analytics';
import adminRouter from './routes/admin';
import gatewayRouter from './routes/gateway';

const app = express();

// Security & Cors Setup
// Customize helmet for local development and gateway routing
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off CSP temporarily to allow interactive docs
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(cookieParser());

// Gateway proxy must process raw buffers if needed, but for json API we configure json parser on standard routes.
// We only enable JSON parsing on non-gateway routes so that the proxy is not disrupted.
app.use((req, res, next) => {
  if (req.path.startsWith('/gateway')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Serve compiled static build uploads
app.use('/public/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Connect Modular Routers
app.use('/api/auth', authRouter);
app.use('/api/builder', builderRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/keys', keysRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);
app.use('/gateway', gatewayRouter);

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'BuildrX SaaS Backend', time: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Global Error Catch:', err);
  const status = err.status || 500;
  return res.status(status).json({
    error: err.message || 'An unexpected server error occurred.',
  });
});

export default app;
