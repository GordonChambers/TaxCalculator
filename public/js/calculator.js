// Function to initialize a calculator
function initializeCalculator(calculator) {
    // Get the income and deductions inputs and the tax paragraph
    const incomeInput = calculator.querySelector('.income');
    const deductionsInput = calculator.querySelector('.deductions');
    const taxParagraph = calculator.querySelector('.tax');

    // Function to calculate the tax
    function calculateTax() {
        const income = parseFloat(incomeInput.value);
        const deductions = parseFloat(deductionsInput.value);
        const tax = (income - deductions) * 0.37;
        taxParagraph.innerText = 'Your total tax is: $' + tax.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    // Add event listeners to the income and deductions inputs to calculate the tax when their values change
    incomeInput.addEventListener('input', calculateTax);
    deductionsInput.addEventListener('input', calculateTax);

    // Add an event listener to the "Remove Calculator" button to remove the calculator when the button is clicked
    calculator.querySelector('.removeCalculator').addEventListener('click', () => {
        calculator.remove();
    });

    // Add an event listener to the "Copy Calculator" button to create a new calculator with the same inputs when the button is clicked
    calculator.querySelector('.copyCalculator').addEventListener('click', () => {
        const newCalculatorHTML = createCalculatorHTML();
        $(calculator).after(newCalculatorHTML);
        const newCalculator = $(calculator).next()[0];

        // Get all inputs in the calculator and the new calculator
        const inputs = calculator.querySelectorAll('input');
        const newInputs = newCalculator.querySelectorAll('input');

        // Copy the value of each input to the corresponding input in the new calculator
        for (let i = 0; i < inputs.length; i++) {
            newInputs[i].value = inputs[i].value;
        }

        // Initialize the new calculator
        initializeCalculator(newCalculator);
    });

    // Calculate the tax for the initial values
    calculateTax();
}

// Get the "New Calculator" button
const newCalculatorButton = document.getElementById('newCalculatorButton');

// Add an event listener to the "New Calculator" button
newCalculatorButton.addEventListener('click', () => {
    // Create a new calculator
    const newCalculatorHTML = createCalculatorHTML();

    // Add the new calculator to the end of the calculators div
    const calculatorsDiv = document.getElementById('calculators');
    calculatorsDiv.insertAdjacentHTML('beforeend', newCalculatorHTML);

    // Get the new calculator
    const newCalculator = calculatorsDiv.lastElementChild;

    // Initialize the new calculator
    initializeCalculator(newCalculator);
});

// Initialize all existing calculators
const calculators = document.querySelectorAll('.calculator');
calculators.forEach(initializeCalculator);