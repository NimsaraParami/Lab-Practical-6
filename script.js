
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];


const transactionForm = document.getElementById('transaction-form');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const clearBtn = document.getElementById('clear-btn');

const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const currentBalanceEl = document.getElementById('current-balance');

const filterTypeEl = document.getElementById('filter-type');
const searchInputEl = document.getElementById('search-input');
const transactionListEl = document.getElementById('transaction-list');


dateInput.value = new Date().toISOString().split('T')[0];


function init() {
    render();
}


function formatCurrency(amount) {
    return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    currentBalanceEl.textContent = formatCurrency(balance);
}


function renderTable() {
    const filterValue = filterTypeEl.value;
    const searchValue = searchInputEl.value.toLowerCase().trim();

    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = filterValue === 'All' || t.type === filterValue;
        const matchesSearch = t.description.toLowerCase().includes(searchValue) ||
                              t.category.toLowerCase().includes(searchValue);
        return matchesFilter && matchesSearch;
    });

    transactionListEl.innerHTML = '';

    if (filteredTransactions.length === 0) {
        transactionListEl.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No transactions found.</td>
            </tr>
        `;
        return;
    }

    filteredTransactions.forEach(t => {
        const tr = document.createElement('tr');
        
        const isIncome = t.type === 'Income';
        const badgeClass = isIncome ? 'badge-income' : 'badge-expense';
        const amountClass = isIncome ? 'amount-income' : 'amount-expense';
        const amountPrefix = isIncome ? '+ ' : '- ';

        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td><span class="badge ${badgeClass}">${t.type}</span></td>
            <td>${t.category}</td>
            <td class="${amountClass}">${amountPrefix}${formatCurrency(t.amount)}</td>
            <td>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
            </td>
        `;

        transactionListEl.appendChild(tr);
    });
}


function render() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateSummary();
    renderTable();
}


transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const type = typeInput.value;
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    
    if (!description || !amount || amount <= 0 || !category || !date) {
        alert('Please fill in all fields with valid data.');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        type,
        description,
        amount,
        category,
        date
    };

    transactions.push(newTransaction);
    render();

    alert('Transaction added successfully!');

    
    transactionForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
});


clearBtn.addEventListener('click', function() {
    transactionForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
});


function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        render();
    }
}


filterTypeEl.addEventListener('change', renderTable);
searchInputEl.addEventListener('input', renderTable);


init();