// Tax Configuration
let currentTaxRate = 20;
let currentTaxBand = 'Basic rate';
const TAX_BANDS = {
  uk: [
    { max: 12570, rate: 0, name: 'Personal Allowance' },
    { max: 50270, rate: 20, name: 'Basic rate' },
    { max: 125140, rate: 40, name: 'Higher rate' },
    { max: Infinity, rate: 45, name: 'Additional rate' }
  ],
  scotland: [
    { max: 12570, rate: 0, name: 'Personal Allowance' },
    { max: 14876, rate: 19, name: 'Starter rate' },
    { max: 26561, rate: 20, name: 'Scottish basic rate' },
    { max: 43662, rate: 21, name: 'Intermediate rate' },
    { max: 75000, rate: 42, name: 'Higher rate' },
    { max: 125140, rate: 45, name: 'Advanced rate' },
    { max: Infinity, rate: 48, name: 'Top rate' }
  ]
};

// Update tax rate based on region and gross salary
function calculateTaxRate() {
  const gross = parseFloat(document.getElementById('grossSalary').value) || 0;
  const region = document.getElementById('taxRegion').value;
  const bands = TAX_BANDS[region];
  
  const band = bands.find(b => gross <= b.max) || bands[bands.length - 1];
  currentTaxRate = band.rate;
  currentTaxBand = band.name;
  
  // Update the tax rate input and band display
  document.getElementById('taxRateInput').value = currentTaxRate;
  document.getElementById('taxBandDisplay').textContent = `(${currentTaxBand})`;
}

// Event listeners for button groups
document.querySelectorAll('.btn-group .btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const parent = this.parentNode;
    Array.from(parent.children).forEach(child => child.classList.remove('active'));
    this.classList.add('active');
    
    // Toggle NI Percentage input visibility if "Percent" is selected
    if (parent.id === 'niGroup' && this.textContent.trim() === 'Percent') {
      document.getElementById('niPercent').classList.remove('hidden');
    } else if (parent.id === 'niGroup') {
      document.getElementById('niPercent').classList.add('hidden');
    }
    
    // Toggle Insurance input visibility
    if (parent.id === 'insuranceToggle') {
      const insuranceInput = document.getElementById('insuranceMonthly');
      if (this.textContent.trim() === 'Yes') {
        insuranceInput.classList.remove('hidden');
      } else {
        insuranceInput.classList.add('hidden');
        insuranceInput.value = '';
      }
    }
    
    // Toggle Maintenance input visibility
    if (parent.id === 'maintenanceToggle') {
      const maintenanceInput = document.getElementById('maintenanceMonthly');
      if (this.textContent.trim() === 'Yes') {
        maintenanceInput.classList.remove('hidden');
      } else {
        maintenanceInput.classList.add('hidden');
        maintenanceInput.value = '';
      }
    }
    
    // Show custom lease duration input if "Custom" is clicked
    if (parent.id === 'leaseDurationGroup') {
      if (this.id === 'customDurationBtn') {
        document.getElementById('customDuration').classList.remove('hidden');
      } else {
        document.getElementById('customDuration').classList.add('hidden');
      }
    }
  });
});

// Main Calculation Function
function calculate() {
  // Retrieve input values
  const grossSalary = parseFloat(document.getElementById('grossSalary').value) || 0; // Annual
  const vehicleCost = parseFloat(document.getElementById('vehicleCost').value) || 0; // Monthly
  const employerNIC = parseFloat(document.getElementById('employerNIC').value) / 100 || 0;
  
  // Use tax rate from input (allowing manual override)
  const taxRate = parseFloat(document.getElementById('taxRateInput').value) / 100 || (currentTaxRate / 100);
  
  // Employee NIC (%) from input
  const employeeNIC = (parseFloat(document.getElementById('employeeNIC').value) || 2) / 100;
  
  // BIK Rate (%) from input
  const bikRate = (parseFloat(document.getElementById('bikRate').value) || 2) / 100;
  
  // Compute monthly BIK amount based on vehicle cost
  const bikMonthly = vehicleCost * bikRate;
  
  // Determine lease duration (in months)
  let duration = 36;
  const activeDurationBtn = document.querySelector('#leaseDurationGroup .btn.active');
  if (activeDurationBtn?.dataset.months) {
    duration = parseInt(activeDurationBtn.dataset.months);
  } else if (document.getElementById('customDuration').value) {
    duration = parseInt(document.getElementById('customDuration').value);
  }
  
  // Documentation and Registration fees (editable)
  const docFee = parseFloat(document.getElementById('docFee').value) || 0;
  const regFee = parseFloat(document.getElementById('regFee').value) || 0;
  
  // Calculate one-time fees (not spread over 12 months)
  const feesTotal = docFee + regFee;
  
  // Insurance: monthly input if included
  const includeInsurance = document.querySelector('#insuranceToggle .btn.active').textContent.trim() === 'Yes';
  const insuranceMonthly = includeInsurance ? (parseFloat(document.getElementById('insuranceMonthly').value) || 0) : 0;
  
  // Maintenance: monthly input if included
  const includeMaintenance = document.querySelector('#maintenanceToggle .btn.active').textContent.trim() === 'Yes';
  const maintenanceMonthly = includeMaintenance ? (parseFloat(document.getElementById('maintenanceMonthly').value) || 0) : 0;
  
  // Base monthly sacrifice calculation:
  // vehicle cost + (docFee+regFee spread over 12) + insurance + maintenance
  let totalMonthlyCost = vehicleCost + ((docFee + regFee) / 12) + insuranceMonthly + maintenanceMonthly;
  
  // Early Termination Insurance adjustment
  const terminationInsurance = parseFloat(document.getElementById('terminationInsurance').value) / 100 || 0;
  totalMonthlyCost += totalMonthlyCost * terminationInsurance;
  
  // NI Adjustment based on selected option
  const niOption = document.querySelector('#niGroup .btn.active').textContent.trim();
  let niAdjustment = 0;
  if (niOption === 'Percent') {
    const niPercent = parseFloat(document.getElementById('niPercent').value) / 100 || 0;
    niAdjustment = totalMonthlyCost * niPercent;
  } else if (niOption === 'No') {
    niAdjustment = 0;
  } else {
    // Default: "Yes"
    niAdjustment = 0;
  }
  totalMonthlyCost -= niAdjustment;
  
  // ---------------------------
  // Breakdown Calculations (Annual & Monthly)
  // ---------------------------
  const monthlySalarySacrifice = totalMonthlyCost; // Already monthly
  const annualSalarySacrifice = monthlySalarySacrifice * 12;
  
  // Reduced Gross Salary (Annual) = Annual Gross - Annual Sacrifice + (BIK monthly * 12)
  const reducedGrossAnnual = grossSalary - annualSalarySacrifice + (bikMonthly * 12);
  const monthlyReducedGross = reducedGrossAnnual / 12;
  
  // Tax Calculations (Annual)
  const originalTaxAnnual = grossSalary * taxRate;
  const newTaxAnnual = reducedGrossAnnual * taxRate;
  const taxSavingsAnnual = originalTaxAnnual - newTaxAnnual;
  const monthlyTaxSavings = taxSavingsAnnual / 12;
  
  // NIC Calculations (Annual)
  const originalNICAnnual = grossSalary * employeeNIC;
  const newNICAnnual = reducedGrossAnnual * employeeNIC;
  const nicSavingsAnnual = originalNICAnnual - newNICAnnual;
  const monthlyNicSavings = nicSavingsAnnual / 12;
  
  // Net Salary (Annual)
  const netSalaryAnnual = reducedGrossAnnual - newTaxAnnual - newNICAnnual;
  const monthlyNetSalary = netSalaryAnnual / 12;
  
  // ---------------------------
  // Update Main Results
  // ---------------------------
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  const updateElement = (id, value) => {
    document.getElementById(id).textContent = formatter.format(value);
  };
  
  updateElement('totalSacrificeMonthly', monthlySalarySacrifice);
  updateElement('totalSacrificeTotal', annualSalarySacrifice);
  updateElement('taxSavingsMonthly', monthlyTaxSavings);
  updateElement('taxSavingsTotal', taxSavingsAnnual);
  updateElement('nicSavingsMonthly', monthlyNicSavings);
  updateElement('nicSavingsTotal', nicSavingsAnnual);
  updateElement('reducedGross', monthlyReducedGross);
  updateElement('reducedGrossAnnual', reducedGrossAnnual);
  updateElement('netSalary', monthlyNetSalary);
  updateElement('netSalaryAnnual', netSalaryAnnual);
  updateElement('feesTotal', feesTotal);
  
  // ---------------------------
  // Update Breakdown Section
  // ---------------------------
  // Original Gross Salary
  updateElement('breakdownOriginalMonthly', grossSalary / 12);
  updateElement('breakdownOriginalAnnual', grossSalary);
  
  // Salary Sacrifice
  updateElement('breakdownSacrificeMonthly', monthlySalarySacrifice);
  updateElement('breakdownSacrificeAnnual', annualSalarySacrifice);
  
  // Reduced Gross Salary
  updateElement('breakdownReducedMonthly', monthlyReducedGross);
  updateElement('breakdownReducedAnnual', reducedGrossAnnual);
  
  // Tax Deduction
  updateElement('breakdownOriginalTaxMonthly', originalTaxAnnual / 12);
  updateElement('breakdownOriginalTaxAnnual', originalTaxAnnual);
  
  // Tax Savings
  updateElement('breakdownTaxSavingMonthly', monthlyTaxSavings);
  updateElement('breakdownTaxSavingAnnual', taxSavingsAnnual);
  
  // NIC Deduction
  updateElement('breakdownOriginalNICMonthly', originalNICAnnual / 12);
  updateElement('breakdownOriginalNICAnnual', originalNICAnnual);
  
  // NIC Savings
  updateElement('breakdownNicSavingMonthly', monthlyNicSavings);
  updateElement('breakdownNicSavingAnnual', nicSavingsAnnual);
  
  // Net Salary Calculation
  updateElement('breakdownNetCalcMonthly', monthlyNetSalary);
  updateElement('breakdownNetCalcAnnual', netSalaryAnnual);
}

// Run initial calculations
calculateTaxRate();
calculate();
