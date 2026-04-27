// ============================================================
// Toast Notification & Notification Dropdown Module
// ============================================================

let notifications = [];
let toastContainer = null;

const NOTIFICATION_ICONS = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  alert: 'error',
  booking: 'confirmation_number',
  fine: 'gavel',
  entry: 'login',
  exit: 'logout',
};

const NOTIFICATION_COLORS = {
  success: '#10b981',
  info: '#3b82f6',
  warning: '#f59e0b',
  alert: '#ef4444',
  booking: '#6366f1',
  fine: '#ef4444',
  entry: '#10b981',
  exit: '#0ea5e9',
};

/**
 * Initialize the toast notification container
 */
export function initNotifications() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

/**
 * Show a toast notification
 */
export function showToast(message, type = 'info', duration = 4000) {
  if (!toastContainer) initNotifications();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-enter`;
  
  const icon = NOTIFICATION_ICONS[type] || 'info';
  const color = NOTIFICATION_COLORS[type] || '#3b82f6';

  toast.innerHTML = `
    <div class="toast-icon" style="color: ${color}">
      <span class="material-icons-outlined">${icon}</span>
    </div>
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      <span class="toast-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.classList.add('toast-exit')">
      <span class="material-icons-outlined">close</span>
    </button>
    <div class="toast-progress" style="background: ${color}"></div>
  `;

  toastContainer.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-visible');
  });

  // Auto-remove
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 400);
  }, duration);

  // Add to notifications list
  addNotification(message, type);
}

/**
 * Add to persistent notification list
 */
function addNotification(message, type) {
  notifications.unshift({
    id: Date.now(),
    message,
    type,
    time: new Date(),
    read: false,
  });
  if (notifications.length > 30) notifications.pop();
  updateNotificationBadge();
}

/**
 * Update the bell icon badge count
 */
function updateNotificationBadge() {
  const unread = notifications.filter(n => !n.read).length;
  const dot = document.querySelector('.notification-dot');
  const wrapper = document.querySelector('.notification-wrapper');
  
  if (dot) {
    dot.style.display = unread > 0 ? 'block' : 'none';
    dot.textContent = unread > 9 ? '9+' : unread;
  }

  // Update or create dropdown
  updateNotificationDropdown();
}

/**
 * Build / update the notification dropdown panel
 */
function updateNotificationDropdown() {
  let dropdown = document.getElementById('notification-dropdown');
  
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'notification-dropdown';
    dropdown.className = 'notification-dropdown';
    
    const wrapper = document.querySelector('.notification-wrapper');
    if (wrapper) {
      wrapper.style.position = 'relative';
      wrapper.appendChild(dropdown);
      
      // Toggle on click
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
          markAllRead();
        }
      });

      // Close on outside click
      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    }
  }

  const unread = notifications.filter(n => !n.read).length;

  dropdown.innerHTML = `
    <div class="notif-dropdown-header">
      <h3>Notifications</h3>
      <span class="notif-count">${unread} new</span>
    </div>
    <div class="notif-dropdown-list">
      ${notifications.length === 0 ? '<div class="notif-empty">No notifications yet</div>' : ''}
      ${notifications.slice(0, 10).map(n => `
        <div class="notif-item ${n.read ? 'read' : 'unread'}">
          <span class="material-icons-outlined notif-icon" style="color: ${NOTIFICATION_COLORS[n.type] || '#3b82f6'}">
            ${NOTIFICATION_ICONS[n.type] || 'info'}
          </span>
          <div class="notif-body">
            <p>${n.message}</p>
            <span class="notif-time">${timeAgo(n.time)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function markAllRead() {
  notifications.forEach(n => n.read = true);
  updateNotificationBadge();
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getNotifications() {
  return notifications;
}
