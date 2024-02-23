let calculators = {};


// Function to create a calculator
function createCalculatorHTML(name = '') {
    // Get the number of calculators
    const calculatorCount = document.getElementById('calculators').children.length;

    // Create a new calculator object
    if (name === '') {
        name = `Calculator ${calculatorCount+1}`;
    }
    const calculatorObject = new Calculator(name);
    calculators[calculatorObject.htmlId] = calculatorObject;

    // Assign a color based on the number of calculators
    const colors = ['#E6E6FA', '#CCCCFF', '#ADD8E6', '#90EE90', '#FFFFE0', '#FFDAB9', '#FFC0CB'];
    const color = colors[calculatorCount % colors.length];

    // Create the calculator element
    const calculatorElement = document.createElement('div');
    calculatorElement.classList.add('calculator');
    calculatorElement.style.backgroundColor = color;
    calculatorElement.dataset.color = color;
    calculatorElement.id = calculatorObject.htmlId; // Set the id of the calculator
    
    // Create the calculator HTML
    calculatorElement.innerHTML = `
        <h2 class="calculator-title" contenteditable="true">${calculatorObject.name}</h2>
        <form>
            <div class="line-items">
            </div>
            <button type="button" class="add-line-item">Add Item</button>
        </form>
        <div class="output-area">
            <p id="total-tax-display">Total Tax: $<span class="total-tax-value">0</span></p>
            <p id="net-income-display">Net Income: $<span class="net-income-value">0</span></p>
        </div>
        <button type="button" class="remove-calculator btn btn-danger">Remove Calculator</button>
        <button type="button" class="copy-calculator">Duplicate</button>
    `;

    // Return the outer HTML of the calculator
    return [calculatorElement.outerHTML, calculatorObject, calculatorObject.htmlId];
};


// Function to prepend a new calculator on new-calculator-button click
$('#new-calculator-button').on('click', function () {
    $('#calculators').prepend(createCalculatorHTML()[0]);
    makeDraggable();
});

function removeCalculator(location) {
    // Get the calculator id
    const calculatorId = location.attr('id');

    // Remove the calculator object from the calculators object
    delete calculators[calculatorId];

    // Remove the calculator from the DOM
    location.remove();
    console.log(calculators);
};

// Function to remove a calculator
$(document).on('click', '.remove-calculator', function (event) {
    // Prevent form submission
    event.preventDefault();

    // Remove the calculator
    removeCalculator($(this).closest('.calculator'));
});

// Function to sort line items and add headings
function sortLineItems(container) {
    // Sort line items by type
    const items = container.find('.line-item').sort(function(a, b) {
        return $(a).find('.line-item-type').val().localeCompare($(b).find('.line-item-type').val());
    });

    // Remove all items and headings from the container
    container.find('.line-items, h3').remove();

    // Add items back to the container in sorted order
    let lastType = '';
    items.each(function() {
        const type = $(this).find('.line-item-type').val();
        if (type !== lastType) {
            // Add a heading for the new type
            container.append(`<h3>${type}</h3>`);
            lastType = type;
        }
        container.append(this);
    });
};

// Event handler for changes to the line item type
$(document).on('change', '.line-item-type', function (event) {
    // Prevent form submission
    event.preventDefault();

    // Sort line items and add headings
    sortLineItems($(this).closest('.line-items'));
});

function addLineItem(location, name='', value=0, type='None') {
    // create a new line item and object
    const lineItemObject = new LineItem(name, value, type);
    
    // Associate the line item with the calculator
    const calculatorId = location.closest('.calculator').attr('id');
    const calculatorObject = calculators[calculatorId];
    calculatorObject.addLineItem(lineItemObject);

    const dropdownOptions = itemTypes.map(itemType => 
        `<option value="${itemType}" ${itemType === type ? 'selected' : ''}>${itemType}</option>`
    ).join('');
    const template = `
        <div class="line-item" id="${lineItemObject.htmlId}">
            <input type="text" class="line-item-name line-item-user-input" name="name" placeholder="Description" value="${name}">
            <input type="text" class="line-item-value line-item-user-input" name="value" value="${Number(value).toFixed(2)}" min="0" pattern="^\d+(.\d{1,2})?$" required>
            <select class="line-item-type line-item-user-input" name="type">
            ${dropdownOptions}
            </select>
            <button type="button" class="remove-line-item">x</button>
        </div>
    `;

    // Add the new line item to the specified location
    const newItem = $(template);
    location.append(newItem);

    // Sort line items and add headings
    sortLineItems(location);
};

// Function to add a line item
$(document).on('click', '.add-line-item', function (event) {
    // Prevent form submission
    event.preventDefault();

    // Add a new line item
    addLineItem($(this).siblings('.line-items'));
});

function removeLineItem(location) {
    // Get the line item object id
    const lineItemhtmlId = location.attr('id');

    // Get the calculator id
    const calculatorId = location.closest('.calculator').attr('id');
    const calculatorObject = calculators[calculatorId];

    // Remove the line item object from the calculator
    calculatorObject.removeLineItem(lineItemhtmlId);

    // declare parent variable to be used in the sortLineItems function
    const parent = location.parent();

    // Remove the line item from the DOM
    location.remove();

    // Sort line items and change headings
    sortLineItems(parent);
}

// Function to remove a line item
$(document).on('click', '.remove-line-item', function (event) {
    // Prevent form submission
    event.preventDefault();

    // Remove the line item
    removeLineItem($(this).parent('.line-item'));
});

function calculateAndUpdateTax(calculatorhtmlId) {
    const calculatorObject = calculators[calculatorhtmlId];

    const tax = calculatorObject.calculateTax();
    const netIncome = calculatorObject.calculateNetIncome();

    // Update the total tax and net income display
    const totalTaxValueElement = $(`#${calculatorhtmlId} .total-tax-value`);
    totalTaxValueElement.text(tax);

    const netIncomeValueElement = $(`#${calculatorhtmlId} .net-income-value`);
    netIncomeValueElement.text(netIncome);

    // console.log('tax', tax, 'netIncome', netIncome);
}

// listeners that detect changes to the line items and parse them to the line item object
$(document).on('input', '.line-item-user-input', function (event) {
    // Prevent form submission
    event.preventDefault();

    // Get the line item id
    const lineItemId = $(this).closest('.line-item').attr('id');
    const calculatorId = $(this).closest('.calculator').attr('id');
    const lineItemObject = calculators[calculatorId].lineItems[lineItemId];
    lineItemObject[this.name] = $(this).val();
    calculateAndUpdateTax(calculatorId);
});

// Move to next input field when enter is pressed
$(document).on('keydown', 'input', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        var inputs = $(this).closest('form').find('.line-item-user-input');
        inputs.eq(inputs.index(this) + 1).focus();
    }
});

// Add event listener to duplicate button
$(document).on('click', '.copy-calculator', function() {
    // Get the current calculator element
    let calculatorElement = $(this).closest('.calculator');

    // Get the current calculator id
    let calculatorId = calculatorElement.attr("id");

    // Get the current calculator object
    let calculatorObject = calculators[calculatorId];

    
    // Create the calculator HTML
    let newCalculatorArray = createCalculatorHTML(calculatorObject.name + ' copy');
    let newCalculatorHTML = newCalculatorArray[0];
    let newCalculatorObject = newCalculatorArray[1];
    let newCalculatorId = newCalculatorArray[2];

    // Add the new calculator HTML to the page
    calculatorElement.before(newCalculatorHTML);
    makeDraggable();


    // TODO: make a system to duplicate line items and show them in the new calculator
    // Duplicate the line items of the calculator
    // newCalculatorObject.lineItems = [...calculatorObject.lineItems];

    let originalLineItems = Object.values(calculatorObject.lineItems);

    for (let i = 0; i < originalLineItems.length; i++) {
        let originalLineItem = originalLineItems[i];
        addLineItem($(`#${newCalculatorId} .line-items`), originalLineItem.name, originalLineItem.value, originalLineItem.type);
        
    };

    // console.log("old item list", calculatorObject.lineItems);
    // console.log("new item list", newCalculatorObject.lineItems);
});

// Make the calculators draggable
// $( function() {
//     $(".calculator").draggable({
//         cancel: "input,textarea,button,select,option, .calculator-title", // Cancel dragging when these elements are clicked
//     });

//     // Disable dragging when the title is focused
//     $(document).on('mousedown', '.calculator-title', function (e) {
//         e.stopImmediatePropagation();
//     });
// } );

function makeDraggable() {
    $(".calculator").draggable({
        cancel: "input,textarea,button,select,option, .calculator-title", // Cancel dragging when these elements are clicked
    });

    // Disable dragging when the title is focused
    $(document).on('mousedown', '.calculator-title', function (e) {
        e.stopImmediatePropagation();
    });
};