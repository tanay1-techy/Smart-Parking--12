// ============================================================
// Authentication Module (Client-Side)
// Handles Login/Register modals and session management
// ============================================================

let currentUser = null;
let authModal = null;
let onAuthCallback = null;

/**
 * Initialize auth system - check for existing session
 */
export function initAuth(callback) {
  onAuthCallback = callback;
  const saved = localStorage.getItem('smartparking_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    if (onAuthCallback) onAuthCallback(currentUser);
    return currentUser;
  }
  showAuthModal();
  return null;
}

/**
 * Show the auth modal (login/register)
 */
export function showAuthModal(mode = 'login') {
  if (authModal) authModal.remove();

  authModal = document.createElement('div');
  authModal.className = 'auth-overlay';
  authModal.id = 'auth-overlay';

  authModal.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-logo">
          <span class="material-icons-outlined">local_parking</span>
        </div>
        <h1>Smart Parking</h1>
        <p class="auth-tagline">Intelligent Parking Management System</p>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-tab="login">Sign In</button>
        <button class="auth-tab ${mode === 'register' ? 'active' : ''}" data-tab="register">Create Account</button>
      </div>

      <!-- Login Form -->
      <form class="auth-form ${mode === 'login' ? 'active' : ''}" id="login-form">
        <div class="auth-field">
          <span class="material-icons-outlined">email</span>
          <input type="email" id="login-email" placeholder="Email address" required value="admin@smartparking.com">
        </div>
        <div class="auth-field">
          <span class="material-icons-outlined">lock</span>
          <input type="password" id="login-password" placeholder="Password" required value="admin123">
        </div>
        <div class="auth-options">
          <label class="auth-checkbox">
            <input type="checkbox" checked> Remember me
          </label>
          <a href="#" class="auth-forgot">Forgot password?</a>
        </div>
        <button type="submit" class="auth-submit-btn">
          <span class="material-icons-outlined">login</span>
          Sign In
        </button>
        <div class="auth-divider"><span>or sign in as</span></div>
        <div class="auth-quick-login">
          <button type="button" class="quick-login-btn admin-quick" data-role="admin">
            <span class="material-icons-outlined">admin_panel_settings</span>
            Admin Demo
          </button>
          <button type="button" class="quick-login-btn user-quick" data-role="user">
            <span class="material-icons-outlined">person</span>
            User Demo
          </button>
        </div>
      </form>

      <!-- Register Form -->
      <form class="auth-form ${mode === 'register' ? 'active' : ''}" id="register-form">
        <div class="auth-field">
          <span class="material-icons-outlined">person</span>
          <input type="text" id="reg-name" placeholder="Full Name" required>
        </div>
        <div class="auth-field">
          <span class="material-icons-outlined">email</span>
          <input type="email" id="reg-email" placeholder="Email address" required>
        </div>
        <div class="auth-field">
          <span class="material-icons-outlined">phone</span>
          <input type="tel" id="reg-phone" placeholder="Phone number" required>
        </div>
        <div class="auth-field">
          <span class="material-icons-outlined">lock</span>
          <input type="password" id="reg-password" placeholder="Password" required>
        </div>
        <div class="auth-field">
          <span class="material-icons-outlined">directions_car</span>
          <input type="text" id="reg-vehicle" placeholder="Vehicle Plate (e.g. KA01AB1234)">
        </div>
        <button type="submit" class="auth-submit-btn">
          <span class="material-icons-outlined">person_add</span>
          Create Account
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(authModal);

  // Event listeners
  authModal.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      authModal.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === target));
      document.getElementById('login-form').classList.toggle('active', target === 'login');
      document.getElementById('register-form').classList.toggle('active', target === 'register');
    });
  });

  // Quick login buttons
  authModal.querySelectorAll('.quick-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      loginAs(role === 'admin' ? {
        name: 'Admin',
        email: 'admin@smartparking.com',
        role: 'admin',
        phone: '+91 98765 43210',
        vehicles: [{ plateNumber: 'KA01AD0001', make: 'System', model: 'Admin' }]
      } : {
        name: 'Tanay Kumar',
        email: 'tanay@example.com',
        role: 'user',
        phone: '+91 98765 12345',
        vehicles: [{ plateNumber: 'KA01AB1234', make: 'Honda', model: 'City' }]
      });
    });
  });

  // Login form submit
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const role = email.includes('admin') ? 'admin' : 'user';
    loginAs({
      name: role === 'admin' ? 'Admin' : 'User',
      email,
      role,
      phone: '+91 98765 43210',
      vehicles: []
    });
  });

  // Register form submit
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loginAs({
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      role: 'user',
      phone: document.getElementById('reg-phone').value,
      vehicles: document.getElementById('reg-vehicle').value
        ? [{ plateNumber: document.getElementById('reg-vehicle').value.toUpperCase() }]
        : []
    });
  });

  // Entrance animation
  requestAnimationFrame(() => authModal.classList.add('visible'));
}

function loginAs(user) {
  currentUser = user;
  localStorage.setItem('smartparking_user', JSON.stringify(user));
  
  if (authModal) {
    authModal.classList.remove('visible');
    setTimeout(() => {
      authModal.remove();
      authModal = null;
    }, 400);
  }

  if (onAuthCallback) onAuthCallback(currentUser);
}

export function logout() {
  currentUser = null;
  localStorage.removeItem('smartparking_user');
  showAuthModal();
}

export function getCurrentUser() {
  return currentUser;
}

export function isAdmin() {
  return currentUser?.role === 'admin';
}
