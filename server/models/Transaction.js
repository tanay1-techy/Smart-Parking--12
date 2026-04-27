import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleNumber: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['parking', 'fine', 'refund', 'wallet-topup'], required: true },
  paymentMethod: { type: String },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
