// js/app.js - Consolidated Modules with Real-time Firebase Sync

// Memory data stores
let repairs = [], clients = [], opportunities = [], money = [];

// Phone Repairs Module (Customer Name, Phone Model, Issue, Cost, Date, Status)
function initRepairs() {
  setupRealtimeListener('repairs', updateRepairsData);
}
window.updateRepairsData = function(data) {
  repairs = data;
  renderRepairs();
};
document.getElementById('repair-form')?.addEventListener('submit', handleAddRepair);
function handleAddRepair(e) {
  e.preventDefault();
  const item = {
    phonetype: document.getElementById('repair-phonetype')?.value,
    issue: document.getElementById('repair-issue')?.value,
    cost: parseFloat(document.getElementById('repair-cost')?.value),
    paystatus: document.getElementById('repair-paystatus')?.value,
    date: document.getElementById('repair-date')?.value
  };
  pushData('repairs', item).then(success => {
    if (success) e.target.reset();
  });
}
function renderRepairs() {
  const tbody = document.querySelector('#repairs-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  repairs.forEach((repair, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${repair.phonetype || ''}</td>
      <td>${repair.issue || ''}</td>
      <td>$${repair.cost || 0}</td>
      <td><span class=\"status ${repair.paystatus || ''}\">${repair.paystatus || ''}</span></td>
      <td>${repair.date || ''}</td>
      <td><button class=\"delete-btn\" onclick=\"deleteRepair('${repair.key || index}')\">Delete</button></td>
    `;
  });
}
window.deleteRepair = async function(key) {
  await removeData('repairs', key);
};

// Clients Module (Business Name, Contact, Payment Status, Project Status)
function initClients() {
  setupRealtimeListener('clients', updateClientsData);
}
window.updateClientsData = function(data) {
  clients = data;
  renderClients();
};
document.getElementById('client-form')?.addEventListener('submit', handleAddClient);
function handleAddClient(e) {
  e.preventDefault();
  const item = {
    name: document.getElementById('client-name')?.value,
    contact: document.getElementById('client-contact')?.value,
    biztype: document.getElementById('client-biztype')?.value,
    status: document.getElementById('client-status')?.value
  };
  pushData('clients', item).then(success => {
    if (success) e.target.reset();
  });
}
function renderClients() {
  const tbody = document.querySelector('#clients-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  clients.forEach((client, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${client.name || ''}</td>
      <td>${client.contact || ''}</td>
      <td>${client.biztype || ''}</td>
      <td><span class=\"status ${client.status || ''}\">${client.status || ''}</span></td>
      <td><button class=\"delete-btn\" onclick=\"deleteClient('${client.key || index}')\">Delete</button></td>
    `;
  });
}
window.deleteClient = async function(key) {
  await removeData('clients', key);
};

// Opportunities Module (Business Name, Contact, Status)
function initOpportunities() {
  setupRealtimeListener('opportunities', updateOpportunitiesData);
}
window.updateOpportunitiesData = function(data) {
  opportunities = data;
  renderOpportunities();
};
document.getElementById('opportunity-form')?.addEventListener('submit', handleAddOpportunity);
function handleAddOpportunity(e) {
  e.preventDefault();
  const item = {
    bizname: document.getElementById('opp-bizname')?.value,
    contact: document.getElementById('opp-contact')?.value,
    status: document.getElementById('opp-status')?.value
  };
  pushData('opportunities', item).then(success => {
    if (success) e.target.reset();
  });
}
function renderOpportunities() {
  const tbody = document.querySelector('#opportunities-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  opportunities.forEach((opp, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${opp.bizname || ''}</td>
      <td>${opp.contact || ''}</td>
      <td><span class=\"status ${opp.status || ''}\">${opp.status || ''}</span></td>
      <td><button class=\"delete-btn\" onclick=\"deleteOpportunity('${opp.key || index}')\">Delete</button></td>
    `;
  });
}
window.deleteOpportunity = async function(key) {
  await removeData('opportunities', key);
};

// Money Manager Module (Income/Expense, Total/Balance)
function initMoney() {
  setupRealtimeListener('money', updateMoneyData);
}
window.updateMoneyData = function(data) {
  money = data;
  renderMoney();
  updateMoneySummary();
};
document.getElementById('money-form')?.addEventListener('submit', handleAddMoney);
function handleAddMoney(e) {
  e.preventDefault();
  const item = {
    type: document.getElementById('money-type')?.value,
    desc: document.getElementById('money-desc')?.value,
    amount: parseFloat(document.getElementById('money-amount')?.value),
    date: document.getElementById('money-date')?.value
  };
  pushData('money', item).then(success => {
    if (success) e.target.reset();
  });
}
function renderMoney() {
  const tbody = document.querySelector('#money-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  money.forEach((entry, index) => {
    const row = tbody.insertRow();
    const typeClass = entry.type === 'income' ? 'paid' : 'unpaid';
    row.innerHTML = `
      <td><span class=\"status ${typeClass}\">${entry.type.toUpperCase()}</span></td>
      <td>${entry.desc || ''}</td>
      <td>$${entry.amount?.toFixed(2) || 0}</td>
      <td>${entry.date || ''}</td>
      <td><button class=\"delete-btn\" onclick=\"deleteMoney('${entry.key || index}')\">Delete</button></td>
    `;
  });
}
function updateMoneySummary() {
  const income = money.filter(e => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0);
  const expenses = money.filter(e => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0);
  const balance = income - expenses;
  
  const balanceEl = document.getElementById('total-balance');
  if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  const incomeEl = document.getElementById('daily-income');
  if (incomeEl) incomeEl.textContent = income.toFixed(2);
  const expensesEl = document.getElementById('daily-expenses');
  if (expensesEl) expensesEl.textContent = expenses.toFixed(2);
}
window.deleteMoney = async function(key) {
  await removeData('money', key);
};

// Export/Import (backup)
window.exportAllData = function() {
  const allData = { repairs, clients, opportunities, money };
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'echo-backup.json';
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById('import-file')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      // Note: Import to local memory, manual sync needed
      Object.assign(repairs, data.repairs || []);
      Object.assign(clients, data.clients || []);
      Object.assign(opportunities, data.opportunities || []);
      Object.assign(money, data.money || []);
      renderRepairs(); renderClients(); renderOpportunities(); renderMoney(); updateMoneySummary();
      alert('Imported to local - sync online to push!');
    } catch (err) {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
});

// Init all modules on load (for dashboard)
document.addEventListener('DOMContentLoaded', () => {
  initRepairs();
  initClients();
  initOpportunities();
  initMoney();
});

