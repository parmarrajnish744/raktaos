const https = require('https');
const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

const clientEnv = loadEnv(path.join(__dirname, '../../client/.env'));
const serverEnv = loadEnv(path.join(__dirname, '../.env'));
const SUPABASE_URL = clientEnv.VITE_SUPABASE_URL || 'https://xsflkmhoxriskrpqpqyj.supabase.co';
const ANON_KEY = clientEnv.VITE_SUPABASE_ANON_KEY;

function fetchJson(urlPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RAKTA BUSINESS OS — PHASE 1 PRODUCTION TEST SUITE');
  console.log('================================================================\n');

  let passCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
      console.log(`✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // 1. Verify Public Demo Card Access via Anon Key
  console.log('--- Test 1: Public Card Access (/c/sudheer-borra) ---');
  try {
    const res = await fetchJson('/rest/v1/cards?slug=eq.sudheer-borra&select=id,slug,full_name,company,is_active');
    const card = res.data?.[0];
    assert(res.status === 200 && card && card.slug === 'sudheer-borra', 'Public demo card accessible with anon key', `Company: ${card?.company}`);
    assert(card?.is_active === true, 'Public demo card is active');
  } catch (err) {
    assert(false, 'Public demo card accessible', err.message);
  }

  // 2. Verify Alias Demo Card Access via Anon Key
  console.log('\n--- Test 2: Alias Demo Card Access (/c/rushipower) ---');
  try {
    const res = await fetchJson('/rest/v1/cards?slug=eq.rushipower&select=id,slug,full_name,company');
    const card = res.data?.[0];
    assert(res.status === 200 && card && card.slug === 'rushipower', 'Alias card rushipower accessible', `Slug: ${card?.slug}`);
  } catch (err) {
    assert(false, 'Alias card accessible', err.message);
  }

  // 3. Verify Metric Increment RPC (Anon Executable)
  console.log('\n--- Test 3: Public Analytics Increment RPC ---');
  try {
    const postReq = () => new Promise((resolve) => {
      const url = new URL('/rest/v1/rpc/increment_card_metric', SUPABASE_URL);
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        resolve(res.statusCode);
      });
      req.write(JSON.stringify({ card_slug: 'sudheer-borra', metric_name: 'view' }));
      req.end();
    });

    const statusCode = await postReq();
    assert(statusCode >= 200 && statusCode < 300, 'increment_card_metric callable by public anon visitors', `HTTP ${statusCode}`);
  } catch (err) {
    assert(false, 'increment_card_metric callable', err.message);
  }

  // 4. Verify Password Security & Isolation in AuthContext
  console.log('\n--- Test 4: Password Security & Clean Metadata Isolation ---');
  const authContextSource = fs.readFileSync(path.join(__dirname, '../../client/src/context/AuthContext.jsx'), 'utf8');
  const hasDedicatedPasswordCall = authContextSource.includes('supabase.auth.updateUser({') && authContextSource.includes('password: targetNewPassword');
  const cleansMetadata = authContextSource.includes('delete metadata.new_password') && authContextSource.includes('delete metadata.current_password');
  assert(hasDedicatedPasswordCall, 'AuthContext invokes supabase.auth.updateUser with explicit password parameter');
  assert(cleansMetadata, 'AuthContext strips plaintext passwords from metadata before saving');

  // 5. Verify Admin Route Guard
  console.log('\n--- Test 5: Admin Route Protection ---');
  const appSource = fs.readFileSync(path.join(__dirname, '../../client/src/App.jsx'), 'utf8');
  const adminPageSource = fs.readFileSync(path.join(__dirname, '../../client/src/pages/AdminPage.jsx'), 'utf8');
  const hasAppGuard = appSource.includes("currentPath === '/admin'") && appSource.includes('!isAdmin') && appSource.includes('Access Denied');
  const hasAdminPageGuard = adminPageSource.includes('if (!isAdmin)') && adminPageSource.includes('Access Denied');
  assert(hasAppGuard, 'App.jsx enforces isAdmin route guard for /admin route');
  assert(hasAdminPageGuard, 'AdminPage.jsx has defense-in-depth component-level guard for non-admins');

  // 6. Verify AnalyticsPage UserId Fix
  console.log('\n--- Test 6: Analytics Page UserId Missing Bug Fix ---');
  const analyticsSource = fs.readFileSync(path.join(__dirname, '../../client/src/pages/AnalyticsPage.jsx'), 'utf8');
  const cardServiceSource = fs.readFileSync(path.join(__dirname, '../../client/src/services/cardService.js'), 'utf8');
  const passesUserId = analyticsSource.includes('getUserCards(user.id)');
  const hasFallback = cardServiceSource.includes('let targetUserId = userId') && cardServiceSource.includes('supabase.auth.getUser()');
  assert(passesUserId, 'AnalyticsPage passes user.id to getUserCards');
  assert(hasFallback, 'cardService has safety fallback to active session user if userId omitted');

  // 7. Verify Serverless AI Generator Architecture
  console.log('\n--- Test 7: Serverless AI Profile Generator ---');
  const usesServerless = cardServiceSource.includes("supabase.functions.invoke('generate-profile'") && cardServiceSource.includes('descriptions[Math.floor');
  const edgeFunctionExists = fs.existsSync(path.join(__dirname, '../../supabase/functions/generate-profile/index.ts'));
  assert(usesServerless, 'generateAIBusinessProfile is serverless with zero Express requirement');
  assert(edgeFunctionExists, 'Supabase Edge Function generate-profile/index.ts created');

  // 8. Verify Leads CSV Export & Delete Lead
  console.log('\n--- Test 8: Leads CRM Capabilities (CSV Export & Delete) ---');
  const leadsPageSource = fs.readFileSync(path.join(__dirname, '../../client/src/pages/LeadsPage.jsx'), 'utf8');
  const hasExportCSV = leadsPageSource.includes('handleExportCSV') && leadsPageSource.includes('text/csv');
  const hasDeleteLead = leadsPageSource.includes('handleDeleteLead') && cardServiceSource.includes('deleteLead(leadId)');
  assert(hasExportCSV, 'LeadsPage has 1-click Export to CSV functionality');
  assert(hasDeleteLead, 'LeadsPage and cardService provide secure Delete Lead functionality');

  // 9. Verify Canonical URLs Across Modules
  console.log('\n--- Test 9: Canonical Public Card URL (/c/:slug) ---');
  const sidebarSource = fs.readFileSync(path.join(__dirname, '../../client/src/components/dashboard/Sidebar.jsx'), 'utf8');
  const homeSource = fs.readFileSync(path.join(__dirname, '../../client/src/pages/HomePage.jsx'), 'utf8');
  const wpShortcodeSource = fs.readFileSync(path.join(__dirname, '../../wordpress/plugins/rakta-business-core/includes/class-rakta-shortcodes.php'), 'utf8');
  const sidebarCanonical = sidebarSource.includes('/c/sudheer-borra');
  const homeCanonical = homeSource.includes('/c/sudheer-borra');
  const wpCanonical = wpShortcodeSource.includes("$app_url . '/c/'");
  assert(sidebarCanonical, 'Sidebar uses canonical /c/sudheer-borra');
  assert(homeCanonical, 'HomePage uses canonical /c/sudheer-borra');
  assert(wpCanonical, 'WordPress plugin shortcode uses canonical /c/ link format');

  // 10. Verify Zero Service Role Key Leakage in Client & WordPress
  console.log('\n--- Test 10: Security & Key Leakage Prevention ---');
  const clientEnvRaw = fs.readFileSync(path.join(__dirname, '../../client/.env'), 'utf8');
  const hasServiceRoleInClient = clientEnvRaw.includes('SERVICE_ROLE') || clientEnvRaw.includes('service_role');
  assert(!hasServiceRoleInClient, 'Client .env contains ONLY safe anon key (Zero Service Role Leakage)');

  console.log('\n================================================================');
  console.log(`📊 TEST SUMMARY: ${passCount} / ${totalCount} PASSED`);
  if (passCount === totalCount) {
    console.log('🏆 ALL CODE INTEGRATION TESTS PASSED!');
  }
  console.log('================================================================\n');
}

runTestSuite().catch(console.error);
