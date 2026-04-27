import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  slotId: { type: String, required: true, unique: true }, // "A-01"
  section: { type: String, required: true }, // "A" - "E"
  number: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  vehicleNumber: { type: String, default: null },
  currentBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  sensorHealth: { type: String, enum: ['online', 'offline', 'degraded'], default: 'online' },
  lastSensorPing: { type: Date, default: Date.now },
  coordinates: {
    row: Number,
    col: Number
  }
});

export default mongoose.model('Slot', slotSchema);
