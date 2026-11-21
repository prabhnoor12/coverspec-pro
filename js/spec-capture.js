/**
 * CoverSpec Pro™ — Contextual Underwriting Spec Capture & Quote Engine
 */

(function (window, document) {
  'use strict';

  const SAVED_ZIP_KEY = 'coverspec_user_zip_v1';
  const FREE_DOMAINS = new Set(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'live.com']);

  const TOOL_CONFIG = {
    'workers-comp': {
      line: 'workers-comp',
      title: 'Commercial Workers’ Comp & EMR',
      primaryId: 'outAnnualPremium',
      secondaryId: 'outMonthlyCost',
      btnLabel: (v) => v ? `🛡️ Lock In ${v}/yr WC Quote →` : '🛡️ Get Binding Workers’ Comp Quotes →',
      codeCheck: (num) => num >= 15000 ? 'EMR & Audit Trigger: Businesses > $15k/yr qualify for Pay-As-You-Go & Experience Mod Review' : ''
    },
    'general-liability': {
      line: 'general-liability',
      title: 'Commercial General Liability & Bond',
      primaryId: 'outAnnualPremium',
      secondaryId: 'outBondCost',
      btnLabel: (v) => v ? `🛡️ Get ${v}/yr GL & COI Quote →` : '🛡️ Get Same-Day GL & COI Quotes →',
      codeCheck: (num) => num >= 3500 ? 'COI & Subcontractor Trigger: Verify Additional Insured & Waiver of Subrogation Endorsements' : ''
    },
    'cyber-liability': {
      line: 'cyber-liability',
      title: 'Commercial Cyber Liability & Breach Risk',
      primaryId: 'outAnnualPremium',
      secondaryId: 'outRecLimit',
      btnLabel: (v) => v ? `🛡️ Get ${v}/yr Cyber Quote →` : '🛡️ Get Binding Cyber Liability Quotes →',
      codeCheck: (num) => num >= 4000 ? 'Underwriting Trigger: MFA & EDR Controls Required for Preferred $2M+ Cyber Policy Limits' : ''
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

  function formatPhoneUS(raw) {
    const d = String(raw || '').replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  function isValidUSPhone(raw) {
    const d = String(raw || '').replace(/\D/g, '');
    if (d.length !== 10 || /^(\d)\1{9}$/.test(d)) return false;
    if (d === '1234567890' || d[0] === '0' || d[0] === '1' || d[3] === '0' || d[3] === '1') return false;
    return true;
  }

  function extractDomain(email) {
    const p = String(email || '').trim().toLowerCase().split('@');
    return p.length === 2 && !FREE_DOMAINS.has(p[1]) ? p[1] : '';
  }

  function init() {
    const cfg = detectTool();
    if (!cfg) return;
    const resultsCol = document.querySelector('.results-column');
    if (!resultsCol || document.getElementById('cspBar')) return;

    const savedZip = localStorage.getItem(SAVED_ZIP_KEY) || '';

    const bar = document.createElement('div');
    bar.id = 'cspBar';
    bar.className = 'csp-bar';
    bar.innerHTML = `
      <div class="csp-bar-top">
        <span class="csp-eyebrow">⚡ Underwriting Estimate Ready</span>
        <span class="csp-trust-chip">A-Rated Commercial Carriers • Max 2 Brokers</span>
      </div>
      <div id="cspCodeAlert" class="csp-code-alert" hidden></div>
      <h3 class="csp-headline">Save Your Underwriting Worksheet or Compare Binding Quotes</h3>
      <p class="csp-sub">Export your calculated actuarial breakdown as a PDF for CFO/board review, or request firm quotes from licensed commercial specialists.</p>
      <div class="csp-actions">
        <button type="button" class="csp-btn-primary" id="cspQuoteBtn">🛡️ Get Binding Quotes →</button>
        <button type="button" class="csp-btn-secondary" id="cspPdfBtn">📄 Save Spec PDF</button>
        <button type="button" class="csp-btn-ghost" id="cspCopyBtn">📋 Copy Summary</button>
      </div>
    `;
    resultsCol.insertBefore(bar, resultsCol.children[1] || null);

    const overlay = document.createElement('div');
    overlay.id = 'cspOverlay';
    overlay.className = 'csp-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="csp-modal">
        <div class="csp-modal-head">
          <div>
            <span class="csp-eyebrow">🛡️ Commercial Underwriting Package</span>
            <h3 class="csp-modal-title" id="cspModalTitle">Compare Binding Commercial Quotes</h3>
          </div>
          <button type="button" class="csp-close" id="cspCloseBtn" aria-label="Close">&times;</button>
        </div>
        <div class="csp-spec-pill" id="cspSpecPill">Calculated Estimate: <strong>Ready</strong></div>

        <form id="cspForm" novalidate>
          <div class="csp-form-grid">
            <div class="csp-field full">
              <label class="csp-label">Policy Timing / Renewal Window *</label>
              <div class="csp-timeline-grid">
                <button type="button" class="csp-time-pill active" data-time="Need COI / Renewing < 30 Days">🔥 Urgent<span>&lt; 30 Days / COI</span></button>
                <button type="button" class="csp-time-pill" data-time="Renewing in 30–90 Days">📅 30–90 Days<span>X-Date Renewal</span></button>
                <button type="button" class="csp-time-pill" data-time="Benchmarking Rates">📋 Benchmarking<span>Rate Check</span></button>
              </div>
            </div>
            <div class="csp-field">
              <label class="csp-label" for="cspName">Your Name / Business *</label>
              <input class="csp-input" type="text" id="cspName" placeholder="e.g., Jordan Lee / Summit LLC" required>
            </div>
            <div class="csp-field">
              <label class="csp-label" for="cspZip">Business 5-Digit ZIP *</label>
              <input class="csp-input" type="text" id="cspZip" maxlength="5" inputmode="numeric" placeholder="e.g., 77002" value="${savedZip}" required>
              <div id="cspZipOk" class="csp-zip-ok" hidden></div>
            </div>
            <div class="csp-field">
              <label class="csp-label" for="cspPhone">Direct Business Phone *</label>
              <input class="csp-input" type="tel" id="cspPhone" maxlength="14" inputmode="tel" placeholder="(713) 555-0194" required>
            </div>
            <div class="csp-field">
              <label class="csp-label" for="cspEmail">Work Email (For PDF) *</label>
              <input class="csp-input" type="email" id="cspEmail" placeholder="owner@company.com" required>
            </div>
          </div>

          <label class="csp-optin">
            <input type="checkbox" id="cspOptIn" checked>
            <span><strong>Match me with up to 2 licensed commercial insurance brokers</strong> for firm A-rated carrier quotes on this exact profile (zero call-center spam).</span>
          </label>

          <div id="cspError" class="csp-error" hidden></div>
          <button type="submit" class="csp-submit" id="cspSubmitBtn">Save Worksheet &amp; Get Binding Quotes →</button>
          <div class="csp-trust-foot">🔒 SSL Encrypted • Max 2 Licensed Brokers • Same-Day COI Available</div>
          <div class="csp-escape"><button type="button" class="csp-escape-btn" id="cspRawPrint">Just print raw worksheet without saving →</button></div>
        </form>

        <div id="cspSuccess" class="csp-success" hidden>
          <div class="csp-success-icon">✓</div>
          <h3 class="csp-modal-title" style="margin-bottom:0.4rem;">Underwriting Summary Saved!</h3>
          <p class="csp-sub" id="cspSuccessMsg" style="margin-bottom:1rem;"></p>
          <button type="button" class="csp-btn-primary" id="cspPrintNow" style="width:100%;">🖨️ Print / Save PDF Worksheet Now</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let timeline = 'Need COI / Renewing < 30 Days';

    function readSpec() {
      const p = (document.getElementById(cfg.primaryId)?.textContent || '').trim();
      const s = (document.getElementById(cfg.secondaryId)?.textContent || '').trim();
      const alertTxt = cfg.codeCheck(extractNum(p));
      return { p, s, alertTxt };
    }

    function sync() {
      const { p, s, alertTxt } = readSpec();
      const qBtn = document.getElementById('cspQuoteBtn');
      const alertEl = document.getElementById('cspCodeAlert');
      const pill = document.getElementById('cspSpecPill');
      if (qBtn) qBtn.textContent = cfg.btnLabel(p);
      if (alertEl) {
        alertEl.textContent = alertTxt ? `⚠️ ${alertTxt}` : '';
        alertEl.hidden = !alertTxt;
      }
      if (pill) {
        pill.innerHTML = `${cfg.title}: <strong>${p || 'Ready'}</strong> ${s ? `(${s})` : ''}`;
      }
    }

    sync();
    const obs = new MutationObserver(sync);
    const pEl = document.getElementById(cfg.primaryId);
    const sEl = document.getElementById(cfg.secondaryId);
    if (pEl) obs.observe(pEl, { childList: true, characterData: true, subtree: true });
    if (sEl) obs.observe(sEl, { childList: true, characterData: true, subtree: true });

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

    const form = document.getElementById('cspForm');
    const success = document.getElementById('cspSuccess');
    const errEl = document.getElementById('cspError');
    const zipEl = document.getElementById('cspZip');
    const zipOk = document.getElementById('cspZipOk');
    const phoneEl = document.getElementById('cspPhone');

    function checkZip() {
      const z = (zipEl?.value || '').trim();
      if (/^\d{5}$/.test(z)) {
        localStorage.setItem(SAVED_ZIP_KEY, z);
        zipOk.textContent = `✓ A-rated commercial markets active in ZIP ${z}`;
        zipOk.hidden = false;
      } else {
        zipOk.hidden = true;
      }
    }

    zipEl?.addEventListener('input', () => {
      zipEl.value = zipEl.value.replace(/\D/g, '').slice(0, 5);
      checkZip();
    });

    phoneEl?.addEventListener('input', (e) => {
      e.target.value = formatPhoneUS(e.target.value);
      e.target.classList.remove('invalid');
    });

    function openModal(mode) {
      sync();
      checkZip();
      errEl.hidden = true;
      form.hidden = false;
      success.hidden = true;
      document.getElementById('cspModalTitle').textContent = mode === 'pdf'
        ? 'Email & Save Underwriting Worksheet PDF'
        : `Compare Binding ${cfg.title} Quotes`;
      overlay.hidden = false;
    }

    document.getElementById('cspQuoteBtn')?.addEventListener('click', () => openModal('quote'));
    document.getElementById('cspPdfBtn')?.addEventListener('click', () => openModal('pdf'));
    document.getElementById('cspCloseBtn')?.addEventListener('click', () => { overlay.hidden = true; });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.hidden = true; });
    document.getElementById('cspRawPrint')?.addEventListener('click', () => { overlay.hidden = true; window.print(); });
    document.getElementById('cspPrintNow')?.addEventListener('click', () => { overlay.hidden = true; window.print(); });

    overlay.querySelectorAll('.csp-time-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        timeline = btn.getAttribute('data-time');
        overlay.querySelectorAll('.csp-time-pill').forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errEl.hidden = true;
      const name = (document.getElementById('cspName')?.value || '').trim();
      const zip = (zipEl?.value || '').trim();
      const phone = (phoneEl?.value || '').trim();
      const email = (document.getElementById('cspEmail')?.value || '').trim();
      const wantQuotes = !!document.getElementById('cspOptIn')?.checked;

      if (name.length < 2) { errEl.textContent = 'Enter your name or business name.'; errEl.hidden = false; return; }
      if (!/^\d{5}$/.test(zip)) { errEl.textContent = 'Enter a valid 5-digit US ZIP code.'; errEl.hidden = false; return; }
      if (!isValidUSPhone(phone)) { phoneEl.classList.add('invalid'); errEl.textContent = 'Enter a valid 10-digit US phone number.'; errEl.hidden = false; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Enter a valid work email address.'; errEl.hidden = false; return; }

      const { p, s } = readSpec();
      const record = {
        line: cfg.line,
        name,
        zip,
        phone,
        email,
        domain: extractDomain(email),
        timeline,
        wantQuotes,
        estimate: p,
        secondary: s,
        timestamp: new Date().toISOString()
      };

      try {
        const list = JSON.parse(localStorage.getItem('coverspec_leads') || '[]');
        list.unshift(record);
        localStorage.setItem('coverspec_leads', JSON.stringify(list));
      } catch (ex) {}

      form.hidden = true;
      success.hidden = false;
      document.getElementById('cspSuccessMsg').textContent = wantQuotes
        ? `Saved for ${name} (ZIP ${zip}). Your ${p}/yr underwriting profile (${timeline}) is queued for up to 2 licensed commercial brokers.`
        : `Your underwriting worksheet (${p}/yr) is ready to print or save as PDF.`;
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window, document);
