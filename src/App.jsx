import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, CheckCircle2, Clock, Map as MapIcon, Maximize, Settings, Terminal, 
  Activity, AlertTriangle, BarChart3, LayoutDashboard, Calendar, CreditCard, 
  Users, FileText, LogOut, Search, Bell, ChevronRight, Plus, X, QrCode, Menu,
  MapPin, Navigation, ChevronDown, UserPlus, MoreHorizontal, Shield, Mail,
  Download, Printer, DollarSign, Wallet, Edit3, MessageSquare, ThumbsUp, Star,
  AlertCircle, Send
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import logo from './assets/logo_final.png';

// --- MOCK DATA ---
const INITIAL_SLOTS = Array.from({ length: 250 }, (_, i) => ({
  id: `${String.fromCharCode(65 + Math.floor(i / 50))}-${String(i % 50 + 1).padStart(2, '0')}`,
  status: Math.random() > 0.4 ? 'available' : (Math.random() > 0.5 ? 'occupied' : 'reserved'),
}));

const RECENT_RESERVATIONS = [
  { id: 1, vehicle: 'KA01AB1234', slot: 'B-12', date: '2 May 2025', time: '10:00 AM - 12:00 PM', status: 'Confirmed' },
  { id: 2, vehicle: 'KA05CD5678', slot: 'A-08', date: '2 May 2025', time: '1:00 PM - 3:00 PM', status: 'Confirmed' },
  { id: 3, vehicle: 'KA03EF9012', slot: 'C-15', date: '2 May 2025', time: '4:00 PM - 6:00 PM', status: 'Pending' },
];

const PAYMENTS_HISTORY = [
  { id: 'TRX-9821', vehicle: 'KA01AB1234', slot: 'B-12', amount: 50, method: 'UPI (PhonePe)', date: '27 Apr 2025', time: '11:30 AM', status: 'Success' },
  { id: 'TRX-9822', vehicle: 'MH02CD5678', slot: 'A-05', amount: 125, method: 'UPI (GPay)', date: '27 Apr 2025', time: '02:15 PM', status: 'Success' },
  { id: 'TRX-9823', vehicle: 'DL05EF9012', slot: 'C-08', amount: 1075, method: 'Credit Card', date: '26 Apr 2025', time: '09:45 AM', status: 'Fine Paid' },
  { id: 'TRX-9824', vehicle: 'MP04GH3456', slot: 'D-22', amount: 25, method: 'Cash', date: '26 Apr 2025', time: '05:20 PM', status: 'Success' },
  { id: 'TRX-9825', vehicle: 'UP16BK8899', slot: 'E-01', amount: 50, method: 'UPI (Paytm)', date: '25 Apr 2025', time: '01:10 PM', status: 'Success' },
];

const INITIAL_USERS = [
  { id: 1, name: 'Tanay Techy', email: 'tanay@nexuspark.com', role: 'Super Admin', joined: '12 Jan 2024', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Tanay+Techy&background=4318FF&color=fff' },
  { id: 2, name: 'Rahul Sharma', email: 'rahul@gmail.com', role: 'Operator', joined: '05 Feb 2024', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=05CD99&color=fff' },
  { id: 3, name: 'Priya Singh', email: 'priya@yahoo.com', role: 'User', joined: '18 Feb 2024', status: 'Inactive', avatar: 'https://ui-avatars.com/api/?name=Priya+Singh&background=FFB547&color=fff' },
  { id: 4, name: 'Amit Verma', email: 'amit@outlook.com', role: 'User', joined: '01 Mar 2024', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Amit+Verma&background=7551FF&color=fff' },
  { id: 5, name: 'Sneha Reddy', email: 'sneha@nexuspark.com', role: 'Manager', joined: '15 Mar 2024', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=FF5B5B&color=fff' },
];

const WORKER_FEEDBACK = [
  { id: 1, worker: 'Rajesh Kumar', rating: 4.8, feedback: 'Extremely polite and guided me to my slot even in heavy rain.', user: 'Amit S.', date: '27 Apr 2025' },
  { id: 2, worker: 'Suresh Mani', rating: 2.5, feedback: 'A bit unprofessional. Was on phone when I needed help with OCR.', user: 'Priya V.', date: '26 Apr 2025' },
  { id: 3, worker: 'Vikram Singh', rating: 5.0, feedback: 'Fastest verification I have seen at any mall parking.', user: 'Sumit G.', date: '25 Apr 2025' },
];

const RECENT_ACTIVITY = [
  { id: 'ACT-001', vehicle: 'MH-01-AX-1234', inTime: '10:05 AM', expiryTime: Date.now() + 600000, duration: '2h', slot: 'A-01' },
  { id: 'ACT-002', vehicle: 'DL-04-CP-5678', inTime: '09:45 AM', expiryTime: Date.now() + 1200000, duration: '3h', slot: 'B-12' },
  { id: 'ACT-003', vehicle: 'KA-03-MG-9012', inTime: '10:30 AM', expiryTime: Date.now() + 1800000, duration: '1h', slot: 'C-05' },
  { id: 'ACT-004', vehicle: 'MP-04-BH-3456', inTime: '08:15 AM', expiryTime: Date.now() + 300000, duration: '4h', slot: 'A-15' },
  { id: 'ACT-005', vehicle: 'UP-16-ND-7890', inTime: '11:00 AM', expiryTime: Date.now() + 2400000, duration: '2h', slot: 'D-22' },
  { id: 'ACT-006', vehicle: 'RJ-14-JP-1122', inTime: '09:20 AM', expiryTime: Date.now() + 900000, duration: '3h', slot: 'B-04' },
  { id: 'ACT-007', vehicle: 'GJ-01-AH-3344', inTime: '10:15 AM', expiryTime: Date.now() + 450000, duration: '1.5h', slot: 'A-09' },
  { id: 'ACT-008', vehicle: 'TN-01-CH-5566', inTime: '08:50 AM', expiryTime: Date.now() + 3600000, duration: '4h', slot: 'C-11' },
  { id: 'ACT-009', vehicle: 'TS-09-HY-7788', inTime: '11:10 AM', expiryTime: Date.now() + 1500000, duration: '1h', slot: 'B-18' },
  { id: 'ACT-010', vehicle: 'WB-02-KO-9900', inTime: '09:05 AM', expiryTime: Date.now() + 750000, duration: '2.5h', slot: 'D-05' },
  { id: 'ACT-011', vehicle: 'PB-01-AM-2233', inTime: '10:40 AM', expiryTime: Date.now() + 2100000, duration: '1.5h', slot: 'A-20' },
  { id: 'ACT-012', vehicle: 'KL-07-KO-4455', inTime: '08:30 AM', expiryTime: Date.now() + 200000, duration: '4h', slot: 'B-01' },
  { id: 'ACT-013', vehicle: 'BR-01-PA-6677', inTime: '11:25 AM', expiryTime: Date.now() + 3000000, duration: '2h', slot: 'C-25' },
  { id: 'ACT-014', vehicle: 'UK-07-DD-8899', inTime: '09:55 AM', expiryTime: Date.now() + 1300000, duration: '3h', slot: 'A-07' },
  { id: 'ACT-015', vehicle: 'GA-01-PN-1122', inTime: '10:50 AM', expiryTime: Date.now() + 500000, duration: '1h', slot: 'D-12' },
  { id: 'ACT-016', vehicle: 'JH-01-RN-3344', inTime: '08:10 AM', expiryTime: Date.now() + 800000, duration: '4.5h', slot: 'B-15' },
  { id: 'ACT-017', vehicle: 'MH-02-PN-5566', inTime: '11:35 AM', expiryTime: Date.now() + 4200000, duration: '2h', slot: 'A-30' },
  { id: 'ACT-018', vehicle: 'DL-01-ND-7788', inTime: '10:20 AM', expiryTime: Date.now() + 1100000, duration: '2.5h', slot: 'C-02' },
  { id: 'ACT-019', vehicle: 'KA-01-BN-9900', inTime: '09:15 AM', expiryTime: Date.now() + 2700000, duration: '3.5h', slot: 'D-10' },
  { id: 'ACT-020', vehicle: 'MP-01-IN-1122', inTime: '11:45 AM', expiryTime: Date.now() + 5000000, duration: '1h', slot: 'B-09' },
];

const CUSTOMER_COMPLAINTS = [
  { id: 'CMP-101', type: 'Payment Issue', desc: 'I tried to pay ₹25 using PhonePe UPI. The amount was deducted twice from my bank account, but the app only showed one successful transaction. Please refund the extra ₹25 as soon as possible.', status: 'Pending', user: 'Rahul K.', date: '27 Apr 2025' },
  { id: 'CMP-102', type: 'Technical', desc: 'The live map in the app was showing slot B-12 as occupied (red color), but when I reached there, it was completely empty. This caused a lot of confusion and I had to circle around twice.', status: 'Resolved', user: 'Sneha R.', date: '26 Apr 2025' },
  { id: 'CMP-103', type: 'Behaviour', desc: 'The security guard at the Sector-Alpha entry point was very rude. He was not allowing me to enter because I was showing my digital ID on phone instead of a physical card. He should be trained on digital policies.', status: 'Processing', user: 'Arjun M.', date: '25 Apr 2025' },
];

const INDIA_PARKING_DATA = {
  'Maharashtra': {
    'Mumbai': [
      { name: 'Gateway of India Parking', distance: '0.5 km', available: 12, total: 50 },
      { name: 'Phoenix Marketcity Kurla', distance: '5.2 km', available: 156, total: 500 },
      { name: 'Marine Drive Public Parking', distance: '1.2 km', available: 0, total: 30 },
      { name: 'Colaba Causeway Parking', distance: '0.8 km', available: 5, total: 20 },
      { name: 'Juhu Beach Multi-Level', distance: '8.4 km', available: 45, total: 100 },
      { name: 'Bandra Kurla Complex (BKC)', distance: '4.1 km', available: 88, total: 250 },
      { name: 'Nariman Point Corporate', distance: '1.5 km', available: 20, total: 80 },
      { name: 'Andheri Station East', distance: '7.2 km', available: 3, total: 40 },
      { name: 'Worli Seaface Parking', distance: '3.5 km', available: 12, total: 60 },
      { name: 'Dadar TT Circle Parking', distance: '2.8 km', available: 0, total: 25 },
      { name: 'R-City Mall Ghatkopar', distance: '6.7 km', available: 120, total: 450 },
      { name: 'Oberoi Mall Goregaon', distance: '11.2 km', available: 65, total: 300 },
      { name: 'Infiniti Mall Malad', distance: '13.5 km', available: 90, total: 400 },
      { name: 'CST Station Main Parking', distance: '1.1 km', available: 8, total: 100 },
      { name: 'High Street Phoenix Parel', distance: '4.5 km', available: 32, total: 200 }
    ],
    'Pune': [
      { name: 'Koregaon Park Central', distance: '1.2 km', available: 8, total: 40 },
      { name: 'Phoenix Mall Viman Nagar', distance: '3.4 km', available: 45, total: 200 },
      { name: 'Amanora Mall Hadapsar', distance: '5.1 km', available: 110, total: 350 },
      { name: 'FC Road Multi-level', distance: '0.5 km', available: 15, total: 80 },
      { name: 'Shaniwar Wada Public', distance: '1.1 km', available: 2, total: 30 },
      { name: 'Hinjewadi IT Park Ph-1', distance: '12.4 km', available: 200, total: 500 },
      { name: 'Magarpatta City Parking', distance: '6.2 km', available: 75, total: 300 },
      { name: 'Seasons Mall Parking', distance: '5.3 km', available: 40, total: 250 },
      { name: 'Savitribai Phule University', distance: '4.5 km', available: 30, total: 100 },
      { name: 'Pune Railway Station', distance: '2.1 km', available: 10, total: 150 },
      { name: 'Swargate Bus Stand', distance: '3.2 km', available: 5, total: 60 },
      { name: 'JM Road Pay n Park', distance: '0.8 km', available: 12, total: 50 },
      { name: 'Kothrud Stand Parking', distance: '4.8 km', available: 18, total: 70 },
      { name: 'Pimpri Central Mall', distance: '14.2 km', available: 55, total: 150 },
      { name: 'Pavilion Mall SB Road', distance: '2.5 km', available: 22, total: 120 }
    ]
  },
  'Delhi': {
    'New Delhi': [
      { name: 'Connaught Place Block-A', distance: '0.2 km', available: 5, total: 120 },
      { name: 'India Gate Public Parking', distance: '1.5 km', available: 45, total: 200 },
      { name: 'Chanakyapuri Corporate', distance: '4.1 km', available: 22, total: 80 },
      { name: 'Select Citywalk Saket', distance: '9.2 km', available: 130, total: 400 },
      { name: 'Khan Market Parking', distance: '2.4 km', available: 2, total: 40 },
      { name: 'Lajpat Nagar Central Market', distance: '6.5 km', available: 0, total: 100 },
      { name: 'Janpath Shopping Parking', distance: '0.5 km', available: 8, total: 60 },
      { name: 'DLF Avenue Saket', distance: '9.5 km', available: 75, total: 300 },
      { name: 'Vasant Kunj DLF Promenade', distance: '11.2 km', available: 90, total: 350 },
      { name: 'Aerocity GMR Square', distance: '15.4 km', available: 180, total: 500 },
      { name: 'Karol Bagh Metro', distance: '4.8 km', available: 10, total: 150 },
      { name: 'Chandni Chowk Multi-level', distance: '3.1 km', available: 40, total: 400 },
      { name: 'SDA Market Parking', distance: '8.2 km', available: 12, total: 40 },
      { name: 'Hauz Khas Village Entry', distance: '8.5 km', available: 5, total: 30 },
      { name: 'PVR Anupam Saket', distance: '10.1 km', available: 25, total: 100 }
    ]
  },
  'Karnataka': {
    'Bengaluru': [
      { name: 'MG Road Metro Parking', distance: '0.4 km', available: 10, total: 60 },
      { name: 'Indiranagar 100ft Road', distance: '1.8 km', available: 3, total: 40 },
      { name: 'Whitefield ITPL Parking', distance: '6.5 km', available: 230, total: 600 },
      { name: 'UB City Vittal Mallya', distance: '1.2 km', available: 45, total: 200 },
      { name: 'Phoenix Marketcity Whitefield', distance: '7.1 km', available: 120, total: 500 },
      { name: 'Forum Mall Koramangala', distance: '3.5 km', available: 25, total: 150 },
      { name: 'Brigade Road Junction', distance: '0.6 km', available: 0, total: 50 },
      { name: 'Manyata Tech Park Ph-2', distance: '10.2 km', available: 300, total: 800 },
      { name: 'Electronic City Ph-1 Toll', distance: '15.4 km', available: 150, total: 400 },
      { name: 'Jayanagar 4th Block', distance: '4.2 km', available: 12, total: 100 },
      { name: 'Mantri Square Mall Malleshwaram', distance: '3.8 km', available: 60, total: 300 },
      { name: 'Majestic Railway Station', distance: '3.2 km', available: 15, total: 250 },
      { name: 'Cunningham Road Parking', distance: '1.5 km', available: 8, total: 40 },
      { name: 'Commercial Street Entry', distance: '1.1 km', available: 0, total: 30 },
      { name: 'ORR Marathahalli Bridge', distance: '8.5 km', available: 40, total: 150 }
    ]
  },
  'Madhya Pradesh': {
    'Bhopal': [
      { name: 'DB Mall Arera Hills', distance: '0.6 km', available: 35, total: 150 },
      { name: 'MP Nagar Zone-1 Multi-level', distance: '1.2 km', available: 10, total: 40 },
      { name: 'Bhopal Junction Platform 1', distance: '4.5 km', available: 20, total: 100 },
      { name: 'C21 Mall Misrod', distance: '8.4 km', available: 65, total: 200 },
      { name: '10 Number Market Parking', distance: '2.1 km', available: 5, total: 40 },
      { name: 'New Market Multilevel', distance: '3.2 km', available: 80, total: 300 },
      { name: 'Bittan Market Ground', distance: '3.8 km', available: 15, total: 100 },
      { name: 'Habibganj Station (RKMP)', distance: '4.2 km', available: 50, total: 250 },
      { name: 'Ashima Mall Hoshangabad Rd', distance: '9.1 km', available: 45, total: 150 },
      { name: 'Clover Mall Gulmohar', distance: '5.5 km', available: 20, total: 80 },
      { name: 'Board Office Square', distance: '1.5 km', available: 8, total: 60 },
      { name: 'Indrapuri B-Sector', distance: '6.8 km', available: 12, total: 50 },
      { name: 'Lake View Boat Club', distance: '5.2 km', available: 0, total: 30 },
      { name: 'Van Vihar Entry Point', distance: '7.5 km', available: 10, total: 50 },
      { name: 'Platinum Plaza TT Nagar', distance: '2.8 km', available: 22, total: 100 }
    ],
    'Indore': [
      { name: 'Rajwada Market Square', distance: '0.3 km', available: 0, total: 50 },
      { name: 'TI Mall MG Road', distance: '2.1 km', available: 85, total: 300 },
      { name: 'Vijay Nagar C21 Square', distance: '3.8 km', available: 120, total: 400 },
      { name: 'Indore Junction Station', distance: '2.5 km', available: 30, total: 150 },
      { name: 'Sapna Sangeeta Cinema', distance: '4.2 km', available: 15, total: 100 },
      { name: '56 Dukan Street Parking', distance: '1.8 km', available: 5, total: 40 },
      { name: 'Malhar Mega Mall', distance: '3.9 km', available: 50, total: 250 },
      { name: 'Annapurna Temple Public', distance: '6.2 km', available: 20, total: 100 },
      { name: 'Bhanwarkuan Square IT Park', distance: '5.5 km', available: 40, total: 120 },
      { name: 'Super Corridor Metro Stn', distance: '12.4 km', available: 200, total: 600 },
      { name: 'Palasia Point Parking', distance: '2.8 km', available: 10, total: 80 },
      { name: 'Marothia Bazaar Parking', distance: '0.5 km', available: 0, total: 30 },
      { name: 'Khajrana Temple Ground', distance: '7.2 km', available: 55, total: 200 },
      { name: 'Geeta Bhawan Square', distance: '3.1 km', available: 12, total: 60 },
      { name: 'Chappan Chowk Food Hub', distance: '1.9 km', available: 3, total: 30 }
    ]
  },
  'Uttar Pradesh': {
    'Noida': [
      { name: 'DLF Mall of India Ph-1', distance: '0.5 km', available: 230, total: 1000 },
      { name: 'Sector 18 Market Multi-level', distance: '0.2 km', available: 150, total: 600 },
      { name: 'Advant Navis Sector 142', distance: '12.4 km', available: 400, total: 800 },
      { name: 'Great India Place (GIP)', distance: '0.8 km', available: 85, total: 400 },
      { name: 'Gardens Galleria Mall', distance: '0.9 km', available: 120, total: 500 },
      { name: 'Sector 62 IT Hub Parking', distance: '8.5 km', available: 200, total: 450 },
      { name: 'Botanical Garden Metro', distance: '1.5 km', available: 40, total: 250 },
      { name: 'Logix City Centre Sec-32', distance: '4.2 km', available: 65, total: 300 },
      { name: 'Brahmaputra Market Sec-29', distance: '2.1 km', available: 5, total: 50 },
      { name: 'Omaxe Connaught Place', distance: '15.2 km', available: 300, total: 700 },
      { name: 'Wave Mall Sector 18', distance: '0.3 km', available: 20, total: 150 },
      { name: 'Noida City Center Metro', distance: '4.5 km', available: 12, total: 200 },
      { name: 'Sector 125 Amity Univ', distance: '6.2 km', available: 45, total: 150 },
      { name: 'Film City Sector 16A', distance: '2.5 km', available: 30, total: 100 },
      { name: 'Noida Electronic City Metro', distance: '10.4 km', available: 80, total: 300 }
    ]
  },
  'Rajasthan': {
    'Jaipur': [
      { name: 'Pink City Hawa Mahal Parking', distance: '0.2 km', available: 10, total: 50 },
      { name: 'World Trade Park Malviya Nagar', distance: '5.4 km', available: 120, total: 400 },
      { name: 'MGF Metropolitan Mall', distance: '3.1 km', available: 45, total: 200 },
      { name: 'Albert Hall Museum Public', distance: '1.2 km', available: 15, total: 60 },
      { name: 'Johari Bazaar Parking', distance: '0.5 km', available: 0, total: 40 },
      { name: 'Jaipur Junction North Gate', distance: '2.8 km', available: 25, total: 100 },
      { name: 'Amer Fort Lower Ground', distance: '11.5 km', available: 80, total: 150 },
      { name: 'City Palace Main Entry', distance: '0.8 km', available: 5, total: 30 },
      { name: 'Jal Mahal Lake View', distance: '6.2 km', available: 40, total: 80 },
      { name: 'Crystal Palm Mall Bais Godam', distance: '4.5 km', available: 30, total: 120 },
      { name: 'Triton Mall Jhotwara Rd', distance: '8.2 km', available: 65, total: 250 },
      { name: 'MI Road Public Parking', distance: '1.5 km', available: 8, total: 50 },
      { name: 'Raja Park Community Centre', distance: '3.5 km', available: 12, total: 40 },
      { name: 'Mansarovar Metro Parking', distance: '9.4 km', available: 150, total: 300 },
      { name: 'GT Central Mall Malviya Nagar', distance: '5.6 km', available: 40, total: 200 }
    ]
  },
  'Gujarat': {
    'Ahmedabad': [
      { name: 'Alpha One Mall Vastrapur', distance: '0.5 km', available: 180, total: 600 },
      { name: 'Sabarmati Riverfront Parking', distance: '1.2 km', available: 50, total: 200 },
      { name: 'CG Road Multi-level', distance: '0.2 km', available: 40, total: 150 },
      { name: 'Iscon Mega Mall S.G Highway', distance: '4.5 km', available: 95, total: 400 },
      { name: 'Ahmedabad Junction Stn', distance: '3.8 km', available: 15, total: 120 },
      { name: 'Science City Main Parking', distance: '10.2 km', available: 120, total: 300 },
      { name: 'Kankaria Lake Front P-1', distance: '5.1 km', available: 60, total: 250 },
      { name: 'Law Garden Evening Market', distance: '2.4 km', available: 5, total: 60 },
      { name: 'Manek Chowk Night Parking', distance: '1.5 km', available: 0, total: 50 },
      { name: 'Gulmohar Park Mall', distance: '6.2 km', available: 45, total: 200 },
      { name: 'Himalaya Mall Drive-in Rd', distance: '4.8 km', available: 32, total: 150 },
      { name: 'Prahlad Nagar Corporate', distance: '7.5 km', available: 80, total: 300 },
      { name: 'Airport Circle Parking', distance: '12.4 km', available: 150, total: 500 },
      { name: 'GIFT City Tower-1 Parking', distance: '18.5 km', available: 500, total: 1200 },
      { name: 'Bhadra Fort Plaza Parking', distance: '2.1 km', available: 10, total: 80 }
    ]
  },
  'Tamil Nadu': {
    'Chennai': [
      { name: 'Express Avenue Mall Royapettah', distance: '0.6 km', available: 120, total: 500 },
      { name: 'Marina Beach Service Road', distance: '1.2 km', available: 20, total: 150 },
      { name: 'Phoenix Marketcity Velachery', distance: '8.4 km', available: 250, total: 800 },
      { name: 'T-Nagar Multi-level Parking', distance: '3.5 km', available: 15, total: 200 },
      { name: 'Chennai Central Railway Stn', distance: '4.2 km', available: 30, total: 300 },
      { name: 'Spencer Plaza Mount Road', distance: '1.1 km', available: 45, total: 250 },
      { name: 'Besant Nagar Beach Parking', distance: '10.5 km', available: 10, total: 80 },
      { name: 'Forum Vijaya Mall Vadapalani', distance: '6.8 km', available: 90, total: 400 },
      { name: 'OMR IT Corridor Ph-1', distance: '12.4 km', available: 350, total: 1000 },
      { name: 'Anna Nagar Tower Park', distance: '5.2 km', available: 22, total: 100 },
      { name: 'Ampa Skywalk Aminjikarai', distance: '7.1 km', available: 55, total: 200 },
      { name: 'Guindy Metro Parking', distance: '9.4 km', available: 80, total: 250 },
      { name: 'Koyambedu Bus Terminus', distance: '8.2 km', available: 100, total: 500 },
      { name: 'Santhome Cathedral Public', distance: '2.5 km', available: 5, total: 40 },
      { name: 'Mylapore Tank Parking', distance: '1.8 km', available: 0, total: 30 }
    ]
  },
  'Telangana': {
    'Hyderabad': [
      { name: 'GVK One Mall Banjara Hills', distance: '0.8 km', available: 85, total: 400 },
      { name: 'Inorbit Mall Madhapur', distance: '5.4 km', available: 210, total: 700 },
      { name: 'Charminar Public Parking', distance: '12.5 km', available: 0, total: 60 },
      { name: 'IKEA Hyderabad Basement', distance: '6.2 km', available: 450, total: 1200 },
      { name: 'DLF Cyber City Gachibowli', distance: '7.5 km', available: 300, total: 800 },
      { name: 'Hyderabad Central Punjagutta', distance: '1.2 km', available: 40, total: 250 },
      { name: 'Secunderabad Railway Stn', distance: '8.4 km', available: 60, total: 400 },
      { name: 'Necklace Road Lake View', distance: '3.1 km', available: 25, total: 100 },
      { name: 'Hi-Tech City Metro Parking', distance: '5.8 km', available: 120, total: 350 },
      { name: 'Lumbini Park Entry Parking', distance: '2.5 km', available: 15, total: 80 },
      { name: 'Forum Sujana Mall Kukatpally', distance: '9.2 km', available: 130, total: 500 },
      { name: 'Jubilee Hills Checkpost', distance: '2.1 km', available: 8, total: 50 },
      { name: 'HITEX Exhibition Center', distance: '10.5 km', available: 500, total: 1500 },
      { name: 'Prasad Imax Tank Bund', distance: '3.8 km', available: 75, total: 300 },
      { name: 'Begumpet Airport Corporate', distance: '4.5 km', available: 110, total: 400 }
    ]
  },
  'West Bengal': {
    'Kolkata': [
      { name: 'South City Mall Prince Anwar', distance: '1.2 km', available: 180, total: 600 },
      { name: 'Quest Mall Syed Amir Ali', distance: '0.5 km', available: 95, total: 450 },
      { name: 'New Market Municipal Corp', distance: '4.8 km', available: 10, total: 200 },
      { name: 'Park Street Multi-level', distance: '0.2 km', available: 15, total: 150 },
      { name: 'Howrah Station Platform 1', distance: '6.5 km', available: 40, total: 300 },
      { name: 'Victoria Memorial Parking', distance: '2.1 km', available: 22, total: 100 },
      { name: 'Science City Kolkata', distance: '8.4 km', available: 150, total: 400 },
      { name: 'Salt Lake Sector V IT Hub', distance: '10.2 km', available: 400, total: 1000 },
      { name: 'Eco Park Gate 1 Parking', distance: '15.4 km', available: 250, total: 600 },
      { name: 'City Centre 1 Salt Lake', distance: '7.8 km', available: 120, total: 350 },
      { name: 'Mani Square Mall EM Bypass', distance: '6.2 km', available: 85, total: 400 },
      { name: 'Sealdah Station Main', distance: '5.1 km', available: 20, total: 250 },
      { name: 'Kalighat Temple Entry', distance: '3.5 km', available: 0, total: 40 },
      { name: 'Lake Mall Rashbehari Ave', distance: '2.8 km', available: 35, total: 150 },
      { name: 'Acropolis Mall Kasba', distance: '5.4 km', available: 65, total: 300 }
    ]
  },
  'Punjab': {
    'Amritsar': [
      { name: 'Golden Temple Multi-level', distance: '0.3 km', available: 200, total: 800 },
      { name: 'Hall Bazaar Public Parking', distance: '0.8 km', available: 15, total: 100 },
      { name: 'Amritsar Junction Stn', distance: '2.5 km', available: 45, total: 250 },
      { name: 'Celebration Mall Batala Rd', distance: '3.2 km', available: 80, total: 300 },
      { name: 'Alpha One Mall GT Road', distance: '4.5 km', available: 120, total: 500 },
      { name: 'Wagah Border Tourist P-1', distance: '28.4 km', available: 300, total: 1000 },
      { name: 'Trillium Mall Amritsar', distance: '5.1 km', available: 150, total: 600 },
      { name: 'Ranjit Avenue C-Block', distance: '4.2 km', available: 40, total: 150 },
      { name: 'Lawrence Road Market', distance: '1.8 km', available: 5, total: 60 },
      { name: 'Jallianwala Bagh Entry', distance: '0.5 km', available: 0, total: 30 },
      { name: 'Durgiana Temple Ground', distance: '1.5 km', available: 35, total: 120 },
      { name: 'Mall Road Public Parking', distance: '2.1 km', available: 12, total: 80 },
      { name: 'Putlighar Market Area', distance: '3.8 km', available: 8, total: 50 },
      { name: 'Saddu Singh Market', distance: '2.9 km', available: 18, total: 70 },
      { name: 'Gumtala Bypass Parking', distance: '6.4 km', available: 100, total: 400 }
    ]
  },
  'Kerala': {
    'Kochi': [
      { name: 'Lulu Mall Edappally', distance: '0.5 km', available: 450, total: 2500 },
      { name: 'Marine Drive GCDA Parking', distance: '6.2 km', available: 40, total: 200 },
      { name: 'MG Road Multi-level', distance: '5.4 km', available: 25, total: 150 },
      { name: 'Ernakulam South Station', distance: '7.1 km', available: 60, total: 300 },
      { name: 'Fort Kochi Beach Public', distance: '12.5 km', available: 15, total: 100 },
      { name: 'Centre Square Mall', distance: '4.8 km', available: 85, total: 350 },
      { name: 'Oberon Mall NH 66', distance: '3.2 km', available: 65, total: 250 },
      { name: 'Kochi Metro Edappally Stn', distance: '0.6 km', available: 120, total: 400 },
      { name: 'Infopark Phase 1 SmartBusiness', distance: '15.4 km', available: 500, total: 1500 },
      { name: 'Vytila Mobility Hub', distance: '8.2 km', available: 200, total: 600 },
      { name: 'Jew Town Mattancherry', distance: '11.5 km', available: 5, total: 50 },
      { name: 'Broadway Market Entry', distance: '5.1 km', available: 0, total: 40 },
      { name: 'Gold Souk Grande Vytila', distance: '8.5 km', available: 40, total: 300 },
      { name: 'Rajendra Maidan Parking', distance: '6.8 km', available: 22, total: 100 },
      { name: 'Chittethukara Corporate', distance: '14.1 km', available: 180, total: 450 }
    ]
  },
  'Bihar': {
    'Patna': [
      { name: 'Gandhi Maidan Gate 1', distance: '0.4 km', available: 100, total: 500 },
      { name: 'Patna Junction Platform 1', distance: '1.2 km', available: 30, total: 200 },
      { name: 'P&M Mall Patliputra', distance: '5.4 km', available: 85, total: 400 },
      { name: 'Dak Bunglow Chouraha', distance: '0.5 km', available: 0, total: 60 },
      { name: 'Patna Museum Public', distance: '2.1 km', available: 15, total: 80 },
      { name: 'Maurya Lok Complex', distance: '0.8 km', available: 40, total: 250 },
      { name: 'Boring Road Market Area', distance: '3.5 km', available: 5, total: 100 },
      { name: 'Golghar Tourist Parking', distance: '1.5 km', available: 20, total: 60 },
      { name: 'Eco Park Gate 2 Patna', distance: '4.2 km', available: 55, total: 150 },
      { name: 'Rajendra Nagar Terminal', distance: '6.8 km', available: 45, total: 200 },
      { name: 'Kankarbagh Community', distance: '7.1 km', available: 32, total: 120 },
      { name: 'Bailey Road Corporate', distance: '5.5 km', available: 60, total: 250 },
      { name: 'Frazer Road Parking', distance: '1.1 km', available: 12, total: 80 },
      { name: 'Digha Ghat Public Ground', distance: '9.4 km', available: 150, total: 400 },
      { name: 'Ashoka Cinema Road', distance: '2.4 km', available: 8, total: 50 }
    ]
  },
  'Uttarakhand': {
    'Dehradun': [
      { name: 'Pacific Mall Rajpur Road', distance: '0.8 km', available: 110, total: 500 },
      { name: 'Clock Tower Multi-level', distance: '0.2 km', available: 30, total: 150 },
      { name: 'Paltan Bazaar Entry', distance: '0.5 km', available: 0, total: 40 },
      { name: 'Dehradun Railway Station', distance: '1.5 km', available: 45, total: 200 },
      { name: 'ISBT Dehradun Parking', distance: '8.4 km', available: 120, total: 400 },
      { name: 'Rajpur Road Shopping Hub', distance: '1.2 km', available: 25, total: 120 },
      { name: 'Doon IT Park Sahastradhara', distance: '10.5 km', available: 200, total: 600 },
      { name: 'Gandhi Park Gate Parking', distance: '0.6 km', available: 15, total: 80 },
      { name: 'Crossroads Mall Dehradun', distance: '2.4 km', available: 50, total: 250 },
      { name: 'FRI Main Campus Entry', distance: '6.2 km', available: 80, total: 150 },
      { name: 'Robbers Cave Tourist P-1', distance: '9.1 km', available: 65, total: 120 },
      { name: 'Jakhan Market Complex', distance: '4.5 km', available: 12, total: 60 },
      { name: 'Ballupur Chowk Parking', distance: '5.2 km', available: 35, total: 100 },
      { name: 'Karanpur Market Area', distance: '1.8 km', available: 8, total: 50 },
      { name: 'Survey Chowk Public', distance: '2.9 km', available: 22, total: 80 }
    ]
  },
  'Goa': {
    'Panaji': [
      { name: 'Patto Plaza Corporate', distance: '0.5 km', available: 150, total: 600 },
      { name: 'Miramar Beach Public', distance: '3.4 km', available: 85, total: 300 },
      { name: 'Dona Paula View Point', distance: '7.2 km', available: 40, total: 150 },
      { name: 'Panjim Market Multi-level', distance: '0.8 km', available: 25, total: 250 },
      { name: 'Casinos Jetty Parking', distance: '1.2 km', available: 10, total: 100 },
      { name: 'Old Goa Church Heritage', distance: '10.5 km', available: 180, total: 400 },
      { name: 'Mall de Goa Porvorim', distance: '5.1 km', available: 220, total: 800 },
      { name: 'Calangute Beach P-1', distance: '15.4 km', available: 50, total: 400 },
      { name: 'Baga Beach Lane Parking', distance: '16.2 km', available: 0, total: 120 },
      { name: 'Margoa Railway Station', distance: '32.4 km', available: 150, total: 500 },
      { name: 'Caculo Mall St Inez', distance: '2.5 km', available: 45, total: 200 },
      { name: 'Fontainhas Heritage Area', distance: '1.5 km', available: 5, total: 40 },
      { name: 'Altinho Hill Public', distance: '1.8 km', available: 12, total: 60 },
      { name: 'Mandovi Riverfront', distance: '0.4 km', available: 30, total: 120 },
      { name: 'Candolim Main Market', distance: '14.5 km', available: 20, total: 150 }
    ]
  },
  'Jharkhand': {
    'Ranchi': [
      { name: 'Nucleus Mall Circular Rd', distance: '0.4 km', available: 80, total: 300 },
      { name: 'Main Road Multi-level Parking', distance: '0.2 km', available: 20, total: 150 },
      { name: 'Ranchi Junction Platform 1', distance: '1.8 km', available: 45, total: 200 },
      { name: 'JD Hi-Street Mall Main Rd', distance: '0.5 km', available: 30, total: 120 },
      { name: 'Albert Ekka Chowk Public', distance: '0.1 km', available: 0, total: 40 },
      { name: 'Lalpur Chowk Market Area', distance: '1.5 km', available: 5, total: 60 },
      { name: 'Spring City Mall Hinoo', distance: '5.4 km', available: 65, total: 250 },
      { name: 'Birsa Munda Airport P-1', distance: '7.2 km', available: 120, total: 300 },
      { name: 'Kutchery Road Corporate', distance: '1.1 km', available: 15, total: 80 },
      { name: 'Harmu Ground Public Parking', distance: '3.8 km', available: 50, total: 200 },
      { name: 'Jagannath Temple Entry', distance: '8.5 km', available: 40, total: 150 },
      { name: 'Doranda Market Parking', distance: '4.2 km', available: 12, total: 70 },
      { name: 'Heavy Engineering Corp (HEC)', distance: '9.4 km', available: 100, total: 400 },
      { name: 'Morabadi Ground Parking', distance: '2.8 km', available: 85, total: 300 },
      { name: 'Piska More Market Parking', distance: '6.1 km', available: 10, total: 50 }
    ],
    'Jamshedpur': [
      { name: 'P&M Hi-Tech Mall Bistupur', distance: '0.6 km', available: 95, total: 400 },
      { name: 'Bistupur Main Market', distance: '0.2 km', available: 0, total: 60 },
      { name: 'Sakchi Market Multi-level', distance: '2.4 km', available: 40, total: 200 },
      { name: 'Tatanagar Railway Station', distance: '4.5 km', available: 55, total: 250 },
      { name: 'Jubilee Park Gate 1', distance: '1.2 km', available: 30, total: 100 },
      { name: 'Adityapur Industrial Hub', distance: '6.8 km', available: 150, total: 500 },
      { name: 'Sonari Airport Corporate', distance: '5.1 km', available: 20, total: 80 },
      { name: 'Telco Colony Market', distance: '12.4 km', available: 45, total: 150 },
      { name: 'Super Center Sakchi', distance: '2.5 km', available: 12, total: 100 },
      { name: 'Gopal Maidan Bistupur', distance: '0.8 km', available: 60, total: 300 },
      { name: 'Dalma Wildlife Entry', distance: '18.5 km', available: 15, total: 50 },
      { name: 'Mango Bridge Parking', distance: '3.2 km', available: 5, total: 40 },
      { name: 'Kadma Market Ground', distance: '4.1 km', available: 18, total: 80 },
      { name: 'Golmuri Market Area', distance: '5.8 km', available: 10, total: 60 },
      { name: 'Baridih Market Parking', distance: '7.5 km', available: 22, total: 100 }
    ]
  }
};

const HOURLY_RATE = 25;

const App = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [reportSubSection, setReportSubSection] = useState('feedback');
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [reservations, setReservations] = useState(RECENT_RESERVATIONS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [payments, setPayments] = useState(PAYMENTS_HISTORY);
  const [feedbacks, setFeedbacks] = useState(WORKER_FEEDBACK);
  const [complaints, setComplaints] = useState(CUSTOMER_COMPLAINTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [logs, setLogs] = useState([]);
  const [isLockdown, setIsLockdown] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [newBooking, setNewBooking] = useState({ vehicle: '', slot: '', duration: 1, startTime: new Date().toISOString().slice(0, 16) });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User', status: 'Active' });
  const [newComplaint, setNewComplaint] = useState({ type: 'Payment Issue', desc: '', user: '' });
  const [newFeedback, setNewFeedback] = useState({ worker: '', rating: 5, feedback: '', user: '' });
  const [selectedParking, setSelectedParking] = useState(null);
  
  // Alert, Role & UI States
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState(true);
  const [notifiedReservations, setNotifiedReservations] = useState([]);
  const [userRole, setUserRole] = useState('admin'); // 'admin' or 'user'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapTilt, setMapTilt] = useState(0); // Start flat for better clarity
  const [mapRotation, setMapRotation] = useState(0);
  const [showAllActivity, setShowAllActivity] = useState(false);
  
  const availableParkingLots = INDIA_PARKING_DATA[selectedState][selectedCity] || [];

  useEffect(() => {
    if (isLockdown) return;
    const interval = setInterval(() => {
      setSlots(prev => {
        const newSlots = [...prev];
        const randomIdx = Math.floor(Math.random() * newSlots.length);
        const oldStatus = newSlots[randomIdx].status;
        const newStatus = oldStatus === 'available' ? 'occupied' : 'available';
        newSlots[randomIdx] = { ...newSlots[randomIdx], status: newStatus };
        if (newStatus === 'occupied') { setLogs(l => [{ time: new Date().toLocaleTimeString(), msg: `Vehicle entered ${newSlots[randomIdx].id}` }, ...l].slice(0, 10)); }
        else { setLogs(l => [{ time: new Date().toLocaleTimeString(), msg: `Vehicle exited ${newSlots[randomIdx].id}` }, ...l].slice(0, 10)); }
        return newSlots;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isLockdown]);

  const availableCount = isLockdown ? 0 : slots.filter(s => s.status === 'available').length;
  const occupiedCount = isLockdown ? slots.length : slots.filter(s => s.status === 'occupied').length;
  const reservedCount = isLockdown ? 0 : slots.filter(s => s.status === 'reserved').length;
  const pieData = [ { name: 'Available', value: availableCount, color: '#22c55e' }, { name: 'Occupied', value: occupiedCount, color: '#6366f1' }, { name: 'Reserved', value: reservedCount, color: '#f59e0b' } ];

  const handleStateChange = (state) => { setSelectedState(state); setSelectedCity(Object.keys(INDIA_PARKING_DATA[state])[0]); setSelectedParking(null); };
  const handleCityChange = (city) => { setSelectedCity(city); setSelectedParking(null); };

  const handleSelectParking = (park) => {
    setSelectedParking(park);
    const total = park.total;
    const available = park.available;
    const occupied = total - available;
    
    const newSlots = Array.from({ length: total }, (_, i) => {
      let status = 'available';
      if (i < occupied) {
        status = 'occupied';
      } else if (Math.random() < 0.15) { // Increased to 15% for better visibility
        status = 'reserved';
      }
      return {
        id: `${String.fromCharCode(65 + Math.floor(i / (total/5)) || 65)}-${String(i % (total/5) + 1).padStart(2, '0')}`,
        status: status
      };
    });

    // Merge actual active reservations into slots
    const syncedSlots = newSlots.map(s => {
      const activeRes = reservations.find(r => r.slot === s.id && r.status === 'Confirmed');
      if (activeRes) return { ...s, status: 'reserved' };
      return s;
    });

    setSlots(syncedSlots);
    setNotification(`Switched to ${park.name} Command Center`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Request Notification Permissions & Persistence
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    // Load from localStorage
    const savedReservations = localStorage.getItem('parksmart_res');
    if (savedReservations) {
      try {
        const parsed = JSON.parse(savedReservations);
        setReservations(parsed);
      } catch (e) {
        console.error("Failed to parse saved reservations");
      }
    }
  }, []);

  // Save to localStorage whenever reservations change
  useEffect(() => {
    localStorage.setItem('parksmart_res', JSON.stringify(reservations));
  }, [reservations]);

  // Sync active reservations to slots when reservations change
  useEffect(() => {
    if (!selectedParking || slots.length === 0) return;
    
    const updatedSlots = slots.map(s => {
      const activeRes = reservations.find(r => r.slot === s.id && r.status === 'Confirmed');
      if (activeRes) return { ...s, status: 'reserved' };
      return s;
    });
    
    // Only update if changed to avoid loops
    if (JSON.stringify(updatedSlots) !== JSON.stringify(slots)) {
      setSlots(updatedSlots);
    }
  }, [reservations, selectedParking]);

  const handleVerify = () => { setIsVerifying(true); setNotification("Running diagnostics..."); setTimeout(() => { setIsVerifying(false); setNotification("All systems verified."); setTimeout(() => setNotification(null), 3000); }, 2000); };
  const handleLockdown = () => { setIsLockdown(!isLockdown); setNotification(isLockdown ? "Lockdown lifted." : "CRITICAL: Area Lockdown!"); setTimeout(() => setNotification(null), 4000); };
  
  // Automatic Expiration Alert Logic
  useEffect(() => {
    if (!autoAlertsEnabled) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      reservations.forEach(res => {
        if (res.expiryTime && !notifiedReservations.includes(res.id)) {
          const timeLeft = res.expiryTime - now;
          // 10 minutes = 600,000 ms
          if (timeLeft > 0 && timeLeft <= 600000) {
            setNotification(`⚠️ ALERT: Booking for ${res.vehicle} (Slot ${res.slot}) expires in ${Math.round(timeLeft/60000)} mins!`);
            setNotifiedReservations(prev => [...prev, res.id]);
            
            // Audio alert (ringing form)
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log("Audio alert blocked by browser policy"));

            // System-level Notification (works even if user is on another tab/offline)
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("ParkSmart Expiry Alert ⚠️", {
                body: `Attention! Booking for ${res.vehicle} at Slot ${res.slot} will expire in 10 minutes.`,
                icon: '/favicon.svg',
                vibrate: [200, 100, 200],
                silent: false
              });
            }
          }
        }
      });
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, [autoAlertsEnabled, reservations, notifiedReservations]);
  
  const confirmBooking = () => { 
    const start = new Date(newBooking.startTime);
    const end = new Date(start.getTime() + newBooking.duration * 3600000); // duration in hours
    
    const res = { 
      id: Date.now(), 
      vehicle: newBooking.vehicle, 
      slot: newBooking.slot, 
      date: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), 
      time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
      expiryTime: end.getTime(),
      status: 'Confirmed' 
    }; 
    
    const pay = { id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`, vehicle: newBooking.vehicle, slot: newBooking.slot, amount: newBooking.duration * 25, method: 'UPI (Simulated)', date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'Success' };
    setReservations([res, ...reservations]); setPayments([pay, ...payments]); setShowBookingModal(false); setBookingStep(1); setNotification("Booking & Payment Successful!"); setTimeout(() => setNotification(null), 3000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const userToAdd = { id: Date.now(), name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status, joined: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), avatar: `https://ui-avatars.com/api/?name=${newUser.name.replace(' ', '+')}&background=4318FF&color=fff` };
    setUsers([userToAdd, ...users]); setShowUserModal(false); setNewUser({ name: '', email: '', role: 'User', status: 'Active' }); setNotification("User added!"); setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const updatedUsers = users.map(u => u.id === editingUser.id ? { ...editingUser, avatar: `https://ui-avatars.com/api/?name=${editingUser.name.replace(' ', '+')}&background=4318FF&color=fff` } : u);
    setUsers(updatedUsers); setShowEditUserModal(false); setNotification("Profile updated successfully!"); setTimeout(() => setNotification(null), 3000);
  };

  const handleResolveComplaint = (id) => {
    const updatedComplaints = complaints.map(c => c.id === id ? { ...c, status: 'Resolved' } : c);
    setComplaints(updatedComplaints);
    setShowComplaintModal(false);
    setNotification(`Complaint ${id} marked as Resolved!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLodgeComplaint = (e) => {
    e.preventDefault();
    const lodge = { id: `CMP-${Math.floor(200 + Math.random() * 800)}`, type: newComplaint.type, desc: newComplaint.desc, user: newComplaint.user, status: 'Pending', date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) };
    setComplaints([lodge, ...complaints]);
    setShowNewComplaintModal(false);
    setNewComplaint({ type: 'Payment Issue', desc: '', user: '' });
    setNotification("Complaint Lodged Successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogFeedback = (e) => {
    e.preventDefault();
    const log = { id: Date.now(), worker: newFeedback.worker, rating: parseFloat(newFeedback.rating), feedback: newFeedback.feedback, user: newFeedback.user, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) };
    setFeedbacks([log, ...feedbacks]);
    setShowFeedbackModal(false);
    setNewFeedback({ worker: '', rating: 5, feedback: '', user: '' });
    setNotification("Worker Feedback Lodged!");
    setTimeout(() => setNotification(null), 3000);
  };

  const downloadReceipt = (payment) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Outfit', sans-serif; background: #f8fafc; display: flex; justify-content: center; padding: 40px; }
          .receipt { background: white; width: 380px; border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e2e8f0; }
          .header { padding: 40px 40px 20px; text-align: center; }
          .logo { background: #4318FF; width: 60px; height: 60px; borderRadius: 16px; display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto 20px; border-radius: 16px; transform: rotate(3deg); font-size: 30px; }
          .title { font-size: 24px; font-weight: 900; color: #111C44; text-transform: uppercase; margin: 0; letter-spacing: -1px; }
          .subtitle { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px; margin-top: 4px; }
          .divider { border-top: 1px solid #f1f5f9; margin: 25px 0; position: relative; text-align: center; }
          .divider span { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 15px; font-size: 10px; font-weight: 900; color: #94a3b8; letter-spacing: 2px; }
          .content { padding: 0 40px 40px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center; }
          .label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; }
          .value { font-size: 13px; font-weight: 700; color: #0f172a; }
          .id-badge { background: #f8fafc; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 12px; }
          .info-box { background: #f8fafc; padding: 25px; border-radius: 24px; border: 1px solid #f1f5f9; margin-top: 20px; }
          .total-row { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
          .total-amount { font-size: 28px; font-weight: 900; color: #05CD99; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 9px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 4px; }
          .btn-print { display: none; }
          @media print { .btn-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">P</div>
            <h1 class="title">SMART PARKING</h1>
            <p class="subtitle">Management System</p>
            <div class="divider"><span>PAYMENT RECEIPT</span></div>
          </div>
          <div class="content">
            <div class="row">
              <span class="label">Transaction ID</span>
              <span class="value id-badge">${payment.id}</span>
            </div>
            <div class="info-box">
              <div class="row">
                <span class="label">Vehicle Plate</span>
                <span class="value">${payment.vehicle}</span>
              </div>
              <div class="row">
                <span class="label">Parking Slot</span>
                <span class="value" style="color: #4318FF;">SLOT ${payment.slot}</span>
              </div>
              <div class="row">
                <span class="label">Date & Time</span>
                <span class="value">${payment.date}, ${payment.time}</span>
              </div>
              <div class="row">
                <span class="label">Method</span>
                <span class="value">${payment.method}</span>
              </div>
            </div>
            <div class="total-row">
              <span class="total-label">Total Paid</span>
              <span class="total-amount">₹${payment.amount}.00</span>
            </div>
          </div>
          <div class="footer">Thank you for your visit</div>
        </div>
        <script>window.onload = () => { /* Ready to print if needed */ }</script>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `Receipt_${payment.id}.html`; 
    link.click(); 
    URL.revokeObjectURL(url);
    setNotification("Styled Receipt Downloaded! ✅"); 
    setTimeout(() => setNotification(null), 3000);
  };

  const openReceipt = (payment) => { setSelectedPayment(payment); setShowReceiptModal(true); };
  const openComplaint = (complaint) => { setSelectedComplaint(complaint); setShowComplaintModal(true); };
  const startEditUser = (user) => { setEditingUser(user); setShowEditUserModal(true); };

  const handleExport = () => {
    setNotification("Preparing report for download...");
    setTimeout(() => {
      setNotification("Report downloaded successfully! ✅");
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPayments = payments.filter(p => p.id.toLowerCase().includes(paymentSearchTerm.toLowerCase()) || p.vehicle.toLowerCase().includes(paymentSearchTerm.toLowerCase()));

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 bg-[#0B1221] text-white`}>
      
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-full border shadow-2xl flex items-center gap-3 backdrop-blur-md font-medium
              ${isLockdown ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[#4318FF]/20 border-[#4318FF] text-[#4318FF]'}`}>
            {isLockdown ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>} {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <aside className={`flex flex-col py-8 shadow-2xl z-30 transition-all duration-500 overflow-hidden whitespace-nowrap ${sidebarOpen ? 'w-[260px]' : 'w-0'} ${activeSection === 'slots' ? 'bg-[#13131a] border-r border-white/5' : 'bg-[#0B1739] text-white'}`}>
        <div className="px-8 mb-10 flex flex-col items-center">
            <div className={`w-32 h-32 mb-4 transition-all duration-500 flex items-center justify-center overflow-hidden rounded-2xl ${activeSection === 'slots' ? (isLockdown ? 'shadow-[0_0_20px_rgba(255,0,0,0.5)] bg-red-500/10' : 'shadow-[0_0_20px_rgba(0,240,255,0.4)] bg-[#00f0ff]/5') : ''}`}>
              <img src={logo} className="w-full h-full object-contain scale-150" alt="Logo" />
            </div>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-[3px] text-center">Premium Hub</p>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {[ 
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' }, 
            { id: 'slots', icon: MapIcon, label: 'Live Map' }, 
            { id: 'reservations', icon: Calendar, label: 'Reservations' }, 
            { id: 'payments', icon: CreditCard, label: 'Payments' }, 
            { id: 'reports', icon: FileText, label: 'Reports' },
            { id: 'revenue', icon: BarChart3, label: 'Revenue', adminOnly: true },
            { id: 'users', icon: Users, label: 'Users', adminOnly: true }
          ]
          .filter(item => !item.adminOnly || userRole === 'admin')
          .map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-medium ${activeSection === item.id ? (activeSection === 'slots' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'bg-[#4318FF] text-white shadow-lg') : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><item.icon size={20} /> {item.label}</button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-20 border-b flex items-center justify-between px-10 shrink-0 transition-colors duration-500 ${activeSection === 'slots' ? 'bg-[#13131a]/50 backdrop-blur-md border-white/5' : 'bg-[#111C44]/50 backdrop-blur-md border-white/5'} text-white`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`p-2 rounded-lg transition-all ${sidebarOpen ? 'hover:bg-white/5 text-white/40' : 'bg-[#4318FF] text-white shadow-lg shadow-[#4318FF]/20 scale-110'}`}
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu size={20}/>
            </button>
            <h2 className="text-xl font-bold capitalize">{activeSection === 'slots' ? 'Live Sector Map' : activeSection}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-l pl-6 border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white capitalize">{userRole}</p>
                <p className="text-[10px] text-gray-400 font-medium">{userRole === 'admin' ? 'Super User' : 'Standard Access'}</p>
              </div>
              <button 
                onClick={() => {
                  const newRole = userRole === 'admin' ? 'user' : 'admin';
                  setUserRole(newRole);
                  if (newRole === 'user' && (activeSection === 'revenue' || activeSection === 'users')) {
                    setActiveSection('dashboard');
                  }
                  setNotification(`Switched to ${newRole.toUpperCase()} Mode`);
                  setTimeout(() => setNotification(null), 2000);
                }}
                className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all hover:scale-110 ${activeSection === 'slots' ? 'ring-[#00f0ff]/50' : 'ring-[#4318FF]/20'}`}
                title="Switch Role (Test Only)"
              >
                <img src={`https://ui-avatars.com/api/?name=${userRole}&background=${userRole === 'admin' ? '4318FF' : '05CD99'}&color=fff`} />
              </button>
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto transition-colors duration-500 ${activeSection === 'slots' ? 'bg-[#0a0a0f] p-0' : 'p-8 bg-[#0B1221]'}`}>
          <AnimatePresence mode="wait">
            {activeSection === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8">
                {selectedParking ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Slots" value={slots.length} icon={LayoutDashboard} color="bg-[#4318FF]" />
                    <StatCard label="Available Slots" value={availableCount} icon={CheckCircle2} color="bg-[#05CD99]" />
                    <StatCard label="Occupied Slots" value={occupiedCount} icon={Car} color="bg-[#7551FF]" />
                    <StatCard label="Reserved Slots" value={reservedCount} icon={Calendar} color="bg-[#FFB547]" />
                  </div>
                ) : (
                  <div className="bg-[#4318FF]/10 border border-[#4318FF]/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 bg-[#4318FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#4318FF]/20 animate-bounce">
                      <MapPin size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Select a Parking Lot</h3>
                      <p className="text-white/40 font-medium max-w-md mt-2">To view real-time statistics and manage slots, please select a state, city and then a specific parking location from the explorer below.</p>
                    </div>
                  </div>
                )}

                {selectedParking && (
                  <div className="bg-[#111C44] rounded-3xl p-8 border border-white/5 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2"><Activity size={20} className="text-[#05CD99]"/> Live Activity Feed (Next to Empty)</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Real-time parking departures - Sorted by soonest empty</p>
                      </div>
                      <span className="bg-[#05CD99]/10 text-[#05CD99] px-3 py-1 rounded-full text-[10px] font-black animate-pulse">LIVE TRACKING</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[9px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">
                            <th className="pb-3">Vehicle Number</th>
                            <th className="pb-3">Slot</th>
                            <th className="pb-3">Check-in Time</th>
                            <th className="pb-3">Booked Until</th>
                            <th className="pb-3 text-right">Total Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[...RECENT_ACTIVITY].sort((a, b) => a.expiryTime - b.expiryTime).slice(0, showAllActivity ? 20 : 5).map((act) => (
                            <tr key={act.id} className="group hover:bg-white/5 transition-all">
                              <td className="py-4 font-black text-xs text-white">{act.vehicle}</td>
                              <td className="py-4 text-[10px] font-bold text-[#4318FF] uppercase">SLOT {act.slot}</td>
                              <td className="py-4 text-[11px] font-bold text-white/60">{act.inTime}</td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <Clock size={12} className={act.expiryTime - Date.now() < 600000 ? "text-red-500 animate-pulse" : "text-[#4318FF]"} />
                                  <span className={`text-[11px] font-black ${act.expiryTime - Date.now() < 600000 ? 'text-red-500' : 'text-white'}`}>
                                    {new Date(act.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 text-right text-[11px] font-black text-[#05CD99]">{act.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <button 
                        onClick={() => setShowAllActivity(!showAllActivity)}
                        className="flex items-center gap-2 bg-[#1B254B] text-white px-6 py-2.5 rounded-xl text-[10px] font-black hover:bg-[#4318FF] transition-all shadow-lg shadow-[#4318FF]/10 uppercase tracking-widest border border-white/5"
                      >
                        {showAllActivity ? <><ChevronUp size={14}/> Show Less</> : <><ChevronDown size={14}/> View All Active Vehicles ({RECENT_ACTIVITY.length})</>}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {selectedParking && (
                    <div className="flex flex-col gap-8">
                      <div className="bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 flex flex-col">
                        <h3 className="font-bold text-lg text-white mb-8">Parking Overview</h3>
                        <div className="h-64 relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">{Math.round((availableCount / slots.length) * 100)}%</span>
                            <span className="text-xs text-white/40 font-medium">Available</span>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-3">
                          {pieData.map(i => (
                            <div key={i.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor:i.color}}></div>
                                <span className="text-sm font-medium text-white/60">{i.name}</span>
                              </div>
                              <span className="text-sm font-bold text-white">{i.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Smart Alerts Center */}
                      <div className="bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#4318FF]/20 rounded-xl flex items-center justify-center text-[#4318FF]">
                              <Bell size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-white">Alert Center</h3>
                              <p className="text-xs text-white/40 font-medium">Auto Expiration Warnings</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setAutoAlertsEnabled(!autoAlertsEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${autoAlertsEnabled ? 'bg-[#05CD99]' : 'bg-white/10'}`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${autoAlertsEnabled ? 'translate-x-6 shadow-[0_0_8px_rgba(5,205,153,0.5)]' : ''}`} />
                          </button>
                        </div>
                        <div className="bg-[#1B254B] p-5 rounded-2xl flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${autoAlertsEnabled ? 'bg-[#05CD99] animate-pulse' : 'bg-white/20'}`}></div>
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">10-Min Proximity Alert: {autoAlertsEnabled ? 'ACTIVE' : 'OFF'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${autoAlertsEnabled ? 'bg-[#05CD99]' : 'bg-white/20'}`}></div>
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Audio Notification: {autoAlertsEnabled ? 'ENABLED' : 'OFF'}</p>
                          </div>
                        </div>
                        <p className="text-[9px] text-white/20 mt-4 font-medium italic text-center">System will automatically trigger ringing alerts for all expiring bookings.</p>
                      </div>
                    </div>
                  )}

                  <div className={`${selectedParking ? 'xl:col-span-2' : 'xl:col-span-3'} bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 flex flex-col`}>
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="font-bold text-lg text-white">Explore Parking Lots</h3>
                        <p className="text-xs text-white/40 font-medium mt-1">Select state and city to find available slots across India</p>
                      </div>
                      <div className="flex items-center gap-2 text-[#4318FF] text-[10px] font-black bg-[#1B254B] px-4 py-2 rounded-full border border-[#4318FF]/10 tracking-widest">
                        <MapPin size={12}/> LIVE DATABASE
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-[2px] pl-1">Select State</label>
                        <div className="relative group">
                          <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="w-full bg-[#1B254B] border-none rounded-2xl px-5 py-4 text-white font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-[#4318FF]/20">
                            {Object.keys(INDIA_PARKING_DATA).map(state => <option key={state} value={state} className="bg-[#111C44]">{state}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-[#4318FF] transition-colors" size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-[2px] pl-1">Select City</label>
                        <div className="relative group">
                          <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)} className="w-full bg-[#1B254B] border-none rounded-2xl px-5 py-4 text-white font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-[#4318FF]/20">
                            {Object.keys(INDIA_PARKING_DATA[selectedState]).map(city => <option key={city} value={city} className="bg-[#111C44]">{city}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-[#4318FF] transition-colors" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 max-h-[400px]">
                      <AnimatePresence mode="popLayout">
                        {availableParkingLots.map((park, idx) => (
                          <motion.div key={park.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} 
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all group border cursor-pointer
                              ${selectedParking?.name === park.name ? 'bg-[#4318FF]/20 border-[#4318FF]' : 'bg-[#1B254B] hover:bg-[#111C44] border-transparent hover:border-[#4318FF]/20'}`}
                            onClick={() => handleSelectParking(park)}>
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm
                                ${selectedParking?.name === park.name ? 'bg-[#4318FF] text-white' : 'bg-[#111C44] text-[#4318FF] group-hover:bg-[#4318FF] group-hover:text-white'}`}>
                                <Navigation size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{park.name}</h4>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{selectedCity}, {selectedState}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="text-right">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${park.available > 10 ? 'bg-[#05CD99]' : park.available > 0 ? 'bg-[#FFB547]' : 'bg-red-500'}`}></div>
                                  <span className={`text-xs font-black ${park.available > 10 ? 'text-[#05CD99]' : park.available > 0 ? 'text-[#FFB547]' : 'text-red-500'}`}>
                                    {park.available === 0 ? 'FULL' : `${park.available}/${park.total}`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-white/40 font-bold tracking-widest">{park.distance} AWAY</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${park.name}, ${selectedCity}, ${selectedState}`)}`, '_blank'); }} 
                                  className="p-2.5 bg-[#1B254B] text-white/40 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-white/5 group-hover:border-red-500/50" title="Get Directions">
                                  <MapIcon size={16} />
                                </button>
                                <button className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-sm border
                                  ${selectedParking?.name === park.name ? 'bg-[#05CD99] text-white border-[#05CD99]' : 'bg-[#111C44] text-[#4318FF] border-[#4318FF]/20 hover:bg-[#4318FF] hover:text-white'}`}>
                                  {selectedParking?.name === park.name ? 'SELECTED' : 'SELECT LOT'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'revenue' && (
              <motion.div key="revenue" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Revenue Analysis</h2>
                    <p className="text-sm text-white/40 font-medium">Financial growth, payment trends and detailed statistics</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleExport} className="bg-[#111C44] border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:bg-white/5 transition-all"><Download size={16}/> Export Report</button>
                    <button onClick={() => { setActiveSection('reservations'); if(selectedParking) setShowBookingModal(true); }} className="bg-[#4318FF] px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#4318FF]/20 hover:scale-105 transition-all"><Plus size={16}/> New Transaction</button>
                  </div>
                </div>

                {/* Derived Stats Calculation */}
                {(() => {
                  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  const currentMonthStr = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                  
                  let todayRev = 0;
                  let monthRev = 0;
                  const methods = {};
                  
                  payments.forEach(p => {
                    todayRev += (p.date === todayStr ? p.amount : 0);
                    if (p.date.includes(currentMonthStr)) monthRev += p.amount;
                    methods[p.method] = (methods[p.method] || 0) + 1;
                  });

                  const topMethod = Object.entries(methods).reduce((a, b) => (a[1] > b[1] ? a : b), ["None", 0]);
                  
                  // Generate Trend Data for Chart
                  const trendData = [
                    { name: 'Mon', revenue: 4500 },
                    { name: 'Tue', revenue: 5200 },
                    { name: 'Wed', revenue: 4800 },
                    { name: 'Thu', revenue: 6100 },
                    { name: 'Fri', revenue: 7500 },
                    { name: 'Sat', revenue: 8900 },
                    { name: 'Sun', revenue: 7200 },
                  ];

                  const methodDistribution = Object.entries(methods).map(([name, value]) => ({ name, value }));
                  const COLORS = ['#4318FF', '#05CD99', '#7551FF', '#FFB547', '#FF5B5B'];

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Today's Revenue" value={`₹${todayRev}`} icon={DollarSign} color="bg-[#4318FF]" />
                        <StatCard label="Monthly Revenue" value={`₹${monthRev}`} icon={BarChart3} color="bg-[#05CD99]" />
                        <StatCard label="Top Payment Method" value={topMethod[0]} icon={CreditCard} color="bg-[#7551FF]" />
                        <StatCard label="Total Transactions" value={payments.length} icon={Activity} color="bg-[#FFB547]" />
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-[#111C44] p-8 rounded-3xl border border-white/5 shadow-sm">
                          <div className="flex justify-between items-center mb-10">
                            <div>
                              <h3 className="font-bold text-lg text-white">Revenue Growth</h3>
                              <p className="text-xs text-white/40 font-medium">Daily collection trend for the current week</p>
                            </div>
                            <select className="bg-[#1B254B] border-none text-[10px] font-bold text-white px-4 py-2 rounded-lg outline-none">
                              <option>Last 7 Days</option>
                              <option>Last 30 Days</option>
                            </select>
                          </div>
                          <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={trendData}>
                                <defs>
                                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4318FF" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                                <Tooltip 
                                  contentStyle={{backgroundColor: '#1B254B', border: 'none', borderRadius: '12px', fontSize: '12px'}}
                                  itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-[#111C44] p-8 rounded-3xl border border-white/5 shadow-sm flex flex-col">
                          <h3 className="font-bold text-lg text-white mb-2">Payment Methods</h3>
                          <p className="text-xs text-white/40 font-medium mb-8">Preferred transaction channels</p>
                          <div className="flex-1 h-64 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={methodDistribution} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                                  {methodDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{backgroundColor: '#1B254B', border: 'none', borderRadius: '12px', fontSize: '10px'}}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Most Used</span>
                              <span className="text-sm font-black text-white">{topMethod[0].split(' ')[0]}</span>
                            </div>
                          </div>
                          <div className="mt-6 flex flex-col gap-3">
                            {methodDistribution.slice(0, 4).map((m, i) => (
                              <div key={m.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                                  <span className="text-xs font-medium text-white/60">{m.name}</span>
                                </div>
                                <span className="text-xs font-bold text-white">{Math.round((m.value/payments.length)*100)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#111C44] p-8 rounded-3xl border border-white/5 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-12 h-12 bg-[#05CD99]/10 rounded-2xl flex items-center justify-center text-[#05CD99]"><FileText size={24}/></div>
                           <div>
                              <h3 className="font-bold text-lg text-white">Monthly Summary</h3>
                              <p className="text-xs text-white/40 font-medium">Automatic billing cycle insights</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="bg-[#1B254B] p-6 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Avg Transaction Value</p>
                              <p className="text-2xl font-black text-white">₹{Math.round(monthRev / (payments.filter(p => p.date.includes(currentMonthStr)).length || 1))}</p>
                           </div>
                           <div className="bg-[#1B254B] p-6 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Highest Daily Peak</p>
                              <p className="text-2xl font-black text-[#05CD99]">₹8,900</p>
                           </div>
                           <div className="bg-[#1B254B] p-6 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Projected Month End</p>
                              <p className="text-2xl font-black text-[#4318FF]">₹45,000</p>
                           </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {activeSection === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8">
                 <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Payment History</h2>
                      <p className="text-sm text-white/40 font-medium">Real-time transaction monitoring and receipt generation</p>
                    </div>
                    {userRole === 'admin' && (
                      <div className="flex gap-4">
                        <div className="bg-[#111C44] px-6 py-3 rounded-2xl border border-white/5 shadow-sm flex flex-col">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Revenue</span>
                          <span className="text-xl font-black text-white">₹12,450.00</span>
                        </div>
                      </div>
                    )}
                 </div>
                 <div className="bg-[#111C44] rounded-3xl shadow-sm border border-white/5 overflow-hidden">
                   <div className="p-8 border-b border-white/5 flex justify-between items-center">
                     <div className="relative w-96">
                       <input type="text" value={paymentSearchTerm} onChange={(e) => setPaymentSearchTerm(e.target.value)} placeholder="Search transaction ID or vehicle..." className="w-full bg-[#1B254B] border-none rounded-2xl px-12 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20" />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                     </div>
                     <div className="flex gap-2">
                       <button onClick={handlePrint} className="p-3 bg-[#1B254B] text-white/60 rounded-xl hover:bg-[#4318FF] hover:text-white transition-all"><Printer size={20}/></button>
                       <button onClick={handleExport} className="p-3 bg-[#1B254B] text-white/60 rounded-xl hover:bg-[#4318FF] hover:text-white transition-all"><Download size={20}/></button>
                     </div>
                   </div><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-[#1B254B]/50"><th className="px-8 py-5">Transaction ID</th><th className="px-8 py-5">Vehicle & Slot</th><th className="px-8 py-5">Amount</th><th className="px-8 py-5">Method</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Date</th><th className="px-8 py-5">Action</th></tr></thead><tbody className="divide-y divide-white/5"><AnimatePresence>{filteredPayments.map((p) => (<motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-[#1B254B]/30 group"><td className="px-8 py-6 font-mono text-xs font-bold text-[#4318FF]">{p.id}</td><td className="px-8 py-6"><div><p className="font-black text-white text-sm">{p.vehicle}</p><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">SLOT {p.slot}</p></div></td><td className="px-8 py-6 font-black text-white">₹{p.amount}.00</td><td className="px-8 py-6 text-xs font-bold text-white/60">{p.method}</td><td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'Success' ? 'bg-[#05CD99]/10 text-[#05CD99]' : 'bg-amber-500/10 text-amber-500'}`}>{p.status}</span></td><td className="px-8 py-6"><p className="text-xs font-bold text-white">{p.date}</p><p className="text-[10px] text-white/40">{p.time}</p></td><td className="px-8 py-6"><button onClick={() => openReceipt(p)} className="bg-[#4318FF] text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-[#4318FF]/20 hover:scale-105 transition-all">RECEIPT</button></td></motion.tr>))}</AnimatePresence>{filteredPayments.length === 0 && (<tr><td colSpan="7" className="px-8 py-20 text-center text-white/40 font-bold">No transactions found matching "{paymentSearchTerm}"</td></tr>)}</tbody></table></div></div>
              </motion.div>
            )}

            {activeSection === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                 <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-white">System Users</h2><p className="text-sm text-white/40 font-medium">Manage administrators, operators, and registered parkers</p></div><button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 bg-[#4318FF] text-white px-6 py-3 rounded-2xl shadow-lg shadow-[#4318FF]/30 hover:scale-105 transition-all font-bold"><UserPlus size={20}/> Add New User</button></div>
                 <div className="bg-[#111C44] rounded-3xl shadow-sm border border-white/5 overflow-hidden"><div className="p-8 border-b border-white/5 flex justify-between items-center"><div className="relative w-96"><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..." className="w-full bg-[#1B254B] border-none rounded-2xl px-12 py-3 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#4318FF]/20" /><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} /></div><button className="p-3 bg-[#1B254B] text-white/60 rounded-xl hover:text-[#4318FF] transition-colors"><MoreHorizontal size={20}/></button></div><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-[#1B254B]/50"><th className="px-8 py-5">User Profile</th><th className="px-8 py-5">System Role</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Date Joined</th><th className="px-8 py-5">Action</th></tr></thead><tbody className="divide-y divide-white/5"><AnimatePresence>{filteredUsers.map((user) => (<motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-[#1B254B]/30 group"><td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-[#4318FF]/10"><img src={user.avatar} /></div><div><p className="font-bold text-white text-sm">{user.name}</p><p className="text-[10px] text-white/40 font-medium">{user.email}</p></div></div></td><td className="px-8 py-6"><div className="flex items-center gap-2 text-sm font-bold text-white"><Shield size={16} className="text-[#4318FF]/60" />{user.role}</div></td><td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'Active' ? 'bg-[#05CD99]/10 text-[#05CD99]' : 'bg-red-500/10 text-red-500'}`}>{user.status}</span></td><td className="px-8 py-6"><p className="text-sm font-bold text-white">{user.joined}</p></td><td className="px-8 py-6"><div className="flex items-center gap-3"><button className="p-2.5 bg-[#1B254B] text-[#4318FF] rounded-xl hover:bg-[#4318FF] hover:text-white transition-all"><Mail size={18}/></button><button onClick={() => startEditUser(user)} className="p-2.5 bg-[#4318FF]/10 text-[#4318FF] rounded-xl font-bold text-[10px] flex items-center gap-2 hover:bg-[#4318FF] hover:text-white transition-all"><Edit3 size={14}/> EDIT</button></div></td></motion.tr>))}</AnimatePresence>{filteredUsers.length === 0 && (<tr><td colSpan="5" className="px-8 py-20 text-center text-white/40 font-bold">No users found matching "{searchTerm}"</td></tr>)}</tbody></table></div></div>
              </motion.div>
            )}

            {activeSection === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8">
                 <div className="flex justify-between items-center">
                    <div><h2 className="text-2xl font-bold text-white">System Reports & Support</h2><p className="text-sm text-white/40 font-medium">Track ground worker performance and customer grievances</p></div>
                    <div className="flex gap-4 items-center">
                       {reportSubSection === 'feedback' ? (
                          <button onClick={() => setShowFeedbackModal(true)} className="flex items-center gap-2 bg-[#05CD99] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-[#05CD99]/20 hover:scale-105 transition-all font-black text-xs"><ThumbsUp size={18}/> LODGE FEEDBACK</button>
                       ) : (
                          <button onClick={() => setShowNewComplaintModal(true)} className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 transition-all font-black text-xs"><AlertCircle size={18}/> LODGE COMPLAINT</button>
                       )}
                       <div className="flex bg-[#111C44] p-1.5 rounded-2xl shadow-sm border border-white/5">
                          <button onClick={() => setReportSubSection('feedback')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${reportSubSection === 'feedback' ? 'bg-[#4318FF] text-white shadow-lg shadow-[#4318FF]/20' : 'text-white/40 hover:text-[#4318FF]'}`}>WORKER FEEDBACK</button>
                          <button onClick={() => setReportSubSection('complaints')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${reportSubSection === 'complaints' ? 'bg-[#4318FF] text-white shadow-lg shadow-[#4318FF]/20' : 'text-white/40 hover:text-[#4318FF]'}`}>CUSTOMER COMPLAINTS</button>
                       </div>
                    </div>
                 </div>

                 {reportSubSection === 'feedback' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {feedbacks.map((f) => (
                          <motion.div key={f.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 flex flex-col gap-4 group hover:border-[#4318FF]/20 transition-all">
                             <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-[#1B254B] rounded-2xl flex items-center justify-center text-[#4318FF] group-hover:bg-[#4318FF] group-hover:text-white transition-all"><Users size={20}/></div>
                                <div className="flex items-center gap-1 bg-[#05CD99]/10 px-3 py-1 rounded-full"><Star size={12} className="text-[#05CD99] fill-[#05CD99]"/><span className="text-xs font-black text-[#05CD99]">{f.rating}</span></div>
                             </div>
                             <div><h4 className="font-black text-white text-lg">{f.worker}</h4><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Ground Staff</p></div>
                             <p className="text-sm text-white/60 font-medium italic leading-relaxed">"{f.feedback}"</p>
                             <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center"><span className="text-[10px] font-bold text-white/40">BY {f.user}</span><span className="text-[10px] font-bold text-white/40">{f.date}</span></div>
                          </motion.div>
                       ))}
                       <button onClick={() => setShowFeedbackModal(true)} className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-white/40 hover:border-[#4318FF] hover:text-[#4318FF] transition-all"><Plus size={32}/><span className="text-xs font-black uppercase tracking-widest">Lodge New Feedback</span></button>
                    </div>
                 ) : (
                    <div className="bg-[#111C44] rounded-3xl shadow-sm border border-white/5 overflow-hidden">
                       <table className="w-full text-left">
                          <thead><tr className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-[#1B254B]/50"><th className="px-8 py-5">Complaint ID</th><th className="px-8 py-5">Issue Type</th><th className="px-8 py-5">Short Description</th><th className="px-8 py-5">Customer</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Action</th></tr></thead>
                          <tbody className="divide-y divide-white/5">
                             {complaints.map((c) => (
                                <tr key={c.id} className="hover:bg-[#1B254B]/30 transition-all">
                                   <td className="px-8 py-6 font-mono text-xs font-bold text-[#4318FF]">{c.id}</td>
                                   <td className="px-8 py-6"><span className="text-xs font-black text-white">{c.type}</span></td>
                                   <td className="px-8 py-6 text-sm text-white/60 font-medium max-w-[200px] truncate">{c.desc}</td>
                                   <td className="px-8 py-6"><p className="text-xs font-bold text-white">{c.user}</p><p className="text-[10px] text-white/40">{c.date}</p></td>
                                   <td className="px-8 py-6">
                                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider 
                                         ${c.status === 'Resolved' ? 'bg-[#05CD99]/10 text-[#05CD99]' : c.status === 'Pending' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                         {c.status}
                                      </span>
                                   </td>
                                   <td className="px-8 py-6"><button onClick={() => openComplaint(c)} className="bg-[#4318FF] text-white px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-[#4318FF]/20 hover:scale-105 transition-all">FULL DETAILS</button></td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </motion.div>
            )}

            {activeSection === 'slots' && (
              <motion.div key="slots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                {selectedParking ? (
                  <div className="flex-1 flex p-6 gap-6 overflow-hidden">
                    <div className="flex-[2] bg-[#13131a] rounded-3xl border border-white/5 p-8 flex flex-col relative overflow-hidden shadow-2xl">
                      <div className="flex justify-between items-center mb-8 relative z-10">
                        <h2 className="text-xl font-bold tracking-wide flex items-center gap-3">
                          <MapIcon className={isLockdown ? "text-red-500" : "text-[#00f0ff]"} /> 
                          {selectedParking.name} 
                          <span className="text-white/30 font-mono text-sm tracking-widest">[AX-{(slots.length).toString().padStart(3, '0')}]</span>
                        </h2>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${isLockdown ? 'bg-red-500 glow-red' : 'bg-green-500 glow-green'}`}></div>
                          {isLockdown ? 'Lockdown Mode' : 'Monitoring Active'}
                        </div>
                      </div>
                      <div className={`flex-1 relative flex items-center justify-center border border-white/5 rounded-2xl overflow-hidden transition-colors duration-1000 ${isLockdown ? 'bg-red-500/5' : 'bg-[#0a0a0f]'}`} 
                           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        
                        {/* 3D Perspective Controls */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Tilt ({mapTilt}°)</span>
                            <input type="range" min="0" max="80" value={mapTilt} onChange={(e) => setMapTilt(e.target.value)} className="w-24 accent-[#00f0ff]" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Rotate ({mapRotation}°)</span>
                            <input type="range" min="-180" max="180" value={mapRotation} onChange={(e) => setMapRotation(e.target.value)} className="w-24 accent-[#00f0ff]" />
                          </div>
                          <button 
                            onClick={() => { setMapTilt(0); setMapRotation(0); }}
                            className="text-[8px] font-black bg-[#4318FF] text-white py-1 rounded-md uppercase tracking-tighter hover:bg-[#4318FF]/80 transition-all"
                          >
                            Reset View (Top-Down)
                          </button>
                        </div>

                        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/60">
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#00f0ff]/20 border border-[#00f0ff] rounded shadow-[0_0_8px_#00f0ff]"></div> Free</div>
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded shadow-[0_0_8px_red]"></div> Occupied</div>
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded shadow-[0_0_8px_orange]"></div> Reserved</div>
                        </div>

                        <div className="overflow-auto w-full h-full p-10 flex items-start justify-start custom-scrollbar">
                          <div 
                            className="grid transition-transform duration-500 ease-out p-20 origin-center" 
                            style={{ 
                              transform: `perspective(3000px) rotateX(${mapTilt}deg) rotateZ(${mapRotation}deg) scale(1)`, 
                              transformStyle: 'preserve-3d',
                              gap: '1.5rem',
                              minWidth: `${(slots.length > 500 ? 25 : slots.length > 200 ? 20 : 10) * 80}px`,
                              gridTemplateColumns: `repeat(${
                                slots.length > 500 ? 25 : 
                                slots.length > 200 ? 20 : 
                                slots.length > 100 ? 15 : 10
                              }, minmax(0, 1fr))`
                            }}
                          >
                            <AnimatePresence>
                              {slots.map((slot) => { 
                                const isOccupied = isLockdown || slot.status === 'occupied';
                                const isReserved = slot.status === 'reserved';
                                return (
                                  <motion.div 
                                    key={slot.id} 
                                    layout 
                                    initial={{ scale: 0.8, opacity: 0 }} 
                                    animate={{ 
                                      scale: 1, 
                                      opacity: 1, 
                                      translateZ: isOccupied || isReserved ? 25 : 0 
                                    }} 
                                    className={`
                                      ${slots.length > 500 ? 'w-10 h-16' : slots.length > 200 ? 'w-12 h-18' : 'w-16 h-24'}
                                      rounded-xl border-2 flex items-center justify-center font-mono relative transition-all duration-700 
                                      ${!isOccupied && !isReserved ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.1)]' : ''}
                                      ${isReserved ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}
                                      ${isOccupied ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}
                                      ${isLockdown && 'bg-red-600/30 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]'}
                                    `}
                                    style={{ transformStyle: 'preserve-3d' }}
                                  >
                                    {/* 3D Side Walls for Occupied/Reserved */}
                                    {(isOccupied || isReserved) && (
                                      <>
                                        <div className={`absolute bottom-full left-0 w-full h-[20px] origin-bottom -rotateX-90 ${isOccupied ? 'bg-red-500/40' : 'bg-amber-500/40'}`} style={{ transform: 'rotateX(-90deg)' }}></div>
                                        <div className={`absolute left-full top-0 h-full w-[20px] origin-left rotateY-90 ${isOccupied ? 'bg-red-500/30' : 'bg-amber-500/30'}`} style={{ transform: 'rotateY(90deg)' }}></div>
                                      </>
                                    )}

                                    <div className="flex flex-col items-center gap-1">
                                      <span className="font-black text-[12px]">{slot.id}</span>
                                      {isOccupied && (isLockdown ? <AlertTriangle size={20} className="text-red-500 animate-pulse" /> : <Car size={24} className="text-red-500 drop-shadow-lg" />)}
                                      {isReserved && <Clock size={20} className="text-amber-500 animate-bounce" />}
                                      {!isOccupied && !isReserved && <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping"></div>}
                                    </div>
                                    
                                    {/* Slot Floor Marking */}
                                    <div className="absolute inset-0 border-b-4 border-white/5 opacity-20"></div>
                                  </motion.div>
                                )
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-6">
                      <div className="bg-[#13131a] rounded-3xl border border-white/5 p-6 flex flex-col h-[60%] shadow-2xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2"><Terminal size={14} className={isLockdown ? "text-red-500" : "text-[#00f0ff]"} /> Live OCR Stream</h3>
                        <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[10px] overflow-hidden relative">
                          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
                          <motion.div animate={{ y: [0, 300, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className={`absolute top-0 left-0 w-full h-[1px] z-10 ${isLockdown ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-[#00f0ff] shadow-[0_0_15px_#00f0ff]'}`} />
                          <div className="flex flex-col gap-2 overflow-y-auto h-full pr-2">
                            {logs.map((l, i) => <div key={i} className="flex gap-2 border-b border-white/5 pb-1 opacity-80"><span className="text-[#00f0ff]/50">[{l.time}]</span><span>{l.msg}</span></div>)}
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#13131a] rounded-3xl border border-white/5 p-6 flex flex-col flex-1 shadow-2xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Tactical Controls</h3>
                        <div className="grid grid-cols-2 gap-3 h-full">
                          <button onClick={handleVerify} disabled={isVerifying} className="bg-white/5 hover:bg-[#00f0ff]/10 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                            {isVerifying ? <Activity size={24} className="text-[#00f0ff] animate-spin" /> : <CheckCircle2 size={24} className="text-[#00f0ff] group-hover:scale-110" />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">{isVerifying ? 'Scanning...' : 'Verify'}</span>
                          </button>
                          <button onClick={handleLockdown} className={`rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group border ${isLockdown ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/40 text-white/60'}`}>
                            <AlertTriangle size={24} className={isLockdown ? 'animate-pulse' : 'group-hover:scale-110'} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{isLockdown ? 'Unlock' : 'Lockdown'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-6">
                    <div className="w-24 h-24 bg-[#00f0ff]/10 rounded-3xl flex items-center justify-center text-[#00f0ff] shadow-[0_0_50px_rgba(0,240,255,0.1)] animate-pulse">
                      <MapIcon size={48} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">Live Map Unavailable</h2>
                      <p className="text-white/40 font-medium max-w-lg mt-2 mx-auto">Please select a specific parking location from the Dashboard explorer to initialize the tactical sector map and live OCR streams.</p>
                    </div>
                    <button onClick={() => setActiveSection('dashboard')} className="mt-4 px-8 py-4 bg-[#00f0ff] text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]">GO TO EXPLORER</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === 'reservations' && (
              <motion.div key="reservations" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-8">
                {selectedParking ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-white">Advanced Reservation System - {selectedParking.name}</h2>
                      <button onClick={() => setShowBookingModal(true)} className="flex items-center gap-2 bg-[#4318FF] text-white px-6 py-3 rounded-2xl shadow-lg shadow-[#4318FF]/30 hover:scale-105 transition-all font-bold"><Plus size={20}/> New Booking</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-gradient-to-br from-[#4318FF] to-[#7551FF] p-8 rounded-3xl text-white shadow-xl flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <h3 className="text-xl font-bold border-b border-white/20 pb-4">Standard Pricing</h3>
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center"><span>Hourly Rate</span><span className="text-2xl font-black font-mono">₹25/hr</span></div>
                          <div className="flex justify-between items-center"><span>Pre-Booking Fee</span><span className="font-bold">Varies by time</span></div>
                          <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl"><span className="text-sm">Grace Period</span><span className="font-bold">30 Mins</span></div>
                        </div>
                        <div className="mt-auto bg-red-500/20 border border-red-400/30 p-4 rounded-2xl flex items-start gap-3">
                          <AlertTriangle className="shrink-0" size={18} />
                          <p className="text-xs leading-relaxed"><strong>Overstay Penalty:</strong> Exceeding grace period incurs a flat <strong>₹1000 fine</strong> plus standard hourly charges.</p>
                        </div>
                      </div>
                      <div className="md:col-span-2 bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 overflow-hidden">
                        <h3 className="font-bold text-lg text-white mb-6">Allocate Slot - {selectedParking.name}</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                          {slots.map((s) => (
                            <div key={s.id} onClick={() => s.status === 'available' && (setNewBooking({...newBooking, slot: s.id}), setShowBookingModal(true))} 
                              className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all hover:scale-110 
                                ${s.status === 'available' ? 'bg-[#05CD99]/10 border-[#05CD99]/20 text-[#05CD99] hover:border-[#05CD99]' : 
                                  s.status === 'occupied' ? 'bg-red-500/10 border-red-500/20 text-red-500/40 cursor-not-allowed' : 
                                  'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'}`}>
                              {s.status === 'occupied' ? <Car size={14} /> : s.status === 'reserved' ? <Clock size={14} /> : <div className="w-2 h-2 rounded-full bg-[#05CD99] animate-pulse"></div>}
                              <span className="text-[10px] font-black">{s.id}</span>
                              {s.status === 'reserved' && <span className="text-[7px] font-bold uppercase">RSVD</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-6">
                    <div className="w-24 h-24 bg-[#4318FF]/10 rounded-3xl flex items-center justify-center text-[#4318FF] shadow-[0_0_50px_rgba(67,24,255,0.1)]">
                      <Calendar size={48} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">Reservation System Inactive</h2>
                      <p className="text-white/40 font-medium max-w-lg mt-2 mx-auto">Please select a parking location from the Dashboard explorer to enable pre-booking, view localized pricing, and access the slot allocation engine.</p>
                    </div>
                    <button onClick={() => setActiveSection('dashboard')} className="mt-4 px-8 py-4 bg-[#4318FF] text-white font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(67,24,255,0.3)]">GO TO EXPLORER</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Log Feedback Modal */}
          <AnimatePresence>
             {showFeedbackModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                   <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/10">
                      <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-red-500 transition-colors"><X size={20}/></button>
                      <div className="p-10">
                         <h2 className="text-2xl font-bold text-white mb-2">Lodge Worker Feedback</h2>
                         <p className="text-sm text-white/40 font-medium mb-8">Record customer experience with ground staff</p>
                         <form onSubmit={handleLogFeedback} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Worker Name</label>
                               <input required type="text" value={newFeedback.worker} onChange={(e) => setNewFeedback({...newFeedback, worker: e.target.value})} placeholder="e.g. Rajesh Kumar" className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#05CD99]/20" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Star Rating (1-5)</label>
                                  <select value={newFeedback.rating} onChange={(e) => setNewFeedback({...newFeedback, rating: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#05CD99]/20 appearance-none cursor-pointer">
                                     <option value="5" className="bg-[#111C44]">5 Stars - Excellent</option><option value="4" className="bg-[#111C44]">4 Stars - Good</option><option value="3" className="bg-[#111C44]">3 Stars - Average</option><option value="2" className="bg-[#111C44]">2 Stars - Poor</option><option value="1" className="bg-[#111C44]">1 Star - Very Bad</option>
                                  </select>
                               </div>
                               <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Customer Name</label>
                                  <input required type="text" value={newFeedback.user} onChange={(e) => setNewFeedback({...newFeedback, user: e.target.value})} placeholder="e.g. Amit S." className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#05CD99]/20" />
                               </div>
                            </div>
                            <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Feedback Message</label>
                               <textarea required rows="4" value={newFeedback.feedback} onChange={(e) => setNewFeedback({...newFeedback, feedback: e.target.value})} placeholder="Describe the customer's experience..." className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-medium text-white focus:ring-2 focus:ring-[#05CD99]/20 resize-none"></textarea>
                            </div>
                            <button type="submit" className="bg-[#05CD99] text-white font-black py-5 rounded-2xl text-lg mt-2 shadow-xl shadow-[#05CD99]/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"><ThumbsUp size={20}/> Lodge Feedback</button>
                         </form>
                      </div>
                   </motion.div>
                </div>
             )}
          </AnimatePresence>

          {/* Lodge New Complaint Modal */}
          <AnimatePresence>
             {showNewComplaintModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                   <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/10">
                      <button onClick={() => setShowNewComplaintModal(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-red-500 transition-colors"><X size={20}/></button>
                      <div className="p-10">
                         <h2 className="text-2xl font-bold text-white mb-2">Lodge New Complaint</h2>
                         <p className="text-sm text-white/40 font-medium mb-8">Record a new customer grievance in the system</p>
                         <form onSubmit={handleLodgeComplaint} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Customer Name</label>
                               <input required type="text" value={newComplaint.user} onChange={(e) => setNewComplaint({...newComplaint, user: e.target.value})} placeholder="e.g. Rahul Kumar" className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-red-500/20" />
                            </div>
                            <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Issue Category</label>
                               <select value={newComplaint.type} onChange={(e) => setNewComplaint({...newComplaint, type: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer">
                                  <option value="Payment Issue" className="bg-[#111C44]">Payment Issue</option><option value="Technical" className="bg-[#111C44]">Technical Glitch</option><option value="Behaviour" className="bg-[#111C44]">Staff Behaviour</option><option value="Other" className="bg-[#111C44]">Other Issues</option>
                               </select>
                            </div>
                            <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Full Description</label>
                               <textarea required rows="4" value={newComplaint.desc} onChange={(e) => setNewComplaint({...newComplaint, desc: e.target.value})} placeholder="Describe the issue in detail..." className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-medium text-white focus:ring-2 focus:ring-red-500/20 resize-none"></textarea>
                            </div>
                            <button type="submit" className="bg-red-500 text-white font-black py-5 rounded-2xl text-lg mt-2 shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"><Send size={20}/> Lodge Complaint</button>
                         </form>
                      </div>
                   </motion.div>
                </div>
             )}
          </AnimatePresence>

          {/* Full Complaint Modal */}
          <AnimatePresence>
             {showComplaintModal && selectedComplaint && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                   <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/10">
                      <button onClick={() => setShowComplaintModal(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-red-500 transition-colors"><X size={20}/></button>
                      <div className="p-10">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500"><AlertCircle size={28}/></div>
                            <div>
                               <h3 className="text-xl font-black text-white">Complaint Details</h3>
                               <p className="text-xs font-mono font-bold text-[#4318FF] uppercase tracking-widest">{selectedComplaint.id}</p>
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div className="bg-[#1B254B] p-6 rounded-2xl">
                               <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Issue Description</label>
                               <p className="text-sm text-white font-medium leading-relaxed">{selectedComplaint.desc}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <div><label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Category</label><p className="text-sm font-bold text-white">{selectedComplaint.type}</p></div>
                               <div><label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Status</label><span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${selectedComplaint.status === 'Resolved' ? 'bg-[#05CD99]/10 text-[#05CD99]' : 'bg-amber-500/10 text-amber-500'}`}>{selectedComplaint.status}</span></div>
                               <div><label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Customer Name</label><p className="text-sm font-bold text-white">{selectedComplaint.user}</p></div>
                               <div><label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Filed On</label><p className="text-sm font-bold text-white">{selectedComplaint.date}</p></div>
                            </div>
                            <div className="flex gap-3 pt-4">
                               <button onClick={() => setShowComplaintModal(false)} className="flex-1 bg-white/5 text-white/40 font-bold py-4 rounded-2xl hover:bg-white/10 transition-all">Close</button>
                               <button 
                                 disabled={selectedComplaint.status === 'Resolved'}
                                 onClick={() => handleResolveComplaint(selectedComplaint.id)} 
                                 className={`flex-1 text-white font-black py-4 rounded-2xl shadow-lg transition-all 
                                   ${selectedComplaint.status === 'Resolved' ? 'bg-white/10 text-white/20 cursor-not-allowed shadow-none' : 'bg-[#4318FF] shadow-[#4318FF]/20 hover:scale-[1.02]'}`}>
                                 {selectedComplaint.status === 'Resolved' ? 'Already Resolved' : 'Mark as Resolved'}
                               </button>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                </div>
             )}
          </AnimatePresence>

          {/* Edit User Modal */}
          <AnimatePresence>
            {showEditUserModal && editingUser && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/10">
                    <button onClick={() => setShowEditUserModal(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-red-500 transition-colors"><X size={20} /></button>
                    <div className="p-10">
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#4318FF]/20"><img src={editingUser.avatar} /></div>
                          <div><h2 className="text-2xl font-bold text-white">Edit Profile</h2><p className="text-xs text-white/40 font-bold uppercase tracking-widest">Update account details</p></div>
                       </div>
                       <form onSubmit={handleUpdateUser} className="flex flex-col gap-6">
                          <div className="flex flex-col gap-2">
                             <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                             <input required type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20" />
                          </div>
                          <div className="flex flex-col gap-2">
                             <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                             <input required type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">System Role</label>
                                <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white appearance-none cursor-pointer">
                                   <option value="User" className="bg-[#111C44]">User</option><option value="Operator" className="bg-[#111C44]">Operator</option><option value="Manager" className="bg-[#111C44]">Manager</option><option value="Super Admin" className="bg-[#111C44]">Super Admin</option>
                                </select>
                             </div>
                             <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Status</label>
                                <select value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white appearance-none cursor-pointer">
                                   <option value="Active" className="bg-[#111C44]">Active</option><option value="Inactive" className="bg-[#111C44]">Inactive</option>
                                </select>
                             </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                             <button type="button" onClick={() => setShowEditUserModal(false)} className="flex-1 bg-white/5 text-white/40 font-bold py-5 rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                             <button type="submit" className="flex-2 bg-[#4318FF] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#4318FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Changes</button>
                          </div>
                       </form>
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Receipt Modal */}
          <AnimatePresence>
            {showReceiptModal && selectedPayment && (
               <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                  <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/10 text-slate-900">
                     <div className="p-10 pb-6 text-center">
                        <button onClick={() => setShowReceiptModal(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={20}/></button>
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-16 h-16 bg-[#4318FF] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3"><Car size={32} /></div>
                           <div className="mt-2">
                             <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-[#111C44]" style={{ fontFamily: "'Outfit', sans-serif" }}>SMART PARKING</h2>
                             <p className="text-[10px] font-black tracking-[4px] text-slate-400 uppercase mt-1">Management System</p>
                           </div>
                           <div className="w-full h-px bg-slate-100 my-4 flex items-center justify-center relative">
                             <span className="bg-white px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest z-10">PAYMENT RECEIPT</span>
                           </div>
                        </div>
                     </div>

                     <div className="px-10 pb-8 flex flex-col gap-5">
                        <div className="flex justify-between items-center group">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Transaction ID</span>
                          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-md">{selectedPayment.id}</span>
                        </div>
                        
                        <div className="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Vehicle Plate</span>
                            <span className="text-sm font-black text-slate-900">{selectedPayment.vehicle}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Parking Slot</span>
                            <span className="text-sm font-black text-[#4318FF]">SLOT {selectedPayment.slot}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Date & Time</span>
                            <span className="text-xs font-bold text-slate-700">{selectedPayment.date}, {selectedPayment.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Payment Method</span>
                            <span className="text-xs font-bold text-slate-700">{selectedPayment.method}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-dashed border-slate-200">
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-sm font-black text-slate-900 uppercase">Total Paid</span>
                            <span className="text-3xl font-black text-[#05CD99]">₹{selectedPayment.amount}.00</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                           <button onClick={() => downloadReceipt(selectedPayment)} className="w-full bg-[#111C44] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#111C44]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"><Download size={18}/> Download Receipt</button>
                           <button onClick={() => window.print()} className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"><Printer size={18}/> Print / Save PDF</button>
                        </div>
                     </div>
                     <div className="p-5 bg-slate-50 text-center">
                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-[5px]">Thank you for your visit</p>
                     </div>
                  </motion.div>
               </div>
            )}
          </AnimatePresence>

          {/* User Add Modal */}
          {showUserModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40"><motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/10"><button onClick={() => setShowUserModal(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-red-500 transition-colors"><X size={20} /></button><div className="p-10"><h2 className="text-2xl font-bold text-white mb-8">Create New Profile</h2><form onSubmit={handleAddUser} className="flex flex-col gap-6"><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label><input required type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="e.g. John Doe" className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#4318FF]/20" /></div><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label><input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="e.g. john@smartparking.com" className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#4318FF]/20" /></div><div className="grid grid-cols-2 gap-4"><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">System Role</label><select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20 appearance-none cursor-pointer"><option value="User" className="bg-[#111C44]">User</option><option value="Operator" className="bg-[#111C44]">Operator</option><option value="Manager" className="bg-[#111C44]">Manager</option><option value="Admin" className="bg-[#111C44]">Admin</option></select></div><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Status</label><select value={newUser.status} onChange={(e) => setNewUser({...newUser, status: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20 appearance-none cursor-pointer"><option value="Active" className="bg-[#111C44]">Active</option><option value="Inactive" className="bg-[#111C44]">Inactive</option></select></div></div><button type="submit" className="bg-[#4318FF] text-white font-black py-5 rounded-2xl text-lg mt-4 shadow-xl shadow-[#4318FF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Create Account</button></form></div></motion.div></div>
          )}

          {showBookingModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden relative border border-white/10">
                <button onClick={() => {setShowBookingModal(false); setBookingStep(1);}} className="absolute top-6 right-6 p-2 text-white/40"><X size={20} /></button>
                {bookingStep === 1 ? (
                  <div className="p-10">
                    <h2 className="text-2xl font-bold text-white mb-2">Book Your Spot</h2>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-8">Secure your parking space in seconds</p>
                    <form onSubmit={(e) => {e.preventDefault(); setBookingStep(2);}} className="flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Vehicle Number</label>
                          <input required type="text" placeholder="MH-01-AX-1234" value={newBooking.vehicle} onChange={(e) => setNewBooking({...newBooking, vehicle: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/30" />
                        </div>
                        <div className="flex flex-col gap-2 relative">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Slot ID</label>
                          <input required type="text" placeholder="e.g. A-05" value={newBooking.slot} onChange={(e) => setNewBooking({...newBooking, slot: e.target.value.toUpperCase()})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/30" />
                          {newBooking.slot && (
                            <div className="absolute right-4 top-[38px]">
                              {(() => {
                                const s = slots.find(sl => sl.id === newBooking.slot);
                                if (!s) return null;
                                if (s.status === 'available') return <span className="text-[8px] font-black bg-[#05CD99]/10 text-[#05CD99] px-2 py-1 rounded-md border border-[#05CD99]/20">AVAILABLE</span>;
                                if (s.status === 'occupied') return <span className="text-[8px] font-black bg-red-500/10 text-red-500 px-2 py-1 rounded-md border border-red-500/20">OCCUPIED</span>;
                                if (s.status === 'reserved') return <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md border border-amber-500/20">RESERVED</span>;
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Available Slots Reference */}
                      <div className="bg-[#1B254B]/50 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 size={12} className="text-[#05CD99]" />
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Recommended Empty Slots</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {slots.filter(s => s.status === 'available').slice(0, 6).map(s => (
                            <button key={s.id} type="button" onClick={() => setNewBooking({...newBooking, slot: s.id})}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border 
                                ${newBooking.slot === s.id ? 'bg-[#4318FF] border-[#4318FF] text-white' : 'bg-[#111C44] border-white/10 text-white/60 hover:border-[#4318FF] hover:text-[#4318FF]'}`}>
                              {s.id}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Check-in Time</label>
                          <input required type="datetime-local" value={newBooking.startTime} onChange={(e) => setNewBooking({...newBooking, startTime: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/30" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Duration</label>
                          <select value={newBooking.duration} onChange={(e) => setNewBooking({...newBooking, duration: parseInt(e.target.value)})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white cursor-pointer focus:ring-2 focus:ring-[#4318FF]/30 appearance-none">
                            {[1,2,3,4,8,12,24].map(h => <option key={h} value={h} className="bg-[#111C44]">{h} Hour{h>1?'s':''}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="bg-[#05CD99]/10 p-6 rounded-2xl flex justify-between items-center border border-[#05CD99]/20 shadow-inner">
                        <div>
                          <p className="text-3xl font-black text-white">₹{newBooking.duration*25}.00</p>
                          <p className="text-[10px] text-[#05CD99] font-black uppercase tracking-[2px] mt-1">Total Payable Amount</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/40 font-bold tracking-widest">Rate: ₹25/hr</p>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={!slots.find(s => s.id === newBooking.slot) || slots.find(s => s.id === newBooking.slot).status !== 'available'}
                        className={`text-white font-black py-5 rounded-2xl text-lg transition-all shadow-xl flex items-center justify-center gap-3
                          ${(!slots.find(s => s.id === newBooking.slot) || slots.find(s => s.id === newBooking.slot).status !== 'available') 
                            ? 'bg-white/10 text-white/20 cursor-not-allowed' 
                            : 'bg-[#4318FF] shadow-[#4318FF]/20 hover:scale-[1.02] active:scale-[0.98]'}`}
                      >
                        <CreditCard size={20}/> 
                        {(!slots.find(s => s.id === newBooking.slot)) ? 'Enter Valid Slot ID' : 
                         (slots.find(s => s.id === newBooking.slot).status !== 'available') ? 'Slot Not Available' : 'Proceed to Payment'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-10 flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Secure Checkout</h2>
                    <p className="text-sm text-white/40 font-medium mb-8">Scan QR to pay ₹{newBooking.duration*25}.00 via UPI</p>
                    <div className="bg-white p-6 rounded-[40px] shadow-2xl relative">
                      <QrCode size={180} className="text-[#111C44]" />
                      <div className="absolute inset-0 border-8 border-white rounded-[40px] pointer-events-none"></div>
                    </div>
                    <div className="mt-8 flex items-center gap-4 text-white/40 font-bold text-xs uppercase tracking-widest">
                       <div className="w-8 h-px bg-white/10"></div>
                       Verified Payment Gateway
                       <div className="w-8 h-px bg-white/10"></div>
                    </div>
                    <button onClick={confirmBooking} className="w-full bg-[#05CD99] text-white font-black py-5 rounded-2xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#05CD99]/20 flex items-center justify-center gap-3"><CheckCircle2 size={20}/> Confirm Payment & Finalize Slot</button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
        <footer className="h-12 bg-[#0B1221] border-t border-white/5 flex items-center justify-between px-10 text-[10px] text-white/20 font-medium shrink-0"><p>© 2025 Smart Parking System. All rights reserved.</p><p>Made with ❤ for smarter cities</p></footer>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (<div className="bg-[#111C44] p-6 rounded-3xl shadow-sm border border-white/5 flex items-center gap-5 transition-transform hover:translate-y-[-4px]"><div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-black/20`}><Icon size={24} /></div><div><p className="text-xs text-white/40 font-bold uppercase tracking-wider">{label}</p><p className="text-2xl font-black text-white">{value}</p></div></div>);

export default App;
