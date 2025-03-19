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
  // 1) Gather Inputs
  const grossSalaryAnnual = parseFloat(document.getElementById('grossSalary').value) || 0;
  const vehicleCost = parseFloat(document.getElementById('vehicleCost').value) || 0; // Monthly Finance Rental
  const vehicleValue = parseFloat(document.getElementById('vehicleValue').value) || 0; // P11D value
  const employerNICPercent = parseFloat(document.getElementById('employerNIC').value) || 0; // e.g. 13.8
  const employeeNICPercent = parseFloat(document.getElementById('employeeNIC').value) || 2;
  const bikRatePercent = parseFloat(document.getElementById('bikRate').value) || 2;
  const taxRateDecimal = (parseFloat(document.getElementById('taxRateInput').value) || currentTaxRate) / 100;
  
  // Optional
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
  
  // 2) Basic Monthly Costs
  const financeRental = vehicleCost; // monthly finance
  const maintenanceRental = maintenanceMonthly;
  const nrVAT = financeRental * 0.10; // 10% of Finance Rental
  const financeRentalTotal = financeRental + maintenanceRental + nrVAT; 
  const insuranceRate = insuranceMonthly;
  const employerGrossRental = financeRentalTotal + insuranceRate; // e.g. ~ 1,614.52

  // 3) Employer NI on the BIK portion
  // monthly BIK (value) = (vehicleValue * (bikRate / 100)) / 12
  const monthlyBIKValue = (vehicleValue * (bikRatePercent / 100)) / 12;
  const employerNIonBIK = monthlyBIKValue * (employerNICPercent / 100);

  // 4) Employer NI Savings Potential
  // As per your request: (Employer Gross Rental + Employer NI on BIK) * NIC%
  const employerNISavingsPotential = (employerGrossRental + employerNIonBIK) * (employerNICPercent / 100);

  // 5) Check NI Option (Yes, No, Percent)
  const niOption = document.querySelector('#niGroup .btn.active').textContent.trim();
  let appliedEmployerNISavings = 0;
  if (niOption === "Yes") {
    appliedEmployerNISavings = employerNISavingsPotential;
  } else if (niOption === "Percent") {
    const percentValue = parseFloat(document.getElementById('niPercent').value) || 0;
    appliedEmployerNISavings = employerNISavingsPotential * (percentValue / 100);
  } else {
    appliedEmployerNISavings = 0;
  }

  // 6) Gross Salary Sacrifice
  // Typically: Employer Gross Rental - (Any NI savings passed)
  const grossSalarySacrifice = employerGrossRental - appliedEmployerNISavings + employerNIonBIK;

  // 7) Employee's BIK Tax each month
  // = monthly BIK value * the employee's tax rate
  const bikTax = monthlyBIKValue * taxRateDecimal;

  // 8) Tax & NIC Savings
  const taxSaving = grossSalarySacrifice * taxRateDecimal;
  const niSaving = grossSalarySacrifice * (employeeNICPercent / 100);

  // 9) Overall Savings & Net Sacrifice
  const totalSaving = taxSaving + niSaving - bikTax;
  const netSalarySacrifice = grossSalarySacrifice - totalSaving;

  // 10) Cost Without Salary Sacrifice
  const costWithoutSacrifice = employerGrossRental;

  // 11) Annual Equivalents
  const multiplier = 12;

  // --- Formatting & Display ---
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const updateElement = (id, value) => {
    document.getElementById(id).textContent = formatter.format(value);
  };

  // Main Results
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

  // --- Breakdown Section ---
  updateElement('breakdownFinanceRental', financeRental);
  updateElement('breakdownMaintenanceRental', maintenanceRental);
  updateElement('breakdownNRVAT', nrVAT);
  updateElement('breakdownFRTotal', financeRentalTotal);
  updateElement('breakdownInsurance', insuranceRate);
  updateElement('breakdownEGR', employerGrossRental);

  // Employer NI on BIK
  updateElement('breakdownEmployerNI', employerNIonBIK);

  // Employer NI Savings = (Employer Gross Rental + Employer NI on BIK) * NIC%
  updateElement('breakdownEmployerNISavings', employerNISavingsPotential);

  updateElement('breakdownGSS', grossSalarySacrifice);
  updateElement('breakdownTaxSaving', taxSaving);
  updateElement('breakdownNISaving', niSaving);
  updateElement('breakdownBIKTax', bikTax);
  updateElement('breakdownTotalSaving', totalSaving);
  updateElement('breakdownNetSacrifice', netSalarySacrifice);
  updateElement('breakdownCostWithout', costWithoutSacrifice);

  // Display rates
  updateElement('breakdownTaxRate', taxRateDecimal * 100);
  updateElement('breakdownNIRate', employeeNICPercent);
  updateElement('breakdownBIKRate', bikRatePercent);

  // Employer NI Savings Passed
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
  // Get customer name and use it for the filename.
  const customerName = document.getElementById('customerName').value.trim();
  const fileName = customerName ? `${customerName}_quote.pdf` : 'quote.pdf';
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4');
  const marginLeft = 40;
  let currentY = 40;

  // HEADER SECTION
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Salary Sacrifice Quote", marginLeft, currentY);
  currentY += 30;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Customer: ${customerName || "N/A"}`, marginLeft, currentY);
  currentY += 20;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, marginLeft, currentY);
  currentY += 30;
  
  // Utility function: add a row if data is available.
  const addRow = (label, value, arr) => {
    if (value && value.trim() !== "") {
      arr.push([label, value.trim()]);
    }
  };

  // SECTION 1: General & Deal Information (in prioritized order)
  // Note: Adjust the IDs below to match your actual elements.
  const detailsData = [];
  addRow("Salary Sacrifice", 
         document.getElementById('salarySacrifice') ? document.getElementById('salarySacrifice').textContent : "", 
         detailsData);
  addRow("Salary Sacrifice Deal", 
         document.getElementById('salarySacrificeDeal') ? document.getElementById('salarySacrificeDeal').textContent : "", 
         detailsData);
  addRow("Salary", 
         document.getElementById('salary') ? document.getElementById('salary').value : "", 
         detailsData);
  addRow("DOB", 
         document.getElementById('dob') ? document.getElementById('dob').value : "", 
         detailsData);
  addRow("#Drivers", 
         document.getElementById('drivers') ? document.getElementById('drivers').value : "", 
         detailsData);
  addRow("Postcode", 
         document.getElementById('postcode') ? document.getElementById('postcode').value : "", 
         detailsData);
  // Insurance fields
  addRow("Insurance Provider", 
         document.getElementById('insuranceProvider') ? document.getElementById('insuranceProvider').value : "", 
         detailsData);
  addRow("Insurance Rate", 
         document.getElementById('insuranceRate') ? document.getElementById('insuranceRate').value : "", 
         detailsData);
  addRow("Insurance Reference", 
         document.getElementById('insuranceReference') ? document.getElementById('insuranceReference').value : "", 
         detailsData);
  addRow("Insurance Policy Issued", 
         document.getElementById('insurancePolicyIssued') ? document.getElementById('insurancePolicyIssued').value : "", 
         detailsData);
  // Early Termination value (skip header)
  addRow("Early Termination", 
         document.getElementById('earlyTermination') ? document.getElementById('earlyTermination').value : "", 
         detailsData);
  // Home Charger: include only Charger Cost
  addRow("Charger Cost", 
         document.getElementById('chargerCost') ? document.getElementById('chargerCost').value : "", 
         detailsData);
  // NR VAT (as a field, e.g. "10%")
  addRow("NR VAT", 
         document.getElementById('nrVAT') ? document.getElementById('nrVAT').value : "", 
         detailsData);
  
  const tableX = marginLeft;
  const col1Width = 200;
  const col2Width = 150;
  const rowHeight = 20;
  
  doc.setFont("helvetica", "normal");
  detailsData.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(tableX, currentY, col1Width + col2Width, rowHeight, 'F');
    }
    doc.text(row[0], tableX + 5, currentY + 14);
    doc.text(row[1], tableX + col1Width + 5, currentY + 14);
    currentY += rowHeight;
  });
  
  currentY += 20;
  
  // EXAMPLE: Calculation Summary Table
  doc.setFont("helvetica", "bold");
  doc.text("Calculation Summary", marginLeft, currentY);
  currentY += 20;
  
  // Build calculation summary data array. Adjust as needed.
  const summaryData = [
    ["Finance Rental Total", document.getElementById('breakdownFRTotal').textContent],
    ["Finance Rental", document.getElementById('breakdownFinanceRental').textContent],
    ["Maintenance Rental", document.getElementById('breakdownMaintenanceRental').textContent],
    ["NR VAT", document.getElementById('breakdownNRVAT').textContent],
    ["Insurance Rate", document.getElementById('breakdownInsurance').textContent],
    ["BIK Rate", document.getElementById('breakdownBIKRate').textContent + "%"],
    ["BIK Tax", document.getElementById('breakdownBIKTax').textContent],
    ["Tax Rate", document.getElementById('breakdownTaxRate').textContent + "%"],
    ["NI Rate", document.getElementById('breakdownNIRate').textContent + "%"],
    ["Employer NI Rate", document.getElementById('employerNIC').value + "%"],
    ["Employer NI", document.getElementById('breakdownEmployerNI').textContent],
    ["Employer NI Savings", document.getElementById('breakdownEmployerNISavings').textContent],
    ["Employer NI Savings Passed (%)", document.getElementById('breakdownEmployerNIPassedPercent').textContent + "%"],
    ["Employer NI Savings Passed", document.getElementById('breakdownEmployerNIPassed').textContent],
    ["Employer Gross Rental", document.getElementById('breakdownEGR').textContent],
    ["Gross Salary Sacrifice", document.getElementById('breakdownGSS').textContent],
    ["Tax Saving", document.getElementById('breakdownTaxSaving').textContent],
    ["NI Saving", document.getElementById('breakdownNISaving').textContent],
    ["Total Saving", document.getElementById('breakdownTotalSaving').textContent],
    ["Net Salary Sacrifice", document.getElementById('breakdownNetSacrifice').textContent]
  ];
  
  // Draw header row for Calculation Summary table.
  doc.setFillColor(200, 200, 200);
  doc.rect(tableX, currentY, col1Width + col2Width, rowHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Description", tableX + 5, currentY + 14);
  doc.text("Monthly (£)", tableX + col1Width + 5, currentY + 14);
  currentY += rowHeight;
  
  doc.setFont("helvetica", "normal");
  summaryData.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(tableX, currentY, col1Width + col2Width, rowHeight, 'F');
    }
    doc.text(row[0], tableX + 5, currentY + 14);
    doc.text(row[1], tableX + col1Width + 5, currentY + 14);
    currentY += rowHeight;
  });
  
  // Finally, save the PDF using the customer name.
  doc.save(fileName);
}

// Run initial calculations
calculateTaxRate();
calculate();
