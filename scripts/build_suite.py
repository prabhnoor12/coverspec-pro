# -*- coding: utf-8 -*-
"""
CoverSpec Pro™ — Static Site Builder, OG Image Generator, pSEO Engine & Validator
Generates:
  1. 1200x630 OpenGraph blueprint PNG (assets/og-coverspec-pro.png)
  2. 12 deeply differentiated State / Regulatory landing pages (4 per tool)
  3. Parent calculator & homepage internal link hubs
  4. Valid 16-URL sitemap.xml
"""

import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://prabhnoor12.github.io/coverspec-pro"
LAST_MOD = "2026-11-21"

TOOLS = {
    "workers-comp": {"name": "Workers’ Comp & EMR Calculator", "short": "Workers’ Comp"},
    "general-liability": {"name": "General Liability & Bond Calculator", "short": "General Liability"},
    "cyber-liability": {"name": "Cyber Liability & Breach Calculator", "short": "Cyber Liability"},
}

PAGES = [
    # --- WORKERS' COMP (4) ---
    {
        "tool": "workers-comp",
        "slug": "texas-non-subscriber",
        "short": "Texas — TDI & Non-Subscriber Rules",
        "badge": "Texas TDI • Optional WC vs. Contract COI",
        "title": "Texas Workers’ Comp Cost Calculator (TDI & Non-Subscriber Rules)",
        "desc": "Calculate Texas commercial workers' comp premiums by NCCI class code and EMR. Compare statutory Texas TDI coverage vs. non-subscriber risks and GC COI mandates.",
        "h1": "Texas Commercial Workers’ Comp &amp; EMR Calculator (TDI Rules)",
        "lead": "Estimate Texas commercial workers’ compensation rates across construction, trucking, and service NCCI class codes—and understand why GC contracts still mandate statutory coverage.",
        "table": [
            ("Texas Labor Code §406", "Non-Subscriber Election", "Texas is the only state where private employers may opt out, but non-subscribers lose common-law tort defenses in employee lawsuits."),
            ("TDI / NCCI Rates", "Lower Loss Costs", "Texas manual rates average ~18%–25% below California and New York due to statutory medical fee guidelines."),
            ("Commercial GC Mandate", "Mandatory COI & Waiver", "Almost all Texas commercial GCs require statutory Workers' Comp + Waiver of Subrogation (WC 42 03 04 B).")
        ],
        "example": "A Houston electrical contractor (Class 5190) with $550,000 payroll and 0.92 EMR pays ~$10,368/yr (~$864/mo) in Texas—saving ~$902/yr from their safety credit.",
        "faqs": [
            ("Is workers' comp mandatory in Texas for commercial contractors?", "Texas state law does not mandate it for private employers, except on public/government contracts—however virtually all commercial general contractors require a statutory Texas Workers' Comp COI."),
            ("What is Texas Waiver of Subrogation endorsement WC 42 03 04 B?", "It prevents your workers' comp carrier from suing the general contractor or property owner after paying an injured worker's claim; standard requirement on TX commercial subcontracts.")
        ]
    },
    {
        "tool": "workers-comp",
        "slug": "california-wcirb",
        "short": "California — WCIRB & CSLB Mandate",
        "badge": "California WCIRB • CSLB License Requirement",
        "title": "California Workers’ Comp & EMR Calculator (WCIRB & CSLB Rules)",
        "desc": "Estimate California commercial workers' comp premiums using WCIRB class codes, dual-wage thresholds, and X-Mod (EMR) impact for contractors and businesses.",
        "h1": "California Workers’ Comp &amp; X-Mod Calculator (WCIRB &amp; CSLB)",
        "lead": "Calculate California workers’ compensation premiums under WCIRB dual-wage construction class codes, mandatory CSLB contractor filing rules, and Experience Mod (X-Mod) credits.",
        "table": [
            ("CA Labor Code §3700", "Strict Mandatory Coverage", "Required for every California employer with 1+ employees; criminal misdemeanor and stop-work penalties apply if uninsured."),
            ("CSLB SB 216", "Contractor Mandate (No Employees)", "C-8 Concrete, C-20 HVAC, C-22 Asbestos, C-39 Roofing, and D-49 Tree contractors must carry WC even with zero employees; expanding to all licenses by 2026."),
            ("WCIRB Dual-Wage Rule", "High-Wage Rate Discount", "Paying commercial trades above California's WCIRB hourly threshold qualifies for dramatically lower high-wage class codes (often 35%–50% cheaper).")
        ],
        "example": "A Los Angeles commercial plumbing shop with $600,000 payroll qualifying for California's WCIRB high-wage class code can cut annual workers' comp costs by $8,000–$14,000/yr.",
        "faqs": [
            ("What is California's WCIRB dual-wage workers' comp rule?", "California splits construction trades into low-wage and high-wage class codes. Employers paying above the WCIRB hourly threshold receive significantly lower manual rates."),
            ("Does California require workers' comp for sole-proprietor contractors?", "Yes for high-risk licenses (C-39 Roofing, C-20 HVAC, C-8 Concrete, D-49 Tree) and expanding statewide under SB 216.")
        ]
    },
    {
        "tool": "workers-comp",
        "slug": "florida-construction",
        "short": "Florida — NCCI Construction Mandate",
        "badge": "Florida DFS • 1+ Construction / 4+ Non-Construction",
        "title": "Florida Workers’ Comp Cost Calculator (Construction & NCCI Rates)",
        "desc": "Calculate Florida commercial workers' compensation premiums by NCCI class code, payroll, and EMR under Florida DFS 1-employee construction mandates.",
        "h1": "Florida Workers’ Comp &amp; EMR Calculator (DFS &amp; NCCI Rates)",
        "lead": "Estimate Florida commercial workers’ compensation premiums and verify Florida Division of Workers’ Compensation compliance thresholds for construction and non-construction firms.",
        "table": [
            ("FL Stat. §440.02", "Construction Threshold: 1+ Employee", "Any Florida construction business with 1 or more employees (including corporate officers unless formally exempt) must carry WC."),
            ("FL Stat. §440.02", "Non-Construction: 4+ Employees", "Non-construction commercial businesses must carry WC once they reach 4 or more full-time/part-time employees."),
            ("FL DFS Stop-Work", "Strict Jobsite Enforcement", "Florida investigators issue immediate stop-work orders plus penalties equal to 2× evaded premium over 2 years.")
        ],
        "example": "A Tampa commercial roofing contractor (Class 5551) with $400,000 payroll and 1.15 EMR faces ~$71,400/yr—making safety-driven EMR reduction worth $10,000+/yr.",
        "faqs": [
            ("Can a Florida construction LLC owner get a workers' comp exemption?", "Yes, up to 3 officers owning at least 10% each in a Florida construction LLC/Corp can file an official FL DFS exemption, though many commercial GCs still require full coverage."),
            ("How fast does Florida enforce uninsured workers' comp penalties?", "Florida DFS conducts active random jobsite sweeps and issues immediate stop-work orders until proof of coverage and 2× back-premium penalties are paid.")
        ]
    },
    {
        "tool": "workers-comp",
        "slug": "new-york-nycirb",
        "short": "New York — NYCIRB & WCB Rules",
        "badge": "New York NYCIRB • NYSIF • WCB C-105.2",
        "title": "New York Workers’ Comp Cost Calculator (NYCIRB & WCB C-105.2)",
        "desc": "Calculate New York commercial workers' comp premiums using NYCIRB class codes, payroll caps, EMR mod impact, and WCB Form C-105.2 permit rules.",
        "h1": "New York Workers’ Comp &amp; EMR Calculator (NYCIRB &amp; WCB)",
        "lead": "Estimate New York commercial workers’ compensation premiums across NYC and Upstate NY under NYCIRB rating rules, construction payroll caps, and NYS Workers’ Compensation Board mandates.",
        "table": [
            ("NY WCL §50", "Mandatory Coverage (1+ Employee)", "Required for virtually all NY businesses with 1+ employees; WCB Form C-105.2 required for NYC DOB permits."),
            ("NYCIRB Payroll Cap", "Construction Weekly Wage Cap", "High-wage NY union/prevailing-wage construction payrolls qualify for NYCIRB weekly payroll caps, preventing runaway premiums."),
            ("NYSIF Market", "State Insurance Fund Option", "New York State Insurance Fund (NYSIF) serves as the guaranteed market alongside private carriers.")
        ],
        "example": "A Brooklyn commercial restaurant (Class 9079) with $480,000 payroll and 0.95 EMR estimates ~$12,800/yr (~$1,067/mo) under NY rates.",
        "faqs": [
            ("What is Form C-105.2 in New York?", "Form C-105.2 is the official NY Workers' Compensation Board certificate proving active private-carrier coverage—required by NYC DOB before issuing building permits."),
            ("Does New York cap high construction wages on workers' comp audits?", "Yes. Under NYCIRB rules, employers meeting specific construction territory/wage criteria can cap auditable weekly payroll per employee.")
        ]
    },

    # --- GENERAL LIABILITY (4) ---
    {
        "tool": "general-liability",
        "slug": "california-cslb-bond",
        "short": "California — CSLB $25k Bond & GL",
        "badge": "California CSLB • $25,000 Surety Bond • ISO CGL",
        "title": "California Contractor GL & CSLB $25,000 Bond Calculator",
        "desc": "Estimate California commercial general liability (GL) premiums and mandatory $25,000 CSLB contractor license surety bond costs by revenue and credit tier.",
        "h1": "California Contractor GL &amp; CSLB $25,000 Bond Calculator",
        "lead": "Model California Commercial General Liability premiums, $2M Commercial Umbrella stacking, and mandatory $25,000 CSLB surety license bond costs.",
        "table": [
            ("CA B&P §7071.6", "$25,000 Mandatory CSLB Bond", "Every active California licensed contractor must maintain a $25,000 license bond on file with the CSLB."),
            ("CA LLC Rule", "$100,000 LLC Worker Bond + $1M GL", "Contractors operating as an LLC in California must also carry a $100,000 LLC employee/worker bond and $1M–$5M GL."),
            ("Commercial COI", "CG 20 10 & CG 20 37 Endorsements", "California commercial owners require ongoing + completed operations Additional Insured endorsements.")
        ],
        "example": "A California GC with $1.5M revenue ($450k insured subs) and $1M/$2M GL + $2M Umbrella budgets ~$12,800/yr GL plus ~$250/yr for the $25k CSLB bond.",
        "faqs": [
            ("How much does a California $25,000 CSLB contractor bond cost?", "With 700+ credit, contractors typically pay $190 to $375 per year (0.75%–1.5% of the $25,000 bond amount)."),
            ("Why do California LLC contractors pay more for bonds?", "California requires LLC contractors to carry an additional $100,000 LLC Employee/Worker Bond plus at least $1,000,000 in General Liability insurance.")
        ]
    },
    {
        "tool": "general-liability",
        "slug": "texas-contractor-gl",
        "short": "Texas — Commercial GL & Sub Audits",
        "badge": "Texas Commercial CGL • CG 20 10 / 20 37 • Municipal Bonds",
        "title": "Texas Commercial General Liability (GL) Cost Calculator",
        "desc": "Calculate Texas commercial general liability insurance premiums for contractors, trades, and businesses by gross revenue, subcontractor spend, and umbrella limits.",
        "h1": "Texas Commercial General Liability (GL) &amp; Bond Calculator",
        "lead": "Benchmark Texas commercial GL rates for Houston, Dallas-Fort Worth, Austin, and San Antonio contractors—including subcontractor COI audit rules and local municipal license bonds.",
        "table": [
            ("TDLR / Municipal", "Trade-Specific GL Minimums", "Texas electrical (TDLR) and HVAC/plumbing licenses require $300k–$1M+ active Commercial General Liability."),
            ("Subcontractor Audits", "Insured vs. Uninsured Sub Spend", "Collecting COIs from Texas subs keeps sub spend rated near $1.10–$1.50/$1k instead of full self-performed rates."),
            ("Commercial Contracts", "$1M/$2M + Umbrella Standard", "Texas commercial GCs routinely require $1M/$2M GL, Primary & Non-Contributory, and Waiver of Subrogation.")
        ],
        "example": "A Dallas HVAC/Plumbing contractor with $850k gross revenue and $75k insured subs estimates ~$3,700/yr for $1M/$2M Commercial GL.",
        "faqs": [
            ("Does Texas require a state general contractor license bond?", "Texas does not have a statewide GC license, but cities like Houston, Austin, and San Antonio require trade permits/bonds and commercial landlords mandate $1M/$2M GL."),
            ("What happens if my Texas subcontractors don't give me a COI?", "At your annual GL audit, the carrier will reclassify uninsured subcontractor payments as full self-performed revenue, potentially adding thousands in surprise audit bills.")
        ]
    },
    {
        "tool": "general-liability",
        "slug": "florida-dbpr-gl",
        "short": "Florida — DBPR GL & Coastal Rules",
        "badge": "Florida DBPR • Statutory GL Minimums • Hurricane Risk",
        "title": "Florida Commercial General Liability (GL) Calculator (DBPR Rules)",
        "desc": "Calculate Florida commercial general liability premiums for DBPR-licensed contractors, retail, and commercial operators by revenue, trade class, and coverage limits.",
        "h1": "Florida Commercial General Liability Calculator (DBPR Standards)",
        "lead": "Estimate Florida Commercial General Liability premiums aligned with Florida DBPR licensing minimums, coastal underwriting surcharges, and commercial lease COI rules.",
        "table": [
            ("FL Rule 61G4-15.003", "DBPR Statutory GL Minimums", "Florida Certified General & Building Contractors must carry minimum $300k/$50k GL; commercial contracts typically require $1M/$2M."),
            ("Coastal Underwriting", "Litigation & Wind Factors", "South Florida (Miami-Dade/Broward) commercial GL rates carry ~15%–25% surcharges over national averages."),
            ("Subcontractor COI", "Strict Completed Ops Coverage", "Verify no 'Action Over' or residential condo exclusions if bidding multi-family/mixed-use commercial projects.")
        ],
        "example": "A Florida commercial retail/warehouse operator with $900k revenue budgets ~$2,100/yr for $1M/$2M Commercial GL.",
        "faqs": [
            ("What GL limits does Florida DBPR require for Certified General Contractors?", "DBPR mandates at least $300,000 bodily injury and $50,000 property damage, though commercial GCs and landlords almost always require $1M/$2M."),
            ("Are roofing GL policies harder to place in Florida?", "Yes. Florida commercial roofing GL often requires specialty Excess & Surplus (E&S) markets with strict torch-down and open-roof warranty clauses.")
        ]
    },
    {
        "tool": "general-liability",
        "slug": "new-york-labor-law-240",
        "short": "New York — Labor Law 240/241 GL",
        "badge": "NY Labor Law §§240–241 • Action-Over Coverage • DOB",
        "title": "New York Commercial GL Calculator (Labor Law 240/241 Impact)",
        "desc": "Estimate New York and NYC commercial general liability premiums accounting for Labor Law 240/241 Scaffold Law surcharges, Action-Over coverage, and DOB limits.",
        "h1": "New York Commercial General Liability Calculator (Labor Law 240)",
        "lead": "Benchmark NYC and New York State commercial GL premiums under NY Labor Law §§240–241 strict liability rules, Action-Over endorsements, and NYC DOB insurance minimums.",
        "table": [
            ("NY Labor Law §240", "Strict Gravity Liability ('Scaffold Law')", "Imposes absolute liability on owners and contractors for height/elevation injuries, driving NY GL rates 50%–100%+ above national averages."),
            ("Action-Over Coverage", "Critical Exclusion Warning", "Cheap E&S policies often carry 'Labor Law / Action Over' exclusions—rejected by NYC Class A landlords and GCs."),
            ("NYC DOB Rule", "Mandatory Project-Specific Limits", "NYC DOB permits require $1M–$5M+ per-occurrence GL depending on building height and permit scope.")
        ],
        "example": "A NYC commercial electrical contractor with $1.2M revenue and $2M/$4M GL limits budgets ~$9,400–$12,500+/yr with full Action-Over coverage.",
        "faqs": [
            ("Why is New York contractor GL insurance so much more expensive?", "NY Labor Law 240 ('The Scaffold Law') holds contractors and property owners strictly liable for gravity-related jobsite injuries regardless of worker fault."),
            ("What is an Action-Over exclusion in NY commercial GL?", "It strips away coverage when an injured employee sues the property owner/GC and the owner tenders the claim back to the subcontractor under contract indemnity.")
        ]
    },

    # --- CYBER LIABILITY (4) ---
    {
        "tool": "cyber-liability",
        "slug": "healthcare-hipaa",
        "short": "Healthcare & Clinics — HIPAA Cyber",
        "badge": "HIPAA / HITECH • PHI Breach Fines • Ransomware",
        "title": "Healthcare & Dental HIPAA Cyber Insurance Calculator",
        "desc": "Calculate commercial cyber liability premiums, recommended $2M–$5M policy limits, and HIPAA PHI data breach exposure for medical clinics, dental practices, and medspas.",
        "h1": "Healthcare &amp; Dental HIPAA Cyber Liability Calculator",
        "lead": "Size standalone commercial cyber insurance limits and estimate ransomware/PHI breach exposure for medical practices, dental groups, and outpatient clinics under HIPAA/HITECH rules.",
        "table": [
            ("HIPAA Breach Rule", "OCR Notification & Fines", "Breaches affecting 500+ patient records trigger HHS OCR public 'Wall of Shame' reporting, forensic audits, and regulatory penalties."),
            ("Ransomware Downtime", "Business Interruption Coverage", "Average clinic EHR ransomware outage lasts 10–21 days; cyber policies reimburse lost billings + forensic recovery."),
            ("Underwriting Mandate", "MFA + EDR + Immutable Backups", "Carriers require MFA on EHR/email and air-gapped backups to offer preferred $2M+ HIPAA cyber rates.")
        ],
        "example": "A $4.5M outpatient medical/dental clinic holding 25,000 patient PHI records faces ~$1.5M breach exposure and budgets ~$9,000–$11,000/yr for a preferred $2M standalone cyber policy.",
        "faqs": [
            ("Does medical malpractice insurance cover a HIPAA ransomware attack?", "No. Medical malpractice covers clinical errors; standalone commercial cyber liability is required for ransomware, forensic IT, patient notification, and HHS OCR regulatory defense."),
            ("How much cyber insurance should a 30-person medical clinic carry?", "Most multi-provider clinics and dental practices carry $2,000,000 to $3,000,000 aggregate limits to cover forensic legal costs, OCR defense, and 2–3 weeks of EHR downtime.")
        ]
    },
    {
        "tool": "cyber-liability",
        "slug": "financial-sec-ftc",
        "short": "CPA, Finance & Legal — FTC / SEC",
        "badge": "FTC Safeguards Rule • Wire Fraud • WISP Compliance",
        "title": "CPA, Financial & Law Firm Cyber Insurance Calculator (FTC Safeguards)",
        "desc": "Estimate commercial cyber liability premiums and Funds Transfer Fraud limits for CPA firms, RIAs, wealth advisors, and law firms under the FTC Safeguards Rule.",
        "h1": "CPA, Financial &amp; Law Firm Cyber Liability Calculator (FTC / SEC)",
        "lead": "Calculate standalone cyber liability premiums, wire-transfer fraud sublimits, and underwriting readiness for accounting firms, RIAs, and legal practices.",
        "table": [
            ("FTC Safeguards Rule", "Mandatory WISP & MFA", "CPA firms and tax preparers must maintain a Written Information Security Plan (WISP), encryption, and MFA."),
            ("Social Engineering", "Wire / Funds Transfer Fraud", "Law firms, title companies, and RIAs are prime Business Email Compromise (BEC) targets—request $250k–$500k+ FTF sublimits."),
            ("IRS Pub. 4557", "Tax Data Breach Liability", "Compromised tax returns trigger mandatory IRS stakeholder notification and multi-state AG breach notices.")
        ],
        "example": "A $3M CPA practice with 22 staff and 15,000 client tax files budgets ~$6,500–$8,500/yr for a $2M standalone cyber policy with $250k wire fraud coverage.",
        "faqs": [
            ("Does Professional Liability (E&O) cover client wire transfer fraud?", "Usually no, or only with tiny $25k sublimits. Standalone cyber policies with explicit Social Engineering / Funds Transfer Fraud endorsements are required."),
            ("Does the FTC Safeguards Rule affect cyber insurance underwriting?", "Yes. Carriers now ask directly on cyber applications whether your firm has a WISP, enforced MFA, and EDR—passing unlocks 15%–25% better rates.")
        ]
    },
    {
        "tool": "cyber-liability",
        "slug": "saas-soc2",
        "short": "B2B SaaS & Tech — SOC 2 & Tech E&O",
        "badge": "SOC 2 Enterprise Contracts • $2M–$5M Cyber + Tech E&O",
        "title": "B2B SaaS & Tech Cyber Liability Calculator (SOC 2 Limits)",
        "desc": "Size $2M–$5M enterprise cyber liability and Tech E&O limits required by enterprise vendor security questionnaires and SOC 2 compliance.",
        "h1": "B2B SaaS &amp; Tech Cyber Liability Calculator (SOC 2 &amp; Enterprise)",
        "lead": "Calculate standalone Cyber + Tech E&O premiums for SaaS startups and managed IT providers closing enterprise contracts requiring $2M–$5M vendor cyber limits.",
        "table": [
            ("Enterprise MSA", "$2M–$5M Mandatory Vendor Limits", "Fortune 500 procurement teams routinely mandate $2M–$5M Cyber + Tech E&O COIs prior to contract signature."),
            ("Tech E&O Bundling", "Combined Cyber & Tech Errors", "Bundling Tech E&O with Cyber avoids coverage gaps between a software outage (E&O) and a security breach (Cyber)."),
            ("SOC 2 Type II", "Preferred Underwriting Credit", "Active SOC 2 Type II + SSO/MFA + EDR qualifies SaaS companies for top-tier preferred carrier pricing.")
        ],
        "example": "An $8M B2B SaaS firm with 45 employees, 100,000 records, and SOC 2/MFA controls budgets ~$11,500–$15,000/yr for a $3M Cyber limit.",
        "faqs": [
            ("Why do enterprise buyers require $2M to $5M cyber insurance from SaaS vendors?", "If a SaaS vendor's cloud environment is breached, enterprise clients face downstream data exposure and regulatory fines—they transfer that vendor risk via MSA insurance minimums."),
            ("Should a SaaS company buy standalone Cyber or combined Tech E&O + Cyber?", "Combined Tech E&O + Cyber on a single carrier form is best practice so two separate insurers cannot point fingers during a cloud outage or breach.")
        ]
    },
    {
        "tool": "cyber-liability",
        "slug": "construction-wire-fraud",
        "short": "Construction GCs — ACH & Wire Fraud",
        "badge": "Construction ACH / BEC Fraud • Ransomware • ERP Lockout",
        "title": "Construction & GC Cyber Liability Calculator (Wire & ACH Fraud)",
        "desc": "Calculate commercial cyber insurance premiums and Funds Transfer Fraud limits for general contractors, subcontractors, and developers protecting against fake vendor ACH scams.",
        "h1": "Construction &amp; GC Cyber Liability Calculator (Wire &amp; ACH Fraud)",
        "lead": "Protect commercial draw requests, subcontractor ACH payouts, and Procore/ERP job files. Estimate standalone cyber liability and Social Engineering coverage for construction firms.",
        "table": [
            ("BEC / ACH Fraud", "Fake Subcontractor Draw Scams", "Construction is a top-5 industry for Business Email Compromise—hackers spoof subcontractor invoices to hijack $50k–$500k progress payments."),
            ("Ransomware Delay", "Project Liquidated Damages Risk", "Locked estimating/accounting servers halt job billing and scheduling; cyber policies fund rapid forensic decryption & recovery."),
            ("Callback Verification", "Underwriting Requirement", "Carriers require dual-authorization / phone-callback verification for wire changes to pay full Funds Transfer Fraud limits.")
        ],
        "example": "A $15M commercial GC with 55 employees budgets ~$4,500–$6,800/yr for a $2M standalone cyber policy with $250k Social Engineering / Wire Fraud coverage.",
        "faqs": [
            ("Why do commercial general contractors need cyber insurance?", "GCs wire large progress payments to dozens of subcontractors every month, making them prime targets for invoice-spoofing wire fraud and accounting-server ransomware."),
            ("Does my Commercial Crime policy cover social engineering wire fraud?", "Standard Crime policies often exclude 'voluntarily parted' funds tricked via spoofed emails unless you add an explicit Social Engineering / Funds Transfer Fraud endorsement.")
        ]
    }
]


def load_font(size, bold=False):
    for p in [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def generate_og_image():
    out_dir = ROOT / "assets"
    out_dir.mkdir(exist_ok=True)
    out = out_dir / "og-coverspec-pro.png"
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), (6, 11, 20))
    draw = ImageDraw.Draw(img)

    for x in range(0, W, 40):
        draw.line([(x, 0), (x, H)], fill=(15, 28, 48), width=1)
    for y in range(0, H, 40):
        draw.line([(0, y), (W, y)], fill=(15, 28, 48), width=1)

    draw.rectangle([(0, 0), (W, 8)], fill=(16, 185, 129))
    draw.rounded_rectangle([(36, 36), (W - 36, H - 36)], radius=20, outline=(16, 185, 129), width=2)

    draw.rounded_rectangle([(80, 82), (410, 128)], radius=22, fill=(13, 38, 40), outline=(16, 185, 129), width=2)
    draw.text((104, 92), "COVERSPEC PRO™ SUITE", fill=(16, 185, 129), font=load_font(22, True))

    draw.text((80, 160), "Commercial Insurance", fill=(248, 250, 252), font=load_font(62, True))
    draw.text((80, 232), "& Actuarial Risk Calculators", fill=(16, 185, 129), font=load_font(62, True))
    draw.text((80, 326), "Workers' Comp (NCCI/EMR) • General Liability & Bonds • Cyber Liability", fill=(148, 163, 184), font=load_font(26, False))

    pills = ["NCCI & EMR", "WCIRB / TDI", "ISO CGL", "CSLB BONDS", "HIPAA / SOC 2", "WIRE FRAUD"]
    f_p = load_font(19, True)
    px, py = 80, 408
    for txt in pills:
        bb = draw.textbbox((0, 0), txt, font=f_p)
        pw = (bb[2] - bb[0]) + 32
        draw.rounded_rectangle([(px, py), (px + pw, py + 42)], radius=10, fill=(17, 28, 51), outline=(6, 182, 212), width=2)
        draw.text((px + 16, py + 9), txt, fill=(6, 182, 212), font=f_p)
        px += pw + 12

    draw.text((80, 520), "Instant Actuarial Benchmarks for CFOs, Business Owners & Commercial Contractors", fill=(100, 116, 139), font=load_font(22, False))
    img.save(out, "PNG", optimize=True)
    print(f"Generated {out}")


def build_pseo_page(p):
    tool = p["tool"]
    slug = p["slug"]
    tmeta = TOOLS[tool]
    url = f"{BASE_URL}/{tool}/{slug}/"
    parent_url = f"{BASE_URL}/{tool}/"
    siblings = [x for x in PAGES if x["tool"] == tool and x["slug"] != slug]

    bc_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "CoverSpec Pro", "item": f"{BASE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": tmeta["name"], "item": parent_url},
            {"@type": "ListItem", "position": 3, "name": p["short"], "item": url},
        ]
    }
    art_ld = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": p["title"],
        "description": p["desc"],
        "url": url,
        "dateModified": LAST_MOD,
        "author": {"@type": "Organization", "name": "CoverSpec Pro Actuarial"},
        "about": {"@type": "WebApplication", "name": tmeta["name"], "url": parent_url}
    }
    faq_ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in p["faqs"]
        ]
    }

    rows = "\n".join(
        f"<tr><td>{html.escape(c1)}</td><td><strong>{html.escape(c2)}</strong></td><td>{html.escape(c3)}</td></tr>"
        for c1, c2, c3 in p["table"]
    )
    faqs_html = "\n".join(
        f'<details class="faq-item"><summary>{html.escape(q)}</summary><div class="faq-answer">{html.escape(a)}</div></details>'
        for q, a in p["faqs"]
    )
    sib_html = "\n".join(
        f'<a href="../{s["slug"]}/" class="hub-card"><strong>📍 {html.escape(s["short"])}</strong><span>{html.escape(s["badge"])}</span></a>'
        for s in siblings
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(p['title'])} | CoverSpec Pro</title>
  <meta name="description" content="{html.escape(p['desc'])}">
  <link rel="canonical" href="{url}">
  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">
  <meta property="og:title" content="{html.escape(p['title'])}">
  <meta property="og:description" content="{html.escape(p['desc'])}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{BASE_URL}/assets/og-coverspec-pro.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="{BASE_URL}/assets/og-coverspec-pro.png">
  <script type="application/ld+json">
{json.dumps(bc_ld, indent=2)}
  </script>
  <script type="application/ld+json">
{json.dumps(art_ld, indent=2)}
  </script>
  <script type="application/ld+json">
{json.dumps(faq_ld, indent=2)}
  </script>
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="../../" class="brand-link"><span class="brand-shield">C</span><span>CoverSpec Pro™</span><span class="brand-tag">{html.escape(tmeta['short'])}</span></a>
      <nav class="header-nav">
        <a href="../../">Suite Home</a>
        <a href="../" class="active">Open Full Calculator</a>
        <a href="../../workers-comp/">Workers’ Comp</a>
        <a href="../../general-liability/">General Liability</a>
        <a href="../../cyber-liability/">Cyber Liability</a>
      </nav>
    </div>
  </header>

  <nav class="breadcrumb-bar" aria-label="Breadcrumb">
    <div class="container">
      <ol class="breadcrumb-list">
        <li><a href="../../">CoverSpec Pro</a></li>
        <li><a href="../">{html.escape(tmeta['name'])}</a></li>
        <li class="breadcrumb-current">{html.escape(p['short'])}</li>
      </ol>
    </div>
  </nav>

  <section class="hero-section">
    <div class="container">
      <div class="hero-badge">📍 {html.escape(p['badge'])}</div>
      <h1 class="hero-title">{p['h1']}</h1>
      <p class="hero-lead">{html.escape(p['lead'])}</p>
      <a href="../" class="btn btn-primary">⚡ Launch Interactive {html.escape(tmeta['name'])} &rarr;</a>
    </div>
  </section>

  <main class="main-content">
    <div class="container">
      <section class="section-block">
        <span class="section-kicker">Jurisdiction Underwriting Standards</span>
        <h2 class="section-heading">Key Regulatory &amp; Rating Factors</h2>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Statute / Standard</th><th>Requirement</th><th>Commercial Impact</th></tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </section>

      <section class="section-block">
        <span class="section-kicker">Regional Benchmark</span>
        <h2 class="section-heading">Worked Commercial Example</h2>
        <div class="formula-box">
          <p style="color:var(--text-main);font-size:0.96rem;margin-bottom:0.85rem;">{html.escape(p['example'])}</p>
          <a href="../" class="btn btn-primary">Run Your Exact Numbers in the Full Calculator &rarr;</a>
        </div>
      </section>

      <section class="section-block">
        <span class="section-kicker">Technical Q&amp;A</span>
        <h2 class="section-heading">Frequently Asked Questions — {html.escape(p['short'])}</h2>
        <div class="faq-list">{faqs_html}</div>
      </section>

      <section class="section-block">
        <span class="section-kicker">Other Editions</span>
        <h2 class="section-heading">More {html.escape(tmeta['short'])} State &amp; Industry Guides</h2>
        <div class="hub-grid">{sib_html}</div>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div><p><strong>CoverSpec Pro™</strong> — Commercial Insurance &amp; Actuarial Risk Suite.</p></div>
      <div class="footer-links"><a href="../../">Home</a><a href="../">Calculator</a><a href="../../sitemap.xml">Sitemap</a></div>
    </div>
  </footer>
</body>
</html>
"""


def inject_hubs():
    # Inject into each of the 3 parent calculators
    for tool in TOOLS:
        f = ROOT / tool / "index.html"
        txt = f.read_text(encoding="utf-8")
        cards = "\n".join(
            f'          <a href="{p["slug"]}/" class="hub-card"><strong>📍 {html.escape(p["short"])} &rarr;</strong><span>{html.escape(p["badge"])}</span></a>'
            for p in PAGES if p["tool"] == tool
        )
        block = f"""<!-- PSEO_HUB_START -->
      <section class="section-block">
        <span class="section-kicker">State &amp; Industry Editions</span>
        <h2 class="section-heading">Jurisdiction-Specific {html.escape(TOOLS[tool]['short'])} Guides</h2>
        <div class="hub-grid">
{cards}
        </div>
      </section>
      <!-- PSEO_HUB_END -->"""
        if "<!-- PSEO_HUB_PLACEHOLDER -->" in txt:
            txt = txt.replace("<!-- PSEO_HUB_PLACEHOLDER -->", block)
        else:
            txt = re.sub(r"<!-- PSEO_HUB_START -->.*?<!-- PSEO_HUB_END -->", block, txt, flags=re.S)
        f.write_text(txt, encoding="utf-8")

    # Inject directory onto root index.html
    hf = ROOT / "index.html"
    htxt = hf.read_text(encoding="utf-8")
    all_cards = "\n".join(
        f'          <a href="{p["tool"]}/{p["slug"]}/" class="hub-card"><strong>📍 {html.escape(p["short"])}</strong><span>{html.escape(TOOLS[p["tool"]]["short"])} • {html.escape(p["badge"])}</span></a>'
        for p in PAGES
    )
    hblock = f"""<!-- PSEO_HOME_START -->
      <section class="section-block" id="state-editions">
        <span class="section-kicker">State &amp; Regulatory Directory</span>
        <h2 class="section-heading">Browse by State Law &amp; Industry Regime</h2>
        <p class="section-desc">Direct commercial underwriting guides for Texas TDI, California WCIRB/CSLB, Florida DBPR, New York Labor Law 240, HIPAA, FTC Safeguards, and SOC 2.</p>
        <div class="hub-grid">
{all_cards}
        </div>
      </section>
      <!-- PSEO_HOME_END -->"""
    if "<!-- PSEO_HOME_PLACEHOLDER -->" in htxt:
        htxt = htxt.replace("<!-- PSEO_HOME_PLACEHOLDER -->", hblock)
    else:
        htxt = re.sub(r"<!-- PSEO_HOME_START -->.*?<!-- PSEO_HOME_END -->", hblock, htxt, flags=re.S)
    hf.write_text(htxt, encoding="utf-8")


def write_sitemap():
    urls = [("", "weekly", "1.0")] + [(f"{t}/", "monthly", "0.9") for t in TOOLS] + [(f"{p['tool']}/{p['slug']}/", "monthly", "0.8") for p in PAGES]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, freq, prio in urls:
        lines.append(f"  <url>\n    <loc>{BASE_URL}/{path}</loc>\n    <lastmod>{LAST_MOD}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{prio}</priority>\n  </url>")
    lines.append("</urlset>\n")
    (ROOT / "sitemap.xml").write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated sitemap.xml with {len(urls)} URLs.")


def verify_all():
    errs = 0
    ET.parse(ROOT / "sitemap.xml")
    for f in ROOT.rglob("*.html"):
        txt = f.read_text(encoding="utf-8")
        for b in re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', txt, re.S):
            try:
                json.loads(b)
            except Exception as e:
                print(f"JSON-LD ERROR in {f}: {e}")
                errs += 1
    for cf in (ROOT / "css").glob("*.css"):
        txt = cf.read_text(encoding="utf-8")
        if txt.count("{") != txt.count("}"):
            print(f"CSS BRACE ERROR in {cf}")
            errs += 1
    print(f"Verification complete across {len(list(ROOT.rglob('*.html')))} HTML files. Total errors: {errs}")
    assert errs == 0


def main():
    generate_og_image()
    for p in PAGES:
        out_dir = ROOT / p["tool"] / p["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(build_pseo_page(p), encoding="utf-8")
    print(f"Generated {len(PAGES)} programmatic state/industry pages.")
    inject_hubs()
    write_sitemap()
    verify_all()


if __name__ == "__main__":
    main()
