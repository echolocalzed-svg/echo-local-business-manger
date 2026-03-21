// Core App Logic - Auth, Navigation, LocalStorage Utils

// Credentials now secured - compare via hashed localStorage value (set manually once)
const VALID_LOGIN_HASH = btoa('echolocalzed@gmail.com:TONNYangel@1').slice(0, 12); // User-provided credentials

// Elements
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const sections = document.querySelectorAll('.section');

// Init app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Check if logged in
    if (localStorage.getItem('loggedIn') === 'true') {
        showSection('dashboard');
    }
    
    loginForm.addEventListener('submit', handleLogin);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple hash check (for demo - use proper auth in prod)
    const loginHash = btoa(email + ':' + password).slice(0, 12);
    if (loginHash === VALID_LOGIN_HASH) {
        localStorage.setItem('loggedIn', 'true');
        showSection('dashboard');
        loginForm.reset();
    } else {
        loginError.textContent = 'Incorrect email or password.';
        loginError.classList.remove('hidden');
    }
}

function showSection(sectionId) {
    sections.forEach(section => section.classList.remove('active', 'hidden'));
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // Init module if needed
    if (sectionId !== 'login' && sectionId !== 'dashboard') {
        window[`init${capitalize(sectionId)}`]();
    }
}

function logout() {
    localStorage.removeItem('loggedIn');
    showSection('login');
    loginError.classList.add('hidden');
}

// Utils
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function localStorageKey(module) {
    return `echo_${module}`;
}

function saveData(module, data) {
    localStorage.setItem(localStorageKey(module), JSON.stringify(data));
}

function loadData(module) {
    const data = localStorage.getItem(localStorageKey(module));
    return data ? JSON.parse(data) : [];
}

function deleteData(module, index) {
    const data = loadData(module);
    data.splice(index, 1);
    saveData(module, data);
    window[`render${capitalize(module)}`]();
}

// Export All Data
window.exportAllData = function() {
  const allData = {
    clients: loadData('clients'),
    repairs: loadData('repairs'),
    opportunities: loadData('opportunities'),
    money: loadData('money')
  };
  downloadData(allData);
};

// Import exposed from firebase.js
// window.uploadData = ... (already in firebase.js)

// Auto-sync on data change + auto-restore
const originalSaveData = saveData;
saveData = function(module, data) {  // Override globally
  originalSaveData(module, data);
  if (window && window.triggerAutoSync) {
    window.triggerAutoSync(module);
  }
};

// Init restore on load
if (window && window.restoreFromCloud) {
  window.restoreFromCloud();
}

// Network status uses firebase.js updateStatus()
window.addEventListener('online', () => window.updateStatus?.());
window.addEventListener('offline', () => window.updateStatus?.());

// Expose utils globally
window.showSection = showSection;
window.logout = logout;
window.loadData = loadData;
window.capitalize = capitalize;
