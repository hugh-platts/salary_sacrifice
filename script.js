function calculate() {
    // Get input values (assume gross salary is entered as an annual figure)
    const grossSalaryAnnual = parseFloat(document.getElementById('grossSalary').value) || 0;
    const vehicleCost = parseFloat(document.getElementById('vehicleCost').value) || 0; // monthly cost
    const taxRate = (parseFloat(document.getElementById('taxRate').value) || 0) / 100;
    const employeeNIC = (parseFloat(document.getElementById('employeeNIC').value) || 0) / 100;
    const duration = parseFloat(document.getElementById('duration').value) || 0; // in months
    const additionalCosts = parseFloat(document.getElementById('additionalCosts').value) || 0;

    // Calculate monthly values from annual gross salary
    const grossSalaryMonthly = grossSalaryAnnual / 12;
    
    // Salary sacrifice is provided as a monthly value.
    const totalSacrificeMonthly = vehicleCost + additionalCosts;
    const totalSacrificeAnnual = totalSacrificeMonthly * 12;
    
    // Calculate reduced gross salary after sacrifice
    const reducedGrossMonthly = grossSalaryMonthly - totalSacrificeMonthly;
    const reducedGrossAnnual = grossSalaryAnnual - totalSacrificeAnnual;
    
    // Tax calculations (monthly and annual)
    const originalTaxMonthly = grossSalaryMonthly * taxRate;
    const newTaxMonthly = reducedGrossMonthly * taxRate;
    const taxSavingMonthly = originalTaxMonthly - newTaxMonthly;
    
    const originalTaxAnnual = grossSalaryAnnual * taxRate;
    const newTaxAnnual = reducedGrossAnnual * taxRate;
    const taxSavingAnnual = originalTaxAnnual - newTaxAnnual;
    
    // NIC calculations (monthly and annual)
    const originalNICMonthly = grossSalaryMonthly * employeeNIC;
    const newNICMonthly = reducedGrossMonthly * employeeNIC;
    const nicSavingMonthly = originalNICMonthly - newNICMonthly;
    
    const originalNICAnnual = grossSalaryAnnual * employeeNIC;
    const newNICAnnual = reducedGrossAnnual * employeeNIC;
    const nicSavingAnnual = originalNICAnnual - newNICAnnual;
    
    // Net salary calculations (monthly and annual)
    const netSalaryMonthly = reducedGrossMonthly - newTaxMonthly - newNICMonthly;
    const netSalaryAnnual = reducedGrossAnnual - newTaxAnnual - newNICAnnual;
    
    // Total sacrifice over the selected lease duration (in months)
    const totalSacrificeOverDuration = totalSacrificeMonthly * duration;
    const taxSavingsOverDuration = taxSavingMonthly * duration;
    const nicSavingsOverDuration = nicSavingMonthly * duration;
    
    // Formatter for currency (two decimal places)
    const formatter = new Intl.NumberFormat('en-GB', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Update the main results section (monthly and over the chosen duration)
    document.getElementById('totalSacrificeMonthly').textContent = formatter.format(totalSacrificeMonthly);
    document.getElementById('totalSacrificeTotal').textContent = formatter.format(totalSacrificeOverDuration);
    
    document.getElementById('taxSavingsMonthly').textContent = formatter.format(taxSavingMonthly);
    document.getElementById('taxSavingsTotal').textContent = formatter.format(taxSavingsOverDuration);
    
    document.getElementById('nicSavingsMonthly').textContent = formatter.format(nicSavingMonthly);
    document.getElementById('nicSavingsTotal').textContent = formatter.format(nicSavingsOverDuration);
    
    document.getElementById('reducedGross').textContent = formatter.format(reducedGrossMonthly);
    document.getElementById('netSalary').textContent = formatter.format(netSalaryMonthly);
    
    // Update the detailed breakdown section to show "Monthly / Annual" values
    document.getElementById('breakdownOriginal').textContent = 
        formatter.format(grossSalaryMonthly) + " / " + formatter.format(grossSalaryAnnual);
    document.getElementById('breakdownSacrifice').textContent = 
        formatter.format(totalSacrificeMonthly) + " / " + formatter.format(totalSacrificeAnnual);
    document.getElementById('breakdownReduced').textContent = 
        formatter.format(reducedGrossMonthly) + " / " + formatter.format(reducedGrossAnnual);
    document.getElementById('breakdownOriginalTax').textContent = 
        formatter.format(originalTaxMonthly) + " / " + formatter.format(originalTaxAnnual);
    document.getElementById('breakdownTaxSaving').textContent = 
        formatter.format(taxSavingMonthly) + " / " + formatter.format(taxSavingAnnual);
    document.getElementById('breakdownOriginalNIC').textContent = 
        formatter.format(originalNICMonthly) + " / " + formatter.format(originalNICAnnual);
    document.getElementById('breakdownNicSaving').textContent = 
        formatter.format(nicSavingMonthly) + " / " + formatter.format(nicSavingAnnual);
    document.getElementById('breakdownNetCalc').textContent = 
        formatter.format(netSalaryMonthly) + " / " + formatter.format(netSalaryAnnual);
}
