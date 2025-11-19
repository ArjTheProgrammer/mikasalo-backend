import 'express-async-errors';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import logger from '../utils/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});