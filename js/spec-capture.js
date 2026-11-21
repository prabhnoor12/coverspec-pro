/**
 * CoverSpec Pro™ — Pure Affiliate & Instant Underwriting Export Engine (Way A)
 * Zero-friction UX: instant free PDF print, 1-click Copy Summary, and direct
 * A-rated commercial carrier affiliate routing via js/affiliate-config.js.
 */

(function (window, document) {
  'use strict';

  const TOOL_CONFIG = {
    'workers-comp': {
      line: 'workers-comp',
      title: 'Commercial Workers’ Comp & EMR',
      primaryId: 'outAnnualPremium',
      secondaryId: 'outMonthlyCost',
      btnLabel: (v, carrier) => v ? `🛡️ Check Live Rate (${v}/yr est.) →` : `🛡️ Compare ${carrier} WC Rates →`,
      codeCheck: (num) => num >= 15000 ? 'EMR & Audit Savings Tip: Businesses > $15k/yr qualify for Pay-As-You-Go & Experience Mod Credits' : ''
    },
    'general-liability': {
      line: 'general-liability',
      title: 'Commercial General Liability & Bond',
      primaryId: 'outAnnualPremium',
      secondaryId: 'outBondCost',
      btnLabel: (v, carrier) => v ? `🛡️ Check Live GL Rate (${v}/yr est.) →` : `🛡️ Compare ${carrier} GL Rates →`,
      codeCheck: (num) => num >= 3500 ? 'COI Tip: Verify Additional Insured (CG 20 10 / 20 37) & Waiver of Subrogation before binding' : ''
    },
    'cyber-liability': {
      line: 'cyber-liability',
      title: 'Commercial Cyber Liability & Breach Risk',
      primaryId: 'outAnnualPremium',
      secondaryId: 'outRecLimit',
      btnLabel: (v, carrier) => v ? `🛡️ Check Cyber Rate (${v}/yr est.) →` : `🛡️ Compare ${carrier} Cyber Rates →`,
      codeCheck: (num) => num >= 4000 ? 'Underwriting Tip: Enforced MFA + EDR unlocks 15%–35% preferred pricing on $2M+ limits' : ''
    }
  };

  function detectTool() {
    const path = window.location.pathname.toLowerCase();
    for (const slug of Object.keys(TOOL_CONFIG)) {
      if (path.includes('/' + slug + '/') || path.endsWith('/' + slug)) {
        return { slug, ...TOOL_CONFIG[slug] };
      }
    }
    return null;
  }

  function extractNum(txt) {
    const m = String(txt || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  function init() {
    const cfg = detectTool();
    if (!cfg) return;
    const resultsCol = document.querySelector('.results-column');
    if (!resultsCol || document.getElementById('cspBar')) return;

    const carriers = (window.COVERSPEC_CARRIERS && window.COVERSPEC_CARRIERS[cfg.line]) || [];
    const topCarrier = carriers[0] || { name: 'Next Insurance', url: 'https://www.nextinsurance.com/' };

    // 1. Frictionless Action Bar (Direct Affiliate Rate Check + Free Instant Print + Copy)
    const bar = document.createElement('div');
    bar.id = 'cspBar';
    bar.className = 'csp-bar';
    bar.innerHTML = `
      <div class="csp-bar-top">
        <span class="csp-eyebrow">⚡ Underwriting Benchmark Ready</span>
        <span class="csp-trust-chip">Instant Online Binding • Same-Day COI</span>
      </div>
      <div id="cspCodeAlert" class="csp-code-alert" hidden></div>
      <h3 class="csp-headline">Compare Live A-Rated Carrier Quotes or Export Your Worksheet</h3>
      <p class="csp-sub">Lock in a binding commercial rate online in minutes, or print this actuarial breakdown for your CFO or bid file—no signup required.</p>
      <div class="csp-actions">
        <a href="${topCarrier.url}" target="_blank" rel="sponsored noopener noreferrer" class="csp-btn-primary" id="cspQuoteBtn" style="text-decoration:none;">🛡️ Check Live Rate →</a>
        <button type="button" class="csp-btn-secondary" id="cspPrintBtn">🖨️ Print / Save PDF</button>
        <button type="button" class="csp-btn-ghost" id="cspCopyBtn">📋 Copy Summary</button>
      </div>
    `;
    resultsCol.insertBefore(bar, resultsCol.children[1] || null);

    // 2. Matched A-Rated Carriers Comparison Shortlist
    if (carriers.length > 0 && !document.getElementById('cspCarriersCard')) {
      const cCard = document.createElement('div');
      cCard.id = 'cspCarriersCard';
      cCard.className = 'csp-carriers-card';
      cCard.innerHTML = `
        <div class="csp-carriers-head">
          <span class="csp-carriers-title">⚡ Top A-Rated Markets for ${cfg.title}</span>
          <span class="csp-carriers-disclosure">Affiliate Partners</span>
        </div>
        <div class="csp-carrier-list">
          ${carriers.map((c) => `
            <div class="csp-carrier-row">
              <div class="csp-carrier-info">
                <div class="csp-carrier-top">
                  <span class="csp-carrier-name">${c.name}</span>
                  <span class="csp-carrier-badge">${c.badge}</span>
                </div>
                <div class="csp-carrier-perk">${c.perk}</div>
              </div>
              <a href="${c.url}" target="_blank" rel="sponsored noopener noreferrer" class="csp-carrier-cta">Check Rate &rarr;</a>
            </div>
          `).join('')}
        </div>
      `;
      resultsCol.appendChild(cCard);
    }

    // 3. Slim Mobile-Only Sticky Bottom Affiliate CTA
    const mobileSticky = document.createElement('div');
    mobileSticky.id = 'cspMobileSticky';
    mobileSticky.className = 'csp-mobile-sticky';
    mobileSticky.hidden = true;
    mobileSticky.innerHTML = `
      <a href="${topCarrier.url}" target="_blank" rel="sponsored noopener noreferrer" class="csp-mobile-sticky-btn" id="cspMobileBtn" style="display:flex;align-items:center;justify-content:center;text-decoration:none;">🛡️ Check Live Rate →</a>
      <button type="button" class="csp-mobile-dismiss" id="cspMobileDismiss" aria-label="Dismiss">&times;</button>
    `;
    document.body.appendChild(mobileSticky);

    let mobileDismissed = false;
    mobileSticky.querySelector('#cspMobileDismiss')?.addEventListener('click', () => {
      mobileDismissed = true;
      mobileSticky.hidden = true;
    });
    window.addEventListener('scroll', () => {
      if (mobileDismissed) return;
      mobileSticky.hidden = window.scrollY < 300;
    }, { passive: true });

    // Live Output Mirroring
    function readSpec() {
      const p = (document.getElementById(cfg.primaryId)?.textContent || '').trim();
      const s = (document.getElementById(cfg.secondaryId)?.textContent || '').trim();
      const alertTxt = cfg.codeCheck(extractNum(p));
      return { p, s, alertTxt };
    }

    function sync() {
      const { p, alertTxt } = readSpec();
      const qBtn = document.getElementById('cspQuoteBtn');
      const mBtn = document.getElementById('cspMobileBtn');
      const alertEl = document.getElementById('cspCodeAlert');
      const label = cfg.btnLabel(p, topCarrier.name);
      if (qBtn) qBtn.textContent = label;
      if (mBtn) mBtn.textContent = label;
      if (alertEl) {
        alertEl.textContent = alertTxt ? `⚠️ ${alertTxt}` : '';
        alertEl.hidden = !alertTxt;
      }
    }

    sync();
    const obs = new MutationObserver(sync);
    const pEl = document.getElementById(cfg.primaryId);
    const sEl = document.getElementById(cfg.secondaryId);
    if (pEl) obs.observe(pEl, { childList: true, characterData: true, subtree: true });
    if (sEl) obs.observe(sEl, { childList: true, characterData: true, subtree: true });

    document.getElementById('cspPrintBtn')?.addEventListener('click', () => window.print());

    document.getElementById('cspCopyBtn')?.addEventListener('click', (e) => {
      const { p, s, alertTxt } = readSpec();
      const text = `CoverSpec Pro™ — ${cfg.title}\nEstimated Annual Premium: ${p}\nSecondary Metric: ${s}\n${alertTxt ? 'Note: ' + alertTxt + '\n' : ''}Calculator: ${window.location.href}`;
      navigator.clipboard?.writeText(text).then(() => {
        const b = e.currentTarget;
        const orig = b.textContent;
        b.textContent = '✓ Copied!';
        setTimeout(() => { b.textContent = orig; }, 2000);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window, document);
