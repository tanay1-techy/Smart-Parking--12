import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { connectDB } from './server/db.js';
import authRoutes from './server/routes/auth.js';const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- CONFIGURATION ---
const TOTAL_SLOTS = 250;
let BASE_RATE = 25; // ₹ per hour
const ADVANCE_BOOKING_FEE = 50; // Premium for >1hr advance
const NO_SHOW_FINE = 1000;
const GRACE_PERIOD_MINS = 30;

// Dynamic Pricing Multiplier state
let currentPricingMultiplier = 1.0;

// --- STATE ---
let slots = [];
let bookings = [];
let transactions = [];
let logs = [];
let dailyRevenue = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [12000, 15000, 11000, 18000, 22000, 25000, 20000]
};

// Initialize Slots
function initSlots() {
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    const section = String.fromCharCode(65 + Math.floor((i - 1) / 50));
    const number = ((i - 1) % 50 + 1).toString().padStart(2, '0');
    slots.push({
      id: `${section}-${number}`,
      status: 'available', // available, occupied, reserved
      vehicleNumber: null,
      currentBookingId: null
    });
  }
}

initSlots();

// --- LOGIC HELPERS ---

function addLog(message, type = 'info') {
  const log = {
    id: uuidv4(),
    timestamp: new Date(),
    message,
    type // info, success, warning, alert
  };
  logs.unshift(log);
  if (logs.length > 50) logs.pop();
  io.emit('log-update', log);
  return log;
}

function updateDynamicPricing() {
  const occupiedSlots = slots.filter(s => s.status !== 'available').length;
  const occupancyRate = occupiedSlots / TOTAL_SLOTS;
  
  let multiplier = 1.0;
  
  // Rule 1: Low Occupancy Discount (< 40%)
  if (occupancyRate < 0.40) {
    multiplier -= 0.15; // 15% discount
  }
  
  // Rule 2: Peak Hours Surge (8-10 AM and 5-7 PM on weekdays)
  const now = new Date();
  const hours = now.getHours();
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  
  if (isWeekday) {
    if (hours >= 8 && hours < 10) {
      multiplier += 0.50; // 50% surge
    } else if (hours >= 17 && hours < 19) {
      multiplier += 0.30; // 30% surge
    }
  }

  // Ensure multiplier doesn't drop below 0.5 or above 3.0
  currentPricingMultiplier = Math.max(0.5, Math.min(multiplier, 3.0));
}

function calculatePrice(startTime, durationHours, isAdvance) {
  // Always update dynamic pricing before calculation
  updateDynamicPricing();
  
  let price = durationHours * (BASE_RATE * currentPricingMultiplier);
  if (isAdvance) price += ADVANCE_BOOKING_FEE;
  return price;
}

// --- SOCKET EVENTS ---

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial state
  updateDynamicPricing();
  socket.emit('init-state', { 
    slots, 
    bookings, 
    logs, 
    revenue: dailyRevenue,
    config: { 
      BASE_RATE: Math.round(BASE_RATE * currentPricingMultiplier), 
      NO_SHOW_FINE, 
      GRACE_PERIOD_MINS,
      MULTIPLIER: currentPricingMultiplier 
    } 
  });

  // Handle New Booking
  socket.on('create-booking', (data) => {
    const { vehicleNumber, duration, startTime } = data;
    
    // Check if vehicle already has a pending booking
    if (bookings.find(b => b.vehicleNumber === vehicleNumber && b.status === 'pending')) {
      socket.emit('error', 'Vehicle already has an active booking.');
      return;
    }

    const start = new Date(startTime);
    const now = new Date();
    const isAdvance = (start - now) > (60 * 60 * 1000); // More than 1 hour in advance
    
    const amount = calculatePrice(start, duration, isAdvance);
    
    const newBooking = {
      id: uuidv4().substring(0, 8).toUpperCase(),
      vehicleNumber,
      startTime: start,
      duration,
      graceEndTime: new Date(start.getTime() + GRACE_PERIOD_MINS * 60000),
      status: 'pending',
      amount,
      isAdvance,
      slotId: null // Assigned on arrival or pre-assigned if user picks? User picks in this system.
    };

    // Pre-assign a slot
    const freeSlot = slots.find(s => s.status === 'available');
    if (!freeSlot) {
      socket.emit('error', 'No slots available for booking.');
      return;
    }

    freeSlot.status = 'reserved';
    newBooking.slotId = freeSlot.id;
    
    bookings.unshift(newBooking);
    addLog(`Booking confirmed: ${vehicleNumber} at Slot ${freeSlot.id}`, 'success');
    
    io.emit('state-update', { 
      slots, 
      bookings,
      config: { 
        BASE_RATE: Math.round(BASE_RATE * currentPricingMultiplier), 
        NO_SHOW_FINE, 
        GRACE_PERIOD_MINS,
        MULTIPLIER: currentPricingMultiplier 
      }
    });
    socket.emit('booking-success', newBooking);

    // Set No-Show Timer
    const timeUntilGraceEnds = newBooking.graceEndTime - new Date();
    setTimeout(() => {
      checkNoShow(newBooking.id);
    }, timeUntilGraceEnds);
  });

  // Simulate ANPR Entry
  socket.on('anpr-entry', (vehicleNumber) => {
    addLog(`ANPR: Vehicle ${vehicleNumber} detected at entry gate.`, 'info');
    
    // Check for existing booking
    let booking = bookings.find(b => b.vehicleNumber === vehicleNumber && b.status === 'pending');
    let slot;

    if (booking) {
      slot = slots.find(s => s.id === booking.slotId);
      booking.status = 'checked-in';
      booking.actualEntry = new Date();
      addLog(`Reservation matched for ${vehicleNumber}. Proceed to ${slot.id}`, 'success');
    } else {
      // Walk-in
      slot = slots.find(s => s.status === 'available');
      if (!slot) {
        addLog(`No space for walk-in vehicle ${vehicleNumber}`, 'alert');
        socket.emit('entry-denied', 'Parking Full');
        return;
      }
      
      const newBooking = {
        id: uuidv4().substring(0, 8).toUpperCase(),
        vehicleNumber,
        startTime: new Date(),
        actualEntry: new Date(),
        status: 'checked-in',
        slotId: slot.id,
        isWalkIn: true
      };
      bookings.unshift(newBooking);
      booking = newBooking;
      addLog(`Walk-in entry: ${vehicleNumber} assigned to ${slot.id}`, 'info');
    }

    slot.status = 'occupied';
    slot.vehicleNumber = vehicleNumber;
    slot.currentBookingId = booking.id;
    
    updateDynamicPricing();
    io.emit('state-update', { 
      slots, 
      bookings,
      config: { 
        BASE_RATE: Math.round(BASE_RATE * currentPricingMultiplier), 
        NO_SHOW_FINE, 
        GRACE_PERIOD_MINS,
        MULTIPLIER: currentPricingMultiplier 
      }
    });
    io.emit('gate-control', 'open');
    setTimeout(() => io.emit('gate-control', 'close'), 5000);
  });

  // Simulate ANPR Exit
  socket.on('anpr-exit', (vehicleNumber) => {
    addLog(`ANPR: Vehicle ${vehicleNumber} detected at exit gate.`, 'info');
    
    const slot = slots.find(s => s.vehicleNumber === vehicleNumber);
    if (!slot) {
      addLog(`Error: Vehicle ${vehicleNumber} not found in system.`, 'alert');
      return;
    }

    const booking = bookings.find(b => b.id === slot.currentBookingId);
    booking.actualExit = new Date();
    booking.status = 'completed';
    
    // Calculate final amount
    const durationMs = booking.actualExit - booking.actualEntry;
    const durationHrs = Math.ceil(durationMs / (1000 * 60 * 60));
    
    let finalAmount = booking.amount || (durationHrs * BASE_RATE);
    
    // Check for overtime (if it was a booking)
    if (!booking.isWalkIn) {
      const plannedExit = new Date(booking.startTime.getTime() + (booking.duration + 0.5) * 60 * 60000);
      if (booking.actualExit > plannedExit) {
        const overtimeMs = booking.actualExit - plannedExit;
        const overtimeHrs = Math.ceil(overtimeMs / (1000 * 60 * 60));
        const penalty = overtimeHrs * BASE_RATE;
        finalAmount += penalty;
        addLog(`Overtime penalty applied to ${vehicleNumber}: ₹${penalty}`, 'warning');
      }
    }

    booking.finalAmount = finalAmount;
    
    // Update Revenue
    const dayIndex = new Date().getDay(); // 0-6
    dailyRevenue.data[dayIndex] += finalAmount;

    // Record Transaction
    transactions.push({
      id: `TXN-${uuidv4().substring(0, 4).toUpperCase()}`,
      bookingId: booking.id,
      vehicleNumber,
      amount: finalAmount,
      timestamp: new Date()
    });

    // Reset Slot
    slot.status = 'available';
    slot.vehicleNumber = null;
    slot.currentBookingId = null;

    addLog(`Vehicle ${vehicleNumber} exited. Total: ₹${finalAmount}`, 'success');
    
    updateDynamicPricing();
    io.emit('state-update', { 
      slots, 
      bookings,
      config: { 
        BASE_RATE: Math.round(BASE_RATE * currentPricingMultiplier), 
        NO_SHOW_FINE, 
        GRACE_PERIOD_MINS,
        MULTIPLIER: currentPricingMultiplier 
      }
    });
    io.emit('gate-control', 'open');
    setTimeout(() => io.emit('gate-control', 'close'), 5000);
    socket.emit('payment-summary', { vehicleNumber, amount: finalAmount });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

function checkNoShow(bookingId) {
  const booking = bookings.find(b => b.id === bookingId);
  if (booking && booking.status === 'pending') {
    booking.status = 'no-show';
    booking.fineAmount = NO_SHOW_FINE;
    
    const slot = slots.find(s => s.id === booking.slotId);
    if (slot) {
      slot.status = 'available';
      slot.currentBookingId = null;
    }
    
    addLog(`No-show: ${booking.vehicleNumber} missed grace window. Fine ₹${NO_SHOW_FINE} issued.`, 'alert');
    io.emit('state-update', { slots, bookings });
  }
}

const PORT = process.env.PORT || 3001;

// Connect to DB then start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Smart Parking Server running on port ${PORT}`);
  });
}).catch(err => {
  console.log('Starting without DB...');
  httpServer.listen(PORT, () => {
    console.log(`Smart Parking Server running on port ${PORT} (In-Memory Fallback)`);
  });
});
