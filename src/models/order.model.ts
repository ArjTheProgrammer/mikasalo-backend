import mongoose from 'mongoose';
import { OrderStatus } from '../utils/validations/order.schema';

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    required: false
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    required: true,
    index: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  orderTime: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common query patterns
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, orderTime: -1 });
orderSchema.index({ userId: 1, orderTime: -1 });

orderSchema.set('toJSON', {
  transform: (_document: any, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();

    delete (returnedObject as any)._id;
    delete (returnedObject as any).__v;
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;