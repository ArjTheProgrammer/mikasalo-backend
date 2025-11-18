import mongoose from 'mongoose';
import { Unit } from '../utils/validations/inventory.schema';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    enum: Object.values(Unit),
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  lowStockThreshold: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

inventorySchema.set('toJSON', {
  transform: (_document: any, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();

    delete (returnedObject as any)._id;
    delete (returnedObject as any).__v;
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;