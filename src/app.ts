import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './utils/logger';
import config from './utils/config';
import middleware from './utils/middleware';
import userRouter from './routes/users';
import loginRouter from './routes/login';

mongoose.set('strictQuery', false);

const app = express();

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

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;