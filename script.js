// --- Tax Band Setup ---
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

// Update tax rate based on gross salary and region (for initial guidance)
function calculateTaxRate() {
  const gross = parseFloat(document.getElementById('grossSalary').value) || 0;
  const region = document.getElementById('taxRegion').value;
  const bands = TAX_BANDS[region];
  
  const band = bands.find(b => gross <= b.max) || bands[bands.length - 1];
  currentTaxRate = band.rate;
  currentTaxBand = band.name;
  
  document.getElementById('taxRateInput').value = currentTaxRate;
  document.getElementById('taxBandDisplay').textContent = `(${currentTaxBand})`;
}

// --- Button Group Event Listeners ---
document.querySelectorAll('.btn-group .btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const parent = this.parentNode;
    Array.from(parent.children).forEach(child => child.classList.remove('active'));
    this.classList.add('active');
    
    // Toggle NI Percentage input if "Percent" is selected
    if (parent.id === 'niGroup' && this.textContent.trim() === 'Percent') {
      document.getElementById('niPercent').classList.remove('hidden');
    } else if (parent.id === 'niGroup') {
      document.getElementById('niPercent').classList.add('hidden');
    }
    
    // Toggle Insurance input visibility
    if (parent.id === 'insuranceToggle') {
      const insInput = document.getElementById('insuranceMonthly');
      if (this.textContent.trim() === 'Yes') {
        insInput.classList.remove('hidden');
      } else {
        insInput.classList.add('hidden');
        insInput.value = '';
      }
    }
    
    // Toggle Maintenance input visibility
    if (parent.id === 'maintenanceToggle') {
      const mainInput = document.getElementById('maintenanceMonthly');
      if (this.textContent.trim() === 'Yes') {
        mainInput.classList.remove('hidden');
      } else {
        mainInput.classList.add('hidden');
        mainInput.value = '';
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

// --- Main Calculation ---
function calculate() {
  // Retrieve inputs
  const grossSalaryAnnual = parseFloat(document.getElementById('grossSalary').value) || 0;
  const vehicleCost = parseFloat(document.getElementById('vehicleCost').value) || 0; // Monthly Finance Rental
  // Here, vehicleValue now represents the P11D value.
  const vehicleValue = parseFloat(document.getElementById('vehicleValue').value) || 0;
  const employerNICPercent = parseFloat(document.getElementById('employerNIC').value) || 0;
  const employeeNICPercent = (parseFloat(document.getElementById('employeeNIC').value) || 2);
  const bikRatePercent = (parseFloat(document.getElementById('bikRate').value) || 2);
  const taxRateDecimal = (parseFloat(document.getElementById('taxRateInput').value) || currentTaxRate) / 100;
  
  // Optional inputs
  const maintenanceMonthly = parseFloat(document.getElementById('maintenanceMonthly').value) || 0;
  const insuranceMonthly = parseFloat(document.getElementById('insuranceMonthly').value) || 0;
  
  // One-Time Fees
  const docFee = parseFloat(document.getElementById('docFee').value) || 0;
  const regFee = parseFloat(document.getElementById('regFee').value) || 0;
  const feesTotal = docFee + regFee;
  
  // Lease duration (months) – for informational purposes
  let leaseDuration = 36;
  const activeLeaseBtn = document.querySelector('#leaseDurationGroup .btn.active');
  if (activeLeaseBtn?.dataset.months) {
    leaseDuration = parseInt(activeLeaseBtn.dataset.months);
  } else if (document.getElementById('customDuration').value) {
    leaseDuration = parseInt(document.getElementById('customDuration').value);
  }
  
  // --- Benefit Components (Monthly) ---
  const financeRental = vehicleCost; // Finance Rental
  const maintenanceRental = maintenanceMonthly; // Maintenance Rental
  const nrVAT = financeRental * 0.10; // 10% of Finance Rental
  const financeRentalTotal = financeRental + maintenanceRental + nrVAT; // Finance Rental Total
  const insuranceRate = insuranceMonthly; // Insurance Rate
  const employerGrossRental = financeRentalTotal + insuranceRate; // Employer Gross Rental
  
  // --- Employer NIC Calculation ---
  const niOption = document.querySelector('#niGroup .btn.active').textContent.trim();
  let appliedEmployerNISavings = 0;
  if (niOption === "Yes") {
    appliedEmployerNISavings = employerGrossRental * (employerNICPercent / 100);
  } else if (niOption === "Percent") {
    const percentValue = parseFloat(document.getElementById('niPercent').value) || 0;
    appliedEmployerNISavings = employerGrossRental * (percentValue / 100);
  } else { // "No"
    appliedEmployerNISavings = 0;
  }
  const employerNI = employerGrossRental * 0.01123; // Employer NI cost
  
  // --- Gross Salary Sacrifice ---
  const grossSalarySacrifice = employerGrossRental - appliedEmployerNISavings + employerNI;
  
  // --- Tax & NIC Savings ---
  const taxSaving = grossSalarySacrifice * taxRateDecimal;
  const niSaving = grossSalarySacrifice * (employeeNICPercent / 100);
  
  // --- BIK Tax ---
  // New calculation: Monthly BIK Tax = (P11D value * (BIK Rate/100) * taxRateDecimal) / 12
  const bikTax = (vehicleValue * (bikRatePercent / 100) * taxRateDecimal) / 12;
  
  // --- Total Saving & Net Salary Sacrifice ---
  const totalSaving = taxSaving + niSaving - bikTax;
  const netSalarySacrifice = grossSalarySacrifice - totalSaving;
  
  // --- Cost Without Salary Sacrifice ---
  const costWithoutSacrifice = employerGrossRental;
  
  // --- Annual Equivalents ---
  const multiplier = 12;
  
  // --- Update Main Results ---
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  const updateElement = (id, value) => {
    document.getElementById(id).textContent = formatter.format(value);
  };
  
  updateElement('grossSacrificeMonthly', grossSalarySacrifice);
  updateElement('grossSacrificeAnnual', grossSalarySacrifice * multiplier);
  
  updateElement('taxSavingMonthly', taxSaving);
  updateElement('taxSavingAnnual', taxSaving * multiplier);
  
  updateElement('niSavingMonthly', niSaving);
  updateElement('niSavingAnnual', niSaving * multiplier);
  
  updateElement('bikTaxMonthly', bikTax);
  updateElement('bikTaxAnnual', bikTax * multiplier);
  
  updateElement('totalSavingMonthly', totalSaving);
  updateElement('totalSavingAnnual', totalSaving * multiplier);
  
  updateElement('netSacrificeMonthly', netSalarySacrifice);
  updateElement('netSacrificeAnnual', netSalarySacrifice * multiplier);
  
  updateElement('costWithoutSacrificeMonthly', costWithoutSacrifice);
  updateElement('costWithoutSacrificeAnnual', costWithoutSacrifice * multiplier);
  
  updateElement('feesTotal', feesTotal);
  
  // --- Update Breakdown Section ---
  updateElement('breakdownFinanceRental', financeRental);
  updateElement('breakdownMaintenanceRental', maintenanceRental);
  updateElement('breakdownNRVAT', nrVAT);
  updateElement('breakdownFRTotal', financeRentalTotal);
  updateElement('breakdownInsurance', insuranceRate);
  updateElement('breakdownEGR', employerGrossRental);
  updateElement('breakdownEmployerNISavings', appliedEmployerNISavings);
  updateElement('breakdownEmployerNI', employerNI);
  updateElement('breakdownGSS', grossSalarySacrifice);
  updateElement('breakdownTaxSaving', taxSaving);
  updateElement('breakdownNISaving', niSaving);
  updateElement('breakdownBIKTax', bikTax);
  updateElement('breakdownTotalSaving', totalSaving);
  updateElement('breakdownNetSacrifice', netSalarySacrifice);
  updateElement('breakdownCostWithout', costWithoutSacrifice);
  
  // Update rates in breakdown display
  updateElement('breakdownTaxRate', taxRateDecimal * 100);
  updateElement('breakdownNIRate', employeeNICPercent);
  updateElement('breakdownBIKRate', bikRatePercent);
  
  // --- Update Employer NI Savings Passed Breakdown (Conditional) ---
  if (niOption === "Yes") {
    updateElement('breakdownEmployerNIPassedPercent', 100);
    updateElement('breakdownEmployerNIPassed', appliedEmployerNISavings);
    document.getElementById('breakdownEmployerNIPassedRow').classList.remove('hidden');
  } else if (niOption === "Percent") {
    const percentValue = parseFloat(document.getElementById('niPercent').value) || 0;
    updateElement('breakdownEmployerNIPassedPercent', percentValue);
    updateElement('breakdownEmployerNIPassed', appliedEmployerNISavings);
    document.getElementById('breakdownEmployerNIPassedRow').classList.remove('hidden');
  } else {
    document.getElementById('breakdownEmployerNIPassedRow').classList.add('hidden');
  }
}

// --- Save as PDF Function ---
function savePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // For this example, we’ll print the main container
  // Adjust as needed to format the PDF quote
  doc.html(document.querySelector('.container'), {
    callback: function (doc) {
      doc.save('quote.pdf');
    },
    x: 10,
    y: 10
  });
}

// Run initial calculations
calculateTaxRate();
calculate();
