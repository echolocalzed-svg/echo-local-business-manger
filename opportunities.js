// Opportunities Module

let opportunitiesData = [];

function initOpportunities() {
    opportunitiesData = loadData('opportunities');
    renderOpportunities();
    
    const form = document.getElementById('opportunity-form');
    if (form) {
        form.addEventListener('submit', handleAddOpportunity);
    }
}

function handleAddOpportunity(e) {
    e.preventDefault();
    const formData = {
        bizname: document.getElementById('opp-bizname').value,
        contact: document.getElementById('opp-contact').value,
        status: document.getElementById('opp-status').value
    };
    
    opportunitiesData.push(formData);
    saveData('opportunities', opportunitiesData);
    renderOpportunities();
    e.target.reset();
}

function renderOpportunities() {
    const tbody = document.querySelector('#opportunities-table tbody');
    tbody.innerHTML = '';
    
    opportunitiesData.forEach((opp, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${opp.bizname}</td>
            <td>${opp.contact || ''}</td>
            <td><span class="status ${opp.status}">${opp.status}</span></td>
            <td><button class="delete-btn" onclick="deleteData('opportunities', ${index})">Delete</button></td>
        `;
    });
}

// Export
window.initOpportunities = initOpportunities;
window.renderOpportunities = renderOpportunities;
