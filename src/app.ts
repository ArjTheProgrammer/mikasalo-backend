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

app.use(cors());
app.use(express.static('dist'));

app.use(express.json());

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