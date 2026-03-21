// Full Firebase Integration for Auto-Backup & Recovery (ES6 modules via CDN v10)

// Firebase v10 Modular CDN
// Note: Use compat for legacy code compatibility
const firebaseConfig = {
  apiKey: "AIzaSyCRm5caQVFdx0O1-wSq8jqypptCA5Bcm1M",
  authDomain: "echolocal-buss.firebaseapp.com",
  projectId: "echolocal-buss",
  storageBucket: "echolocal-buss.firebasestorage.app",
  messagingSenderId: "961610422072",
  appId: "1:961610422072:web:0790239d5caf68927ed3cd",
  measurementId: "G-XT10TH0SMX"
};

// Initialize Firebase v10 compat
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global state
let isOnline = navigator.onLine;
let lastBackup = null;

// Network listeners
window.addEventListener('online', () => { 
  isOnline = true; 
  updateStatus();
  autoSyncAll(); 
});
window.addEventListener('offline', () => { 
  isOnline = false; 
  updateStatus(); 
});

// Auto-restore from cloud on load if local data missing
async function restoreFromCloud() {
  if (!isOnline) return;
  
  const modules = ['clients', 'repairs', 'opportunities', 'money'];
  
  for (const module of modules) {
    const localData = loadData(module);
    if (localData.length === 0) {
      try {
        const snapshot = await db.collection(module).get();
        if (!snapshot.empty) {
          const cloudData = snapshot.docs.map(doc => doc.data());
          saveData(module, cloudData);
          // Re-render if section active
          window[`render${capitalize(module)}`]?.();
          console.log(`${module} restored from cloud`);
        }
      } catch (e) {
        console.error(`Restore failed for ${module}:`, e);
      }
    }
  }
  loadLastBackupStatus();
}

// Load last backup timestamp
async function loadLastBackupStatus() {
  try {
    if (isOnline) {
      const doc = await db.collection('meta').doc('backup').get();
      if (doc.exists) {
        lastBackup = doc.data().timestamp;
      }
    }
  } catch (e) {
    console.error('Failed to load backup status');
  }
  updateStatus();
}

// Auto-sync single module when data changes (if online)
async function autoSyncModule(module) {
  if (!isOnline) return;
  
  const localData = loadData(module);
  const colRef = db.collection(module);
  
  try {
    // Update last backup
    const metaRef = db.collection('meta').doc('backup');
    const batch = db.batch();
    
    // Clear and upload
    const snapshot = await colRef.get();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    localData.forEach(item => batch.set(colRef.doc(), item));
    batch.set(metaRef, { timestamp: new Date().toISOString() });
    
    await batch.commit();
    lastBackup = new Date().toISOString();
    console.log(`${module} auto-synced`);
    updateStatus();
  } catch (e) {
    console.error('Auto-sync failed:', e);
  }
}

// Manual sync all (existing)
async function syncAll() {
  await Promise.all(['clients', 'repairs', 'opportunities', 'money'].map(autoSyncModule));
}

// Trigger auto-sync event (called from app.js)
window.triggerAutoSync = function(module) {
  autoSyncModule(module);
};

// Update UI status
window.updateStatus = function() {
  const statusEl = document.getElementById('connection-status');
  const backupEl = document.getElementById('last-backup');
  const syncBtn = document.getElementById('sync-btn');
  
  if (statusEl) {
    statusEl.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
    statusEl.className = `status ${isOnline ? 'paid' : 'unpaid'}`;
  }
  
  if (backupEl && lastBackup) {
    const date = new Date(lastBackup).toLocaleString();
    backupEl.textContent = `Last Backup: ${date}`;
  }
  
  if (syncBtn) {
    syncBtn.disabled = !isOnline;
    syncBtn.textContent = isOnline ? '☁️ Synced' : '☁️ Offline';
  }
};

window.isOnline = () => isOnline;
window.restoreFromCloud = restoreFromCloud;
window.syncAll = syncAll;

// Init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    restoreFromCloud();
    updateStatus();
  });
} else {
  restoreFromCloud();
  updateStatus();
}

// Existing export/import unchanged
window.downloadData = function(allData) {
  const blob = new Blob([JSON.stringify(allData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'echo-backup.json';
  a.click();
  URL.revokeObjectURL(url);
};

window.uploadData = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      Object.keys(data).forEach(module => {
        saveData(module, data[module]);
        window.triggerAutoSync(module);
        window[`render${capitalize(module)}`]?.();
      });
      window.updateSummary?.();
      updateStatus();
      alert('Data imported & auto-synced!');
    } catch (err) {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

