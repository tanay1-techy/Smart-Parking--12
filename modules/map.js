// ============================================================
// Interactive SVG Parking Map Module
// Renders a visual parking lot layout with real-time updates
// ============================================================

const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const SLOTS_PER_SECTION = 50;
const COLS_PER_ROW = 10;

// Section colors for visual differentiation
const SECTION_COLORS = {
  A: { label: '#6366f1', bg: 'rgba(99,102,241,0.06)' },
  B: { label: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
  C: { label: '#0ea5e9', bg: 'rgba(14,165,233,0.06)' },
  D: { label: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
  E: { label: '#ec4899', bg: 'rgba(236,72,153,0.06)' },
};

const STATUS_COLORS = {
  available: { fill: '#10b981', glow: 'rgba(16,185,129,0.4)', icon: '🅿️' },
  occupied:  { fill: '#ef4444', glow: 'rgba(239,68,68,0.4)',  icon: '🚗' },
  reserved:  { fill: '#3b82f6', glow: 'rgba(59,130,246,0.4)', icon: '📋' },
};

let currentFilter = 'all';
let currentSection = 'all';
let tooltipEl = null;

/**
 * Render the full interactive parking map into the given container
 */
export function renderInteractiveMap(containerId, slots, onSlotClick) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  container.className = 'interactive-map-container';

  // Create filter bar
  const filterBar = createFilterBar(containerId, slots, onSlotClick);
  container.appendChild(filterBar);

  // Create sections wrapper
  const sectionsWrapper = document.createElement('div');
  sectionsWrapper.className = 'map-sections-wrapper';

  const filteredSections = currentSection === 'all' ? SECTIONS : [currentSection];

  filteredSections.forEach(section => {
    const sectionSlots = slots.filter(s => s.id.startsWith(section + '-'));
    const filteredSlots = filterSlots(sectionSlots);
    
    if (filteredSlots.length === 0 && currentFilter !== 'all') return;

    const sectionEl = createSection(section, sectionSlots, filteredSlots, onSlotClick);
    sectionsWrapper.appendChild(sectionEl);
  });

  container.appendChild(sectionsWrapper);

  // Create tooltip element
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'slot-tooltip';
    tooltipEl.style.display = 'none';
    document.body.appendChild(tooltipEl);
  }
}

function createFilterBar(containerId, slots, onSlotClick) {
  const bar = document.createElement('div');
  bar.className = 'map-filter-bar';

  // Status filters
  const statusFilters = document.createElement('div');
  statusFilters.className = 'map-status-filters';

  const filters = [
    { key: 'all', label: 'All Slots', icon: 'grid_view' },
    { key: 'available', label: 'Available', icon: 'check_circle' },
    { key: 'occupied', label: 'Occupied', icon: 'directions_car' },
    { key: 'reserved', label: 'Reserved', icon: 'bookmark' },
  ];

  filters.forEach(f => {
    const btn = document.createElement('button');
    btn.className = `map-filter-btn ${currentFilter === f.key ? 'active' : ''}`;
    btn.dataset.filter = f.key;
    btn.innerHTML = `<span class="material-icons-outlined">${f.icon}</span>${f.label}`;
    btn.addEventListener('click', () => {
      currentFilter = f.key;
      renderInteractiveMap(containerId, slots, onSlotClick);
    });
    statusFilters.appendChild(btn);
  });

  bar.appendChild(statusFilters);

  // Section selector
  const sectionSelect = document.createElement('div');
  sectionSelect.className = 'map-section-select';

  const select = document.createElement('select');
  select.className = 'section-dropdown';
  select.innerHTML = `<option value="all">All Sections</option>` +
    SECTIONS.map(s => `<option value="${s}" ${currentSection === s ? 'selected' : ''}>Section ${s}</option>`).join('');
  
  select.addEventListener('change', (e) => {
    currentSection = e.target.value;
    renderInteractiveMap(containerId, slots, onSlotClick);
  });

  sectionSelect.appendChild(select);
  bar.appendChild(sectionSelect);

  return bar;
}

function createSection(section, allSlots, displaySlots, onSlotClick) {
  const el = document.createElement('div');
  el.className = 'map-section';
  el.style.background = SECTION_COLORS[section].bg;

  // Section header
  const header = document.createElement('div');
  header.className = 'map-section-header';
  
  const available = allSlots.filter(s => s.status === 'available').length;
  const occupied = allSlots.filter(s => s.status === 'occupied').length;
  const reserved = allSlots.filter(s => s.status === 'reserved').length;

  header.innerHTML = `
    <div class="section-label" style="background: ${SECTION_COLORS[section].label}">
      <span class="material-icons-outlined">local_parking</span>
      Section ${section}
    </div>
    <div class="section-stats">
      <span class="section-stat available">${available} free</span>
      <span class="section-stat occupied">${occupied} used</span>
      <span class="section-stat reserved">${reserved} reserved</span>
    </div>
  `;
  el.appendChild(header);

  // Parking grid - two rows facing each other (like a real parking lot aisle)
  const grid = document.createElement('div');
  grid.className = 'map-parking-aisle';

  // Split slots into two facing rows
  const topRow = allSlots.slice(0, 25);
  const bottomRow = allSlots.slice(25, 50);

  const topRowEl = createParkingRow(topRow, 'top', onSlotClick);
  const aisleEl = document.createElement('div');
  aisleEl.className = 'map-aisle-road';
  aisleEl.innerHTML = `
    <div class="road-line"></div>
    <div class="road-arrow">
      <span class="material-icons-outlined">arrow_forward</span>
      <span class="material-icons-outlined">arrow_forward</span>
      <span class="material-icons-outlined">arrow_forward</span>
    </div>
    <div class="road-line"></div>
  `;
  const bottomRowEl = createParkingRow(bottomRow, 'bottom', onSlotClick);

  grid.appendChild(topRowEl);
  grid.appendChild(aisleEl);
  grid.appendChild(bottomRowEl);

  el.appendChild(grid);
  return el;
}

function createParkingRow(slots, position, onSlotClick) {
  const row = document.createElement('div');
  row.className = `map-parking-row ${position}`;

  slots.forEach(slot => {
    const isFiltered = currentFilter !== 'all' && slot.status !== currentFilter;
    const slotEl = document.createElement('div');
    slotEl.className = `map-slot-cell ${slot.status} ${isFiltered ? 'dimmed' : ''}`;
    slotEl.dataset.slotId = slot.id;

    const statusInfo = STATUS_COLORS[slot.status];

    slotEl.innerHTML = `
      <div class="slot-indicator" style="background: ${statusInfo.fill}; box-shadow: 0 0 12px ${statusInfo.glow}"></div>
      <span class="slot-label">${slot.id.split('-')[1]}</span>
      ${slot.status === 'occupied' ? '<div class="car-icon-mini">🚗</div>' : ''}
      ${slot.status === 'reserved' ? '<div class="car-icon-mini">📋</div>' : ''}
    `;

    // Tooltip on hover
    slotEl.addEventListener('mouseenter', (e) => showTooltip(e, slot));
    slotEl.addEventListener('mouseleave', hideTooltip);
    
    // Click handler
    slotEl.addEventListener('click', () => {
      if (onSlotClick) onSlotClick(slot);
    });

    row.appendChild(slotEl);
  });

  return row;
}

function filterSlots(slots) {
  if (currentFilter === 'all') return slots;
  return slots.filter(s => s.status === currentFilter);
}

function showTooltip(e, slot) {
  if (!tooltipEl) return;
  
  const statusLabels = {
    available: '✅ Available',
    occupied: '🚗 Occupied',
    reserved: '📋 Reserved'
  };

  tooltipEl.innerHTML = `
    <div class="tooltip-header">Slot ${slot.id}</div>
    <div class="tooltip-status ${slot.status}">${statusLabels[slot.status]}</div>
    ${slot.vehicleNumber ? `<div class="tooltip-vehicle">🔢 ${slot.vehicleNumber}</div>` : ''}
    ${slot.status === 'available' ? '<div class="tooltip-action">Click to book</div>' : ''}
  `;

  const rect = e.target.getBoundingClientRect();
  tooltipEl.style.display = 'block';
  tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
  tooltipEl.style.top = `${rect.top - 10}px`;
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = 'none';
}

/**
 * Reset filters
 */
export function resetMapFilters() {
  currentFilter = 'all';
  currentSection = 'all';
}
