// Full Firebase Integration for Backup Sync (ES6 modules via CDN)

const firebaseConfig = {
  apiKey: "AIzaSyCRm5caQVFdx0O1-wSq8jqypptCA5Bcm1M",
  authDomain: "echolocal-buss.firebaseapp.com",
  projectId: "echolocal-buss",
  storageBucket: "echolocal-buss.firebasestorage.app",
  messagingSenderId: "961610422072",
  appId: "1:961610422072:web:0790239d5caf68927ed3cd",
  measurementId: "G-XT10TH0SMX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Online status
let isOnline = navigator.onLine;
window.addEventListener('online', () => { isOnline = true; syncAll(); });
window.addEventListener('offline', () => isOnline = false);

async function syncModule(module) {
  if (!isOnline) return;
  
  const localData = loadData(module);
  const colRef = db.collection(module);
  
  try {
    // Clear remote and upload local (simple backup)
    const snapshot = await colRef.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    localData.forEach(item => {
      batch.set(colRef.doc(), item);
    });
    
    await batch.commit();
    console.log(`${module} synced`);
  } catch (e) {
    console.error('Sync failed:', e);
  }
}

async function syncAll() {
  ['clients', 'repairs', 'opportunities', 'money'].forEach(syncModule);
}

// Export/Import Utils (called from app.js)
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
        if (isOnline) syncModule(module);
        // Re-render
        window[`render${capitalize(module)}`]?.();
      });
      updateSummary(); // For money
      alert('Data imported successfully!');
    } catch (err) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
};

window.syncAll = syncAll;
window.isOnline = () => isOnline;
