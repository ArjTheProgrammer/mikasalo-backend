import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model';

const loginRouter = express.Router();

interface LoginRequest {
  email: string;
  password: string;
}

loginRouter.post('/', async (request: Request<unknown, unknown, LoginRequest>, response: Response) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid email or password'
    });
  }

  const userForToken = {
    email: user.email,
    id: user.id,
    role: user.role
  };

  const secret = process.env.SECRET;
  if (!secret) {
    return response.status(500).json({
      error: 'Server configuration error'
    });
  }

  const token = jwt.sign(userForToken, secret, { expiresIn: '1h' });

  response
    .status(200)
    .send({ 
      token, 
      email: user.email, 
      name: user.name,
      role: user.role
    });
});

export default loginRouter;