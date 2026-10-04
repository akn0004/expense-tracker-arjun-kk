// ===============================
// Expense Tracker
// ===============================


// Get HTML elements

const form = document.getElementById("transactionForm");

const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const transactionList =
    document.getElementById("transactionList");

const totalIncomeElement =
    document.getElementById("totalIncome");

const totalExpenseElement =
    document.getElementById("totalExpense");

const balanceElement =
    document.getElementById("balance");

const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const errorMessage =
    document.getElementById("errorMessage");

const submitButton =
    document.getElementById("submitButton");

const cancelButton =
    document.getElementById("cancelButton");

const monthlySummary =
    document.getElementById("monthlySummary");


// ===============================
// Load data from Local Storage
// ===============================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


// ID used while editing

let editId = null;


// Set today's date

dateInput.value =
    new Date().toISOString().split("T")[0];


// ===============================
// Save transactions
// ===============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ===============================
// Form Submit
// ===============================

form.addEventListener("submit", function (event) {

    event.preventDefault();


    const type = typeInput.value;

    const amount = Number(amountInput.value);

    const category = categoryInput.value;

    const date = dateInput.value;

    const description =
        descriptionInput.value.trim();


    // Validation

    if (
        !type ||
        !amount ||
        amount <= 0 ||
        !category ||
        !date ||
        !description
    ) {

        errorMessage.textContent =
            "Please fill all fields correctly.";

        return;
    }


    errorMessage.textContent = "";


    // ===============================
    // EDIT EXISTING TRANSACTION
    // ===============================

    if (editId !== null) {

        transactions =
            transactions.map(function (transaction) {

                if (transaction.id === editId) {

                    return {

                        id: editId,

                        type: type,

                        amount: amount,

                        category: category,

                        date: date,

                        description: description

                    };

                }

                return transaction;

            });


        editId = null;

        submitButton.textContent =
            "Add Transaction";

        cancelButton.style.display =
            "none";

    }


    // ===============================
    // ADD NEW TRANSACTION
    // ===============================

    else {

        const transaction = {

            id: Date.now(),

            type: type,

            amount: amount,

            category: category,

            date: date,

            description: description

        };


        transactions.push(transaction);

    }


    // Save

    saveTransactions();


    // Reset form

    form.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];


    // Refresh screen

    renderTransactions();

});


// ===============================
// Update Summary
// ===============================

function updateSummary() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        }

        else if (transaction.type === "expense") {

            totalExpense += transaction.amount;

        }

    });


    const balance =
        totalIncome - totalExpense;


    totalIncomeElement.textContent =
        formatCurrency(totalIncome);

    totalExpenseElement.textContent =
        formatCurrency(totalExpense);

    balanceElement.textContent =
        formatCurrency(balance);

}


// ===============================
// Currency
// ===============================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR"
        }
    ).format(amount);

}


// ===============================
// Render Transactions
// ===============================

function renderTransactions() {

    updateSummary();

    renderMonthlySummary();

    renderExpenseChart();


    const selectedType =
        typeFilter.value;

    const selectedCategory =
        categoryFilter.value;


    const filteredTransactions =
        transactions.filter(function (transaction) {

            const typeMatch =
                selectedType === "all" ||
                transaction.type === selectedType;


            const categoryMatch =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;


            return typeMatch && categoryMatch;

        });


    transactionList.innerHTML = "";


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty">
                No transactions found.
            </div>
        `;

        return;

    }


    // Newest transactions first

    filteredTransactions
        .sort(function (a, b) {

            return new Date(b.date) -
                   new Date(a.date);

        })
        .forEach(function (transaction) {


            const transactionElement =
                document.createElement("div");


            transactionElement.className =
                "transaction";


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            transactionElement.innerHTML = `

                <div class="transaction-info">

                    <h3>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            transaction.category
                        )}
                        •
                        ${formatDate(
                            transaction.date
                        )}
                    </p>

                </div>


                <div class="
                    transaction-amount
                    ${transaction.type}
                ">

                    ${sign}${formatCurrency(
                        transaction.amount
                    )}

                </div>


                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})">

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">

                        Delete

                    </button>

                </div>

            `;


            transactionList.appendChild(
                transactionElement
            );

        });

}


// ===============================
// Edit
// ===============================

function editTransaction(id) {

    const transaction =
        transactions.find(function (item) {

            return item.id === id;

        });


    if (!transaction) {

        return;

    }


    typeInput.value =
        transaction.type;

    amountInput.value =
        transaction.amount;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;

    descriptionInput.value =
        transaction.description;


    editId = id;


    submitButton.textContent =
        "Update Transaction";


    cancelButton.style.display =
        "inline-block";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ===============================
// Cancel Edit
// ===============================

function cancelEdit() {

    editId = null;

    form.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];

    submitButton.textContent =
        "Add Transaction";

    cancelButton.style.display =
        "none";

    errorMessage.textContent = "";

}


// ===============================
// Delete
// ===============================

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {

        return;

    }


    transactions =
        transactions.filter(function (transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    renderTransactions();

}


// ===============================
// Format Date
// ===============================

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString("en-IN");

}


// ===============================
// Monthly Expense Summary
// ===============================

function renderMonthlySummary() {

    const monthlyExpenses = {};


    transactions.forEach(function (transaction) {

        if (transaction.type !== "expense") {

            return;

        }


        const month =
            transaction.date.substring(0, 7);


        if (!monthlyExpenses[month]) {

            monthlyExpenses[month] = 0;

        }


        monthlyExpenses[month] +=
            transaction.amount;

    });


    monthlySummary.innerHTML = "";


    const months =
        Object.keys(monthlyExpenses)
            .sort()
            .reverse();


    if (months.length === 0) {

        monthlySummary.innerHTML = `
            <div class="empty">
                No expense data available.
            </div>
        `;

        return;

    }


    months.forEach(function (month) {

        const row =
            document.createElement("div");


        row.className = "month-row";


        const formattedMonth =
            new Date(month + "-01")
                .toLocaleDateString(
                    "en-IN",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


        row.innerHTML = `

            <span>
                ${formattedMonth}
            </span>

            <strong>
                ${formatCurrency(
                    monthlyExpenses[month]
                )}
            </strong>

        `;


        monthlySummary.appendChild(row);

    });

}


// ===============================
// Category-wise Expense Chart
// ===============================

function renderExpenseChart() {

    const categoryTotals = {};


    transactions.forEach(function (transaction) {

        // IMPORTANT:
        // Only expenses appear in this chart

        if (transaction.type !== "expense") {

            return;

        }


        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }


        categoryTotals[transaction.category] +=
            transaction.amount;

    });


    const chartContainer =
        document.querySelector(".chart-container");


    if (!chartContainer) {

        return;

    }


    chartContainer.innerHTML = "";


    const categories =
        Object.keys(categoryTotals);


    if (categories.length === 0) {

        chartContainer.innerHTML = `
            <div class="empty">
                No expense data available for the chart.
            </div>
        `;

        return;

    }


    const maxAmount =
        Math.max(
            ...Object.values(categoryTotals)
        );


    categories.forEach(function (category) {

        const amount =
            categoryTotals[category];


        const percentage =
            (amount / maxAmount) * 100;


        const row =
            document.createElement("div");


        row.className =
            "chart-row";


        row.innerHTML = `

            <div class="chart-label">

                <span>
                    ${escapeHTML(category)}
                </span>

                <strong>
                    ${formatCurrency(amount)}
                </strong>

            </div>


            <div class="bar-background">

                <div
                    class="bar-fill"
                    style="width: ${percentage}%">
                </div>

            </div>

        `;


        chartContainer.appendChild(row);

    });

}


// ===============================
// HTML Security
// ===============================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


// ===============================
// Filters
// ===============================

typeFilter.addEventListener(
    "change",
    renderTransactions
);


categoryFilter.addEventListener(
    "change",
    renderTransactions
);


// ===============================
// Initial Load
// ===============================

renderTransactions();