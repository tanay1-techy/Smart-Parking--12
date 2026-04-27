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

const CUSTOMER_COMPLAINTS = [
  { id: 'CMP-101', type: 'Payment Issue', desc: 'I tried to pay ₹25 using PhonePe UPI. The amount was deducted twice from my bank account, but the app only showed one successful transaction. Please refund the extra ₹25 as soon as possible.', status: 'Pending', user: 'Rahul K.', date: '27 Apr 2025' },
  { id: 'CMP-102', type: 'Technical', desc: 'The live map in the app was showing slot B-12 as occupied (red color), but when I reached there, it was completely empty. This caused a lot of confusion and I had to circle around twice.', status: 'Resolved', user: 'Sneha R.', date: '26 Apr 2025' },
  { id: 'CMP-103', type: 'Behaviour', desc: 'The security guard at the Sector-Alpha entry point was very rude. He was not allowing me to enter because I was showing my digital ID on phone instead of a physical card. He should be trained on digital policies.', status: 'Processing', user: 'Arjun M.', date: '25 Apr 2025' },
];

const INDIA_PARKING_DATA = {
  'Maharashtra': { 'Mumbai': [{ name: 'Gateway of India Parking', distance: '0.5 km', available: 12, total: 50 }, { name: 'Phoenix Marketcity Mumbai', distance: '5.2 km', available: 156, total: 500 }, { name: 'Marine Drive Public Parking', distance: '1.2 km', available: 0, total: 30 }], 'Pune': [{ name: 'Koregaon Park Central', distance: '1.2 km', available: 8, total: 40 }, { name: 'Phoenix Mall Viman Nagar', distance: '3.4 km', available: 45, total: 200 }] },
  'Delhi': { 'New Delhi': [{ name: 'Connaught Place Block-A', distance: '0.2 km', available: 5, total: 120 }, { name: 'India Gate Public Parking', distance: '1.5 km', available: 45, total: 200 }, { name: 'Chanakyapuri Corporate', distance: '4.1 km', available: 22, total: 80 }] },
  'Haryana': { 'Gurugram': [{ name: 'Cyber Hub Parking', distance: '0.8 km', available: 45, total: 100 }, { name: 'Ambience Mall Gurugram', distance: '1.2 km', available: 12, total: 250 }, { name: 'DLF Cyber City Multi-level', distance: '2.5 km', available: 88, total: 300 }] },
  'Karnataka': { 'Bengaluru': [{ name: 'MG Road Metro Parking', distance: '0.4 km', available: 10, total: 60 }, { name: 'Indiranagar 100ft Road', distance: '1.8 km', available: 3, total: 40 }, { name: 'Whitefield ITPL Parking', distance: '6.5 km', available: 230, total: 600 }] },
  'Madhya Pradesh': { 'Bhopal': [{ name: 'DB Mall Bhopal Parking', distance: '0.6 km', available: 35, total: 150 }, { name: 'MP Nagar Zone-1 Parking', distance: '1.2 km', available: 10, total: 40 }, { name: 'Bhopal Junction Station', distance: '4.5 km', available: 20, total: 100 }], 'Indore': [{ name: 'Rajwada Market Parking', distance: '0.3 km', available: 0, total: 50 }, { name: 'TI Mall MG Road', distance: '2.1 km', available: 85, total: 300 }, { name: 'Vijay Nagar Square', distance: '3.8 km', available: 120, total: 400 }] }
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

  const handleStateChange = (state) => { setSelectedState(state); setSelectedCity(Object.keys(INDIA_PARKING_DATA[state])[0]); };
  const handleVerify = () => { setIsVerifying(true); setNotification("Running diagnostics..."); setTimeout(() => { setIsVerifying(false); setNotification("All systems verified."); setTimeout(() => setNotification(null), 3000); }, 2000); };
  const handleLockdown = () => { setIsLockdown(!isLockdown); setNotification(isLockdown ? "Lockdown lifted." : "CRITICAL: Area Lockdown!"); setTimeout(() => setNotification(null), 4000); };
  
  const confirmBooking = () => { 
    const res = { id: Date.now(), vehicle: newBooking.vehicle, slot: newBooking.slot, date: new Date(newBooking.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), time: `${new Date(newBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, status: 'Confirmed' }; 
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
    const content = `SMART PARKING SYSTEM\n--------------------------\nPAYMENT RECEIPT\n--------------------------\nTransaction ID : ${payment.id}\nVehicle Plate  : ${payment.vehicle}\nParking Slot   : ${payment.slot}\nDate           : ${payment.date}\nTime           : ${payment.time}\nPayment Method : ${payment.method}\n--------------------------\nTOTAL PAID     : INR ${payment.amount}.00\nPayment Status : ${payment.status}\n--------------------------\nThank you for choosing smarter parking!\nVisit again.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `Receipt_${payment.id}.txt`; link.click(); URL.revokeObjectURL(url);
    setNotification("Receipt downloaded!"); setTimeout(() => setNotification(null), 3000);
  };

  const openReceipt = (payment) => { setSelectedPayment(payment); setShowReceiptModal(true); };
  const openComplaint = (complaint) => { setSelectedComplaint(complaint); setShowComplaintModal(true); };
  const startEditUser = (user) => { setEditingUser(user); setShowEditUserModal(true); };

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

      <aside className={`w-[260px] flex flex-col py-8 shadow-2xl z-30 transition-colors duration-500 ${activeSection === 'slots' ? 'bg-[#13131a] border-r border-white/5' : 'bg-[#0B1739] text-white'}`}>
        <div className="px-8 mb-10 flex flex-col items-center">
           <div className={`w-20 h-20 mb-2 transition-all duration-500 flex items-center justify-center overflow-hidden rounded-2xl ${activeSection === 'slots' ? (isLockdown ? 'shadow-[0_0_20px_rgba(255,0,0,0.5)] bg-red-500/10' : 'shadow-[0_0_20px_rgba(0,240,255,0.4)] bg-[#00f0ff]/5') : ''}`}>
              <img src={logo} className="w-full h-full object-contain" alt="Logo" />
           </div>
           <h1 className="text-xl font-black text-center leading-tight">SMART PARKING<br/><span className={activeSection === 'slots' ? "text-[#00f0ff]" : "text-[#05CD99]"}>SYSTEM</span></h1>
           <p className="text-white/40 text-[9px] mt-2 font-bold uppercase tracking-[3px] text-center">Premium Hub</p>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1">
          {[ { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' }, { id: 'slots', icon: MapIcon, label: 'Live Map' }, { id: 'reservations', icon: Calendar, label: 'Reservations' }, { id: 'payments', icon: CreditCard, label: 'Payments' }, { id: 'users', icon: Users, label: 'Users' }, { id: 'reports', icon: FileText, label: 'Reports' } ].map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-medium ${activeSection === item.id ? (activeSection === 'slots' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'bg-[#4318FF] text-white shadow-lg') : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><item.icon size={20} /> {item.label}</button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-20 border-b flex items-center justify-between px-10 shrink-0 transition-colors duration-500 ${activeSection === 'slots' ? 'bg-[#13131a]/50 backdrop-blur-md border-white/5' : 'bg-[#111C44]/50 backdrop-blur-md border-white/5'} text-white`}>
          <div className="flex items-center gap-4"><button className="p-2 hover:bg-gray-100/10 rounded-lg"><Menu size={20}/></button><h2 className="text-xl font-bold capitalize">{activeSection === 'slots' ? 'Live Sector Map' : activeSection}</h2></div>
          <div className="flex items-center gap-6"><div className="flex items-center gap-3 border-l pl-6 border-white/10"><div className="text-right hidden sm:block"><p className="text-sm font-bold">Admin</p><p className="text-[10px] text-gray-400 font-medium">Super User</p></div><div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${activeSection === 'slots' ? 'ring-[#00f0ff]/50' : 'ring-[#4318FF]/20'}`}><img src="https://ui-avatars.com/api/?name=Admin&background=4318FF&color=fff" /></div></div></div>
        </header>

        <div className={`flex-1 overflow-y-auto transition-colors duration-500 ${activeSection === 'slots' ? 'bg-[#0a0a0f] p-0' : 'p-8 bg-[#0B1221]'}`}>
          <AnimatePresence mode="wait">
            {activeSection === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><StatCard label="Total Slots" value="250" icon={LayoutDashboard} color="bg-[#4318FF]" /><StatCard label="Available Slots" value={availableCount} icon={CheckCircle2} color="bg-[#05CD99]" /><StatCard label="Occupied Slots" value={occupiedCount} icon={Car} color="bg-[#7551FF]" /><StatCard label="Reserved Slots" value={reservedCount} icon={Calendar} color="bg-[#FFB547]" /></div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8"><div className="bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 flex flex-col"><h3 className="font-bold text-lg text-white mb-8">Parking Overview</h3><div className="h-64 relative flex items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="absolute flex flex-col items-center"><span className="text-3xl font-bold text-white">48%</span><span className="text-xs text-white/40 font-medium">Available</span></div></div><div className="mt-6 flex flex-col gap-3">{pieData.map(i => <div key={i.name} className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{backgroundColor:i.color}}></div><span className="text-sm font-medium text-white/60">{i.name}</span></div><span className="text-sm font-bold text-white">{i.value}</span></div>)}</div></div><div className="xl:col-span-2 bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 flex flex-col"><div className="flex justify-between items-center mb-8"><div><h3 className="font-bold text-lg text-white">Explore Parking Lots</h3><p className="text-xs text-white/40 font-medium mt-1">Select state and city to find available slots across India</p></div><div className="flex items-center gap-2 text-[#4318FF] text-[10px] font-black bg-[#1B254B] px-4 py-2 rounded-full border border-[#4318FF]/10 tracking-widest"><MapPin size={12}/> LIVE DATABASE</div></div><div className="grid grid-cols-2 gap-4 mb-8"><div className="flex flex-col gap-2"><label className="text-[10px] font-bold text-white/40 uppercase tracking-[2px] pl-1">Select State</label><div className="relative group"><select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="w-full bg-[#1B254B] border-none rounded-2xl px-5 py-4 text-white font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-[#4318FF]/20">{Object.keys(INDIA_PARKING_DATA).map(state => <option key={state} value={state} className="bg-[#111C44]">{state}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-[#4318FF] transition-colors" size={20} /></div></div><div className="flex flex-col gap-2"><label className="text-[10px] font-bold text-white/40 uppercase tracking-[2px] pl-1">Select City</label><div className="relative group"><select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-[#1B254B] border-none rounded-2xl px-5 py-4 text-white font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-[#4318FF]/20">{Object.keys(INDIA_PARKING_DATA[selectedState]).map(city => <option key={city} value={city} className="bg-[#111C44]">{city}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-[#4318FF] transition-colors" size={20} /></div></div></div><div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 max-h-[250px]"><AnimatePresence mode="popLayout">{availableParkingLots.map((park, idx) => (<motion.div key={park.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between p-4 bg-[#1B254B] hover:bg-[#111C44] border border-transparent hover:border-[#4318FF]/20 rounded-2xl transition-all group"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-[#111C44] rounded-xl flex items-center justify-center text-[#4318FF] shadow-sm group-hover:bg-[#4318FF] group-hover:text-white transition-all"><Navigation size={20} /></div><div><h4 className="font-bold text-white text-sm">{park.name}</h4><p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{selectedCity}, {selectedState}</p></div></div><div className="flex items-center gap-8"><div className="text-right"><div className="flex items-center gap-1.5 mb-0.5"><div className={`w-1.5 h-1.5 rounded-full ${park.available > 10 ? 'bg-[#05CD99]' : park.available > 0 ? 'bg-[#FFB547]' : 'bg-red-500'}`}></div><span className={`text-xs font-black ${park.available > 10 ? 'text-[#05CD99]' : park.available > 0 ? 'text-[#FFB547]' : 'text-red-500'}`}>{park.available === 0 ? 'FULL' : `${park.available}/${park.total}`}</span></div><p className="text-[10px] text-white/40 font-bold tracking-widest">{park.distance} AWAY</p></div><button className="bg-[#111C44] text-[#4318FF] border border-[#4318FF]/20 hover:bg-[#4318FF] hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-sm">DETAILS</button></div></motion.div>))}</AnimatePresence></div></div></div>
              </motion.div>
            )}

            {activeSection === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8">
                 <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-white">Payment History</h2><p className="text-sm text-white/40 font-medium">Real-time transaction monitoring and receipt generation</p></div><div className="flex gap-4"><div className="bg-[#111C44] px-6 py-3 rounded-2xl border border-white/5 shadow-sm flex flex-col"><span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Revenue</span><span className="text-xl font-black text-white">₹12,450.00</span></div></div></div>
                 <div className="bg-[#111C44] rounded-3xl shadow-sm border border-white/5 overflow-hidden"><div className="p-8 border-b border-white/5 flex justify-between items-center"><div className="relative w-96"><input type="text" value={paymentSearchTerm} onChange={(e) => setPaymentSearchTerm(e.target.value)} placeholder="Search transaction ID or vehicle..." className="w-full bg-[#1B254B] border-none rounded-2xl px-12 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20" /><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} /></div><div className="flex gap-2"><button className="p-3 bg-[#1B254B] text-white/60 rounded-xl hover:bg-[#4318FF] hover:text-white transition-all"><Printer size={20}/></button><button className="p-3 bg-[#1B254B] text-white/60 rounded-xl hover:bg-[#4318FF] hover:text-white transition-all"><Download size={20}/></button></div></div><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-[#1B254B]/50"><th className="px-8 py-5">Transaction ID</th><th className="px-8 py-5">Vehicle & Slot</th><th className="px-8 py-5">Amount</th><th className="px-8 py-5">Method</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Date</th><th className="px-8 py-5">Action</th></tr></thead><tbody className="divide-y divide-white/5"><AnimatePresence>{filteredPayments.map((p) => (<motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-[#1B254B]/30 group"><td className="px-8 py-6 font-mono text-xs font-bold text-[#4318FF]">{p.id}</td><td className="px-8 py-6"><div><p className="font-black text-white text-sm">{p.vehicle}</p><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">SLOT {p.slot}</p></div></td><td className="px-8 py-6 font-black text-white">₹{p.amount}.00</td><td className="px-8 py-6 text-xs font-bold text-white/60">{p.method}</td><td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'Success' ? 'bg-[#05CD99]/10 text-[#05CD99]' : 'bg-amber-500/10 text-amber-500'}`}>{p.status}</span></td><td className="px-8 py-6"><p className="text-xs font-bold text-white">{p.date}</p><p className="text-[10px] text-white/40">{p.time}</p></td><td className="px-8 py-6"><button onClick={() => openReceipt(p)} className="bg-[#4318FF] text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-[#4318FF]/20 hover:scale-105 transition-all">RECEIPT</button></td></motion.tr>))}</AnimatePresence>{filteredPayments.length === 0 && (<tr><td colSpan="7" className="px-8 py-20 text-center text-white/40 font-bold">No transactions found matching "{paymentSearchTerm}"</td></tr>)}</tbody></table></div></div>
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
              <motion.div key="slots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col"><div className="flex-1 flex p-6 gap-6 overflow-hidden"><div className="flex-[2] bg-[#13131a] rounded-3xl border border-white/5 p-8 flex flex-col relative overflow-hidden shadow-2xl"><div className="flex justify-between items-center mb-8 relative z-10"><h2 className="text-xl font-bold tracking-wide flex items-center gap-3"><MapIcon className={isLockdown ? "text-red-500" : "text-[#00f0ff]"} /> Sector Alpha <span className="text-white/30 font-mono text-sm tracking-widest">[AX-001]</span></h2><div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest"><div className={`w-2 h-2 rounded-full animate-pulse ${isLockdown ? 'bg-red-500 glow-red' : 'bg-green-500 glow-green'}`}></div>{isLockdown ? 'Lockdown Mode' : 'Monitoring Active'}</div></div><div className={`flex-1 relative flex items-center justify-center border border-white/5 rounded-2xl overflow-hidden transition-colors duration-1000 ${isLockdown ? 'bg-red-500/5' : 'bg-[#0a0a0f]'}`} style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}><div className="grid grid-cols-10 gap-3 p-8" style={{ transform: 'perspective(1200px) rotateX(45deg) scale(1.1)', transformStyle: 'preserve-3d' }}><AnimatePresence>{slots.slice(0, 60).map((slot) => { const isOccupied = isLockdown || slot.status === 'occupied'; return (<motion.div key={slot.id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1, z: isOccupied ? 15 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className={`w-12 h-20 rounded-md border flex items-center justify-center font-mono text-[10px] relative transition-all duration-700 ${!isOccupied ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-white/5 border-red-500/30 text-red-500/50'} ${isLockdown && 'bg-red-500/20 border-red-500/60 shadow-[0_0_20px_rgba(255,0,0,0.4)]'}`}>{isOccupied && <div className="absolute inset-x-2 top-2 bottom-2 bg-red-500/20 rounded shadow-[0_0_15px_rgba(255,0,0,0.5)] flex items-center justify-center">{isLockdown ? <AlertTriangle size={18} className="text-red-500 animate-pulse" /> : <Car size={18} className="text-red-500 drop-shadow-lg" />}</div>}<span className="absolute bottom-1 opacity-60 font-bold">{slot.id}</span></motion.div>)})}</AnimatePresence></div></div></div><div className="flex-1 flex flex-col gap-6"><div className="bg-[#13131a] rounded-3xl border border-white/5 p-6 flex flex-col h-[60%] shadow-2xl"><h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2"><Terminal size={14} className={isLockdown ? "text-red-500" : "text-[#00f0ff]"} /> Live OCR Stream</h3><div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[10px] overflow-hidden relative"><div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div><motion.div animate={{ y: [0, 300, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className={`absolute top-0 left-0 w-full h-[1px] z-10 ${isLockdown ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-[#00f0ff] shadow-[0_0_15px_#00f0ff]'}`} /><div className="flex flex-col gap-2 overflow-y-auto h-full pr-2">{logs.map((l, i) => <div key={i} className="flex gap-2 border-b border-white/5 pb-1 opacity-80"><span className="text-[#00f0ff]/50">[{l.time}]</span><span>{l.msg}</span></div>)}</div></div></div><div className="bg-[#13131a] rounded-3xl border border-white/5 p-6 flex flex-col flex-1 shadow-2xl"><h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Tactical Controls</h3><div className="grid grid-cols-2 gap-3 h-full"><button onClick={handleVerify} disabled={isVerifying} className="bg-white/5 hover:bg-[#00f0ff]/10 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">{isVerifying ? <Activity size={24} className="text-[#00f0ff] animate-spin" /> : <CheckCircle2 size={24} className="text-[#00f0ff] group-hover:scale-110" />}<span className="text-[10px] font-bold uppercase tracking-wider">{isVerifying ? 'Scanning...' : 'Verify'}</span></button><button onClick={handleLockdown} className={`rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group border ${isLockdown ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/40 text-white/60'}`}><AlertTriangle size={24} className={isLockdown ? 'animate-pulse' : 'group-hover:scale-110'} /><span className="text-[10px] font-bold uppercase tracking-wider">{isLockdown ? 'Unlock' : 'Lockdown'}</span></button></div></div></div></div></motion.div>
            )}

            {activeSection === 'reservations' && (
              <motion.div key="reservations" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-8"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Advanced Reservation System</h2><button onClick={() => setShowBookingModal(true)} className="flex items-center gap-2 bg-[#4318FF] text-white px-6 py-3 rounded-2xl shadow-lg shadow-[#4318FF]/30 hover:scale-105 transition-all font-bold"><Plus size={20}/> New Booking</button></div><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div className="bg-gradient-to-br from-[#4318FF] to-[#7551FF] p-8 rounded-3xl text-white shadow-xl flex flex-col gap-6 relative overflow-hidden"><div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div><h3 className="text-xl font-bold border-b border-white/20 pb-4">Standard Pricing</h3><div className="flex flex-col gap-4"><div className="flex justify-between items-center"><span>Hourly Rate</span><span className="text-2xl font-black font-mono">₹25/hr</span></div><div className="flex justify-between items-center"><span>Pre-Booking Fee</span><span className="font-bold">Varies by time</span></div><div className="flex justify-between items-center bg-white/10 p-3 rounded-xl"><span className="text-sm">Grace Period</span><span className="font-bold">30 Mins</span></div></div><div className="mt-auto bg-red-500/20 border border-red-400/30 p-4 rounded-2xl flex items-start gap-3"><AlertTriangle className="shrink-0" size={18} /><p className="text-xs leading-relaxed"><strong>Overstay Penalty:</strong> Exceeding grace period incurs a flat <strong>₹1000 fine</strong> plus standard hourly charges.</p></div></div><div className="md:col-span-2 bg-[#111C44] p-8 rounded-3xl shadow-sm border border-white/5 overflow-hidden"><h3 className="font-bold text-lg text-white mb-6">Available Slots</h3><div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto pr-2">{slots.slice(0, 80).map((s) => <div key={s.id} onClick={() => s.status === 'available' && (setNewBooking({...newBooking, slot: s.id}), setShowBookingModal(true))} className={`p-3 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all hover:scale-105 ${s.status === 'available' ? 'bg-[#05CD99]/10 border-[#05CD99]/20 text-[#05CD99]' : s.status === 'occupied' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 opacity-50' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}><Car size={14} /><span className="text-[10px] font-black">{s.id}</span></div>)}</div></div></div></motion.div>
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
                  <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/10">
                     <div className="p-8 border-b border-dashed border-white/10 relative">
                        <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 p-2 text-white/40 hover:text-red-500 transition-colors"><X size={20}/></button>
                        <div className="flex flex-col items-center">
                           <div className="w-16 h-16 bg-[#4318FF]/10 rounded-2xl flex items-center justify-center text-[#4318FF] mb-4"><img src={logo} className="w-full h-full object-contain" alt="Logo" /></div>
                           <h3 className="text-xl font-black text-white">Payment Receipt</h3>
                           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Smart Parking System</p>
                        </div>
                     </div>
                     <div className="p-8 flex flex-col gap-4">
                        <div className="flex justify-between items-center"><span className="text-xs text-white/40 font-bold uppercase">Transaction ID</span><span className="text-xs font-mono font-bold text-white">{selectedPayment.id}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs text-white/40 font-bold uppercase">Vehicle</span><span className="text-sm font-black text-white">{selectedPayment.vehicle}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs text-white/40 font-bold uppercase">Parking Slot</span><span className="text-sm font-black text-white">{selectedPayment.slot}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs text-white/40 font-bold uppercase">Date & Time</span><span className="text-xs font-bold text-white">{selectedPayment.date}, {selectedPayment.time}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs text-white/40 font-bold uppercase">Method</span><span className="text-xs font-bold text-white">{selectedPayment.method}</span></div>
                        <div className="h-px bg-white/5 my-2"></div>
                        <div className="flex justify-between items-center"><span className="text-sm font-black text-white">Total Paid</span><span className="text-2xl font-black text-[#05CD99]">₹{selectedPayment.amount}.00</span></div>
                        <div className="mt-6 flex flex-col gap-2">
                           <button onClick={() => downloadReceipt(selectedPayment)} className="w-full bg-[#4318FF] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#4318FF]/20 hover:scale-[1.02] transition-all"><Download size={18}/> Download Receipt (.txt)</button>
                           <button onClick={() => window.print()} className="w-full bg-white/5 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><Printer size={18}/> Print / Save PDF</button>
                        </div>
                     </div>
                     <div className="p-4 bg-white/5 text-center text-[8px] text-white/20 uppercase font-black tracking-[4px]">Thank you for using Smart Parking</div>
                  </motion.div>
               </div>
            )}
          </AnimatePresence>

          {/* User Add Modal */}
          {showUserModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40"><motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/10"><button onClick={() => setShowUserModal(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-red-500 transition-colors"><X size={20} /></button><div className="p-10"><h2 className="text-2xl font-bold text-white mb-8">Create New Profile</h2><form onSubmit={handleAddUser} className="flex flex-col gap-6"><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label><input required type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="e.g. John Doe" className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#4318FF]/20" /></div><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label><input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="e.g. john@smartparking.com" className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#4318FF]/20" /></div><div className="grid grid-cols-2 gap-4"><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">System Role</label><select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20 appearance-none cursor-pointer"><option value="User" className="bg-[#111C44]">User</option><option value="Operator" className="bg-[#111C44]">Operator</option><option value="Manager" className="bg-[#111C44]">Manager</option><option value="Admin" className="bg-[#111C44]">Admin</option></select></div><div className="flex flex-col gap-2"><label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Status</label><select value={newUser.status} onChange={(e) => setNewUser({...newUser, status: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-[#4318FF]/20 appearance-none cursor-pointer"><option value="Active" className="bg-[#111C44]">Active</option><option value="Inactive" className="bg-[#111C44]">Inactive</option></select></div></div><button type="submit" className="bg-[#4318FF] text-white font-black py-5 rounded-2xl text-lg mt-4 shadow-xl shadow-[#4318FF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Create Account</button></form></div></motion.div></div>
          )}

          {showBookingModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40"><motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111C44] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden relative border border-white/10"><button onClick={() => {setShowBookingModal(false); setBookingStep(1);}} className="absolute top-6 right-6 p-2 text-white/40"><X size={20} /></button>{bookingStep === 1 ? (<div className="p-10"><h2 className="text-2xl font-bold text-white mb-8">Book Your Spot</h2><form onSubmit={(e) => {e.preventDefault(); setBookingStep(2);}} className="flex flex-col gap-6"><div className="grid grid-cols-2 gap-4"><input required type="text" placeholder="Plate No" value={newBooking.vehicle} onChange={(e) => setNewBooking({...newBooking, vehicle: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white" /><input required type="text" placeholder="Slot ID" value={newBooking.slot} onChange={(e) => setNewBooking({...newBooking, slot: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white" /></div><div className="grid grid-cols-2 gap-4"><input required type="datetime-local" value={newBooking.startTime} onChange={(e) => setNewBooking({...newBooking, startTime: e.target.value})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white" /><select value={newBooking.duration} onChange={(e) => setNewBooking({...newBooking, duration: parseInt(e.target.value)})} className="bg-[#1B254B] border-none rounded-2xl px-5 py-4 font-bold text-white cursor-pointer">{[1,2,3,4,8,12,24].map(h => <option key={h} value={h} className="bg-[#111C44]">{h} Hour{h>1?'s':''}</option>)}</select></div><div className="bg-[#05CD99]/10 p-6 rounded-2xl flex justify-between items-center border border-[#05CD99]/20"><p className="text-3xl font-black text-white">₹{newBooking.duration*25}.00</p><p className="text-xs text-[#05CD99] font-bold uppercase tracking-widest">₹25.00 / Hour</p></div><button type="submit" className="bg-[#4318FF] text-white font-black py-5 rounded-2xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-all">Proceed to Payment</button></form></div>) : (<div className="p-10 flex flex-col items-center"><h2 className="text-2xl font-bold text-white mb-8">Scan to Pay via UPI</h2><div className="bg-white p-4 rounded-3xl"><QrCode size={160} className="text-[#111C44]" /></div><button onClick={confirmBooking} className="w-full bg-[#05CD99] text-white font-black py-5 rounded-2xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all">Confirm Payment</button></div>)}</motion.div></div>
          )}
        </div>
        <footer className="h-12 bg-[#0B1221] border-t border-white/5 flex items-center justify-between px-10 text-[10px] text-white/20 font-medium shrink-0"><p>© 2025 Smart Parking System. All rights reserved.</p><p>Made with ❤ for smarter cities</p></footer>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (<div className="bg-[#111C44] p-6 rounded-3xl shadow-sm border border-white/5 flex items-center gap-5 transition-transform hover:translate-y-[-4px]"><div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-black/20`}><Icon size={24} /></div><div><p className="text-xs text-white/40 font-bold uppercase tracking-wider">{label}</p><p className="text-2xl font-black text-white">{value}</p></div></div>);

export default App;
