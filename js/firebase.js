// js/firebase.js - Firebase Realtime Database for Real-time Sync (Offline-First)

// Firebase Config (echolocal-buss project)
const firebaseConfig = {
  apiKey: \"AIzaSyCRm5caQVFdx0O1-wSq8jqypptCA5Bcm1M\",
  authDomain: \"echolocal-buss.firebaseapp.com\",
  databaseURL: \"https://echolocal-buss-default-rtdb.firebaseio.com/\",
  projectId: \"echolocal-buss\",
  storageBucket: \"echolocal-buss.firebasestorage.app\",
  messagingSenderId: \"961610422072\",
  appId: \"1:961610422072:web:0790239d5caf68927ed3cd\"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const rtdb = firebase.database();

// Global state
let isOnline = navigator.onLine;
let listeners = {};

// Network status
window.addEventListener('online', () => {
  isOnline = true;
  updateConnectionStatus();
  reconnectListeners();
});
window.addEventListener('offline', () => {
  isOnline = false;
  updateConnectionStatus();
});

// Update UI status (global)
window.updateConnectionStatus = function() {
  const statusEl = document.getElementById('connection-status');
  if (statusEl) {
    statusEl.textContent = isOnline ? '🟢 Online (Real-time Sync)' : '🔴 Offline Mode';
    statusEl.className = `status ${isOnline ? 'online' : 'offline'}`;
  }
};

// Setup real-time listener for a module (called from app.js)
window.setupRealtimeListener = function(module, callback) {
  const path = `/${module}`;
  const ref = rtdb.ref(path);
  
  // Initial load
  ref.once('value').then(snapshot => {
    const data = snapshot.val() ? Object.values(snapshot.val()) : [];
    callback(data);
  });
  
  // Real-time listener
  const listener = ref.on('value', snapshot => {
    const data = snapshot.val() ? Object.values(snapshot.val()) : [];
    callback(data);
  });
  
  listeners[module] = listener;
  return listener;
};

// Push new data (add)
window.pushData = async function(module, item) {
  if (!isOnline) {
    console.warn(`${module}: Offline - data cached locally`);
    return false;
  }
  try {
    await rtdb.ref(module).push(item);
    return true;
  } catch (e) {
    console.error('Push failed:', e);
    return false;
  }
};

// Remove data (by key)
window.removeData = async function(module, key) {
  if (!isOnline) return false;
  try {
    await rtdb.ref(`${module}/${key}`).remove();
    return true;
  } catch (e) {
    console.error('Remove failed:', e);
    return false;
  }
};

// Reconnect listeners
function reconnectListeners() {
  Object.keys(listeners).forEach(module => {
    const listener = listeners[module];
    if (listener) rtdb.ref(`/${module}`).off('value', listener);
    setupRealtimeListener(module, window[`update${capitalize(module)}Data`]);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Init on load
document.addEventListener('DOMContentLoaded', updateConnectionStatus);

