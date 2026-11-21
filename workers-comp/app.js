/**
 * CoverSpec Pro™ — Commercial Workers' Compensation & EMR Actuarial Engine
 * Formula: Annual Premium = (Annual Payroll / 100) × NCCI Class Rate × State Factor × EMR
 */

(function () {
  'use strict';

  // Baseline manual rates per $100 of payroll (industry actuarial averages)
  const NCCI_CLASSES = {
    '5190': { name: '5190 — Electrical Wiring (Commercial)', rate: 2.85, risk: 'Moderate-High' },
    '5183': { name: '5183 — Plumbing / HVAC Mechanical', rate: 3.65, risk: 'Moderate-High' },
    '5551': { name: '5551 — Commercial Roofing', rate: 14.80, risk: 'High Hazard' },
    '5403': { name: '5403 — Commercial Carpentry / Framing', rate: 7.40, risk: 'High' },
    '5645': { name: '5645 — Residential / Light Carpentry', rate: 6.20, risk: 'High' },
    '7219': { name: '7219 — Commercial Trucking / Hauling', rate: 8.95, risk: 'High' },
    '9079': { name: '9079 — Restaurant / Commercial Kitchen', rate: 2.15, risk: 'Moderate' },
    '8832': { name: '8832 — Medical / Dental Practice Office', rate: 0.58, risk: 'Low' },
    '8810': { name: '8810 — Clerical / Corporate Office', rate: 0.19, risk: 'Low' },
    '3632': { name: '3632 — Machine Shop / Metal Fabrication', rate: 4.10, risk: 'Moderate-High' }
  };

  const STATE_FACTORS = {
    TX: { name: 'Texas (TDI / Optional Non-Subscriber)', mult: 0.78 },
    CA: { name: 'California (WCIRB — High Medical Cost)', mult: 1.48 },
    FL: { name: 'Florida (NCCI — Mandatory 1+ Construction)', mult: 1.05 },
    NY: { name: 'New York (NYCIRB — High Indemnity)', mult: 1.42 },
    NJ: { name: 'New Jersey (NJCRIB)', mult: 1.24 },
    IL: { name: 'Illinois (NCCI)', mult: 1.15 },
    GA: { name: 'Georgia (NCCI)', mult: 0.96 },
    PA: { name: 'Pennsylvania (PCRB)', mult: 1.12 },
    OH: { name: 'Ohio (Monopolistic State Fund BWC)', mult: 0.88 },
    WA: { name: 'Washington (Monopolistic L&I)', mult: 1.08 }
  };

  function fmtMoney(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const classSel = document.getElementById('wcClassCode');
    const stateSel = document.getElementById('wcState');
    const payrollInput = document.getElementById('wcPayroll');
    const emrRange = document.getElementById('wcEmr');
    const emrReadout = document.getElementById('wcEmrReadout');
    const paygoSel = document.getElementById('wcPaygo');

    function calculate() {
      const cls = NCCI_CLASSES[classSel.value] || NCCI_CLASSES['5190'];
      const st = STATE_FACTORS[stateSel.value] || STATE_FACTORS.TX;
      const payroll = Math.max(25000, parseFloat(payrollInput.value) || 450000);
      const emr = parseFloat(emrRange.value) || 1.0;
      const scheduleDiscount = paygoSel.value === 'preferred' ? 0.92 : 1.0;

      if (emrReadout) emrReadout.textContent = emr.toFixed(2) + (emr < 1 ? ' (Credit)' : emr > 1 ? ' (Debit)' : ' (Baseline)');

      const effectiveRate = cls.rate * st.mult * scheduleDiscount;
      const basePremium = (payroll / 100) * effectiveRate;
      const annualPremium = Math.max(750, basePremium * emr);
      const monthlyCost = annualPremium / 12;
      const emrDelta = annualPremium - basePremium;

      document.getElementById('outAnnualPremium').textContent = fmtMoney(annualPremium);
      document.getElementById('outAnnualSub').textContent = `${cls.name} • ${st.name}`;
      document.getElementById('outMonthlyCost').textContent = `${fmtMoney(monthlyCost)} / mo`;
      document.getElementById('outEffectiveRate').textContent = `$${(effectiveRate * emr).toFixed(2)} / $100`;
      document.getElementById('outEmrImpact').textContent = emrDelta === 0
        ? '$0 (1.00 Neutral)'
        : `${emrDelta > 0 ? '+' : '-'}${fmtMoney(Math.abs(emrDelta))} / yr`;
      document.getElementById('outEmrImpact').className = 'metric-val ' + (emrDelta < 0 ? 'green' : emrDelta > 0 ? 'amber' : 'cyan');
      document.getElementById('outRiskTier').textContent = cls.risk;
    }

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const p = btn.getAttribute('data-preset');
        if (p === 'electrical') { classSel.value = '5190'; stateSel.value = 'TX'; payrollInput.value = 550000; emrRange.value = 0.92; }
        if (p === 'roofing') { classSel.value = '5551'; stateSel.value = 'FL'; payrollInput.value = 400000; emrRange.value = 1.15; }
        if (p === 'trucking') { classSel.value = '7219'; stateSel.value = 'CA'; payrollInput.value = 650000; emrRange.value = 1.00; }
        if (p === 'restaurant') { classSel.value = '9079'; stateSel.value = 'NY'; payrollInput.value = 480000; emrRange.value = 0.95; }
        calculate();
      });
    });

    [classSel, stateSel, payrollInput, emrRange, paygoSel].forEach((el) => {
      el?.addEventListener('input', calculate);
      el?.addEventListener('change', calculate);
    });

    calculate();
  });
})();
