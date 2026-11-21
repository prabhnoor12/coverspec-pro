/**
 * CoverSpec Pro™ — Commercial Cyber Liability & Breach Exposure Calculator
 * Sizes recommended policy limit ($1M-$5M), estimated annual premium,
 * IBM/Ponemon-aligned breach exposure, and underwriting security readiness.
 */

(function () {
  'use strict';

  const INDUSTRIES = {
    healthcare: { name: 'Healthcare / Clinic / Dental (HIPAA)', riskMult: 1.65, costPerRec: 215, basePrem: 2400 },
    finance: { name: 'Financial / CPA / Wealth Advisory (FTC/SEC)', riskMult: 1.55, costPerRec: 195, basePrem: 2200 },
    saas: { name: 'B2B SaaS / Managed IT / Tech (SOC 2)', riskMult: 1.45, costPerRec: 180, basePrem: 2100 },
    legal: { name: 'Law Firm / Title & Escrow (Wire Fraud)', riskMult: 1.50, costPerRec: 185, basePrem: 2050 },
    construction: { name: 'Commercial Construction / GC (ACH Fraud)', riskMult: 1.15, costPerRec: 135, basePrem: 1450 },
    ecommerce: { name: 'E-Commerce / Retail (PCI-DSS)', riskMult: 1.25, costPerRec: 155, basePrem: 1650 },
    manufacturing: { name: 'Manufacturing / Logistics (Ransomware)', riskMult: 1.30, costPerRec: 150, basePrem: 1750 }
  };

  function fmtMoney(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const indSel = document.getElementById('cyIndustry');
    const revInput = document.getElementById('cyRevenue');
    const empInput = document.getElementById('cyEmployees');
    const recInput = document.getElementById('cyRecords');
    const secSel = document.getElementById('cySecurity');
    const limitSel = document.getElementById('cyLimit');

    function calculate() {
      const ind = INDUSTRIES[indSel.value] || INDUSTRIES.healthcare;
      const revM = Math.max(0.5, (parseFloat(revInput.value) || 5000000) / 1000000);
      const emps = Math.max(1, parseInt(empInput.value, 10) || 35);
      const recs = Math.max(100, parseInt(recInput.value, 10) || 25000);
      const secMult = parseFloat(secSel.value) || 1.0;
      const limitM = parseFloat(limitSel.value) || 2;

      // Limit scaling factor (1M=1.0, 2M=1.55, 3M=2.05, 5M=2.85)
      const limitFactor = limitM === 1 ? 1.0 : limitM === 2 ? 1.55 : limitM === 3 ? 2.05 : 2.85;

      // Actuarial premium model
      const revFactor = 1 + Math.log10(revM + 1) * 0.72;
      const recFactor = 1 + Math.log10(recs / 1000 + 1) * 0.28;
      const annualPrem = Math.max(1200, ind.basePrem * ind.riskMult * revFactor * recFactor * limitFactor * secMult);
      const monthlyPrem = annualPrem / 12;

      // Estimated Breach / Ransomware Financial Exposure (Notification + Legal + Downtime)
      const breachExposure = Math.min(12000000, Math.round((recs * ind.costPerRec * 0.22) + (emps * 4800) + (revM * 45000)));
      const recLimit = breachExposure > 2500000 ? '$5,000,000 Limit' : breachExposure > 1200000 ? '$2,000,000 – $3,000,000' : '$1,000,000 – $2,000,000';

      let readiness = 'Preferred (MFA + EDR Verified)';
      let rClass = 'green';
      if (secMult > 1.2) { readiness = 'High Decline Risk (Add MFA/EDR)'; rClass = 'amber'; }
      else if (secMult > 0.95) { readiness = 'Standard (MFA Active)'; rClass = 'cyan'; }

      document.getElementById('outAnnualPremium').textContent = fmtMoney(annualPrem);
      document.getElementById('outAnnualSub').textContent = `$${limitM}M Limit • ${ind.name}`;
      document.getElementById('outMonthlyCost').textContent = `${fmtMoney(monthlyPrem)} / mo`;
      document.getElementById('outRecLimit').textContent = recLimit;
      document.getElementById('outBreachExposure').textContent = fmtMoney(breachExposure);
      document.getElementById('outReadiness').textContent = readiness;
      document.getElementById('outReadiness').className = 'metric-val ' + rClass;
    }

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const p = btn.getAttribute('data-preset');
        if (p === 'clinic') { indSel.value = 'healthcare'; revInput.value = 4500000; empInput.value = 30; recInput.value = 25000; secSel.value = '0.85'; limitSel.value = '2'; }
        if (p === 'saas') { indSel.value = 'saas'; revInput.value = 8000000; empInput.value = 45; recInput.value = 100000; secSel.value = '0.85'; limitSel.value = '3'; }
        if (p === 'cpa') { indSel.value = 'finance'; revInput.value = 3000000; empInput.value = 22; recInput.value = 15000; secSel.value = '1.00'; limitSel.value = '2'; }
        if (p === 'gc') { indSel.value = 'construction'; revInput.value = 15000000; empInput.value = 55; recInput.value = 5000; secSel.value = '1.00'; limitSel.value = '2'; }
        calculate();
      });
    });

    [indSel, revInput, empInput, recInput, secSel, limitSel].forEach((el) => {
      el?.addEventListener('input', calculate);
      el?.addEventListener('change', calculate);
    });

    calculate();
  });
})();
