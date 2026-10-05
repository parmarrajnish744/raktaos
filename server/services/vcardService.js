/**
 * vCard 3.0 RFC 2426 compliant generator
 */
function escapeVCard(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function generateVCard(card, addresses = []) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(card.full_name)}`
  ];

  // Name splitting (last name; first name; middle; prefix; suffix)
  const nameParts = (card.full_name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);

  if (card.company_name) {
    lines.push(`ORG:${escapeVCard(card.company_name)}`);
  }

  if (card.designation) {
    lines.push(`TITLE:${escapeVCard(card.designation)}`);
  }

  if (card.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${card.phone}`);
  }

  if (card.alternate_phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${card.alternate_phone}`);
  }

  if (card.whatsapp && card.whatsapp !== card.phone) {
    lines.push(`TEL;TYPE=CELL,MSG:${card.whatsapp}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=PREF,INTERNET:${card.email}`);
  }

  if (card.website) {
    lines.push(`URL:${card.website}`);
  }

  // Handle addresses
  if (addresses && addresses.length > 0) {
    addresses.forEach((addr) => {
      const type = (addr.type && addr.type.toLowerCase().includes('factory')) ? 'WORK,POSTAL' : 'WORK,PARCEL';
      const street = escapeVCard(addr.address || '');
      const city = escapeVCard(addr.city || '');
      const state = escapeVCard(addr.state || '');
      const postalCode = escapeVCard(addr.pincode || '');
      const country = escapeVCard(addr.country || 'India');
      // Format: ADR;TYPE=...:PO Box;Extended;Street;Locality;Region;PostalCode;Country
      lines.push(`ADR;TYPE=${type}:;;${street};${city};${state};${postalCode};${country}`);
    });
  }

  // Tagline or note
  const notes = [];
  if (card.tagline) notes.push(card.tagline);
  if (card.company_description) notes.push(card.company_description);
  if (notes.length > 0) {
    lines.push(`NOTE:${escapeVCard(notes.join(' | '))}`);
  }

  lines.push('REV:' + new Date().toISOString());
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

module.exports = {
  generateVCard,
  escapeVCard
};
