let totalAmount = document.getElementById("total-amount");
let userAmount = document.getElementById("user-amount");
const checkAmountButton = document.getElementById("check-amount");
const totalAmountButton = document.getElementById("total-amount-button");
const productTitle = document.getElementById("product-title");
const errorMessage = document.getElementById("budget-error");
const productTitleError = document.getElementById("product-title-error");
const productCostError = document.getElementById("product-cost-error");
const amount = document.getElementById("amount");
const expenditureValue = document.getElementById("expenditure-value");
const balanceValue = document.getElementById("balance-amount");
const list = document.getElementById("list");
const clearDataButton = document.getElementById("clear-data-button");
const printButton = document.getElementById("print-button");

let tempAmount = 0;

/* ---------- HELPER FUNCTIONS ---------- */
function formatRupee(val) {
    return "₹ " + parseInt(val || 0);
}
function parseRupee(val) {
    return parseInt(val.replace("₹", "").trim()) || 0;
}

/* ---------- LOAD DATA ---------- */
window.onload = function () {
    tempAmount = parseInt(localStorage.getItem("budget")) || 0;
    amount.innerText = formatRupee(tempAmount);

    expenditureValue.innerText = formatRupee(localStorage.getItem("expenditure"));
    balanceValue.innerText = formatRupee(localStorage.getItem("balance"));

    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    savedExpenses.forEach(e => listCreator(e.name, e.value));

    loadBudgetHistory();
};

/* ---------- SAVE DATA ---------- */
function saveData() {
    localStorage.setItem("budget", tempAmount);
    localStorage.setItem("expenditure", parseRupee(expenditureValue.innerText));
    localStorage.setItem("balance", parseRupee(balanceValue.innerText));

    const expenses = Array.from(document.querySelectorAll(".sublist-content")).map(item => ({
        name: item.querySelector(".product").innerText,
        value: parseRupee(item.querySelector(".amount").innerText)
    }));
    localStorage.setItem("expenses", JSON.stringify(expenses));

}

/* ---------- SET BUDGET ---------- */
totalAmountButton.addEventListener("click", () => {
    tempAmount = parseInt(totalAmount.value);

    if (isNaN(tempAmount) || tempAmount < 0) {
        errorMessage.classList.remove("hide");
        return;
    }

    errorMessage.classList.add("hide");
    amount.innerText = formatRupee(tempAmount);

    let spent = parseRupee(expenditureValue.innerText);
    balanceValue.innerText = formatRupee(tempAmount - spent);

    totalAmount.value = "";
    saveData();
    saveBudgetHistory();
    
});

/* ---------- DISABLE EDIT ---------- */
const disableButtons = (state) => {
    document.querySelectorAll(".edit").forEach(btn => btn.disabled = state);
};

/* ---------- MODIFY ITEM ---------- */
const modifyElement = (element, edit = false) => {
    let parent = element.parentElement;

    let itemAmount = parseRupee(parent.querySelector(".amount").innerText);
    let balance = parseRupee(balanceValue.innerText);
    let expense = parseRupee(expenditureValue.innerText);

    if (edit) {
        productTitle.value = parent.querySelector(".product").innerText;
        userAmount.value = itemAmount;
        disableButtons(true);
    }

    balanceValue.innerText = formatRupee(balance + itemAmount);
    expenditureValue.innerText = formatRupee(expense - itemAmount);

    parent.remove();
    saveData();
    
};

/* ---------- CREATE LIST ---------- */
const listCreator = (name, value) => {
    let div = document.createElement("div");
    div.classList.add("sublist-content", "flex-space");

    div.innerHTML = `
        <p class="product">${name}</p>
        <p class="amount">₹ ${value}</p>
    `;

    let editBtn = document.createElement("button");
    editBtn.classList.add("fa-solid", "fa-pen-to-square", "edit");
    editBtn.onclick = () => modifyElement(editBtn, true);

    let delBtn = document.createElement("button");
    delBtn.classList.add("fa-solid", "fa-trash-can", "delete");
    delBtn.onclick = () => modifyElement(delBtn);

    div.append(editBtn, delBtn);
    list.appendChild(div);

    saveData();
   
};

/* ---------- ADD EXPENSE ---------- */
checkAmountButton.addEventListener("click", () => {
    if (!productTitle.value || !userAmount.value) {
        productTitleError.classList.remove("hide");
        return;
    }

    productTitleError.classList.add("hide");
    disableButtons(false);

    let expense = parseInt(userAmount.value);
    let totalSpent = parseRupee(expenditureValue.innerText) + expense;

    expenditureValue.innerText = formatRupee(totalSpent);
    balanceValue.innerText = formatRupee(tempAmount - totalSpent);

    listCreator(productTitle.value, expense);

    productTitle.value = "";
    userAmount.value = "";

    saveData();
   
});

/* ---------- PRINT ---------- */
//printButton.addEventListener("click", () => window.print());

printButton.addEventListener("click", () => {
    document.getElementById("invoice-date").innerText =
        new Date().toLocaleDateString("en-IN");

    document.getElementById("invoice-budget").innerText = amount.innerText;
    document.getElementById("invoice-expense").innerText = expenditureValue.innerText;
    document.getElementById("invoice-balance").innerText = balanceValue.innerText;

    const invoiceList = document.getElementById("invoice-list");
    invoiceList.innerHTML = "";

    const items = document.querySelectorAll(".sublist-content");

    items.forEach((item, index) => {
        let name = item.querySelector(".product").innerText;
        let value = item.querySelector(".amount").innerText;

        let row = `
            <tr>
                <td>${index + 1}</td>
                <td>${name}</td>
                <td>${value}</td>
            </tr>
        `;
        invoiceList.innerHTML += row;
    });

    document.getElementById("invoice-print").style.display = "block";
    window.print();
    document.getElementById("invoice-print").style.display = "none";
});

/* ---------- CLEAR ALL ---------- */
clearDataButton.addEventListener("click", () => {
    localStorage.clear();
    tempAmount = 0;

    amount.innerText = formatRupee(0);
    expenditureValue.innerText = formatRupee(0);
    balanceValue.innerText = formatRupee(0);

    list.innerHTML = "";
    productTitle.value = "";
    userAmount.value = "";

    errorMessage.classList.add("hide");
    productTitleError.classList.add("hide");
});

/* ---------- Save Budget History---------- */

function saveBudgetHistory() {
    let history = JSON.parse(localStorage.getItem("budgetHistory")) || [];

    const snapshot = {
        date: new Date().toLocaleString("en-IN"),
        budget: tempAmount,
        expenditure: parseRupee(expenditureValue.innerText),
        balance: parseRupee(balanceValue.innerText),
        expenses: Array.from(document.querySelectorAll(".sublist-content")).map(item => ({
            name: item.querySelector(".product").innerText,
            amount: parseRupee(item.querySelector(".amount").innerText)
        }))
    };

    history.unshift(snapshot);       // add newest first
    if (history.length > 10) history.pop(); // keep only last 10

    localStorage.setItem("budgetHistory", JSON.stringify(history));
    
}


/* ---------- Load Budget History ---------- */

function loadBudgetHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    const history = JSON.parse(localStorage.getItem("budgetHistory")) || [];

    history.forEach((item, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <strong>${item.date}</strong> |
            Budget: ₹ ${item.budget} |
            Expense: ₹ ${item.expenditure} |
            Balance: ₹ ${item.balance}
            <button onclick="viewHistory(${index})">View</button>
        `;
        historyList.appendChild(li);
    });
}
loadBudgetHistory();

/* ---------- View History Item ---------- */
function viewHistory(index) {
    const history = JSON.parse(localStorage.getItem("budgetHistory"));
    const record = history[index];

    alert(
        `DATE: ${record.date}\n` +
        `BUDGET: ₹ ${record.budget}\n` +
        `EXPENSE: ₹ ${record.expenditure}\n` +
        `BALANCE: ₹ ${record.balance}\n\n` +
        `EXPENSE DETAILS:\n` +
        record.expenses.map(e => `${e.name} - ₹ ${e.amount}`).join("\n")
    );
}
/* ---------- Save history on budget change ---------- */
