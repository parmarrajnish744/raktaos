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

const serverEnv = loadEnv(path.join(__dirname, '../.env'));
const SUPABASE_URL = serverEnv.SUPABASE_URL || 'https://xsflkmhoxriskrpqpqyj.supabase.co';
const SERVICE_KEY = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

const DEMO_USER_ID = '377d2c5d-29ac-4b90-a09e-a1a409ed316d'; // demo@digitalcard.com

const baseCard = {
  user_id: DEMO_USER_ID,
  full_name: 'Sudheer Borra',
  designation: 'Managing Director',
  company: 'RUSHI Power Systems Pvt. Ltd.',
  company_name: 'RUSHI Power Systems Pvt. Ltd.',
  phone: '+91 98490 12345',
  alternate_phone: '+91 98490 54321',
  email: 'sudheer@rushipower.com',
  whatsapp: '+919849012345',
  website: 'https://rushipower.com',
  address: 'Secunderabad, Telangana, India',
  addresses: [
    {
      id: 'addr-1',
      type: 'Registered Office',
      address: 'Plot No. 42, Phase-II, Industrial Development Area, Cherlapally',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500051'
    },
    {
      id: 'addr-2',
      type: 'Factory Office',
      address: 'Survey No. 128/A, Tech Industrial Zone, Medchal Malkajgiri',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '501401'
    }
  ],
  company_description: 'Pioneering turnkey electrical systems, industrial substations, and smart grid automation since 2008.',
  industry: 'Electrical & Energy Engineering',
  gst_number: '36AABCR1234F1Z8',
  registration_number: 'U40100TG2008PTC059123',
  tagline: 'ISO 9001:2015 Certified Power Solutions',
  theme: 'corporate-blue',
  primary_color: '#0B2E59',
  secondary_color: '#2563EB',
  button_style: 'rounded',
  card_style: 'modern',
  font_family: 'Inter',
  social_links: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/rushipower', is_active: 1 },
    { platform: 'Website', url: 'https://rushipower.com', is_active: 1 },
    { platform: 'WhatsApp', url: 'https://wa.me/919849012345', is_active: 1 }
  ],
  is_active: true,
  views_count: 148,
  scans_count: 89,
  downloads_count: 64
};

function postOrPatchCard(cardData) {
  return new Promise((resolve, reject) => {
    const checkUrl = new URL(`/rest/v1/cards?slug=eq.${cardData.slug}`, SUPABASE_URL);
    const checkReq = https.request({
      hostname: checkUrl.hostname,
      path: checkUrl.pathname + checkUrl.search,
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let existing = [];
        try { existing = JSON.parse(data); } catch (_) {}
        const method = existing.length > 0 ? 'PATCH' : 'POST';
        const targetPath = existing.length > 0 ? `/rest/v1/cards?slug=eq.${cardData.slug}` : '/rest/v1/cards';

        const saveUrl = new URL(targetPath, SUPABASE_URL);
        const payload = JSON.stringify(cardData);
        const saveReq = https.request({
          hostname: saveUrl.hostname,
          path: saveUrl.pathname + saveUrl.search,
          method,
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }, (saveRes) => {
          let saveData = '';
          saveRes.on('data', c => saveData += c);
          saveRes.on('end', () => {
            resolve({ status: saveRes.statusCode, slug: cardData.slug });
          });
        });

        saveReq.on('error', reject);
        saveReq.write(payload);
        saveReq.end();
      });
    });

    checkReq.on('error', reject);
    checkReq.end();
  });
}

async function main() {
  console.log('Seeding demo cards...');
  const res1 = await postOrPatchCard({ ...baseCard, slug: 'sudheer-borra' });
  console.log('Card sudheer-borra status:', res1.status);

  const res2 = await postOrPatchCard({ ...baseCard, slug: 'rushipower', views_count: 94, scans_count: 52, downloads_count: 38 });
  console.log('Card rushipower status:', res2.status);
}

main().catch(console.error);
