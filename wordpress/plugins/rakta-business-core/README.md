# Rakta Business OS Core &mdash; WordPress & Elementor Plugin

The official bridge connecting WordPress marketing pages (`raktabusiness.com`) to the **Rakta Business OS** cloud database (Supabase) and SaaS application portal (`app.raktabusiness.com`).

---

## Features

1. **Direct Supabase REST Integration**: Connects WordPress to your live Supabase database without middleware bottlenecks. Uses safe public client anon keys (never service keys).
2. **Transient Performance Caching**: Automatic caching with configurable TTL (default 300 seconds) prevents redundant database calls on high-traffic landing pages.
3. **Elementor Native Widgets**:
   - `Digital Business Card`: Select any card handle/slug to render a responsive digital card preview on your marketing site.
   - `SME Lead Enquiry Form`: Captures prospect enquiries from WordPress pages and syncs them straight into the business owner's Rakta CRM leads table.
4. **Shortcodes Engine**:
   - `[rakta_card slug="sudheer-borra"]`: Embed card anywhere in Gutenberg, Classic Editor, or Elementor shortcode blocks.
   - `[rakta_lead_form card_slug="sudheer-borra"]`: Interactive AJAX-powered enquiry form.
   - `[rakta_app_cta text="Start Free Trial" plan="pro"]`: Deep link directly into the SaaS registration portal.
5. **Connection Diagnostics**: Built-in 1-click test button in WordPress Admin (`Settings > Rakta OS`) to verify live connectivity with Supabase.

---

## Installation

1. Copy the `rakta-business-core` folder to your WordPress installation directory:
   ```
   /wp-content/plugins/rakta-business-core/
   ```
2. In WordPress Admin, navigate to **Plugins > Installed Plugins** and click **Activate** on **Rakta Business OS Core**.
3. Go to **Settings > Rakta OS** in the WordPress menu.
4. Fill in:
   - **Supabase Project URL**: e.g., `https://your-project.supabase.co`
   - **Supabase Anon Public Key**: `eyJhbGciOi...`
   - **SaaS App URL**: `https://app.raktabusiness.com` (or `http://localhost:5173` during local development)
   - **Cache Duration**: `300` seconds
5. Click **Test Supabase Connection** to ensure credentials are valid.
6. Click **Save Settings**.

---

## Elementor Usage

1. Open any page in Elementor.
2. In the widget search bar on the left panel, search for **Rakta** or scroll to the **Rakta Business OS** category.
3. Drag the **Digital Business Card** or **SME Lead Enquiry Form** widget into your page canvas.
4. Set the card slug (e.g. `sudheer-borra`) and customize titles, subtitles, and layout styles.
5. Click **Publish** or **Update**.
