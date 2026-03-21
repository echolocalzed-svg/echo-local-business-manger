// Phone Repairs Module

let repairsData = [];

function initRepairs() {
    repairsData = loadData('repairs');
    renderRepairs();
    
    const form = document.getElementById('repair-form');
    if (form) {
        form.addEventListener('submit', handleAddRepair);
    }
}

function handleAddRepair(e) {
    e.preventDefault();
    const formData = {
        phonetype: document.getElementById('repair-phonetype').value,
        issue: document.getElementById('repair-issue').value,
        cost: parseFloat(document.getElementById('repair-cost').value),
        paystatus: document.getElementById('repair-paystatus').value,
        date: document.getElementById('repair-date').value
    };
    
    repairsData.push(formData);
    saveData('repairs', repairsData);
    renderRepairs();
    e.target.reset();
}

function renderRepairs() {
    const tbody = document.querySelector('#repairs-table tbody');
    tbody.innerHTML = '';
    
    repairsData.forEach((repair, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${repair.phonetype}</td>
            <td>${repair.issue}</td>
            <td>$${repair.cost}</td>
            <td><span class="status ${repair.paystatus}">${repair.paystatus}</td>
            <td>${repair.date}</td>
            <td><button class="delete-btn" onclick="deleteData('repairs', ${index})">Delete</button></td>
        `;
    });
}

// Export
window.initRepairs = initRepairs;
window.renderRepairs = renderRepairs;
