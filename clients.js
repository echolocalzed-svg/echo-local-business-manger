// Clients Module

let clientsData = [];

function initClients() {
    clientsData = loadData('clients');
    renderClients();
    
    const form = document.getElementById('client-form');
    if (form) {
        form.addEventListener('submit', handleAddClient);
    }
}

function handleAddClient(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('client-name').value,
        contact: document.getElementById('client-contact').value,
        biztype: document.getElementById('client-biztype').value,
        notes: document.getElementById('client-notes').value,
        status: document.getElementById('client-status').value
    };
    
    clientsData.push(formData);
    saveData('clients', clientsData);
    renderClients();
    e.target.reset();
}

function renderClients() {
    const tbody = document.querySelector('#clients-table tbody');
    tbody.innerHTML = '';
    
    clientsData.forEach((client, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.contact || ''}</td>
            <td>${client.biztype || ''}</td>
            <td><span class="status ${client.status}">${client.status}</span></td>
            <td><button class="delete-btn" onclick="deleteData('clients', ${index})">Delete</button></td>
        `;
    });
}

// Export for app.js
window.initClients = initClients;
window.renderClients = renderClients;
