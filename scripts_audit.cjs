const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// === 1. Walk all source files and extract t("key", ...) calls ===
const ROOTS = ['app', 'components', 'lib'];
const STATIC_KEYS = new Set();
const DYNAMIC_PATTERNS = []; // {file, line, expr}

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next' || e.name === 'dist') continue;
      walk(p, files);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      files.push(p);
    }
  }
  return files;
}

const files = ROOTS.flatMap(r => fs.existsSync(r) ? walk(r) : []);

const STATIC_RE = /\bt\(\s*"([^"\\]+)"\s*[,\)]/g;
const STATIC_RE2 = /\bt\(\s*'([^'\\]+)'\s*[,\)]/g;
const DYNAMIC_RE = /\bt\(\s*([a-zA-Z_$][\w$]*\(|\`)/g;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = STATIC_RE.exec(src)) !== null) STATIC_KEYS.add(m[1]);
  while ((m = STATIC_RE2.exec(src)) !== null) STATIC_KEYS.add(m[1]);
  while ((m = DYNAMIC_RE.exec(src)) !== null) {
    const idx = m.index;
    const upToHere = src.slice(0, idx);
    const line = upToHere.split('\n').length;
    DYNAMIC_PATTERNS.push({ file: f, line, hint: src.slice(idx, idx + 80).split('\n')[0] });
  }
}

console.log('=== STATIC KEY EXTRACTION ===');
console.log('Static t("key") calls found:', STATIC_KEYS.size);
console.log('Dynamic t(fn()/template) call sites:', DYNAMIC_PATTERNS.length);

// === 2. Fetch DB ===
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  // Fetch ALL translations (paginated to be safe)
  const PAGE = 1000;
  let from = 0;
  const all = [];
  while (true) {
    const { data, error } = await sb.from('translations').select('key,locale,value').range(from, from + PAGE - 1);
    if (error) { console.error(error); break; }
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  const enKeys = new Set(all.filter(r => r.locale === 'en' && r.value && r.value.trim()).map(r => r.key));
  const ltKeys = new Set(all.filter(r => r.locale === 'lt' && r.value && r.value.trim()).map(r => r.key));
  const enEmpty = new Set(all.filter(r => r.locale === 'en' && (!r.value || !r.value.trim())).map(r => r.key));
  const ltEmpty = new Set(all.filter(r => r.locale === 'lt' && (!r.value || !r.value.trim())).map(r => r.key));

  console.log('\n=== DATABASE STATE ===');
  console.log('Total rows:', all.length);
  console.log('EN keys with values:', enKeys.size, '  empty values:', enEmpty.size);
  console.log('LT keys with values:', ltKeys.size, '  empty values:', ltEmpty.size);

  // Union of all keys ever stored
  const allDbKeys = new Set([...enKeys, ...ltKeys, ...enEmpty, ...ltEmpty]);
  
  // === 3. Diff against code usage ===
  const usedNotInDb = [...STATIC_KEYS].filter(k => !allDbKeys.has(k)).sort();
  const inDbNotUsed = [...allDbKeys].filter(k => !STATIC_KEYS.has(k)).sort();
  const usedMissingEn = [...STATIC_KEYS].filter(k => allDbKeys.has(k) && !enKeys.has(k)).sort();
  const usedMissingLt = [...STATIC_KEYS].filter(k => allDbKeys.has(k) && !ltKeys.has(k)).sort();
  
  console.log('\n=== DIFFS (static keys only) ===');
  console.log('Used in code but NOT in DB at all:', usedNotInDb.length);
  console.log('In DB but no static usage in code (may be dynamic):', inDbNotUsed.length);
  console.log('Used in code, in DB, but missing/empty EN value:', usedMissingEn.length);
  console.log('Used in code, in DB, but missing/empty LT value:', usedMissingLt.length);

  // Group missing-from-DB by prefix
  const bySection = {};
  usedNotInDb.forEach(k => {
    const sec = k.split('.').slice(0,2).join('.');
    (bySection[sec] = bySection[sec] || []).push(k);
  });
  console.log('\n=== KEYS USED IN CODE BUT NOT IN DB (by section) ===');
  Object.keys(bySection).sort().forEach(sec => {
    console.log(`\n[${sec}] (${bySection[sec].length})`);
    bySection[sec].slice(0, 30).forEach(k => console.log('  ' + k));
    if (bySection[sec].length > 30) console.log(`  ... +${bySection[sec].length - 30} more`);
  });

  // EN/LT mismatch summary among keys that exist
  const allKeysWithAny = [...allDbKeys];
  const enOnly = allKeysWithAny.filter(k => enKeys.has(k) && !ltKeys.has(k));
  const ltOnly = allKeysWithAny.filter(k => ltKeys.has(k) && !enKeys.has(k));
  console.log('\n=== EN/LT PARITY (across all DB keys) ===');
  console.log('Keys with EN but no LT:', enOnly.length);
  console.log('Keys with LT but no EN:', ltOnly.length);
  
  // Save details to file
  const report = {
    summary: {
      static_keys_in_code: STATIC_KEYS.size,
      dynamic_call_sites: DYNAMIC_PATTERNS.length,
      db_total_rows: all.length,
      db_en_with_values: enKeys.size,
      db_lt_with_values: ltKeys.size,
      used_not_in_db: usedNotInDb.length,
      in_db_not_used: inDbNotUsed.length,
      en_only: enOnly.length,
      lt_only: ltOnly.length,
    },
    used_not_in_db: usedNotInDb,
    en_only: enOnly.sort(),
    lt_only: ltOnly.sort(),
    in_db_not_used_sample: inDbNotUsed.slice(0, 50),
    dynamic_call_sites: DYNAMIC_PATTERNS,
  };
  fs.writeFileSync('/tmp/i18n_audit_report.json', JSON.stringify(report, null, 2));
  console.log('\nFull report: /tmp/i18n_audit_report.json');
})();
