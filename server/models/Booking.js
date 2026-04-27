import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for walk-ins
  vehicleNumber: { type: String, required: true },
  slotId: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // hours
  graceEndTime: { type: Date },
  actualEntry: { type: Date, default: null },
  actualExit: { type: Date, default: null },
  isAdvanceBooking: { type: Boolean, default: false },
  baseAmount: { type: Number, default: 0 },
  advanceSurcharge: { type: Number, default: 0 },
  overtimePenalty: { type: Number, default: 0 },
  noShowFine: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'checked-in', 'completed', 'no-show', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['phonepe', 'gpay', 'card', 'cash', null], default: null },
  isWalkIn: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
