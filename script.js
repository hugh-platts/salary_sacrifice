function calculate() {
    // Get input values
    const grossSalary = parseFloat(document.getElementById('grossSalary').value) || 0;
    const vehicleCost = parseFloat(document.getElementById('vehicleCost').value) || 0;
    const employerNIC = parseFloat(document.getElementById('employerNIC').value) / 100 || 0;
    const taxRate = parseFloat(document.getElementById('taxRate').value) / 100 || 0;
    const employeeNIC = parseFloat(document.getElementById('employeeNIC').value) / 100 || 0;
    const duration = parseFloat(document.getElementById('duration').value) || 0;
    const additionalCosts = parseFloat(document.getElementById('additionalCosts').value) || 0;

    // Calculate values
    const totalSacrificeMonthly = vehicleCost + additionalCosts;
    const totalSacrificeTotal = totalSacrificeMonthly * duration;
    
    const taxSavingsMonthly = totalSacrificeMonthly * taxRate;
    const taxSavingsTotal = taxSavingsMonthly * duration;
    
    const nicSavingsMonthly = totalSacrificeMonthly * employeeNIC;
    const nicSavingsTotal = nicSavingsMonthly * duration;
    
    const reducedGross = grossSalary - totalSacrificeMonthly;
    const netSalary = reducedGross * (1 - taxRate - employeeNIC);

    // Format numbers
    const formatter = new Intl.NumberFormat('en-GB', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Update results
    document.getElementById('totalSacrificeMonthly').textContent = formatter.format(totalSacrificeMonthly);
    document.getElementById('totalSacrificeTotal').textContent = formatter.format(totalSacrificeTotal);
    
    document.getElementById('taxSavingsMonthly').textContent = formatter.format(taxSavingsMonthly);
    document.getElementById('taxSavingsTotal').textContent = formatter.format(taxSavingsTotal);
    
    document.getElementById('nicSavingsMonthly').textContent = formatter.format(nicSavingsMonthly);
    document.getElementById('nicSavingsTotal').textContent = formatter.format(nicSavingsTotal);
    
    document.getElementById('reducedGross').textContent = formatter.format(reducedGross);
    document.getElementById('netSalary').textContent = formatter.format(netSalary);
}