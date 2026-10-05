/**
 * RFC 2426 vCard 3.0 / vCard 4.0 compliant dynamic contact generator
 * Fully compatible with modern iOS, macOS, Android, and Windows contact apps.
 */

/**
 * Escapes characters per vCard specification:
 * Backslash, semicolon, comma, and line breaks.
 */
export function escapeVCard(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/[\r\n]/g, '\\n');
}

/**
 * Generates an RFC-compliant vCard string from a customer card record.
 */
export function buildVCardString(card, addresses = []) {
  if (!card) return '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'PRODID:-//Rakta Business OS//Digital Business Card SaaS//EN'
  ];

  // Formatted Full Name (FN)
  const fullName = (card.full_name || 'Contact').trim();
  lines.push(`FN;CHARSET=UTF-8:${escapeVCard(fullName)}`);

  // Structured Name (N: Family, Given, Middle, Prefix, Suffix)
  const parts = fullName.split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  lines.push(`N;CHARSET=UTF-8:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);

  // Organization / Company
  const companyName = card.company || card.company_name;
  if (companyName) {
    lines.push(`ORG;CHARSET=UTF-8:${escapeVCard(companyName)}`);
  }

  // Job Title / Designation
  if (card.designation) {
    lines.push(`TITLE;CHARSET=UTF-8:${escapeVCard(card.designation)}`);
  }

  // Primary Phone Number
  if (card.phone) {
    const cleanTel = card.phone.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE,PREF:${cleanTel || card.phone}`);
  }

  // Alternate Phone
  if (card.alternate_phone) {
    const cleanAlt = card.alternate_phone.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanAlt || card.alternate_phone}`);
  }

  // WhatsApp
  if (card.whatsapp && card.whatsapp !== card.phone) {
    const cleanWa = card.whatsapp.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=MSG,VOICE:${cleanWa || card.whatsapp}`);
  }

  // Email Address
  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${card.email.trim()}`);
  }

  // Website URL
  if (card.website) {
    let site = card.website.trim();
    if (!site.startsWith('http://') && !site.startsWith('https://')) {
      site = `https://${site}`;
    }
    lines.push(`URL:${site}`);
  }

  // Office & Factory Addresses
  const addressList = (Array.isArray(addresses) && addresses.length > 0)
    ? addresses
    : (Array.isArray(card.addresses) ? card.addresses : []);

  if (addressList.length > 0) {
    addressList.forEach((addr) => {
      const typeStr = (addr.type && addr.type.toLowerCase().includes('factory'))
        ? 'WORK,POSTAL'
        : 'WORK,PREF';
      const street = escapeVCard(addr.address || '');
      const city = escapeVCard(addr.city || '');
      const state = escapeVCard(addr.state || '');
      const postalCode = escapeVCard(addr.pincode || '');
      const country = escapeVCard(addr.country || 'India');
      // Format: ADR;TYPE=...:PO Box;Extended;Street;City;State;PostalCode;Country
      lines.push(`ADR;TYPE=${typeStr};CHARSET=UTF-8:;;${street};${city};${state};${postalCode};${country}`);
    });
  } else if (card.address) {
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${escapeVCard(card.address)};;;;`);
  }

  // Notes & Bio
  const notes = [];
  if (card.tagline) notes.push(card.tagline);
  if (card.company_description) notes.push(card.company_description);
  if (card.industry) notes.push(`Industry: ${card.industry}`);
  if (card.gst_number) notes.push(`GST: ${card.gst_number}`);
  if (notes.length > 0) {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCard(notes.join(' | '))}`);
  }

  // Social Links
  const socialList = Array.isArray(card.social_links) ? card.social_links : [];
  socialList.forEach((soc) => {
    if (soc.url && soc.is_active !== 0) {
      lines.push(`X-SOCIALPROFILE;TYPE=${soc.platform || 'web'}:${soc.url}`);
    }
  });

  // Profile Image URL if available
  const photoUrl = card.profile_image_url || card.profile_photo;
  if (photoUrl && photoUrl.startsWith('http')) {
    lines.push(`PHOTO;VALUE=URI:${photoUrl}`);
  }

  // Revision Timestamp
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Triggers a browser download of the generated .vcf file.
 */
export function downloadVCardClient(card, addresses = []) {
  const vcfString = buildVCardString(card, addresses);
  const blob = new Blob([vcfString], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Generate safe filename (e.g. John_Doe_AB72KQ.vcf)
  const nameSlug = (card.full_name || 'Contact').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cardSlug = card.slug || card.username || '';
  const filename = cardSlug ? `${nameSlug}_${cardSlug}.vcf` : `${nameSlug}.vcf`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}
