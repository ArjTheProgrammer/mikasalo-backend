import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import logger from './utils/logger';
import config from './utils/config';
import middleware from './utils/middleware';
import userRouter from './routes/users';
import loginRouter from './routes/login';
import menuRouter from './routes/menu';
import orderRouter from './routes/orders';
import inventoryRouter from './routes/inventory';
import { initializeWebSocket } from './utils/websocket';
import helmet from 'helmet';
import nocache from 'nocache';

mongoose.set('strictQuery', false);

const app = express();
const server = createServer(app);

// Initialize WebSocket server
initializeWebSocket(server);

logger.info('connecting to MongoDB');

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error: Error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(express.static('dist'));

app.use(express.json());

// ======== SECURITY MIDDLEWARE ========

// Fixes: Content Security Policy (CSP) Header Not Set
// Prevents inline script execution and restricts resource loading sources
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}));

// Fixes: Missing Anti-clickjacking Header
// Prevents embedding in iframes (Clickjacking protection)
app.use(helmet.frameguard({ action: 'deny' }));

// Fixes: Cross-Domain Misconfiguration (CORS)
// Replace your current cors() with this configured version
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Fixes: X-Content-Type-Options Header Missing
// Prevents MIME-type sniffing attacks
app.use(helmet.noSniff());

// Fixes: Strict-Transport-Security Header Not Set (HSTS)
// Forces HTTPS connections (only in production)
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year in seconds
  includeSubDomains: true,
  preload: true,
}));

// Fixes: Information Disclosure (X-Powered-By)
// Removes the X-Powered-By header that reveals Express
app.use(helmet.hidePoweredBy());

// Fixes: Cache-Control Issues
// Prevents caching of sensitive responses
app.use(nocache());

// ======== END SECURITY MIDDLEWARE ========

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', orderRouter);
app.use('/api/inventory', inventoryRouter);

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export { server };
export default app;