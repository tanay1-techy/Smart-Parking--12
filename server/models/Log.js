import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'alert'], default: 'info' },
  source: { type: String, enum: ['anpr', 'booking', 'system', 'admin', 'payment'], default: 'system' },
  metadata: {
    vehicleNumber: String,
    slotId: String,
    bookingId: String
  }
}, { timestamps: true });

export default mongoose.model('Log', logSchema);
