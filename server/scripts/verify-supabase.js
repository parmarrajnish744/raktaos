const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually parse .env without external dependencies
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

const serverEnv = loadEnv(path.join(__dirname, '../.env'));
const SUPABASE_URL = serverEnv.SUPABASE_URL || 'https://xsflkmhoxriskrpqpqyj.supabase.co';
const SERVICE_KEY = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in server/.env');
  process.exit(1);
}

function fetchJson(urlPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function verifySupabase() {
  console.log('====================================================');
  console.log('🔍 RAKTA BUSINESS OS — SUPABASE CLOUD VERIFICATION');
  console.log('Target URL:', SUPABASE_URL);
  console.log('====================================================\n');

  let allPassed = true;

  // 1. Check OpenAPI Spec for Tables
  console.log('1. Checking Database Tables...');
  const openApi = await fetchJson('/rest/v1/');
  const definitions = Object.keys(openApi.data?.definitions || {});
  const requiredTables = ['cards', 'businesses', 'business_services', 'leads', 'analytics_events'];

  requiredTables.forEach(table => {
    if (definitions.includes(table)) {
      console.log(`  ✅ Table '${table}': FOUND`);
    } else {
      console.log(`  ❌ Table '${table}': MISSING`);
      allPassed = false;
    }
  });

  // 2. Check RPCs
  console.log('\n2. Checking Stored Procedures (RPCs)...');
  const paths = Object.keys(openApi.data?.paths || {});
  const requiredRPCs = [
    '/rpc/increment_card_metric',
    '/rpc/record_card_event',
    '/rpc/submit_card_lead'
  ];

  requiredRPCs.forEach(rpc => {
    if (paths.includes(rpc)) {
      console.log(`  ✅ RPC '${rpc.replace('/rpc/', '')}': REGISTERED`);
    } else {
      console.log(`  ❌ RPC '${rpc.replace('/rpc/', '')}': MISSING`);
      allPassed = false;
    }
  });

  // 3. Check Storage Buckets
  console.log('\n3. Checking Storage Buckets...');
  const storageRes = await fetchJson('/storage/v1/bucket');
  const buckets = Array.isArray(storageRes.data) ? storageRes.data : [];
  const cardAssets = buckets.find(b => b.id === 'card-assets');

  if (cardAssets) {
    console.log(`  ✅ Bucket 'card-assets': ACTIVE (public: ${cardAssets.public})`);
  } else {
    console.log(`  ❌ Bucket 'card-assets': MISSING`);
    allPassed = false;
  }

  // 4. Check Demo Card
  console.log('\n4. Checking Reference Demo Card (/c/sudheer-borra)...');
  const cardRes = await fetchJson('/rest/v1/cards?slug=eq.sudheer-borra&select=id,slug,full_name,company,is_active');
  const demoCard = Array.isArray(cardRes.data) && cardRes.data[0];

  if (demoCard) {
    console.log(`  ✅ Demo Card '${demoCard.slug}': FOUND (${demoCard.full_name} - ${demoCard.company})`);
  } else {
    console.log(`  ⚠️ Demo Card 'sudheer-borra': NOT SEEDED YET`);
  }

  console.log('\n====================================================');
  if (allPassed && demoCard) {
    console.log('🎉 RESULT: SUPABASE CLOUD IS 100% PRODUCTION READY!');
  } else if (!allPassed) {
    console.log('⚠️ RESULT: SCHEMA PENDING EXECUTION IN SUPABASE SQL EDITOR');
    console.log('Please execute supabase/schema.sql in https://supabase.com/dashboard');
  }
  console.log('====================================================\n');
}

verifySupabase().catch(err => {
  console.error('Verification failed with error:', err);
});
