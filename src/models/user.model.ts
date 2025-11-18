import mongoose from 'mongoose';
import { User } from '../utils/validations/user.schema'
import { Role } from '../utils/validations/user.schema';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.CUSTOMER,
    required: true
  }
}, {
  timestamps: true
});

userSchema.set('toJSON', {
  transform: (_document: any, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();

    delete (returnedObject as any)._id;
    delete (returnedObject as any).__v;
    delete (returnedObject as any).passwordHash;
  }
});

const User = mongoose.model('User', userSchema);

export default User;