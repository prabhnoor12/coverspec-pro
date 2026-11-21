/**
 * CoverSpec Pro™ — Commercial General Liability (GL) & Surety Bond Calculator
 * Rates per $1,000 of Gross Revenue + Subcontractor Pass-Through + State License Bond
 */

(function () {
  'use strict';

  const GL_CLASSES = {
    gc: { name: 'Commercial General Contractor (GC)', ratePer1k: 5.80, subRate: 1.45, coiNote: 'CG 20 10 + CG 20 37 Required' },
    electrical: { name: 'Commercial Electrical Contractor', ratePer1k: 4.10, subRate: 1.10, coiNote: 'Primary & Non-Contributory' },
    plumbing: { name: 'Plumbing / HVAC Mechanical', ratePer1k: 4.95, subRate: 1.25, coiNote: 'Water Damage & Completed Ops' },
    roofing: { name: 'Commercial Roofing Contractor', ratePer1k: 12.50, subRate: 2.90, coiNote: 'Height / Torch-Down Underwriting' },
    excavation: { name: 'Sitework / Excavation / Grading', ratePer1k: 6.75, subRate: 1.65, coiNote: 'XCU Underground Coverage Active' },
    restaurant: { name: 'Restaurant / Commercial Foodservice', ratePer1k: 2.85, subRate: 0.50, coiNote: 'Host / Liquor Liability Separate' },
    retail: { name: 'Commercial Retail / Warehouse', ratePer1k: 1.95, subRate: 0.45, coiNote: 'Landlord Additional Insured' },
    consulting: { name: 'B2B Tech / Engineering / Consulting', ratePer1k: 1.15, subRate: 0.35, coiNote: 'Pair w/ E&O Professional Liability' }
  };

  const LIMIT_MULTS = {
    '1m2m': { label: '$1M Occurrence / $2M Aggregate', mult: 1.0 },
    '2m4m': { label: '$2M Occurrence / $4M Aggregate', mult: 1.26 },
    '1m2m_umb': { label: '$1M/$2M GL + $2M Commercial Umbrella', mult: 1.52 }
  };

  const STATE_BONDS = {
    CA: { name: 'California (CSLB $25,000 Mandatory Bond)', bondAmt: 25000, rateMult: 1.25 },
    TX: { name: 'Texas (Local Municipal / $10k–$25k Bond)', bondAmt: 15000, rateMult: 0.94 },
    FL: { name: 'Florida (DBPR Credit/Bond Compliance)', bondAmt: 15000, rateMult: 1.18 },
    NY: { name: 'New York (NYC Labor Law 240/241 Surcharge)', bondAmt: 25000, rateMult: 1.68 },
    WA: { name: 'Washington (L&I $30,000 GC / $15,000 Spec)', bondAmt: 30000, rateMult: 1.08 },
    OTHER: { name: 'Standard US Commercial Jurisdiction', bondAmt: 15000, rateMult: 1.00 }
  };

  function fmtMoney(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const classSel = document.getElementById('glClass');
    const stateSel = document.getElementById('glState');
    const revInput = document.getElementById('glRevenue');
    const subInput = document.getElementById('glSubCost');
    const limitSel = document.getElementById('glLimit');
    const creditSel = document.getElementById('glBondCredit');

    function calculate() {
      const cls = GL_CLASSES[classSel.value] || GL_CLASSES.gc;
      const st = STATE_BONDS[stateSel.value] || STATE_BONDS.CA;
      const lim = LIMIT_MULTS[limitSel.value] || LIMIT_MULTS['1m2m'];
      const rev = Math.max(50000, parseFloat(revInput.value) || 1200000);
      const subCost = Math.max(0, parseFloat(subInput.value) || 250000);
      const bondRate = parseFloat(creditSel.value) || 0.015; // 1% to 5%

      const selfRev = Math.max(0, rev - subCost);
      const rawGl = ((selfRev / 1000) * cls.ratePer1k + (subCost / 1000) * cls.subRate) * st.rateMult * lim.mult;
      const annualGl = Math.max(650, rawGl);
      const annualBond = Math.max(150, st.bondAmt * bondRate);
      const monthlyCombined = (annualGl + annualBond) / 12;

      document.getElementById('outAnnualPremium').textContent = fmtMoney(annualGl);
      document.getElementById('outAnnualSub').textContent = `${lim.label} • ${st.name}`;
      document.getElementById('outMonthlyCost').textContent = `${fmtMoney(monthlyCombined)} / mo`;
      document.getElementById('outBondCost').textContent = `${fmtMoney(annualBond)} / yr ($${(st.bondAmt / 1000)}k Bond)`;
      document.getElementById('outRatePer1k').textContent = `$${((annualGl / rev) * 1000).toFixed(2)} / $1k Rev`;
      document.getElementById('outCoiNote').textContent = cls.coiNote;
    }

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const p = btn.getAttribute('data-preset');
        if (p === 'gc') { classSel.value = 'gc'; stateSel.value = 'CA'; revInput.value = 1500000; subInput.value = 450000; limitSel.value = '1m2m_umb'; }
        if (p === 'hvac') { classSel.value = 'plumbing'; stateSel.value = 'TX'; revInput.value = 850000; subInput.value = 75000; limitSel.value = '1m2m'; }
        if (p === 'ny') { classSel.value = 'electrical'; stateSel.value = 'NY'; revInput.value = 1200000; subInput.value = 150000; limitSel.value = '2m4m'; }
        if (p === 'retail') { classSel.value = 'retail'; stateSel.value = 'FL'; revInput.value = 900000; subInput.value = 0; limitSel.value = '1m2m'; }
        calculate();
      });
    });

    [classSel, stateSel, revInput, subInput, limitSel, creditSel].forEach((el) => {
      el?.addEventListener('input', calculate);
      el?.addEventListener('change', calculate);
    });

    calculate();
  });
})();
