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
let tempAmount = 0;

// Load data from local storage on page load
window.onload = function () {
    // Load budget and expenditure values
    const savedBudget = localStorage.getItem("budget");
    const savedExpenditure = localStorage.getItem("expenditure");
    const savedBalance = localStorage.getItem("balance");

    if (savedBudget) {
        tempAmount = parseInt(savedBudget);
        amount.innerText = tempAmount;
    }
    if (savedExpenditure) {
        expenditureValue.innerText = savedExpenditure;
    }
    if (savedBalance) {
        balanceValue.innerText = savedBalance;
    }

    // Load list items from local storage
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    savedExpenses.forEach((expense) => {
        listCreator(expense.name, expense.value);
    });
};

// Save data to local storage
function saveData() {
    localStorage.setItem("budget", tempAmount);
    localStorage.setItem("expenditure", expenditureValue.innerText);
    localStorage.setItem("balance", balanceValue.innerText);

    // Save all list items
    const expenses = Array.from(document.querySelectorAll(".sublist-content")).map(item => {
        return {
            name: item.querySelector(".product").innerText,
            value: item.querySelector(".amount").innerText,
        };
    });
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Set Budget Part
totalAmountButton.addEventListener("click", () => {
    tempAmount = parseInt(totalAmount.value);
    if (isNaN(tempAmount) || tempAmount < 0) {
        errorMessage.classList.remove("hide");
    } else {
        errorMessage.classList.add("hide");
        amount.innerText = tempAmount;
        balanceValue.innerText = tempAmount - parseInt(expenditureValue.innerText);
        totalAmount.value = "";
        saveData();
    }
});

// Function To Disable Edit and Delete Button
const disableButtons = (bool) => {
    let editButtons = document.getElementsByClassName("edit");
    Array.from(editButtons).forEach((element) => {
        element.disabled = bool;
    });
};

// Function To Modify List Elements
const modifyElement = (element, edit = false) => {
    let parentDiv = element.parentElement;
    let currentBalance = parseInt(balanceValue.innerText);
    let currentExpense = parseInt(expenditureValue.innerText);
    let parentAmount = parseInt(parentDiv.querySelector(".amount").innerText);
    if (edit) {
        let parentText = parentDiv.querySelector(".product").innerText;
        productTitle.value = parentText;
        userAmount.value = parentAmount;
        disableButtons(true);
    }
    balanceValue.innerText = currentBalance + parentAmount;
    expenditureValue.innerText = currentExpense - parentAmount;
    parentDiv.remove();
    saveData();
};

// Function To Create List
const listCreator = (expenseName, expenseValue) => {
    let sublistContent = document.createElement("div");
    sublistContent.classList.add("sublist-content", "flex-space");
    sublistContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${expenseValue}</p>`;

    let editButton = document.createElement("button");
    editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
    editButton.style.fontSize = "1.2em";
    editButton.addEventListener("click", () => {
        modifyElement(editButton, true);
    });

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
    deleteButton.style.fontSize = "1.2em";
    deleteButton.addEventListener("click", () => {
        modifyElement(deleteButton);
    });

    sublistContent.appendChild(editButton);
    sublistContent.appendChild(deleteButton);
    list.appendChild(sublistContent);
    saveData();
};

// Function To Add Expenses
checkAmountButton.addEventListener("click", () => {
    if (!userAmount.value || !productTitle.value) {
        productTitleError.classList.remove("hide");
        return false;
    }
    disableButtons(false);
    let expenditure = parseInt(userAmount.value);
    let sum = parseInt(expenditureValue.innerText) + expenditure;
    expenditureValue.innerText = sum;
    const totalBalance = tempAmount - sum;
    balanceValue.innerText = totalBalance;
    listCreator(productTitle.value, userAmount.value);
    productTitle.value = "";
    userAmount.value = "";
    saveData();
});

// Print Functionality
const printButton = document.getElementById("print-button");
printButton.addEventListener("click", () => {
    window.print();
});



clearDataButton.addEventListener("click", () => {
    // Clear local storage
    localStorage.clear();

    // Reset displayed values
    amount.innerText = "0";
    expenditureValue.innerText = "0";
    balanceValue.innerText = "0";
    tempAmount = 0;

    // Clear all items from the list
    list.innerHTML = "";

    // Clear input fields
    productTitle.value = "";
    userAmount.value = "";

    // Hide any error messages
    errorMessage.classList.add("hide");
    productTitleError.classList.add("hide");
});