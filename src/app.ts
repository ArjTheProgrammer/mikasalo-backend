import express from 'express';
import mongoose from 'mongoose';
import logger from './utils/logger';
import config from './utils/config';
import cors from 'cors';

export const app = express();

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error: Error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});