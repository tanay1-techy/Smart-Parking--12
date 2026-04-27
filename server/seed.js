import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Slot from './models/Slot.js';
import { connectDB } from './db.js';

dotenv.config();

const seedSlots = async () => {
  await connectDB();
  
  try {
    const TOTAL_SLOTS = 250;
    const slotsToInsert = [];

    for (let i = 1; i <= TOTAL_SLOTS; i++) {
      const section = String.fromCharCode(65 + Math.floor((i - 1) / 50));
      const number = ((i - 1) % 50 + 1);
      const slotId = `${section}-${number.toString().padStart(2, '0')}`;
      
      slotsToInsert.push({
        slotId,
        section,
        number,
        status: 'available',
        sensorHealth: 'online',
        coordinates: {
          row: Math.floor((i - 1) / 10), // Example coordinate logic
          col: (i - 1) % 10
        }
      });
    }

    await Slot.deleteMany(); // Clear existing slots
    await Slot.insertMany(slotsToInsert);
    
    console.log(`Successfully seeded ${TOTAL_SLOTS} slots.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedSlots();
