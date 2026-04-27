# 🚗 Smart Parking Management System — Implementation Plan

> **AI-Powered Smart Parking Management System with Real-Time Monitoring, ANPR, and Dynamic Reservation**

---

## 📋 Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [System Architecture](#2-system-architecture)
3. [Database Schema Design](#3-database-schema-design)
4. [API Design (REST + WebSocket)](#4-api-design)
5. [Implementation Phases](#5-implementation-phases)
6. [File Structure (Target)](#6-file-structure-target)
7. [Pricing & Business Logic Reference](#7-pricing--business-logic-reference)

---

## 1. Current State Audit

### ✅ What Already Exists

| Component | Status | Notes |
|---|---|---|
| Vite + Express project scaffold | ✅ Done | `package.json` configured, dev/server scripts |
| Socket.io real-time infra | ✅ Done | Server ↔ Client bidirectional communication |
| In-memory slot management (250 slots) | ✅ Done | Sections A–E, 50 slots each |
| Basic booking engine | ✅ Done | `create-booking`, assigns slot, sets grace timer |
| ANPR entry/exit simulation | ✅ Done | Walk-in + reservation matching + exit billing |
| No-show detection | ✅ Done | Timer fires after grace period |
| Dynamic pricing skeleton | ✅ Done | Base rate ₹25/hr, advance fee ₹50, no-show ₹1000 |
| Dashboard UI (sidebar layout) | ✅ Done | Stat cards, gate control, activity log, ANPR sim, charts |
| Parking Slots grid view | ✅ Done | Color-coded 250-slot grid |
| Reservations section | ✅ Done | Booking form, card list, history table |
| Payments section (Admin) | ✅ Done | Revenue chart, payment methods, transaction table |
| Role switching (Admin/User) | ✅ Done | Toggle hides admin-only sections |

### ⚠️ What Needs Work

| Gap | Priority | Description |
|---|---|---|
| No persistent database | 🔴 Critical | All data is in-memory; lost on server restart |
| No authentication system | 🔴 Critical | No login/register; role is toggled manually |
| No user registration/profiles | 🔴 Critical | Users can't create accounts or view personal history |
| Parking Map is Google Maps embed | 🟡 Major | Should be interactive SVG/Canvas parking layout |
| No notification system | 🟡 Major | No push/SMS/in-app notifications |
| Revenue charts use hardcoded data | 🟡 Major | Not driven by actual transaction data |
| Booking form doesn't use date picker | 🟢 Minor | Only time input, no date selection |
| Settings page is non-functional | 🟢 Minor | Form doesn't save or propagate changes |
| Reports page has no real data | 🟢 Minor | Download buttons are non-functional |
| Missing responsive/mobile layout | 🟢 Minor | Sidebar doesn't collapse on small screens |
| No payment gateway integration | 🟢 Minor | No Razorpay/Stripe; can be simulated |

---

## 2. System Architecture

### Tech Stack (Confirmed)

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Vite + Vanilla JS + CSS | Already scaffolded; lightweight, fast |
| Backend | Node.js + Express | Already scaffolded; real-time capable |
| Database | **MongoDB + Mongoose** | Flexible schema for logs/sensor data |
| Real-time | Socket.io | Already integrated |
| Charts | Chart.js | Already integrated via CDN |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless auth, industry standard |
| Icons | Material Icons Outlined | Already integrated |
| Fonts | Inter (Google Fonts) | Already integrated |

### Architecture Diagram

```
Frontend (Vite + Vanilla JS)
├── index.html (SPA Shell)
├── main.js (App Controller)
├── style.css (Design System)
├── modules/auth.js
├── modules/map.js
├── modules/booking.js
├── modules/anpr.js
└── modules/notifications.js
        │
        ├── Socket.io ──────────────────┐
        └── REST API ───────────────────┤
                                        ▼
Backend (Node.js + Express)
├── server.js (Entry Point)
├── routes/auth.js
├── routes/bookings.js
├── routes/slots.js
├── routes/payments.js
├── routes/admin.js
├── middleware/auth.js
├── services/pricing.js
├── services/anpr.js
├── services/notifications.js
└── socket/handlers.js
        │
        ▼
Database (MongoDB)
├── Users Collection
├── Slots Collection
├── Bookings Collection
├── Transactions Collection
└── Logs Collection
```

---

## 3. Database Schema Design

### 3.1 Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,            // unique, indexed
  phone: String,
  passwordHash: String,     // bcrypt hashed
  role: "admin" | "user",
  vehicles: [{ plateNumber: String, make: String, model: String }],
  wallet: { balance: Number, transactions: [ObjectId] },
  notifications: [{ message: String, type: String, read: Boolean, createdAt: Date }],
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 Slots Collection

```javascript
{
  _id: ObjectId,
  slotId: String,           // "A-01", "B-15"
  section: String,          // "A"–"E"
  number: Number,           // 1–50
  status: "available" | "occupied" | "reserved",
  vehicleNumber: String | null,
  currentBookingId: ObjectId | null,
  sensorHealth: "online" | "offline" | "degraded",
  lastSensorPing: Date,
  coordinates: { row: Number, col: Number }
}
```

### 3.3 Bookings Collection

```javascript
{
  _id: ObjectId,
  bookingId: String,        // "BK-A1B2C3D4"
  userId: ObjectId,
  vehicleNumber: String,
  slotId: String,
  startTime: Date,
  duration: Number,         // hours
  graceEndTime: Date,       // startTime + duration + 30min
  actualEntry: Date | null,
  actualExit: Date | null,
  isAdvanceBooking: Boolean,
  baseAmount: Number,       // duration × ₹25
  advanceSurcharge: Number, // ₹50 if advance
  overtimePenalty: Number,
  noShowFine: Number,       // ₹1000
  totalAmount: Number,
  status: "pending" | "checked-in" | "completed" | "no-show" | "cancelled",
  paymentStatus: "unpaid" | "paid" | "refunded",
  paymentMethod: "phonepe" | "gpay" | "card" | "cash" | null,
  isWalkIn: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4 Transactions Collection

```javascript
{
  _id: ObjectId,
  transactionId: String,    // "TXN-XXXX"
  bookingId: ObjectId,
  userId: ObjectId,
  vehicleNumber: String,
  amount: Number,
  type: "parking" | "fine" | "refund" | "wallet-topup",
  paymentMethod: String,
  status: "success" | "pending" | "failed",
  createdAt: Date
}
```

### 3.5 Activity Logs Collection

```javascript
{
  _id: ObjectId,
  message: String,
  type: "info" | "success" | "warning" | "alert",
  source: "anpr" | "booking" | "system" | "admin" | "payment",
  metadata: { vehicleNumber: String, slotId: String, bookingId: String },
  createdAt: Date
}
```

---

## 4. API Design

### 4.1 REST API Endpoints

#### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login, returns JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update profile | ✅ |

#### Slots
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/slots` | Get all slots with status | ✅ |
| `GET` | `/api/slots/stats` | Get counts | ✅ |
| `GET` | `/api/slots/:id` | Get single slot | ✅ |

#### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/bookings` | Create new booking | ✅ |
| `GET` | `/api/bookings` | Get user's bookings | ✅ |
| `GET` | `/api/bookings/:id` | Get booking details | ✅ |
| `PUT` | `/api/bookings/:id/cancel` | Cancel booking | ✅ |
| `GET` | `/api/bookings/all` | Admin: get all | ✅ Admin |

#### Payments & Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/transactions` | User's transactions | ✅ |
| `GET` | `/api/transactions/all` | Admin: all transactions | ✅ Admin |
| `GET` | `/api/revenue/summary` | Revenue stats | ✅ Admin |
| `GET` | `/api/admin/users` | List all users | ✅ Admin |
| `PUT` | `/api/admin/settings` | Update config | ✅ Admin |
| `GET` | `/api/admin/reports/:type` | Generate report | ✅ Admin |
| `GET` | `/api/admin/logs` | Activity logs | ✅ Admin |

### 4.2 WebSocket Events

#### Server → Client
| Event | Payload | Description |
|---|---|---|
| `init-state` | `{ slots, bookings, logs, revenue, config }` | Initial state on connect |
| `state-update` | `{ slots, bookings }` | Real-time changes |
| `log-update` | `{ id, timestamp, message, type }` | New log entry |
| `gate-control` | `"open" \| "close"` | Gate animation |
| `notification` | `{ message, type, bookingId }` | Push notification |
| `payment-summary` | `{ vehicleNumber, amount, breakdown }` | Exit payment |

#### Client → Server
| Event | Payload | Description |
|---|---|---|
| `create-booking` | `{ vehicleNumber, duration, startTime }` | New reservation |
| `anpr-entry` | `vehicleNumber` | Entry scan |
| `anpr-exit` | `vehicleNumber` | Exit scan |
| `manual-gate` | `"open" \| "close"` | Manual gate control |
| `cancel-booking` | `bookingId` | Cancel reservation |

---

## 5. Implementation Phases

### Phase 1: Database Integration & Backend Restructure
**Duration:** ~3-4 hours | **Priority:** 🔴 Critical

| # | Task | Files |
|---|---|---|
| 1.1 | Install MongoDB deps | `package.json` → `mongoose dotenv` |
| 1.2 | Create DB connection module | `server/db.js` |
| 1.3 | Create Mongoose models | `server/models/*.js` |
| 1.4 | Create seed script | `server/seed.js` |
| 1.5 | Migrate server.js to use DB | `server.js` |
| 1.6 | Create `.env` file | `.env` |

✅ **Acceptance:** Server connects to MongoDB, 250 slots persist, Socket.io events work with DB.

---

### Phase 2: Authentication & User Management
**Duration:** ~2-3 hours | **Priority:** 🔴 Critical

| # | Task | Files |
|---|---|---|
| 2.1 | Install auth deps | `jsonwebtoken bcryptjs` |
| 2.2 | Create auth middleware | `server/middleware/auth.js` |
| 2.3 | Create auth routes | `server/routes/auth.js` |
| 2.4 | Build Login/Register UI | `index.html`, `style.css` |
| 2.5 | Implement client-side auth | `main.js` |
| 2.6 | Wire role system to real users | `main.js` |

✅ **Acceptance:** Register, login, JWT-based auth, real role-based views.

---

### Phase 3: Interactive Parking Map
**Duration:** ~3-4 hours | **Priority:** 🟡 Major

| # | Task | Files |
|---|---|---|
| 3.1 | Design SVG parking layout | `modules/map.js` |
| 3.2 | Build interactive slot rendering | `modules/map.js` |
| 3.3 | Color-code logic | 🟢=Available, 🔴=Occupied, 🔵=Reserved |
| 3.4 | Real-time update animations | `style.css` |
| 3.5 | Replace Google Maps embed | `index.html` |
| 3.6 | Add section filter/zoom | `modules/map.js` |

✅ **Acceptance:** 250 slots as visual parking lot, real-time color updates, click for details.

---

### Phase 4: Enhanced Booking & Pricing Engine
**Duration:** ~2-3 hours | **Priority:** 🟡 Major

| # | Task | Files |
|---|---|---|
| 4.1 | Add datetime picker | `index.html` |
| 4.2 | Full pricing calculator | `server/services/pricing.js` |
| 4.3 | Live price estimation | `main.js` |
| 4.4 | Payment method selection | `index.html`, `main.js` |
| 4.5 | Ticket-style confirmation | `main.js`, `style.css` |
| 4.6 | Booking cancellation | `main.js`, `server.js` |
| 4.7 | Overtime warning timer | `main.js` |

✅ **Acceptance:** Real-time price estimate, grace period logic, overtime charges, no-show fines.

---

### Phase 5: Notification System
**Duration:** ~2 hours | **Priority:** 🟡 Major

| # | Task | Files |
|---|---|---|
| 5.1 | Notification service | `server/services/notifications.js` |
| 5.2 | Notification dropdown UI | `index.html`, `style.css` |
| 5.3 | Notification triggers | `server.js` |
| 5.4 | Toast notifications | `main.js`, `style.css` |
| 5.5 | Mark-as-read | `main.js` |

**Triggers:** Booking confirmed, grace ending, fine issued, entry/exit confirmed.

✅ **Acceptance:** Bell icon with badge, toast pop-ups, persistent notifications.

---

### Phase 6: Admin Analytics & Reports
**Duration:** ~2-3 hours | **Priority:** 🟢 Enhancement

| # | Task | Files |
|---|---|---|
| 6.1 | Revenue dashboard (real data) | `main.js` |
| 6.2 | Date range filters | `main.js` |
| 6.3 | Occupancy heatmap | `modules/map.js` |
| 6.4 | Fine management panel | `index.html`, `main.js` |
| 6.5 | PDF/Excel export | `server/routes/admin.js` |
| 6.6 | User management table | `index.html`, `main.js` |
| 6.7 | Sensor health dashboard | `index.html`, `main.js` |

✅ **Acceptance:** Real transaction data in charts, downloadable reports, fine management.

---

### Phase 7: UI/UX Polish & Responsiveness
**Duration:** ~2 hours | **Priority:** 🟢 Enhancement

| # | Task | Files |
|---|---|---|
| 7.1 | Mobile-responsive sidebar | `style.css` |
| 7.2 | Dark mode toggle | `style.css`, `main.js` |
| 7.3 | Micro-animations | `style.css` |
| 7.4 | Loading skeletons | `style.css` |
| 7.5 | Empty state illustrations | `index.html` |
| 7.6 | Accessibility audit | All files |
| 7.7 | Error handling UI | `main.js`, `style.css` |

✅ **Acceptance:** Mobile usable (375px+), dark mode, smooth transitions, loading states.

---

## 6. File Structure (Target)

```
test project one/
├── .env
├── .gitignore
├── index.html                    # SPA shell (enhanced)
├── style.css                     # Design system
├── main.js                       # App controller (refactored)
├── modules/                      # Frontend modules (NEW)
│   ├── auth.js
│   ├── map.js
│   ├── booking.js
│   ├── notifications.js
│   └── charts.js
├── server.js                     # Express + Socket.io (refactored)
├── server/                       # Backend modules (NEW)
│   ├── db.js
│   ├── seed.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Slot.js
│   │   ├── Booking.js
│   │   ├── Transaction.js
│   │   └── Log.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── slots.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── services/
│   │   ├── pricing.js
│   │   ├── anpr.js
│   │   └── notifications.js
│   └── socket/
│       └── handlers.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── package.json
└── vite.config.js
```

---

## 7. Pricing & Business Logic Reference

### 💰 Pricing Formula

```
Base Cost     = duration_hours × ₹25
Advance Fee   = ₹50 (if booked > 1hr in advance)
Grace Period  = 30 minutes FREE (no charge)
Overtime      = ceil(overtime_hours) × ₹25
No-Show Fine  = ₹1000 (if didn't arrive in grace window)

TOTAL = Base + Advance Fee + Overtime + No-Show Fine
```

### ⏱️ Timeline Example

```
User books at 1:00 PM for 2 hours:
  → Reserved: 1:00 PM
  → Booked Until: 3:00 PM
  → Grace Ends: 3:30 PM (30 min free)
  → If exits at 4:15 PM:
      Overtime = 4:15 PM - 3:30 PM = 45 min → ceil = 1 hr
      Total = (2 × ₹25) + (1 × ₹25) = ₹75
  → If never shows up by 3:30 PM:
      Fine = ₹1000 (slot auto-released)
```

### 🚦 Slot State Machine

```
[Available] --User Books--> [Reserved]
[Reserved] --ANPR Entry--> [Occupied]
[Reserved] --No-Show--> [Available] (+ ₹1000 fine)
[Occupied] --ANPR Exit--> [Available] (+ billing)
[Available] --Walk-in Entry--> [Occupied]
```

### 🚗 Vehicle Flow (Entry to Exit)

```
Vehicle arrives → Camera scans plate → Entry logged →
Sensor detects slot occupied (RED) →
[If pre-booked → slot turns BLUE → on arrival turns RED] →
User exits → Camera scans plate → Exit logged →
Duration calculated → Amount charged → Slot turns GREEN
```

---

## 🎯 Recommended Execution Order

> **IMPORTANT:** Start with Phase 1 (Database) since all other features depend on persistent data.

| Order | Phase | Depends On | Est. Time |
|---|---|---|---|
| 1st | Phase 1: Database Integration | — | 3-4 hrs |
| 2nd | Phase 2: Authentication | Phase 1 | 2-3 hrs |
| 3rd | Phase 3: Interactive Map | Phase 1 | 3-4 hrs |
| 4th | Phase 4: Booking & Pricing | Phase 1, 2 | 2-3 hrs |
| 5th | Phase 5: Notifications | Phase 1, 2, 4 | 2 hrs |
| 6th | Phase 6: Admin Analytics | Phase 1, 2 | 2-3 hrs |
| 7th | Phase 7: UI/UX Polish | All above | 2 hrs |
| **Total** | | | **~16-22 hrs** |

> **TIP:** Phase 3 (Interactive Map) and Phase 7 (UI Polish) can run in parallel with Phase 1 since they're frontend-only.
