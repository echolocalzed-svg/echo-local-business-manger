// Money Manager Module

let moneyData = [];

function initMoney() {
    moneyData = loadData('money');
    renderMoney();
    updateSummary();
    
    const form = document.getElementById('money-form');
    if (form) {
        form.addEventListener('submit', handleAddMoney);
    }
}

function handleAddMoney(e) {
    e.preventDefault();
    const formData = {
        type: document.getElementById('money-type').value,
        desc: document.getElementById('money-desc').value,
        amount: parseFloat(document.getElementById('money-amount').value),
        date: document.getElementById('money-date').value
    };
    
    moneyData.push(formData);
    saveData('money', moneyData);
    renderMoney();
    updateSummary();
    e.target.reset();
}

function renderMoney() {
    const tbody = document.querySelector('#money-table tbody');
    tbody.innerHTML = '';
    
    moneyData.forEach((entry, index) => {
        const row = tbody.insertRow();
        const typeClass = entry.type === 'income' ? 'status paid' : 'status expense';
        row.innerHTML = `
            <td><span class="${typeClass}">${entry.type}</span></td>
            <td>${entry.desc}</td>
            <td>$${entry.amount}</td>
            <td>${entry.date}</td>
            <td><button class="delete-btn" onclick="deleteData('money', ${index}); updateSummary();">Delete</button></td>
        `;
    });
}

function updateSummary() {
    const income = moneyData
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
    
    const expenses = moneyData
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
    
    const balance = income - expenses;
    
    document.getElementById('total-balance').textContent = balance.toFixed(2);
    document.getElementById('daily-income').textContent = income.toFixed(2);
    document.getElementById('daily-expenses').textContent = expenses.toFixed(2);
}

// Export
window.initMoney = initMoney;
window.renderMoney = renderMoney;
window.updateSummary = updateSummary;
