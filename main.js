import { io } from "socket.io-client";

// --- CONFIGURATION ---
const SOCKET_URL = "http://localhost:3001";
let socket;

// --- STATE ---
let slots = [];
let bookings = [];
let logs = [];
let revenueData = { labels: [], data: [] };
let config = {};
let chartInstances = {};
let currentSection = 'dashboard';
let currentMapFilter = 'all';

// --- ELEMENTS ---
const elements = {
    navMenu: document.getElementById('nav-menu'),
    sections: document.querySelectorAll('.section-content'),
    topbarTitle: document.getElementById('topbar-title'),
    
    // Stats
    statTotal: document.getElementById('stat-total'),
    statAvailable: document.getElementById('stat-available'),
    statOccupied: document.getElementById('stat-occupied'),
    statReserved: document.getElementById('stat-reserved'),
    
    // Map Stats
    mapOccupancyRate: document.getElementById('map-occupancy-rate'),
    mapStatAvailable: document.getElementById('map-stat-available'),
    mapStatOccupied: document.getElementById('map-stat-occupied'),
    mapStatReserved: document.getElementById('map-stat-reserved'),
    
    // Map
    parkingGridContainer: document.getElementById('parking-grid-container'),
    sectionFilters: document.querySelectorAll('.section-btn'),
    currentSectionLabel: document.getElementById('current-section-label'),
    
    // Gate/Sim
    gateBarrier: document.getElementById('gate-barrier'),
    plateDisplay: document.getElementById('plate-display'),
    scannerLine: document.getElementById('scanner-line'),
    simPlateInput: document.getElementById('sim-plate-input'),
    
    // Booking
    bookingSlot: document.getElementById('booking-slot'),
    bookingArrival: document.getElementById('booking-arrival'),
    bookingDuration: document.getElementById('booking-duration'),
    bookingPlate: document.getElementById('booking-plate'),
    priceBaseRate: document.getElementById('price-base-rate'),
    priceCalcBase: document.getElementById('price-calc-base'),
    priceCalcAdvance: document.getElementById('price-calc-advance'),
    priceCalcTotal: document.getElementById('price-calc-total'),
    
    // Log
    activityLogBody: document.getElementById('activity-log-body'),
    
    // Header & Mobile
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    sidebar: document.getElementById('sidebar'),
    copilotInput: document.getElementById('admin-copilot-input'),
    copilotSubmit: document.getElementById('admin-copilot-submit'),
    copilotResults: document.getElementById('copilot-results'),
    copilotOutput: document.getElementById('copilot-output'),
    
    // Top Right Actions
    topActions: document.querySelectorAll('header .flex.items-center.gap-4 button, header .flex.items-center.gap-3 img'),
    
    // Footer Links
    footerLinks: document.querySelectorAll('nav > ul.pt-4 a'),

    // Payment Methods
    paymentOptions: document.querySelectorAll('.payment-option')
};

// --- INIT ---
function init() {
    setupNavigation();
    setupMapFilters();
    setupExtraButtons();
    initCharts();
    connectSocket();
    
    // Expose functions to window for onclick handlers
    window.socket = socket;
    window.simulateEntry = simulateEntry;
    window.simulateExit = simulateExit;
    window.submitBooking = submitBooking;
    window.updatePriceEstimate = updatePriceEstimate;
    window.drawNavigationPath = drawNavigationPath;
    
    // Set default time for booking
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15); // Default to 15 mins from now
    elements.bookingArrival.value = now.toTimeString().slice(0, 5);
}

// --- SOCKET CONNECTION ---
function connectSocket() {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        showToast('Connected to Central Command', 'success');
    });

    socket.on('init-state', (data) => {
        slots = data.slots;
        bookings = data.bookings;
        revenueData = data.revenue;
        config = data.config;
        updateUI();
    });

    socket.on('state-update', (data) => {
        slots = data.slots;
        bookings = data.bookings;
        if (data.config) config = data.config;
        updateUI();
    });

    socket.on('log-update', (log) => {
        addActivityLog(log.message, log.type);
        showToast(log.message, log.type);
    });

    socket.on('gate-control', (status) => {
        toggleGate(status);
    });

    socket.on('payment-summary', (data) => {
        showToast(`Vehicle ${data.vehicleNumber} exit complete. Amount: ₹${data.amount}`, 'success');
    });
}

// --- UI UPDATES ---
function updateUI() {
    updateStats();
    updateMap();
    updateBookingOptions();
    updateCharts();
}

function updateStats() {
    const counts = { available: 0, occupied: 0, reserved: 0 };
    slots.forEach(s => counts[s.status]++);
    
    elements.statTotal.textContent = slots.length;
    elements.statAvailable.textContent = counts.available;
    elements.statOccupied.textContent = counts.occupied;
    elements.statReserved.textContent = counts.reserved;
    
    elements.mapStatAvailable.textContent = counts.available;
    elements.mapStatOccupied.textContent = counts.occupied;
    elements.mapStatReserved.textContent = counts.reserved;
    
    const occupancyRate = slots.length ? Math.round(((counts.occupied + counts.reserved) / slots.length) * 100) : 0;
    elements.mapOccupancyRate.textContent = `${occupancyRate}%`;
}

function updateMap() {
    if (!elements.parkingGridContainer) return;
    
    elements.parkingGridContainer.innerHTML = '';
    
    const filteredSlots = currentMapFilter === 'all' 
        ? slots 
        : slots.filter(s => s.id.startsWith(currentMapFilter));
        
    filteredSlots.forEach(slot => {
        const slotEl = document.createElement('div');
        
        // Base styling for the slot box
        let classes = 'parking-slot-box shadow-sm border-2 ';
        let content = `<span class="slot-id">${slot.id}</span>`;
        
        if (slot.status === 'available') {
            classes += 'slot-available border-outline-variant';
        } else if (slot.status === 'occupied') {
            classes += 'slot-occupied border-red-500';
            content += `<span class="material-symbols-outlined mt-1 text-white text-sm">directions_car</span>`;
        } else if (slot.status === 'reserved') {
            classes += 'slot-reserved border-blue-500 bg-blue-500';
            content += `<span class="material-symbols-outlined mt-1 text-white text-sm">bookmark</span>`;
        }
        
        slotEl.className = classes;
        slotEl.innerHTML = content;
        
        // Click to book if available
        if (slot.status === 'available') {
            slotEl.addEventListener('click', () => {
                elements.bookingSlot.value = slot.id;
                
                // Draw path then navigate
                drawNavigationPath(slot.id);
                showToast(`Navigating to Slot ${slot.id}...`, 'info');
                
                setTimeout(() => {
                    navigateTo('booking');
                    updatePriceEstimate();
                }, 1500); // give time to see the cool animation
            });
        }
        
        elements.parkingGridContainer.appendChild(slotEl);
    });
}

function updateBookingOptions() {
    const currentVal = elements.bookingSlot.value;
    const availableSlots = slots.filter(s => s.status === 'available');
    
    elements.bookingSlot.innerHTML = '<option value="">Select a slot...</option>' + 
        availableSlots.map(s => `<option value="${s.id}">Slot ${s.id}</option>`).join('');
        
    // Keep selection if still available
    if (availableSlots.some(s => s.id === currentVal)) {
        elements.bookingSlot.value = currentVal;
    }
}

// --- LOGIC FUNCTIONS ---
function drawNavigationPath(slotId) {
    const svg = document.getElementById('navigation-svg');
    const scrollArea = document.getElementById('map-scroll-area');
    const slotElements = document.querySelectorAll('.parking-slot-box');
    
    let targetSlot = null;
    slotElements.forEach(el => {
        if(el.querySelector('.slot-id').textContent === slotId) targetSlot = el;
    });

    // Remove existing paths
    const existingPaths = svg.querySelectorAll('.nav-route');
    existingPaths.forEach(p => p.remove());

    if (!targetSlot) return;

    const areaRect = scrollArea.getBoundingClientRect();
    const slotRect = targetSlot.getBoundingClientRect();

    // Relative to the SVG viewbox / scroll area
    const startX = 70; // Gate A center X
    const startY = 50; // Gate A bottom Y
    
    const endX = (slotRect.left - areaRect.left) + (slotRect.width / 2) + scrollArea.scrollLeft;
    const endY = (slotRect.top - areaRect.top) + scrollArea.scrollTop;

    const midY = startY + (endY - startY) / 2;
    const pathData = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'url(#path-gradient)');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('filter', 'url(#glow)');
    path.setAttribute('class', 'nav-route');
    
    // Animation properties
    const pathLength = 1500; // rough estimation, getBBox might not be available immediately
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';

    svg.appendChild(path);

    // Trigger animation
    setTimeout(() => {
        path.style.strokeDashoffset = '0';
    }, 50);
}

function toggleGate(status) {
    if (status === 'open') {
        elements.gateBarrier.classList.add('open');
    } else {
        elements.gateBarrier.classList.remove('open');
    }
}

function generateRandomPlate() {
    const states = ['MH', 'DL', 'KA', 'TS', 'TN', 'GJ', 'UP', 'HR'];
    const state = states[Math.floor(Math.random() * states.length)];
    const rto = String(Math.floor(Math.random() * 90) + 10);
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = String(Math.floor(Math.random() * 9000) + 1000);
    return `${state}${rto}${letters}${numbers}`;
}

function simulateEntry() {
    let plate = elements.simPlateInput.value.trim().toUpperCase();
    if (!plate) {
        plate = generateRandomPlate();
        elements.simPlateInput.value = plate;
        showToast('AI automatically detected incoming vehicle plate.', 'info');
    }
    
    elements.plateDisplay.textContent = plate;
    elements.plateDisplay.classList.add('plate-scanning');
    elements.scannerLine.classList.remove('hidden');
    
    setTimeout(() => {
        elements.plateDisplay.classList.remove('plate-scanning');
        elements.scannerLine.classList.add('hidden');
        socket.emit('anpr-entry', plate);
        elements.simPlateInput.value = '';
        setTimeout(() => { elements.plateDisplay.textContent = 'READY'; }, 1000);
    }, 1500);
}

function simulateExit() {
    let plate = elements.simPlateInput.value.trim().toUpperCase();
    if (!plate) {
        // Find a currently parked vehicle
        const parkedVehicles = slots.filter(s => s.status === 'occupied' && s.vehicleNumber).map(s => s.vehicleNumber);
        if (parkedVehicles.length > 0) {
            plate = parkedVehicles[Math.floor(Math.random() * parkedVehicles.length)];
            elements.simPlateInput.value = plate;
            showToast('AI automatically detected outgoing vehicle plate.', 'info');
        } else {
            showToast('No vehicles currently parked to simulate exit', 'error');
            return;
        }
    }
    
    elements.plateDisplay.textContent = plate;
    elements.plateDisplay.classList.add('plate-scanning');
    elements.scannerLine.classList.remove('hidden');
    
    setTimeout(() => {
        elements.plateDisplay.classList.remove('plate-scanning');
        elements.scannerLine.classList.add('hidden');
        socket.emit('anpr-exit', plate);
        elements.simPlateInput.value = '';
        setTimeout(() => { elements.plateDisplay.textContent = 'READY'; }, 1000);
    }, 1500);
}

function submitBooking() {
    const plate = elements.bookingPlate.value.trim().toUpperCase();
    const slotId = elements.bookingSlot.value;
    const arrivalTimeStr = elements.bookingArrival.value;
    const duration = parseFloat(elements.bookingDuration.value);
    
    const selectedPaymentInput = document.querySelector('input[name="payment_method"]:checked');
    const paymentMethod = selectedPaymentInput ? selectedPaymentInput.value : 'upi';
    
    if (!plate || !slotId || !arrivalTimeStr || !duration) {
        showToast('Please fill all booking details', 'error');
        return;
    }
    
    const [hours, minutes] = arrivalTimeStr.split(':');
    const arrivalTime = new Date();
    arrivalTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    socket.emit('create-booking', {
        vehicleNumber: plate,
        slotId: slotId,
        startTime: arrivalTime.toISOString(),
        duration: duration,
        paymentMethod: paymentMethod
    });
    
    elements.bookingPlate.value = '';
    
    let paymentText = 'UPI';
    if(paymentMethod === 'card') paymentText = 'Card';
    if(paymentMethod === 'netbanking') paymentText = 'Net Banking';
    
    showToast(`Payment via ${paymentText} successful. Slot reserved!`, 'success');
    navigateTo('dashboard');
}

function updatePriceEstimate() {
    const duration = parseFloat(elements.bookingDuration.value || 0);
    const arrivalTimeStr = elements.bookingArrival.value;
    
    if (!duration || !arrivalTimeStr || !config.BASE_RATE) return;
    
    const [hours, minutes] = arrivalTimeStr.split(':');
    const arrival = new Date();
    arrival.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const isAdvance = (arrival - new Date()) > (60 * 60 * 1000); // More than 1 hr
    
    const baseAmount = duration * config.BASE_RATE;
    const advanceAmount = isAdvance ? config.ADVANCE_BOOKING_FEE : 0;
    
    let modifierText = '';
    if (config.MULTIPLIER && config.MULTIPLIER > 1.0) modifierText = ` (Surge x${config.MULTIPLIER.toFixed(1)})`;
    if (config.MULTIPLIER && config.MULTIPLIER < 1.0) modifierText = ` (Discount x${config.MULTIPLIER.toFixed(1)})`;
    
    elements.priceBaseRate.textContent = `₹${config.BASE_RATE}${modifierText}`;
    elements.priceCalcBase.textContent = `₹${baseAmount.toFixed(2)}`;
    elements.priceCalcAdvance.textContent = `₹${advanceAmount.toFixed(2)}`;
    elements.priceCalcTotal.textContent = `₹${(baseAmount + advanceAmount).toFixed(2)}`;
}

function addActivityLog(message, type) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-surface-container-low transition-colors';
    
    let icon = 'info';
    let iconColor = 'text-blue-500';
    let bgColor = 'bg-blue-100';
    
    if (type === 'success') { icon = 'check_circle'; iconColor = 'text-green-600'; bgColor = 'bg-green-100'; }
    else if (type === 'alert' || type === 'error') { icon = 'warning'; iconColor = 'text-red-600'; bgColor = 'bg-red-100'; }
    else if (type === 'booking') { icon = 'bookmark'; iconColor = 'text-purple-600'; bgColor = 'bg-purple-100'; }
    
    tr.innerHTML = `
        <td class="py-4 px-card-padding flex items-center gap-3">
            <div class="w-8 h-8 rounded-full ${bgColor} ${iconColor} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">${icon}</span>
            </div>
            <span class="font-medium">${message}</span>
        </td>
        <td class="py-4 px-card-padding">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${bgColor} ${iconColor} uppercase tracking-wider">
                ${type}
            </span>
        </td>
        <td class="py-4 px-card-padding text-on-surface-variant">${timeStr}</td>
    `;
    
    elements.activityLogBody.prepend(tr);
    if (elements.activityLogBody.children.length > 10) {
        elements.activityLogBody.lastElementChild.remove();
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-enter border-l-4`;
    
    let icon = 'info';
    let color = '#3b82f6';
    
    if (type === 'success') { icon = 'check_circle'; color = '#10b981'; toast.style.borderLeftColor = color; }
    else if (type === 'error' || type === 'alert') { icon = 'error'; color = '#ef4444'; toast.style.borderLeftColor = color; }
    else { toast.style.borderLeftColor = color; }
    
    toast.innerHTML = `
        <span class="material-symbols-outlined" style="color: ${color}">${icon}</span>
        <div class="flex-1">
            <p class="font-bold text-sm text-slate-800">${message}</p>
        </div>
        <button class="text-slate-400 hover:text-slate-600" onclick="this.parentElement.remove()">
            <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
    `;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-visible');
    });
    
    setTimeout(() => {
        toast.classList.replace('toast-visible', 'toast-exit');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// --- NAVIGATION & FILTERS ---
function setupExtraButtons() {
    // Mobile Menu Toggle
    if (elements.mobileMenuBtn && elements.sidebar) {
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.sidebar.classList.toggle('-translate-x-full');
        });
    }

    // Auth Modal Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Logging in...';
            
            // In a real scenario, this would call fetch('/api/auth/login')
            // Using a simulated delay for the UI demo
            setTimeout(() => {
                const modal = document.getElementById('auth-modal');
                modal.classList.add('opacity-0');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
                showToast('Successfully logged in as Admin', 'success');
                btn.innerHTML = 'Login to Dashboard <span class="material-symbols-outlined text-sm">arrow_forward</span>';
            }, 800);
        });
    }

    // Admin AI Copilot Search
    const processCopilotQuery = () => {
        const query = elements.copilotInput.value.trim().toLowerCase();
        if (!query) {
            elements.copilotResults.classList.add('hidden');
            return;
        }

        elements.copilotResults.classList.remove('hidden');
        elements.copilotOutput.innerHTML = `<div class="flex gap-2 items-center text-slate-500"><div class="w-4 h-4 border-2 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div> Analyzing...</div>`;

        setTimeout(() => {
            let response = '';
            
            // Occupancy Query
            if (query.includes('occupancy') || query.includes('how many')) {
                const zoneMatch = query.match(/(zone|section)\s*([a-e])/i);
                if (zoneMatch) {
                    const zone = zoneMatch[2].toUpperCase();
                    const zoneSlots = slots.filter(s => s.id.startsWith(zone));
                    const occupied = zoneSlots.filter(s => s.status !== 'available').length;
                    const percent = Math.round((occupied / zoneSlots.length) * 100);
                    response = `<strong>Zone ${zone}</strong> is currently at <strong>${percent}% occupancy</strong> (${occupied}/${zoneSlots.length} slots).`;
                } else {
                    const occupied = slots.filter(s => s.status !== 'available').length;
                    const percent = Math.round((occupied / slots.length) * 100);
                    response = `Overall facility occupancy is <strong>${percent}%</strong> (${occupied}/${slots.length} slots).`;
                }
            }
            // Revenue Query
            else if (query.includes('revenue') || query.includes('money') || query.includes('earnings')) {
                const todayRevenue = revenueData.data[new Date().getDay()] || 0;
                response = `Today's total estimated revenue is <strong>₹${todayRevenue}</strong>.`;
            }
            // Incident / Alerts Query
            else if (query.includes('alert') || query.includes('incident') || query.includes('overstay')) {
                response = `<strong>1 Alert Found:</strong> Vehicle MH12AB1234 in Slot A-05 has overstayed its grace period by 12 minutes. <a href="#" class="text-red-500 underline ml-2">Issue Fine</a>`;
            }
            // Maintenance Query
            else if (query.includes('sensor') || query.includes('health') || query.includes('maintenance')) {
                response = `All gates operational. <strong>2 sensors</strong> in Section C are currently unresponsive. Maintenance team has been notified.`;
            }
            else {
                response = `I couldn't understand that query. Try asking about "occupancy for Zone B", "today's revenue", or "recent alerts".`;
            }
            
            elements.copilotOutput.innerHTML = response;
        }, 800); // simulate network delay
    };

    if (elements.copilotInput) {
        elements.copilotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processCopilotQuery();
        });
        
        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!elements.copilotInput.contains(e.target) && !elements.copilotResults.contains(e.target) && !elements.copilotSubmit.contains(e.target)) {
                elements.copilotResults.classList.add('hidden');
            }
        });
    }

    if (elements.copilotSubmit) {
        elements.copilotSubmit.addEventListener('click', processCopilotQuery);
    }

    // Top Right Actions (Notifications, Settings, Help, Profile)
    if (elements.topActions) {
        elements.topActions.forEach(btn => {
            btn.addEventListener('click', () => {
                showToast('Feature coming soon in Phase 2!', 'info');
            });
        });
    }

    // Sidebar Footer Links (Support, Logout)
    if (elements.footerLinks) {
        elements.footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.textContent.includes('Logout')) {
                    showToast('Logging out... Demo Session Ended.', 'alert');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast('Support portal will open in a new tab.', 'info');
                }
            });
        });
    }

    // Payment Option Selection Logic
    if (elements.paymentOptions) {
        elements.paymentOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            radio.addEventListener('change', () => {
                // Reset all
                elements.paymentOptions.forEach(opt => {
                    opt.classList.remove('border-[#4318FF]', 'bg-[#4318FF]/5');
                    opt.classList.add('border-outline-variant/30', 'hover:bg-surface-bright');
                    const icon = opt.querySelector('.option-icon');
                    if(icon) {
                        icon.classList.remove('text-[#4318FF]');
                        icon.classList.add('text-slate-500');
                    }
                });
                
                // Set active
                if (radio.checked) {
                    option.classList.remove('border-outline-variant/30', 'hover:bg-surface-bright');
                    option.classList.add('border-[#4318FF]', 'bg-[#4318FF]/5');
                    const activeIcon = option.querySelector('.option-icon');
                    if(activeIcon) {
                        activeIcon.classList.remove('text-slate-500');
                        activeIcon.classList.add('text-[#4318FF]');
                    }
                }
            });
        });
    }
}

function setupNavigation() {
    const links = elements.navMenu.querySelectorAll('a[data-section]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.section);
        });
    });
}

function navigateTo(sectionId) {
    currentSection = sectionId;
    
    // Update Nav UI
    elements.navMenu.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    const activeLink = elements.navMenu.querySelector(`a[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    // Update Title
    const titles = { dashboard: 'Overview', map: 'Live Parking Map', booking: 'Reservations' };
    elements.topbarTitle.textContent = titles[sectionId] || 'Dashboard';
    
    // Show/Hide Sections
    elements.sections.forEach(sec => {
        if (sec.id === `${sectionId}-section`) {
            sec.classList.remove('hidden');
        } else {
            sec.classList.add('hidden');
        }
    });
}

function setupMapFilters() {
    elements.sectionFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.sectionFilters.forEach(b => {
                b.classList.remove('bg-secondary-container', 'text-white');
                b.classList.add('bg-surface-bright', 'text-on-surface-variant');
            });
            btn.classList.add('bg-secondary-container', 'text-white');
            btn.classList.remove('bg-surface-bright', 'text-on-surface-variant');
            
            currentMapFilter = btn.dataset.section;
            elements.currentSectionLabel.textContent = currentMapFilter === 'all' 
                ? 'All Sections Layout' 
                : `Section ${currentMapFilter} Layout`;
                
            updateMap();
        });
    });
}

// --- CHARTS ---
function initCharts() {
    const ctxOverview = document.getElementById('parkingOverviewChart');
    if (ctxOverview) {
        chartInstances.overview = new Chart(ctxOverview.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Available', 'Occupied', 'Reserved'],
                datasets: [{
                    data: [1, 1, 1], // Initial dummy data
                    backgroundColor: ['#22c55e', '#ef4444', '#3b82f6'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                }
            }
        });
    }

    const ctxLine = document.getElementById('earningsChart');
    if (ctxLine) {
        const lineCtx = ctxLine.getContext('2d');
        const gradientFill = lineCtx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(67, 24, 255, 0.2)');
        gradientFill.addColorStop(1, 'rgba(67, 24, 255, 0.0)');

        chartInstances.revenue = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [],
                    borderColor: '#4317ff',
                    backgroundColor: gradientFill,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4317ff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

function updateCharts() {
    if (chartInstances.overview) {
        const counts = { available: 0, occupied: 0, reserved: 0 };
        slots.forEach(s => counts[s.status]++);
        chartInstances.overview.data.datasets[0].data = [counts.available, counts.occupied, counts.reserved];
        chartInstances.overview.update();
    }
    
    if (chartInstances.revenue && revenueData) {
        chartInstances.revenue.data.labels = revenueData.labels;
        chartInstances.revenue.data.datasets[0].data = revenueData.data;
        chartInstances.revenue.update();
    }
}

document.addEventListener('DOMContentLoaded', init);
