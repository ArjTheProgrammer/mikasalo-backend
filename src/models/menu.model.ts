import mongoose from 'mongoose';
import { Category } from '../utils/validations/menu.schema';

const menuSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: Object.values(Category),
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true
});

menuSchema.set('toJSON', {
  transform: (_document: any, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();

    delete (returnedObject as any)._id;
    delete (returnedObject as any).__v;
  }
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;