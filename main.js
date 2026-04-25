// --- CONFIGURATION ---
const TOTAL_SLOTS = 250;
const RATES = {
  BASE_PER_HR: 25.00,
  ADVANCE_FEE_PER_HR: 10.00,
  FINE: 1000.00
};
const GRACE_PERIOD_HOURS = 0.5;

// --- STATE ---
let slots = [];
let chartInstances = {};
let reservations = [
  { plate: 'KA01AB1234', slot: 'B-12', arrival: '10:00 AM', departure: '12:00 PM', status: 'confirmed', date: '2 May 2025' },
  { plate: 'KA05CD5678', slot: 'A-08', arrival: '1:00 PM', departure: '3:00 PM', status: 'confirmed', date: '2 May 2025' },
  { plate: 'KA03EF9012', slot: 'C-15', arrival: '4:00 PM', departure: '6:00 PM', status: 'pending', date: '2 May 2025' },
  { plate: 'DL04GH3456', slot: 'D-02', arrival: '09:00 AM', departure: '11:00 AM', status: 'confirmed', date: '2 May 2025' },
  { plate: 'MH12IJ7890', slot: 'E-45', arrival: '11:30 AM', departure: '01:30 PM', status: 'confirmed', date: '2 May 2025' },
];

let transactions = [
  { id: 'TXN-9021', user: 'Tanay Singh', method: 'PhonePe', amount: '₹50.00', date: '2 May, 10:30 AM', status: 'success' },
  { id: 'TXN-9022', user: 'Rahul Verma', method: 'GPay', amount: '₹25.00', date: '2 May, 11:15 AM', status: 'success' },
  { id: 'TXN-9023', user: 'Priya Dhar', method: 'PhonePe', amount: '₹100.00', date: '2 May, 12:00 PM', status: 'success' },
];

// --- DOM ELEMENTS ---
let elements = {};

function initElements() {
  elements = {
    pageTitle: document.getElementById('page-title'),
    totalSlots: document.getElementById('total-slots'),
    availableSlots: document.getElementById('available-slots'),
    occupiedSlots: document.getElementById('occupied-slots'),
    prebookedSlots: document.getElementById('prebooked-slots'),
    parkingMap: document.getElementById('parking-map'),
    recentReservationsList: document.getElementById('recent-reservations-list'),
    sections: document.querySelectorAll('.content-section'),
    navItems: document.querySelectorAll('.nav-item'),
    fullParkingGrid: document.getElementById('parking-grid-full'),
    fullReservationsTable: document.getElementById('full-reservations-list'),
    transactionsTable: document.getElementById('transactions-list'),
    usersGrid: document.getElementById('users-list'),
    
    // Gate & Activity
    gateBarrier: document.getElementById('gate-barrier'),
    gateStatus: document.getElementById('gate-status-badge'),
    activityLog: document.getElementById('activity-log')
  };
}

// --- INITIALIZATION ---
function init() {
  initElements();
  generateSlots();
  updateDashboard();
  renderMap();
  renderRecentReservations();
  renderFullReservationsTable();
  renderTransactionsTable();
  renderUsers();
  initCharts();
  setupEventListeners();
  
  // Start Phase 6 Features
  startSimulation();
  addActivityLog('System initialized. All sensors online.', 'success');
  
  // Set default view
  navigateTo('dashboard');
}

// --- PHASE 6: IOT & GATE LOGIC ---

function toggleGate(status) {
  if (status === 'open') {
    elements.gateBarrier.classList.add('open');
    elements.gateStatus.textContent = 'Open';
    elements.gateStatus.className = 'status-badge confirmed';
    addActivityLog('Gate opened manually.', 'info');
  } else {
    elements.gateBarrier.classList.remove('open');
    elements.gateStatus.textContent = 'Closed';
    elements.gateStatus.className = 'status-badge pending'; // Using pending for yellow/closed
    addActivityLog('Gate closed.', 'info');
  }
}

function addActivityLog(message, type = 'info') {
  if (!elements.activityLog) return;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const item = document.createElement('div');
  item.className = `activity-item ${type}`;
  item.innerHTML = `
    <span class="time">${time}</span>
    <span class="msg">${message}</span>
  `;
  
  elements.activityLog.prepend(item);
  if (elements.activityLog.children.length > 10) elements.activityLog.lastElementChild.remove();
}

function startSimulation() {
  // Randomly toggle slot status every 8 seconds
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * slots.length);
    const slot = slots[randomIndex];
    
    // Toggle between available and occupied
    const oldStatus = slot.status;
    slot.status = oldStatus === 'available' ? 'occupied' : 'available';
    
    // Log activity
    const action = slot.status === 'occupied' ? 'Occupied' : 'Vacated';
    addActivityLog(`Slot ${slot.id} ${action} (Sensor ${randomIndex + 100})`, slot.status === 'occupied' ? 'alert' : 'success');
    
    // Update UI
    updateDashboard();
    renderMap();
    
    // Flash the slot on the map
    const mapSlots = document.querySelectorAll('.map-slot');
    if (mapSlots[randomIndex]) {
      mapSlots[randomIndex].classList.add('flash');
      setTimeout(() => mapSlots[randomIndex].classList.remove('flash'), 1000);
    }
  }, 8000);

  // Random Gate Event simulation
  setInterval(() => {
    if (Math.random() > 0.7) {
      addActivityLog('Vehicle detected at entry gate.', 'info');
      toggleGate('open');
      setTimeout(() => toggleGate('closed'), 5000);
    }
  }, 25000);
}

function generateSlots() {
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    const rand = Math.random();
    let status = 'available';
    if (rand < 0.39) status = 'occupied';
    else if (rand < 0.52) status = 'reserved';
    
    slots.push({
      id: `${String.fromCharCode(65 + Math.floor(i/50))}-${(i % 50).toString().padStart(2, '0')}`,
      status: status
    });
  }
}

// --- NAVIGATION LOGIC ---
function navigateTo(sectionId) {
  if (!elements.sections) return;
  
  // Hide all sections
  elements.sections.forEach(sec => sec.style.display = 'none');
  
  // Show target section
  const target = document.getElementById(`${sectionId}-section`);
  if (target) {
    target.style.display = 'block';
    elements.pageTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('-', ' ');
  }

  // Update nav active state
  elements.navItems.forEach(item => {
    const link = item.getAttribute('href')?.replace('#', '');
    if (link === sectionId) {
      elements.navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    }
  });

  // Section specific triggers
  if (sectionId === 'slots') renderFullParkingGrid();
  
  // Resize charts to fix canvas issues when showing hidden containers
  Object.values(chartInstances).forEach(chart => {
    if (chart && typeof chart.resize === 'function') chart.resize();
  });
}

function setupEventListeners() {
  elements.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.getAttribute('href').replace('#', '');
      navigateTo(sectionId);
    });
  });

  // Global functions for inline onclicks
  window.navigateTo = navigateTo;
  window.toggleGate = toggleGate;
}

// --- RENDERING ---

function updateDashboard() {
  const counts = slots.reduce((acc, slot) => {
    acc[slot.status]++;
    return acc;
  }, { available: 0, occupied: 0, reserved: 0 });

  if (elements.totalSlots) elements.totalSlots.textContent = TOTAL_SLOTS;
  if (elements.availableSlots) elements.availableSlots.textContent = counts.available;
  if (elements.occupiedSlots) elements.occupiedSlots.textContent = counts.occupied;
  if (elements.prebookedSlots) elements.prebookedSlots.textContent = counts.reserved;

  updateCharts(counts);
}

function renderMap() {
  if (!elements.parkingMap) return;
  elements.parkingMap.innerHTML = '';
  for (let s = 0; s < 3; s++) {
    const section = document.createElement('div');
    section.className = 'map-section';
    for (let i = 0; i < 8; i++) {
      const slotIndex = s * 8 + i;
      const slot = slots[slotIndex];
      const slotEl = document.createElement('div');
      slotEl.className = `map-slot ${slot.status}`;
      slotEl.title = `Slot ${slot.id}`;
      section.appendChild(slotEl);
    }
    elements.parkingMap.appendChild(section);
  }
}

function renderRecentReservations() {
  if (!elements.recentReservationsList) return;
  elements.recentReservationsList.innerHTML = '';
  reservations.slice(0, 3).forEach(res => {
    const item = document.createElement('div');
    item.className = 'reservation-item';
    item.innerHTML = `
      <div class="res-left">
        <div class="res-icon"><span class="material-icons-outlined">directions_car</span></div>
        <div class="res-info"><h4>${res.plate}</h4><p>Slot ${res.slot}</p></div>
      </div>
      <div class="res-time"><div class="date">${res.date}</div><div class="hours">${res.arrival} - ${res.departure}</div></div>
      <div class="status-badge ${res.status}">${res.status.charAt(0).toUpperCase() + res.status.slice(1)}</div>
    `;
    elements.recentReservationsList.appendChild(item);
  });
}

function renderFullParkingGrid() {
  if (!elements.fullParkingGrid) return;
  elements.fullParkingGrid.innerHTML = '';
  slots.forEach(slot => {
    const slotEl = document.createElement('div');
    slotEl.className = `parking-slot ${slot.status} pop`;
    slotEl.innerHTML = `<span>${slot.id}</span>`;
    elements.fullParkingGrid.appendChild(slotEl);
  });
}

function renderFullReservationsTable() {
  if (!elements.fullReservationsTable) return;
  elements.fullReservationsTable.innerHTML = '';
  reservations.forEach(res => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${res.plate}</td>
      <td>${res.slot}</td>
      <td>${res.arrival}</td>
      <td>${res.departure}</td>
      <td><span class="status-badge ${res.status}">${res.status}</span></td>
      <td><button class="filter-btn">Edit</button></td>
    `;
    elements.fullReservationsTable.appendChild(tr);
  });
}

function renderTransactionsTable() {
  if (!elements.transactionsTable) return;
  elements.transactionsTable.innerHTML = '';
  transactions.forEach(txn => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${txn.id}</td>
      <td>${txn.user}</td>
      <td>${txn.method}</td>
      <td>${txn.amount}</td>
      <td>${txn.date}</td>
      <td><span class="status-badge confirmed">Success</span></td>
    `;
    elements.transactionsTable.appendChild(tr);
  });
}

function renderUsers() {
  if (!elements.usersGrid) return;
  elements.usersGrid.innerHTML = '';
  const users = [
    { name: 'Tanay Singh', role: 'Super Admin', img: 'https://ui-avatars.com/api/?name=Tanay+Singh' },
    { name: 'Security One', role: 'Parking Attendant', img: 'https://ui-avatars.com/api/?name=S+1' },
    { name: 'Manager X', role: 'Branch Manager', img: 'https://ui-avatars.com/api/?name=M+X' },
  ];
  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
      <img src="${user.img}" style="width: 50px; border-radius: 50%; margin-bottom: 0.5rem;">
      <h4>${user.name}</h4>
      <p class="text-muted" style="font-size: 0.8rem;">${user.role}</p>
    `;
    elements.usersGrid.appendChild(card);
  });
}

// --- CHARTS ---
function initCharts() {
  const counts = slots.reduce((acc, slot) => {
    acc[slot.status]++;
    return acc;
  }, { available: 0, occupied: 0, reserved: 0 });

  // Dashboard Donut
  const ctxOverview = document.getElementById('overviewChart')?.getContext('2d');
  if (ctxOverview) {
    chartInstances.overview = new Chart(ctxOverview, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Occupied', 'Reserved'],
        datasets: [{
          data: [counts.available, counts.occupied, counts.reserved],
          backgroundColor: ['#05cd99', '#868cff', '#ffb547'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '85%', plugins: { legend: { display: false } } }
    });
    renderCustomLegend('overview-legend', chartInstances.overview);
  }

  // Dashboard Line
  const ctxEarnings = document.getElementById('earningsChart')?.getContext('2d');
  if (ctxEarnings) {
    chartInstances.earnings = new Chart(ctxEarnings, {
      type: 'line',
      data: {
        labels: ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'],
        datasets: [{
          label: 'Earnings',
          data: [2000, 3500, 3000, 6000, 5000, 9000, 12450],
          borderColor: '#4318ff',
          backgroundColor: 'rgba(67, 24, 255, 0.1)',
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: true }, y: { display: false } } }
    });
  }

  // Revenue Chart (Payment Section)
  const ctxRev = document.getElementById('revenueChart')?.getContext('2d');
  if (ctxRev) {
    chartInstances.revenue = new Chart(ctxRev, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [320000, 380000, 350000, 420000, 452000, 480000],
          backgroundColor: '#4318ff',
          borderRadius: 8
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  // Dashboard Mini Donut
  const ctxStatus = document.getElementById('statusChart')?.getContext('2d');
  if (ctxStatus) {
    chartInstances.status = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Occupied', 'Reserved'],
        datasets: [{ data: [counts.available, counts.occupied, counts.reserved], backgroundColor: ['#05cd99', '#868cff', '#ffb547'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { display: false } } }
    });
    renderMiniLegend('status-legend', counts);
  }
}

function renderCustomLegend(containerId, chart) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  chart.data.labels.forEach((label, i) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const color = chart.data.datasets[0].backgroundColor[i];
    item.innerHTML = `<div class="legend-dot" style="background: ${color}"></div><span>${label} (${chart.data.datasets[0].data[i]})</span>`;
    container.appendChild(item);
  });
}

function renderMiniLegend(containerId, counts) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const items = [
    { label: 'Available', count: counts.available, color: '#05cd99' },
    { label: 'Occupied', count: counts.occupied, color: '#868cff' },
    { label: 'Reserved', count: counts.reserved, color: '#ffb547' }
  ];
  items.forEach(item => {
    const pct = Math.round((item.count / TOTAL_SLOTS) * 100);
    const row = document.createElement('div');
    row.className = 'legend-item-mini';
    row.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;"><div class="legend-dot" style="background: ${item.color}; width: 8px; height: 8px;"></div><span>${item.label}</span></div><span>${item.count} (${pct}%)</span>`;
    container.appendChild(row);
  });
}

function updateCharts(counts) {
  if (chartInstances.overview) {
    chartInstances.overview.data.datasets[0].data = [counts.available, counts.occupied, counts.reserved];
    chartInstances.overview.update();
    renderCustomLegend('overview-legend', chartInstances.overview);
  }
  if (chartInstances.status) {
    chartInstances.status.data.datasets[0].data = [counts.available, counts.occupied, counts.reserved];
    chartInstances.status.update();
    renderMiniLegend('status-legend', counts);
  }
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
