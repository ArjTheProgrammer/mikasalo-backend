import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user.model';
import { Role } from '../utils/validations/user.schema';
import config from '../utils/config';

describe('Auth and User Routes', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    // Close mongoose connection
    await mongoose.connection.close();
  });

  describe('POST /api/users (register)', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '+1234567890',
        role: Role.CUSTOMER
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.email).toBe(userData.email);
      expect(response.body.name).toBe(userData.name);
      expect(response.body.phoneNumber).toBe(userData.phoneNumber);
      expect(response.body.role).toBe(userData.role);
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
        // missing name, phoneNumber, role
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid role', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '+1234567890',
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create a user first
      await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phoneNumber: '+1234567890',
          role: Role.CUSTOMER
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
      expect(response.body.role).toBe('customer');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('invalid email or password');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('invalid email or password');
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create multiple users for testing
      await request(app)
        .post('/api/users')
        .send({
          email: 'user1@example.com',
          password: 'password123',
          name: 'User One',
          phoneNumber: '+1111111111',
          role: Role.CUSTOMER
        });
      
      await request(app)
        .post('/api/users')
        .send({
          email: 'user2@example.com',
          password: 'password123',
          name: 'User Two',
          phoneNumber: '+2222222222',
          role: 'admin'
        });
    });

    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).not.toHaveProperty('passwordHash');
      expect(response.body[1]).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /api/users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phoneNumber: '+1234567890',
          role: Role.CUSTOMER
        });
      userId = response.body.id;
    });

    it('should get user by id', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011') // Valid ObjectId that doesn't exist
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid user ID');
    });
  });
});