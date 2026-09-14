#!/usr/bin/env node
/**
 * Portfolio Management — permission gate check.
 *
 *   node scripts/verify-portfolio-permissions.cjs
 *
 * Two of these gates were on the wrong code (see
 * docs/BACKEND_PERMISSIONS_PORTFOLIO.md), and one of them was a privilege
 * question rather than a cosmetic one: Reports sat on the code that guards a
 * single investor's own dashboard, so anyone who could see their own could read
 * the whole book. This asserts the corrected mapping so neither can regress
 * quietly.
 *
 * What it checks
 *   1. every PORTFOLIO_* code the app uses is one identity-service registered
 *   2. each menu row is gated on the agreed code
 *   3. each page's write actions are gated on the agreed code
 *   4. which rows each role actually sees, for the roles identity-service
 *      reported grant counts for
 *
 * Scope: (1)-(3) read the real source. (4) models the sidebar's `hasAccess`
 * rather than importing it — that function is declared inline inside the
 * component and is not exported. The rule modelled is the one it implements for
 * codes of this shape: case-insensitive exact match on moduleCode/moduleName or
 * on a permission's permissionCode/code, recursing into sub-modules. The
 * display-name fallback is skipped for single-token keys, which all of these
 * are, so it does not apply.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SIDEBAR = path.join(ROOT, 'src/components/DashboardSideBar/DashboardSideBar.tsx');

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log('  FAIL  ' + msg);
};
const pass = (msg) => console.log('  ok    ' + msg);

/* ------------------------------------------------------------------ */
/* The catalogue identity-service reports as registered (V133–V142)     */
/* ------------------------------------------------------------------ */

const REGISTERED = new Set([
  'PORTFOLIO',
  'PORTFOLIO_REFERENCE_READ',
  'PORTFOLIO_REFERENCE_MANAGE',
  'PORTFOLIO_INVESTOR_READ',
  'PORTFOLIO_INVESTOR_MANAGE',
  'PORTFOLIO_INVESTOR_VERIFY',
  'PORTFOLIO_PRODUCT_READ',
  'PORTFOLIO_PRODUCT_MANAGE',
  'PORTFOLIO_PRODUCT_LIFECYCLE',
  'PORTFOLIO_FUND_READ',
  'PORTFOLIO_FUND_MANAGE',
  'PORTFOLIO_INVESTMENT_READ',
  'PORTFOLIO_INVESTMENT_MANAGE',
  'PORTFOLIO_INVESTMENT_APPROVE',
  'PORTFOLIO_PAYOUT_EXECUTE',
  'PORTFOLIO_SETTINGS_READ',
  'PORTFOLIO_SETTINGS_MANAGE',
  'PORTFOLIO_ALLOCATION_READ',
  'PORTFOLIO_ALLOCATION_MANAGE',
  'PORTFOLIO_ALLOCATION_APPROVE',
  'PORTFOLIO_ALLOCATION_EXECUTE',
  'PORTFOLIO_COMPLIANCE_READ',
  'PORTFOLIO_COMPLIANCE_MANAGE',
  'PORTFOLIO_COMPLIANCE_CONCLUDE',
  'PORTFOLIO_FX_READ',
  'PORTFOLIO_FX_MANAGE',
  'PORTFOLIO_DASHBOARD_READ',
  'PORTFOLIO_ADMIN_DASHBOARD_READ',
]);

/** The agreed gate for each menu row. `|` means the row opens on either. */
const EXPECTED_ROWS = {
  'Portfolio Management': 'PORTFOLIO',
  'Dashboard Overview': 'PORTFOLIO_ADMIN_DASHBOARD_READ',
  Investors: 'PORTFOLIO_INVESTOR_READ',
  'Products & Rates': 'PORTFOLIO_PRODUCT_READ',
  'System Settings': 'PORTFOLIO_SETTINGS_READ|PORTFOLIO_REFERENCE_READ',
  'Income Ranges': 'PORTFOLIO_REFERENCE_READ',
  'Initial Invest': 'PORTFOLIO_REFERENCE_READ',
  'Investment Experience': 'PORTFOLIO_REFERENCE_READ',
  'Investment Timeline': 'PORTFOLIO_REFERENCE_READ',
  'Approve Investment': 'PORTFOLIO_INVESTMENT_APPROVE',
  Investments: 'PORTFOLIO_INVESTMENT_READ',
  'Allocation Engine': 'PORTFOLIO_ALLOCATION_READ',
  Reports: 'PORTFOLIO_ADMIN_DASHBOARD_READ',
  'Audit Logs': 'PORTFOLIO_ADMIN_DASHBOARD_READ',
};

/** Write actions inside a page the user can already open. */
const EXPECTED_PAGE_GATES = {
  'src/pages/InvestorPages/admin/income-ranges/IncomeRangeList.tsx': 'PORTFOLIO_REFERENCE_MANAGE',
  'src/pages/InvestorPages/admin/initial-invest/InitialInvestList.tsx': 'PORTFOLIO_REFERENCE_MANAGE',
  'src/pages/InvestorPages/admin/investment-experience/InvestmentExperienceList.tsx':
    'PORTFOLIO_REFERENCE_MANAGE',
  'src/pages/InvestorPages/admin/investment-timeline/InvestmentTimelineList.tsx':
    'PORTFOLIO_REFERENCE_MANAGE',
  'src/pages/InvestorPages/admin/investors/InvestorsList.tsx': 'PORTFOLIO_INVESTOR_MANAGE',
  'src/pages/InvestorPages/admin/investors/AddInvestor.tsx': 'PORTFOLIO_INVESTOR_MANAGE',
  'src/pages/InvestorPages/admin/investors/KycDocuments.tsx': 'PORTFOLIO_INVESTOR_MANAGE',
  'src/pages/InvestorPages/admin/investors/DocumentPreview.tsx': 'PORTFOLIO_INVESTOR_VERIFY',
  'src/pages/InvestorPages/admin/investors/InvestorDocuments.tsx': 'PORTFOLIO_INVESTOR_VERIFY',
  'src/pages/InvestorPages/admin/products/ProductsListNew.tsx': 'PORTFOLIO_PRODUCT_MANAGE',
  'src/pages/InvestorPages/admin/products/ProductConfiguration.tsx': 'PORTFOLIO_PRODUCT_MANAGE',
  'src/pages/InvestorPages/admin/investments/InvestmentsList.tsx': 'PORTFOLIO_INVESTMENT_MANAGE',
  'src/pages/InvestorPages/admin/investments/InvestmentAdjust.tsx': 'PORTFOLIO_INVESTMENT_MANAGE',
  'src/pages/InvestorPages/admin/investments/ApproveInvestment.tsx': 'PORTFOLIO_INVESTMENT_APPROVE',
  'src/pages/InvestorPages/admin/allocation/AllocationDashboard.tsx': 'PORTFOLIO_ALLOCATION_MANAGE',
  'src/pages/InvestorPages/admin/allocation/StrategiesList.tsx': 'PORTFOLIO_ALLOCATION_MANAGE',
  'src/pages/InvestorPages/admin/allocation/CreateStrategy.tsx': 'PORTFOLIO_ALLOCATION_MANAGE',
  'src/pages/InvestorPages/admin/allocation/RiskProfiles.tsx': 'PORTFOLIO_ALLOCATION_MANAGE',
};

/* ------------------------------------------------------------------ */
/* Read the gates out of the source                                     */
/* ------------------------------------------------------------------ */

const readRows = () => {
  const lines = fs.readFileSync(SIDEBAR, 'utf8').split(/\r?\n/);
  const start = lines.findIndex((l) => l.includes('label: "Portfolio Management"'));
  if (start === -1) throw new Error('Portfolio module not found in the sidebar');
  let end = -1;
  for (let i = start; i < lines.length; i += 1) {
    if (lines[i] === '  ].filter(Boolean);') { end = i; break; }
  }

  const rows = [];
  let gate = null;
  let commented = false;
  for (let i = start - 10; i < end; i += 1) {
    const raw = lines[i];
    const isComment = raw.trim().startsWith('//') || raw.trim().startsWith('*');
    const text = raw.replace(/^\s*\/\/\s?/, '').trim();

    const single = text.match(/hasAccess\("(PORTFOLIO[A-Z_]*)"\)/);
    const list = text.match(/hasAccess\(\[([^\]]*)\]\)/);
    if (single) { gate = single[1]; commented = isComment; }
    else if (list) {
      gate = list[1].split(',').map((k) => k.trim().replace(/"/g, '')).join('|');
      commented = isComment;
    }

    const label = text.match(/^label: "([^"]+)"/);
    if (label && gate) {
      rows.push({ label: label[1], gate, hidden: commented });
      gate = null;
      commented = false;
    }
  }
  return rows;
};

/* ------------------------------------------------------------------ */
/* 1–3. the gates themselves                                            */
/* ------------------------------------------------------------------ */

const rows = readRows();

console.log('\n1. Every code the app uses is registered');
{
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name)) files.push(full);
    }
  };
  walk(path.join(ROOT, 'src/pages/InvestorPages'));
  files.push(SIDEBAR);

  const used = new Set();
  for (const file of files) {
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      for (const m of line.matchAll(/["'](PORTFOLIO[A-Z_]*)["']/g)) used.add(m[1]);
    }
  }
  const unknown = [...used].filter((c) => !REGISTERED.has(c)).sort();
  if (unknown.length) unknown.forEach((c) => fail(c + ' is not in the registered catalogue'));
  else pass(used.size + ' distinct codes, all registered');
}

console.log('\n2. Menu rows are gated on the agreed code');
for (const [label, expected] of Object.entries(EXPECTED_ROWS)) {
  const row = rows.find((r) => r.label === label && !r.hidden);
  if (!row) fail(label + ' — row not found, or commented out');
  else if (row.gate !== expected) fail(label + ' — gated on ' + row.gate + ', expected ' + expected);
  else pass(label.padEnd(24) + expected);
}
{
  // The investor-dashboard code must gate no menu row: it guards one
  // investor's own portfolio, not the book.
  const stray = rows.filter((r) => !r.hidden && r.gate.split('|').includes('PORTFOLIO_DASHBOARD_READ'));
  if (stray.length) stray.forEach((r) => fail(r.label + ' still uses the investor-dashboard code'));
  else pass('PORTFOLIO_DASHBOARD_READ gates no menu row');
}

console.log('\n3. Page write actions are gated on the agreed code');
for (const [rel, expected] of Object.entries(EXPECTED_PAGE_GATES)) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { fail(rel + ' — file missing'); continue; }
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes("hasPermission('" + expected + "')")) {
    const found = [...src.matchAll(/hasPermission\('(PORTFOLIO[A-Z_]*)'\)/g)].map((m) => m[1]);
    fail(path.basename(rel) + ' — gated on ' + (found.join(', ') || 'nothing') + ', expected ' + expected);
  } else pass(path.basename(rel).padEnd(32) + expected);
}

/* ------------------------------------------------------------------ */
/* 4. What each role sees                                               */
/* ------------------------------------------------------------------ */

/**
 * The sidebar's rule for codes of this shape. See the header note: this models
 * `hasAccess`, it does not import it.
 */
const grants = (permissionData, key) => {
  const modules = Array.isArray(permissionData)
    ? permissionData
    : Object.values(permissionData || {}).flat();
  if (!modules.length) return false;
  const want = key.toLowerCase();
  const match = (mod) => {
    if ((mod.moduleCode || '').toLowerCase() === want) return true;
    if ((mod.moduleName || '').toLowerCase() === want) return true;
    for (const p of mod.permissionsList || mod.permissions || []) {
      if ((p.permissionCode || p.code || '').toLowerCase() === want) return true;
    }
    return (mod.subModulesList || mod.sub_modules || []).some(match);
  };
  return modules.some(match);
};

const payloadFor = (codes) => ({
  los: [
    {
      moduleCode: 'PORTFOLIO',
      moduleName: 'Investor Portfolio',
      permissionsList: codes.map((permissionCode) => ({ permissionCode })),
    },
  ],
});

const ALL = [...REGISTERED].filter((c) => c !== 'PORTFOLIO');

/* The grant counts identity-service reported on DEV. Only `admin` is claimed
   to hold everything; the partial holders are the interesting cases. */
const ROLES = {
  'admin (27/27)': ALL,
  'reference-only': ['PORTFOLIO_REFERENCE_READ'],
  'settings-only (the old gate)': ['PORTFOLIO_SETTINGS_READ', 'PORTFOLIO_SETTINGS_MANAGE'],
  'investor-dashboard only': ['PORTFOLIO_DASHBOARD_READ'],
  'investor read-only': ['PORTFOLIO_INVESTOR_READ'],
  none: [],
};

console.log('\n4. What each role sees');
for (const [role, codes] of Object.entries(ROLES)) {
  const data = payloadFor(codes);
  const visible = rows
    .filter((r) => !r.hidden && r.label !== 'Portfolio Management')
    .filter((r) => r.gate.split('|').some((k) => grants(data, k)))
    .map((r) => r.label);
  const groupOpen = grants(data, 'PORTFOLIO');
  console.log(
    '\n  ' + role + (groupOpen ? '' : '  [group hidden]') + ' — ' + visible.length + ' row(s)'
  );
  visible.forEach((v) => console.log('      · ' + v));
  if (!visible.length) console.log('      (nothing)');
}

/* The two corrections, stated as assertions rather than left to the eye. */
console.log('\n   Regressions guarded');
{
  const investorOnly = payloadFor(['PORTFOLIO_DASHBOARD_READ']);
  const reportsRow = rows.find((r) => r.label === 'Reports' && !r.hidden);
  if (reportsRow && reportsRow.gate.split('|').some((k) => grants(investorOnly, k))) {
    fail('a role with only the investor-dashboard code can still open Reports');
  } else pass('investor-dashboard code alone does not open Reports');

  const settingsOnly = payloadFor(['PORTFOLIO_SETTINGS_READ']);
  const catalogues = ['Income Ranges', 'Initial Invest', 'Investment Experience', 'Investment Timeline'];
  const leaked = catalogues.filter((label) => {
    const row = rows.find((r) => r.label === label && !r.hidden);
    return row && row.gate.split('|').some((k) => grants(settingsOnly, k));
  });
  if (leaked.length) {
    fail('settings-only role is still shown ' + leaked.join(', ') + ' — every call would 403');
  } else pass('settings-only role is not shown the four catalogue screens');
}

console.log(
  '\n' + (failures === 0 ? 'PASS — every gate is on the code the service enforces' : failures + ' FAILURE(S)')
);
process.exit(failures === 0 ? 0 : 1);
