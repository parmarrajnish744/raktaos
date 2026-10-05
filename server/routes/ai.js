const express = require('express');
const router = express.Router();

/**
 * AI Business Profile Generator (Phase 1)
 * Takes business name, industry, and list of services, then generates
 * an engaging, professional corporate overview tailored for Indian SMEs.
 */
router.post('/generate-profile', async (req, res) => {
  try {
    const businessName = (req.body.businessName || req.body.companyName || '').trim();
    const { industry, services, ownerName, city } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: 'Business or Company name is required to generate profile.' });
    }

    const servicesList = Array.isArray(services)
      ? services.filter(Boolean).join(', ')
      : (typeof services === 'string' ? services : '');

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is configured, make call to Gemini 1.5 Flash
    if (geminiApiKey && !geminiApiKey.includes('your-gemini')) {
      try {
        const promptText = `
You are a senior copywriter and branding strategist for Indian small and medium businesses (SMEs) at Rakta Business OS.
Generate a concise, compelling, high-converting professional business description (approx 2-3 sentences, 40-70 words) for a digital business card.

Business Details:
- Business Name: ${businessName}
- Industry/Sector: ${industry || 'Services & Trading'}
- Key Services Offered: ${servicesList || 'Specialized client solutions'}
- Location: ${city || 'India'}
${ownerName ? `- Led By: ${ownerName}` : ''}

Style Guide:
- Trustworthy, clear, action-oriented, and modern.
- Highlight dependability, quality of service, and client satisfaction.
- Do NOT use exaggerated fluff or hashtags.
- Output ONLY the plain text description paragraph without quotes or commentary.
`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 250
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (generatedText) {
            return res.json({
              success: true,
              description: generatedText,
              provider: 'gemini-1.5-flash'
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call notice, falling back to local synthesizer:', geminiErr.message);
      }
    }

    // High quality intelligent template synthesizer fallback (Ensures 100% offline & local reliability)
    const sanitizedName = businessName.trim();
    const citySuffix = city ? ` in ${city.trim()}` : '';
    const servicesPhrase = servicesList ? ` specializing in ${servicesList}` : '';
    const ind = industry ? `${industry.trim()}` : 'professional services';

    const descriptions = [
      `At ${sanitizedName}, we deliver trusted, high-caliber ${ind}${servicesPhrase}${citySuffix}. With an unwavering commitment to operational excellence, rapid turnaround, and complete client satisfaction, we partner with customers to provide dependable, end-to-end solutions.`,
      `${sanitizedName} is a premier provider of ${ind}${citySuffix}${servicesPhrase}. Known for reliability, technical expertise, and attentive customer service, we empower clients with modern, cost-effective solutions tailored to their exact requirements.`,
      `Dedicated to excellence, ${sanitizedName} provides top-tier ${ind} solutions${servicesPhrase}. We blend hands-on industry expertise with dedicated customer care to ensure unmatched quality, reliability, and long-term value for every client.`
    ];

    const chosen = descriptions[Math.floor(Math.random() * descriptions.length)];

    res.json({
      success: true,
      description: chosen,
      provider: 'rakta-synthesizer'
    });
  } catch (err) {
    console.error('AI Profile generation error:', err);
    res.status(500).json({ error: 'Failed to generate business profile.' });
  }
});

module.exports = router;
