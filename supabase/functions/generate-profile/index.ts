// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs on Supabase Edge Functions (Deno runtime)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { businessName, companyName, industry, services, ownerName, city } = await req.json();
    const name = (businessName || companyName || '').trim();

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Business or Company name is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const servicesList = Array.isArray(services)
      ? services.filter(Boolean).join(', ')
      : (typeof services === 'string' ? services : '');

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (geminiApiKey && !geminiApiKey.includes('your-gemini')) {
      try {
        const promptText = `
You are a senior branding strategist for Indian small and medium businesses (SMEs) at Rakta Business OS.
Generate a concise, compelling, high-converting professional business description (approx 2-3 sentences, 40-70 words) for a digital business card.

Business Details:
- Business Name: ${name}
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
            return new Response(
              JSON.stringify({ success: true, description: generatedText, provider: 'gemini-1.5-flash' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call notice, falling back to local synthesizer:', geminiErr.message);
      }
    }

    // High quality intelligent template synthesizer fallback
    const sanitizedName = name.trim();
    const citySuffix = city ? ` in ${city.trim()}` : '';
    const servicesPhrase = servicesList ? ` specializing in ${servicesList}` : '';
    const ind = industry ? `${industry.trim()}` : 'professional services';

    const descriptions = [
      `At ${sanitizedName}, we deliver trusted, high-caliber ${ind}${servicesPhrase}${citySuffix}. With an unwavering commitment to operational excellence, rapid turnaround, and complete client satisfaction, we partner with customers to provide dependable, end-to-end solutions.`,
      `${sanitizedName} is a premier provider of ${ind}${citySuffix}${servicesPhrase}. Known for reliability, technical expertise, and attentive customer service, we empower clients with modern, cost-effective solutions tailored to their exact requirements.`,
      `Dedicated to excellence, ${sanitizedName} provides top-tier ${ind} solutions${servicesPhrase}. We blend hands-on industry expertise with dedicated customer care to ensure unmatched quality, reliability, and long-term value for every client.`
    ];

    const chosen = descriptions[Math.floor(Math.random() * descriptions.length)];

    return new Response(
      JSON.stringify({ success: true, description: chosen, provider: 'rakta-synthesizer' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to generate profile.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
