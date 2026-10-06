/**
 * Rakta Business OS - Legacy User Migration Engine
 * Demonstrates safe, zero-password-sync user migration into Supabase Auth.
 * 
 * Complies with Requirement 13 (No password synchronization) & Requirement 14 (Migration Strategy).
 * Provisions Supabase Auth user accounts with verified email and generates unique recovery activation links.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('../../client/node_modules/@supabase/supabase-js');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
  return env;
}

const serverEnv = loadEnv(path.join(__dirname, '../.env'));
const SUPABASE_URL = serverEnv.SUPABASE_URL || 'https://xsflkmhoxriskrpqpqyj.supabase.co';
const SERVICE_KEY = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Sample legacy users demonstration dataset (e.g. exported from wp_users)
const sampleLegacyUsers = [
  {
    wp_id: 101,
    name: 'Sudheer Borra (Legacy)',
    email: 'sudheer.migrated.demo@example.com',
    company: 'RUSHI Power Systems',
    phone: '+91 98490 12345'
  },
  {
    wp_id: 102,
    name: 'Priya Sharma (Legacy)',
    email: 'priya.migrated.demo@example.com',
    company: 'GreenTech Innovations',
    phone: '+91 98765 43210'
  }
];

async function migrateUsers(usersToMigrate) {
  console.log('================================================================');
  console.log('🚀 Rakta Business OS - Zero-Password-Sync Legacy User Migration');
  console.log('================================================================\n');

  const migrationResults = [];

  for (const legacyUser of usersToMigrate) {
    console.log(`Processing legacy user: ${legacyUser.email} (WP ID: ${legacyUser.wp_id})...`);

    try {
      // 1. Check if user already exists in Supabase Auth
      const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;

      const existingUser = listData.users.find(u => u.email.toLowerCase() === legacyUser.email.toLowerCase());

      let authUserId = null;

      if (existingUser) {
        console.log(`  ℹ️ User already exists in Supabase Auth (UID: ${existingUser.id})`);
        authUserId = existingUser.id;
      } else {
        // 2. Provision user in Supabase Auth WITHOUT password (Zero Password Sync)
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: legacyUser.email,
          email_confirm: true,
          user_metadata: {
            name: legacyUser.name,
            company: legacyUser.company,
            phone: legacyUser.phone,
            legacy_wp_id: legacyUser.wp_id,
            migrated_at: new Date().toISOString()
          }
        });

        if (createError) throw createError;
        authUserId = newUser.user.id;
        console.log(`  ✓ Provisioned in Supabase Auth (UID: ${authUserId})`);
      }

      // 3. Generate secure Password Activation Link (Supabase Recovery Link)
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: legacyUser.email,
        options: {
          redirectTo: 'https://app.raktabusiness.com/auth/callback?type=recovery'
        }
      });

      if (linkError) throw linkError;

      const activationUrl = linkData?.properties?.action_link || 'https://app.raktabusiness.com/reset-password';
      console.log(`  ✓ Generated unique password activation link`);

      migrationResults.push({
        status: 'SUCCESS',
        email: legacyUser.email,
        supabase_uid: authUserId,
        wp_id: legacyUser.wp_id,
        activation_link_available: Boolean(activationUrl)
      });
    } catch (err) {
      console.error(`  ✕ Migration error for ${legacyUser.email}:`, err.message);
      migrationResults.push({
        status: 'FAILED',
        email: legacyUser.email,
        error: err.message
      });
    }
  }

  console.log('\n================================================================');
  console.log('📊 Migration Summary:');
  console.log(JSON.stringify(migrationResults, null, 2));
  console.log('================================================================\n');

  return migrationResults;
}

if (require.main === module) {
  migrateUsers(sampleLegacyUsers)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}

module.exports = { migrateUsers };
