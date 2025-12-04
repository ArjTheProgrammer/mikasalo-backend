import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { newUser } from '../utils/validations/user.schema';

const getAllUsers = async () => {
  const users = await User.find({});
  return users;
};

const createUser = async (userData: newUser) => {
  const { password, ...rest } = userData;
  
  if (!password || password.length < 3) {
    throw new Error('Password must be at least 3 characters long');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    ...rest,
    passwordHash,
  });

  const savedUser = await user.save();
  return savedUser;
};

const findById = async (id: string) => {
  const user = await User.findById(id);
  return user;
};

export default {
  getAllUsers,
  createUser,
  findById
};