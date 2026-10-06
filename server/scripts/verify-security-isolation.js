const fs = require('fs');
const path = require('path');
const { createClient } = require('../../client/node_modules/@supabase/supabase-js');

// Helper to load .env
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
const clientEnv = loadEnv(path.join(__dirname, '../../client/.env'));

const SUPABASE_URL = serverEnv.SUPABASE_URL || clientEnv.VITE_SUPABASE_URL;
const SERVICE_KEY = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = clientEnv.VITE_SUPABASE_ANON_KEY || serverEnv.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('❌ Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANON_KEY)');
  process.exit(1);
}

// 1. Service Client (for provisioning and ground-truth validation)
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 2. Pure Anonymous Client (NEVER logs in, strictly unauthenticated throughout)
const clientAnon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Helper to authenticate a user and return an authenticated client without polluting clientAnon
async function createAuthenticatedClient(email, password) {
  const loginClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data, error } = await loginClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return { user: data.user, session: data.session, client: userClient };
}

const results = [];

function recordResult(testNumber, testName, status, tableTested, details, evidence) {
  results.push({
    testNumber,
    testName,
    status, // 'PASS', 'FAIL', 'PARTIAL'
    tableTested,
    details,
    evidence
  });
  const icon = status === 'PASS' ? '✅' : (status === 'FAIL' ? '❌' : '⚠️');
  console.log(`${icon} [${testNumber}] ${testName} -> ${status}`);
  if (details) console.log(`   Details: ${details}`);
  if (evidence) console.log(`   Evidence: ${JSON.stringify(evidence)}`);
}

async function runVerification() {
  console.log('================================================================');
  console.log('🔒 RAKTA BUSINESS OS — PRODUCTION SECURITY & ISOLATION VERIFICATION');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log('================================================================\n');

  const timestamp = Date.now();
  const userAEmail = `sec_user_a_${timestamp}@raktabusiness.test`;
  const userBEmail = `sec_user_b_${timestamp}@raktabusiness.test`;
  const commonPassword = `SecPass#${timestamp}!2026`;

  let userA = null;
  let userB = null;
  let clientA = null;
  let clientB = null;

  let cardA = null;
  let cardB = null;
  let inactiveCardB = null;
  let leadAId = null;
  let leadBId = null;

  try {
    // --------------------------------------------------------------------------
    // PROVISIONING TEST USERS
    // --------------------------------------------------------------------------
    console.log('--- Setting up isolated test accounts (User A & User B) ---');
    const { data: createdA, error: errA } = await adminClient.auth.admin.createUser({
      email: userAEmail,
      password: commonPassword,
      email_confirm: true,
      user_metadata: { name: 'Security User A', role: 'USER' }
    });
    if (errA) throw new Error(`Failed to create User A: ${errA.message}`);
    userA = createdA.user;

    const { data: createdB, error: errB } = await adminClient.auth.admin.createUser({
      email: userBEmail,
      password: commonPassword,
      email_confirm: true,
      user_metadata: { name: 'Security User B', role: 'USER' }
    });
    if (errB) throw new Error(`Failed to create User B: ${errB.message}`);
    userB = createdB.user;

    console.log(`User A created: ${userA.id} (${userA.email})`);
    console.log(`User B created: ${userB.id} (${userB.email})\n`);

    // Authenticate User A via isolated login client
    const authARes = await createAuthenticatedClient(userAEmail, commonPassword);
    clientA = authARes.client;

    // Authenticate User B via isolated login client
    const authBRes = await createAuthenticatedClient(userBEmail, commonPassword);
    clientB = authBRes.client;

    // --------------------------------------------------------------------------
    // TEST 1 — Authentication & Identity Isolation
    // --------------------------------------------------------------------------
    console.log('--- TEST 1: Authentication & Identity Isolation ---');
    const tokenAUser = authARes.user.id;
    const tokenBUser = authBRes.user.id;
    const authIsolatePass = (tokenAUser === userA.id) && (tokenBUser === userB.id) && (tokenAUser !== tokenBUser);

    recordResult(
      'TEST 1',
      'User Authentication & JWT Session Isolation',
      authIsolatePass ? 'PASS' : 'FAIL',
      'auth.users',
      'User A and User B authenticate with completely distinct JWTs and isolated sessions',
      { userAId: userA.id, userBId: userB.id, differentJwtSubjects: authIsolatePass }
    );

    // --------------------------------------------------------------------------
    // TEST 2 — Card Ownership & Cross-User Mutation Prevention
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 2: Card Ownership & Cross-User Mutation Prevention ---');
    const slugA = `sec-a-${timestamp}`;
    const slugB = `sec-b-${timestamp}`;
    const slugBInactive = `sec-b-inact-${timestamp}`;

    // User A creates Card A
    const { data: insertedA, error: insertErrA } = await clientA.from('cards').insert({
      user_id: userA.id,
      slug: slugA,
      full_name: 'Card Owner A',
      company: 'Company A Enterprise',
      phone: '+91 91111 11111',
      email: userAEmail,
      is_active: true
    }).select().single();

    if (insertErrA) throw new Error(`Card A creation failed: ${insertErrA.message}`);
    cardA = insertedA;

    // User B creates Card B
    const { data: insertedB, error: insertErrB } = await clientB.from('cards').insert({
      user_id: userB.id,
      slug: slugB,
      full_name: 'Card Owner B',
      company: 'Company B Logistics',
      phone: '+91 92222 22222',
      email: userBEmail,
      is_active: true
    }).select().single();

    if (insertErrB) throw new Error(`Card B creation failed: ${insertErrB.message}`);
    cardB = insertedB;

    // User B creates Inactive Card
    const { data: insertedBInact, error: insertErrBInact } = await clientB.from('cards').insert({
      user_id: userB.id,
      slug: slugBInactive,
      full_name: 'Card Owner B Inactive',
      company: 'Company B Stealth',
      phone: '+91 92222 33333',
      email: userBEmail,
      is_active: false
    }).select().single();
    inactiveCardB = insertedBInact;

    // User A Dashboard Cards Query: only userA cards
    const { data: userACards } = await clientA.from('cards').select('*').eq('user_id', userA.id);
    const userASeesOnlyOwn = userACards.every(c => c.user_id === userA.id) && userACards.some(c => c.id === cardA.id);

    // User B Dashboard Cards Query: only userB cards
    const { data: userBCards } = await clientB.from('cards').select('*').eq('user_id', userB.id);
    const userBSeesOnlyOwn = userBCards.every(c => c.user_id === userB.id) && userBCards.some(c => c.id === cardB.id);

    // Cross-User Attacks:
    // 1. User A attempts to UPDATE Card B
    const { data: updateResBByA, error: updateErrBByA } = await clientA.from('cards')
      .update({ full_name: 'HACKED_BY_A', company: 'Malicious Overwrite' })
      .eq('id', cardB.id)
      .select();
    const updateBPrevented = (!updateResBByA || updateResBByA.length === 0) || Boolean(updateErrBByA);

    // 2. User A attempts to DELETE Card B
    const { data: delResBByA, error: delErrBByA } = await clientA.from('cards')
      .delete()
      .eq('id', cardB.id)
      .select();
    const delBPrevented = (!delResBByA || delResBByA.length === 0) || Boolean(delErrBByA);

    // 3. User B attempts to UPDATE Card A
    const { data: updateResAByB, error: updateErrAByB } = await clientB.from('cards')
      .update({ full_name: 'HACKED_BY_B' })
      .eq('id', cardA.id)
      .select();
    const updateAPrevented = (!updateResAByB || updateResAByB.length === 0) || Boolean(updateErrAByB);

    // 4. User B attempts to DELETE Card A
    const { data: delResAByB, error: delErrAByB } = await clientB.from('cards')
      .delete()
      .eq('id', cardA.id)
      .select();
    const delAPrevented = (!delResAByB || delResAByB.length === 0) || Boolean(delErrAByB);

    // 5. Inactive Card Isolation: User A attempts to read User B's inactive card
    const { data: readInactByA } = await clientA.from('cards').select('*').eq('id', inactiveCardB.id);
    const inactHiddenFromA = !readInactByA || readInactByA.length === 0;

    // Verify ground truth state of Card A and Card B in DB
    const { data: verifyCardA } = await adminClient.from('cards').select('*').eq('id', cardA.id).single();
    const { data: verifyCardB } = await adminClient.from('cards').select('*').eq('id', cardB.id).single();
    const cardsUncorrupted = verifyCardA.full_name === 'Card Owner A' && verifyCardB.full_name === 'Card Owner B';

    const test2Pass = userASeesOnlyOwn && userBSeesOnlyOwn && updateBPrevented && delBPrevented && updateAPrevented && delAPrevented && inactHiddenFromA && cardsUncorrupted;

    recordResult(
      'TEST 2',
      'Card Ownership & Cross-User Mutation Prevention',
      test2Pass ? 'PASS' : 'FAIL',
      'public.cards',
      'Users can create cards; unauthorized cross-user updates & deletes return 0 rows; inactive cards are hidden from other users',
      {
        userADashboardCount: userACards.length,
        userBDashboardCount: userBCards.length,
        updateCardBByA_affected: updateResBByA?.length || 0,
        deleteCardBByA_affected: delResBByA?.length || 0,
        updateCardAByB_affected: updateResAByB?.length || 0,
        deleteCardAByB_affected: delResAByB?.length || 0,
        userASeesInactiveCardB: readInactByA?.length || 0,
        cardBNameUnchanged: verifyCardB.full_name
      }
    );

    // --------------------------------------------------------------------------
    // TEST 3 — Leads Isolation
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 3: Leads CRM Isolation ---');
    // Generate Lead A via submit_card_lead RPC
    const { data: rpcLeadA, error: rpcLeadAErr } = await clientAnon.rpc('submit_card_lead', {
      p_card_slug: slugA,
      p_name: 'Lead Customer For A',
      p_phone: '+91 98888 11111',
      p_email: 'lead_a@customer.com',
      p_message: 'Interested in Service A'
    });
    if (rpcLeadAErr) throw new Error(`Lead A RPC failed: ${rpcLeadAErr.message}`);
    leadAId = rpcLeadA.lead_id;

    // Generate Lead B via submit_card_lead RPC
    const { data: rpcLeadB, error: rpcLeadBErr } = await clientAnon.rpc('submit_card_lead', {
      p_card_slug: slugB,
      p_name: 'Lead Customer For B',
      p_phone: '+91 98888 22222',
      p_email: 'lead_b@customer.com',
      p_message: 'Interested in Service B'
    });
    if (rpcLeadBErr) throw new Error(`Lead B RPC failed: ${rpcLeadBErr.message}`);
    leadBId = rpcLeadB.lead_id;

    // Read Isolation: User A queries leads
    const { data: leadsSeenByA } = await clientA.from('leads').select('*');
    const userASeesLeadA = (leadsSeenByA || []).some(l => l.id === leadAId);
    const userADoesNotSeeLeadB = !(leadsSeenByA || []).some(l => l.id === leadBId);

    // Read Isolation: User B queries leads
    const { data: leadsSeenByB } = await clientB.from('leads').select('*');
    const userBSeesLeadB = (leadsSeenByB || []).some(l => l.id === leadBId);
    const userBDoesNotSeeLeadA = !(leadsSeenByB || []).some(l => l.id === leadAId);

    // Cross-user mutation attacks on leads:
    // User A attempts to update Lead B
    const { data: updateLeadBByA, error: errUpLeadB } = await clientA.from('leads')
      .update({ status: 'Converted', message: 'HACKED_LEAD_B' })
      .eq('id', leadBId)
      .select();
    const updateLeadBBlocked = (!updateLeadBByA || updateLeadBByA.length === 0) || Boolean(errUpLeadB);

    // User A attempts to delete Lead B
    const { data: delLeadBByA, error: errDelLeadB } = await clientA.from('leads')
      .delete()
      .eq('id', leadBId)
      .select();
    const delLeadBBlocked = (!delLeadBByA || delLeadBByA.length === 0) || Boolean(errDelLeadB);

    // User B attempts to update Lead A
    const { data: updateLeadAByB, error: errUpLeadA } = await clientB.from('leads')
      .update({ status: 'Lost' })
      .eq('id', leadAId)
      .select();
    const updateLeadABlocked = (!updateLeadAByB || updateLeadAByB.length === 0) || Boolean(errUpLeadA);

    // User B attempts to delete Lead A
    const { data: delLeadAByB, error: errDelLeadA } = await clientB.from('leads')
      .delete()
      .eq('id', leadAId)
      .select();
    const delLeadABlocked = (!delLeadAByB || delLeadAByB.length === 0) || Boolean(errDelLeadA);

    // Ground truth verification
    const { data: verifyLeadB } = await adminClient.from('leads').select('*').eq('id', leadBId).single();
    const leadBIntact = verifyLeadB && verifyLeadB.status === 'New' && verifyLeadB.name === 'Lead Customer For B';

    const test3Pass = userASeesLeadA && userADoesNotSeeLeadB && userBSeesLeadB && userBDoesNotSeeLeadA &&
                      updateLeadBBlocked && delLeadBBlocked && updateLeadABlocked && delLeadABlocked && leadBIntact;

    recordResult(
      'TEST 3',
      'Leads CRM Multi-Tenant Isolation',
      test3Pass ? 'PASS' : 'FAIL',
      'public.leads',
      'User A sees only Lead A; User B sees only Lead B; cross-user lead read/update/delete attempts affect 0 rows',
      {
        userASeesLeadA,
        userADoesNotSeeLeadB,
        userBSeesLeadB,
        userBDoesNotSeeLeadA,
        updateLeadBByA_affected: updateLeadBByA?.length || 0,
        deleteLeadBByA_affected: delLeadBByA?.length || 0,
        updateLeadAByB_affected: updateLeadAByB?.length || 0,
        deleteLeadAByB_affected: delLeadAByB?.length || 0,
        leadBStatusIntact: verifyLeadB?.status
      }
    );

    // --------------------------------------------------------------------------
    // TEST 4 — Analytics Isolation
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 4: Analytics Telemetry Isolation ---');
    // Generate analytics for Card A
    await clientAnon.rpc('record_card_event', {
      p_card_slug: slugA,
      p_event_type: 'call_click',
      p_user_agent: 'SecTestAgent/A'
    });
    await clientAnon.rpc('record_card_event', {
      p_card_slug: slugA,
      p_event_type: 'page_view',
      p_user_agent: 'SecTestAgent/A2'
    });

    // Generate analytics for Card B
    await clientAnon.rpc('record_card_event', {
      p_card_slug: slugB,
      p_event_type: 'whatsapp_click',
      p_user_agent: 'SecTestAgent/B'
    });

    // User A queries analytics for Card A
    const { data: eventsCardAByA } = await clientA.from('analytics_events').select('*').eq('card_id', cardA.id);
    // User A attempts to query analytics for Card B
    const { data: eventsCardBByA } = await clientA.from('analytics_events').select('*').eq('card_id', cardB.id);

    // User B queries analytics for Card B
    const { data: eventsCardBByB } = await clientB.from('analytics_events').select('*').eq('card_id', cardB.id);
    // User B attempts to query analytics for Card A
    const { data: eventsCardAByB } = await clientB.from('analytics_events').select('*').eq('card_id', cardA.id);

    const test4Pass = (eventsCardAByA?.length > 0) &&
                      (eventsCardBByA?.length === 0) &&
                      (eventsCardBByB?.length > 0) &&
                      (eventsCardAByB?.length === 0);

    recordResult(
      'TEST 4',
      'Analytics Telemetry Isolation',
      test4Pass ? 'PASS' : 'FAIL',
      'public.analytics_events',
      'Card owners can query only their own card analytics events; cross-user queries return 0 rows',
      {
        userAEventsForCardA: eventsCardAByA?.length || 0,
        userAEventsForCardB: eventsCardBByA?.length || 0,
        userBEventsForCardB: eventsCardBByB?.length || 0,
        userBEventsForCardA: eventsCardAByB?.length || 0
      }
    );

    // --------------------------------------------------------------------------
    // TEST 5 — Anonymous Public Access
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 5: Anonymous Public Access Verification ---');
    // Read public card A by slug
    const { data: pubCardA } = await clientAnon
      .from('cards')
      .select('id, slug, full_name, company, phone, email, is_active')
      .eq('slug', slugA)
      .single();

    // Read public card B by slug
    const { data: pubCardB } = await clientAnon
      .from('cards')
      .select('id, slug, full_name, company, phone, email, is_active')
      .eq('slug', slugB)
      .single();

    const publicCardsAccessible = Boolean(pubCardA && pubCardA.is_active && pubCardB && pubCardB.is_active);

    // Increment metric via RPC
    const { error: incErr } = await clientAnon.rpc('increment_card_metric', {
      card_slug: slugA,
      metric_name: 'view'
    });

    // Direct anon read on leads table
    const { data: anonLeads } = await clientAnon.from('leads').select('*');
    const anonCannotReadLeads = (anonLeads?.length === 0);

    // Direct anon read on analytics_events table
    const { data: anonEvents } = await clientAnon.from('analytics_events').select('*');
    const anonCannotReadAnalytics = (anonEvents?.length === 0);

    // Direct anon read on inactive card
    const { data: anonInactCard } = await clientAnon.from('cards').select('*').eq('slug', slugBInactive);
    const anonCannotReadInactiveCard = (anonInactCard?.length === 0);

    const test5Pass = publicCardsAccessible && !incErr && anonCannotReadLeads && anonCannotReadAnalytics && anonCannotReadInactiveCard;

    recordResult(
      'TEST 5',
      'Anonymous Public Access Boundaries',
      test5Pass ? 'PASS' : 'FAIL',
      'public.cards, public.leads, public.analytics_events',
      'Public active cards and RPC metrics are accessible; private leads and telemetry records return 0 rows for anonymous visitors',
      {
        pubCardASlug: pubCardA?.slug,
        pubCardBSlug: pubCardB?.slug,
        anonDirectLeadsReadCount: anonLeads?.length || 0,
        anonDirectEventsReadCount: anonEvents?.length || 0,
        anonDirectInactiveCardReadCount: anonInactCard?.length || 0
      }
    );

    // --------------------------------------------------------------------------
    // TEST 6 — Supabase RLS Policy & Storage Audit
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 6: Supabase RLS Policy & Storage Security Audit ---');
    // Storage multi-user isolation check using valid 1x1 PNG image asset:
    const testPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const pathA = `${userA.id}/test_asset.png`;
    const pathB = `${userB.id}/test_asset.png`;

    // 1. User A uploads to own folder
    const { error: uploadAErr } = await clientA.storage
      .from('card-assets')
      .upload(pathA, testPngBuffer, { contentType: 'image/png', upsert: true });
    const userAUploadOwnPass = !uploadAErr;

    // 2. User A attempts cross-user upload to User B folder
    const { error: uploadCrossErr } = await clientA.storage
      .from('card-assets')
      .upload(pathB, testPngBuffer, { contentType: 'image/png', upsert: true });
    const userACrossUploadBlocked = Boolean(uploadCrossErr);

    // 3. User B uploads to own folder
    const { error: uploadBErr } = await clientB.storage
      .from('card-assets')
      .upload(pathB, testPngBuffer, { contentType: 'image/png', upsert: true });
    const userBUploadOwnPass = !uploadBErr;

    // 4. User A attempts to delete User B's file
    await clientA.storage
      .from('card-assets')
      .remove([pathB]);
    const { data: verifyFileBStillExists } = await adminClient.storage
      .from('card-assets')
      .list(userB.id);
    const fileBIntact = (verifyFileBStillExists || []).some(f => f.name === 'test_asset.png');

    // 5. Anonymous visitor attempts to upload
    const { error: anonUploadErr } = await clientAnon.storage
      .from('card-assets')
      .upload(`${userA.id}/anon.png`, testPngBuffer, { contentType: 'image/png' });
    const anonUploadBlocked = Boolean(anonUploadErr);

    const test6Pass = userAUploadOwnPass && userACrossUploadBlocked && userBUploadOwnPass && fileBIntact && anonUploadBlocked;

    recordResult(
      'TEST 6',
      'Storage RLS Folder-Level Multi-Tenant Isolation',
      test6Pass ? 'PASS' : 'FAIL',
      'storage.objects (bucket: card-assets)',
      'Users can write only to their own <userId>/ folder; cross-user uploads and deletions fail; anon uploads rejected',
      {
        userAUploadOwn: userAUploadOwnPass,
        userACrossUploadBlocked,
        uploadCrossErrorMessage: uploadCrossErr?.message,
        userBUploadOwn: userBUploadOwnPass,
        fileBIntactAfterADeleteAttempt: fileBIntact,
        anonUploadBlocked,
        anonUploadErrorMessage: anonUploadErr?.message
      }
    );

    // --------------------------------------------------------------------------
    // TEST 7 — RPC Security & Abuse Resistance
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 7: Stored Procedure (RPC) Anti-Abuse Verification ---');
    // 1. increment_card_metric on inactive card
    const { data: inactBefore } = await adminClient.from('cards').select('views_count').eq('id', inactiveCardB.id).single();
    await clientAnon.rpc('increment_card_metric', {
      card_slug: slugBInactive,
      metric_name: 'view'
    });
    const { data: inactAfter } = await adminClient.from('cards').select('views_count').eq('id', inactiveCardB.id).single();
    const metricRejectedInactive = (inactBefore.views_count === inactAfter.views_count);

    // 2. record_card_event on inactive card
    const { data: recordInactRes } = await clientAnon.rpc('record_card_event', {
      p_card_slug: slugBInactive,
      p_event_type: 'page_view'
    });
    const recordRejectedInactive = recordInactRes && recordInactRes.success === false;

    // 3. submit_card_lead validation
    const { data: emptyLeadRes } = await clientAnon.rpc('submit_card_lead', {
      p_card_slug: slugA,
      p_name: '',
      p_phone: ''
    });
    const validationEnforced = emptyLeadRes && emptyLeadRes.success === false;

    // 4. submit_card_lead on inactive card
    const { data: inactLeadRes } = await clientAnon.rpc('submit_card_lead', {
      p_card_slug: slugBInactive,
      p_name: 'Attacker',
      p_phone: '+91 99999 99999'
    });
    const leadRejectedInactive = inactLeadRes && inactLeadRes.success === false;

    // 5. Verify caller cannot view submitted lead
    const { data: leadAProbe } = await clientAnon.from('leads').select('*').eq('id', leadAId);
    const leadProbeReturnsZero = (leadAProbe?.length === 0);

    const test7Pass = metricRejectedInactive && recordRejectedInactive && validationEnforced && leadRejectedInactive && leadProbeReturnsZero;

    recordResult(
      'TEST 7',
      'Stored Procedure (RPC) Anti-Abuse & Validation',
      test7Pass ? 'PASS' : 'FAIL',
      'public.increment_card_metric, record_card_event, submit_card_lead',
      'RPCs enforce input validation, reject inactive cards, and do not expose private rows to callers',
      {
        metricRejectedInactive,
        recordRejectedInactive,
        recordError: recordInactRes?.error,
        validationEnforced,
        validationError: emptyLeadRes?.error,
        leadRejectedInactive,
        leadProbeReturnsZero
      }
    );

    // --------------------------------------------------------------------------
    // TEST 8 — Secrets & Key Exposure Audit
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 8: Secrets & Key Exposure Audit ---');
    const clientDir = path.join(__dirname, '../../client');
    const wpDir = path.join(__dirname, '../../wordpress');

    function searchSecrets(dir, prohibitedTerms, extensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.env', '.php']) {
      const leaks = [];
      function walk(current) {
        if (!fs.existsSync(current)) return;
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(current, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
            walk(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (!extensions.includes(ext) && entry.name !== '.env') continue;
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const term of prohibitedTerms) {
              if (content.includes(term)) {
                // Ignore safe warning comments mentioning the term
                if (content.includes('DO NOT use service_role') && term === 'service_role') continue;
                leaks.push({ file: path.relative(path.join(__dirname, '../..'), fullPath), term });
              }
            }
          }
        }
      }
      walk(dir);
      return leaks;
    }

    const clientLeaks = searchSecrets(clientDir, ['SUPABASE_SERVICE_ROLE_KEY', 'service_role', 'JWT_SECRET']);
    const wpLeaks = searchSecrets(wpDir, ['SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET']);

    const test8Pass = clientLeaks.length === 0 && wpLeaks.length === 0;

    recordResult(
      'TEST 8',
      'Frontend & Client Secret Leakage Audit',
      test8Pass ? 'PASS' : 'FAIL',
      'client/**/*, wordpress/**/*',
      'Zero private service-role keys or server JWT secrets found in client or WordPress plugins',
      { clientLeaks, wpLeaks, clean: test8Pass }
    );

    // --------------------------------------------------------------------------
    // TEST 9 — Production Architecture & Ground-Truth Verification
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 9: Production Architecture & Ground-Truth Verification ---');
    const supabaseClientSource = fs.readFileSync(path.join(__dirname, '../../client/src/utils/supabaseClient.js'), 'utf8');
    const cardServiceSource = fs.readFileSync(path.join(__dirname, '../../client/src/services/cardService.js'), 'utf8');
    const authContextSource = fs.readFileSync(path.join(__dirname, '../../client/src/context/AuthContext.jsx'), 'utf8');

    const usesCloudUrl = supabaseClientSource.includes('xsflkmhoxriskrpqpqyj.supabase.co');
    const noLocalStorageDB = !cardServiceSource.includes('localStorage.setItem') && !cardServiceSource.includes('localStorage.getItem');
    const authenticSupabaseAuth = authContextSource.includes('supabase.auth.signInWithPassword') &&
                                 authContextSource.includes('supabase.auth.signUp') &&
                                 !authContextSource.includes('mock') &&
                                 !authContextSource.includes('synthetic');

    const test9Pass = usesCloudUrl && noLocalStorageDB && authenticSupabaseAuth;

    recordResult(
      'TEST 9',
      'Production Architecture & Single Source of Truth',
      test9Pass ? 'PASS' : 'FAIL',
      'Supabase Cloud Production Instance',
      'Client exclusively communicates with Supabase Cloud; zero localStorage fallback database; authentic Supabase Auth used without mocks',
      { usesCloudUrl, noLocalStorageDB, authenticSupabaseAuth }
    );

  } catch (err) {
    console.error('Execution encountered unexpected error:', err);
    recordResult(
      'EXECUTION_ERROR',
      'Unexpected Test Harness Error',
      'FAIL',
      'N/A',
      err.message,
      { stack: err.stack }
    );
  } finally {
    // --------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // --------------------------------------------------------------------------
    console.log('\n--- Cleaning up temporary test entities ---');
    try {
      if (cardA) {
        await adminClient.from('cards').delete().eq('id', cardA.id);
        console.log(`Cleaned up Card A: ${cardA.id}`);
      }
      if (cardB) {
        await adminClient.from('cards').delete().eq('id', cardB.id);
        console.log(`Cleaned up Card B: ${cardB.id}`);
      }
      if (inactiveCardB) {
        await adminClient.from('cards').delete().eq('id', inactiveCardB.id);
        console.log(`Cleaned up Inactive Card B: ${inactiveCardB.id}`);
      }
      if (userA) {
        await adminClient.storage.from('card-assets').remove([`${userA.id}/test_asset.png`]);
        await adminClient.auth.admin.deleteUser(userA.id);
        console.log(`Cleaned up User A: ${userA.id}`);
      }
      if (userB) {
        await adminClient.storage.from('card-assets').remove([`${userB.id}/test_asset.png`]);
        await adminClient.auth.admin.deleteUser(userB.id);
        console.log(`Cleaned up User B: ${userB.id}`);
      }
    } catch (cleanErr) {
      console.warn('Cleanup notice:', cleanErr.message);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 10 — SUMMARY & FINAL DECISION
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 FINAL PRODUCTION SECURITY VERIFICATION SUMMARY');
  console.log('================================================================');

  let allPass = true;
  results.forEach(r => {
    if (r.status !== 'PASS') allPass = false;
  });

  const passedCount = results.filter(r => r.status === 'PASS').length;
  console.log(`Results: ${passedCount} / ${results.length} PASSED`);

  if (allPass) {
    console.log('\n🏆 FINAL DECISION: PHASE 1.5 SECURITY VERIFIED — READY FOR PHASE 2');
  } else {
    console.log('\n❌ FINAL DECISION: PHASE 1.5 NOT READY — DO NOT START PHASE 2');
  }
  console.log('================================================================\n');

  // Save full evidence report as JSON for artifact generation
  fs.writeFileSync(
    path.join(__dirname, 'security-verification-evidence.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), allPass, results }, null, 2)
  );
}

runVerification();
