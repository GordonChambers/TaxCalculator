const itemTypes = [
    'None',
    'Income', 
    'Deduction', 
    'Expense', 
    'Tax Offset', 
    'Tax Credit', 
    'Asset', 
    'Liability', 
    'Student Loan', 
    'Medicare Levy', 
    'Medicare Levy Surcharge', 
    'HELP Debt', 
    'SFSS Debt'
];

let a = [];

class LineItem {
    static lastId = 0;

    constructor(name='', value=0, type='None') {
        this.id = ++LineItem.lastId;
        this.htmlId = `line-item-${this.id}`;
        this.name = name;
        this.value = value;
        this.type = type; // income, deduction, expense, offset, credit, asset, liability, studentLoan
    }
}

class Calculator {
    static lastId = 0;

    constructor(name = '') {
        this.id = ++Calculator.lastId;
        this.htmlId = `calculator-${this.id}`;
        this.name = name;
        this.lineItems = {};
        this.tax = 0;
        this.netIncome = 0;
    }

    addLineItem(lineItem) {
        this.lineItems[lineItem.htmlId]= lineItem;
    }
    
    removeLineItem(lineItemhtmlId) {
        delete this.lineItems[lineItemhtmlId];
    }

    getLineItems() {
        return this.lineItems;
    }

    getLineItemsByType(type) {
        let lineItems = Object.values(this.lineItems).filter(item => item.type === type);
        return lineItems;
    }

    getTotalByType(type) {
        let items = this.getLineItemsByType(type);
        a.push(items); // for debugging only
        console.log(a[-1]); // for debugging only
        return items.reduce((total, item) => total + Number(item.value), 0);
    }

    getTotalIncome() {
        return this.getTotalByType('Income');
    }

    getTotalDeduction() {
        let totalDeduction = this.getTotalByType('Deduction');
        return totalDeduction;
    }

    calculateTaxableIncome() {
        let incomes = this.getTotalIncome();
        let deductions = this.getTotalDeduction();
        return incomes - deductions;
    }

    calculateTax() {
        let taxableIncome = this.calculateTaxableIncome();
        // Tax on this income 2023-24 rates
        // 0 – $18,200 Nil
        // $18,201 – $45,000 19c for each $1 over $18,200
        // $45,001 – $120,000 $5,092 plus 32.5c for each $1 over $45,000
        // $120,001 – $180,000 $29,467 plus 37c for each $1 over $120,000
        // $180,001 and over $51,667 plus 45c for each $1 over $180,000
        let taxRates = [
            { min: 0, max: 18200, rate: 0 },
            { min: 18201, max: 45000, rate: 0.19 },
            { min: 45001, max: 120000, rate: 0.325 },
            { min: 120001, max: 180000, rate: 0.37 },
            { min: 180001, max: Infinity, rate: 0.45 }
        ];

        // Calculate tax
        let tax = 0;
        for (let i = 0; i < taxRates.length; i++) {
            if (taxableIncome > taxRates[i].min) {
                let taxableAmount = Math.min(taxableIncome, taxRates[i].max) - taxRates[i].min;
                tax += taxableAmount * taxRates[i].rate;
            } else {
                break;
            };
        };

        // Round tax to the integer
        tax = Math.round(tax); 

        this.tax = tax;
        return tax;
    };

    calculateNetIncome() {
        let taxableIncome = this.calculateTaxableIncome();
        let tax = this.calculateTax();
        const netIncome = taxableIncome - tax;
        this.netIncome = netIncome;
        return netIncome;
    };
};