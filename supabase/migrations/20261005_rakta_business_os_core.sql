-- ==============================================================================
-- RAKTA BUSINESS OS — PRODUCTION CORE SUPABASE SCHEMA MIGRATION
-- Migration: 20261005_rakta_business_os_core.sql
-- ==============================================================================

-- 1. UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  gst_number TEXT,
  registration_number TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  business_hours JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Business Services Table
CREATE TABLE IF NOT EXISTS public.business_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Digital Cards Table (Create if not exists & Alter to add business_id)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  designation TEXT,
  company TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT,
  website TEXT,
  address TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  profile_image_url TEXT,
  company_logo_url TEXT,
  company_description TEXT,
  industry TEXT,
  gst_number TEXT,
  registration_number TEXT,
  tagline TEXT,
  theme TEXT DEFAULT 'corporate-blue',
  primary_color TEXT DEFAULT '#0B2E59',
  secondary_color TEXT DEFAULT '#2563EB',
  button_style TEXT DEFAULT 'rounded',
  card_style TEXT DEFAULT 'modern',
  font_family TEXT DEFAULT 'Inter',
  social_links JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  scans_count INTEGER DEFAULT 0 NOT NULL,
  downloads_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Safe Column Additions for cards table if already created previously
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'business_id') THEN
    ALTER TABLE public.cards ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Leads Table (Lead Capture: "Send Enquiry")
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Converted', 'Lost')),
  source TEXT DEFAULT 'public_card',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Analytics Events Table (Individual Event Telemetry)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view', 'scan', 'vcard_download', 'call_click', 'whatsapp_click',
    'email_click', 'website_click', 'map_click', 'share_click', 'lead_submit'
  )),
  referrer TEXT,
  device_type TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON public.businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON public.business_services(business_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_business_id ON public.cards(business_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_slug ON public.cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_is_active ON public.cards(is_active);
CREATE INDEX IF NOT EXISTS idx_leads_business_id ON public.leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_card_id ON public.leads(card_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_card_id ON public.analytics_events(card_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);

-- 8. Enable Row Level Security (RLS) on All Tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies

-- Businesses RLS
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
CREATE POLICY "Public can view active businesses"
  ON public.businesses FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Owners can view own businesses" ON public.businesses;
CREATE POLICY "Owners can view own businesses"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert own businesses" ON public.businesses;
CREATE POLICY "Owners can insert own businesses"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own businesses" ON public.businesses;
CREATE POLICY "Owners can update own businesses"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete own businesses" ON public.businesses;
CREATE POLICY "Owners can delete own businesses"
  ON public.businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Business Services RLS
DROP POLICY IF EXISTS "Public can view active services" ON public.business_services;
CREATE POLICY "Public can view active services"
  ON public.business_services FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Business owners can manage services" ON public.business_services;
CREATE POLICY "Business owners can manage services"
  ON public.business_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_services.business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_services.business_id AND b.owner_id = auth.uid()
    )
  );

-- Cards RLS
DROP POLICY IF EXISTS "Public visitors can view active cards" ON public.cards;
CREATE POLICY "Public visitors can view active cards"
  ON public.cards FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can create their own cards" ON public.cards;
CREATE POLICY "Users can create their own cards"
  ON public.cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own cards" ON public.cards;
CREATE POLICY "Users can view their own cards"
  ON public.cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cards" ON public.cards;
CREATE POLICY "Users can update their own cards"
  ON public.cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards" ON public.cards;
CREATE POLICY "Users can delete their own cards"
  ON public.cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Leads RLS (STRICT SECURITY: Public can submit enquiries; ONLY business owners can view/manage)
DROP POLICY IF EXISTS "Public visitors can insert leads" ON public.leads;
CREATE POLICY "Public visitors can insert leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0 AND
    phone IS NOT NULL AND length(trim(phone)) > 0
  );

DROP POLICY IF EXISTS "Business owners can view received leads" ON public.leads;
CREATE POLICY "Business owners can view received leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    (business_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.businesses b WHERE b.id = leads.business_id AND b.owner_id = auth.uid()
    ))
    OR
    (card_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.cards c WHERE c.id = leads.card_id AND c.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Business owners can update lead status" ON public.leads;
CREATE POLICY "Business owners can update lead status"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    (business_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.businesses b WHERE b.id = leads.business_id AND b.owner_id = auth.uid()
    ))
    OR
    (card_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.cards c WHERE c.id = leads.card_id AND c.user_id = auth.uid()
    ))
  )
  WITH CHECK (
    (business_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.businesses b WHERE b.id = leads.business_id AND b.owner_id = auth.uid()
    ))
    OR
    (card_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.cards c WHERE c.id = leads.card_id AND c.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Business owners can delete leads" ON public.leads;
CREATE POLICY "Business owners can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (
    (business_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.businesses b WHERE b.id = leads.business_id AND b.owner_id = auth.uid()
    ))
    OR
    (card_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.cards c WHERE c.id = leads.card_id AND c.user_id = auth.uid()
    ))
  );

-- Analytics Events RLS
DROP POLICY IF EXISTS "Public can record analytics event" ON public.analytics_events;
CREATE POLICY "Public can record analytics event"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cards c WHERE c.id = analytics_events.card_id AND c.is_active = TRUE)
  );

DROP POLICY IF EXISTS "Card owners can view card analytics events" ON public.analytics_events;
CREATE POLICY "Card owners can view card analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.cards c WHERE c.id = analytics_events.card_id AND c.user_id = auth.uid())
  );

-- 10. Automated updated_at Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_businesses_updated_at ON public.businesses;
CREATE TRIGGER trigger_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_cards_updated_at ON public.cards;
CREATE TRIGGER trigger_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_cards_updated_at();

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON public.leads;
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11. RPC: Legacy Metric Incrementer (Preserved for backwards compatibility)
CREATE OR REPLACE FUNCTION public.increment_card_metric(card_slug TEXT, metric_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF metric_type = 'view' THEN
    UPDATE public.cards SET views_count = views_count + 1 WHERE slug = card_slug AND is_active = TRUE;
  ELSIF metric_type = 'scan' THEN
    UPDATE public.cards SET scans_count = scans_count + 1 WHERE slug = card_slug AND is_active = TRUE;
  ELSIF metric_type = 'download' THEN
    UPDATE public.cards SET downloads_count = downloads_count + 1 WHERE slug = card_slug AND is_active = TRUE;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_card_metric(TEXT, TEXT) TO anon, authenticated;

-- 12. RPC: Comprehensive Event Tracker (Records row in analytics_events + updates counter)
CREATE OR REPLACE FUNCTION public.record_card_event(
  p_card_slug TEXT,
  p_event_type TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_card RECORD;
BEGIN
  SELECT id, is_active INTO v_card
  FROM public.cards
  WHERE slug = p_card_slug;

  IF NOT FOUND OR v_card.is_active = FALSE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found or inactive');
  END IF;

  -- Insert event record
  INSERT INTO public.analytics_events (
    card_id, event_type, referrer, device_type, user_agent, created_at
  ) VALUES (
    v_card.id, p_event_type, p_referrer, p_device_type, p_user_agent, now()
  );

  -- Increment aggregate counters
  IF p_event_type = 'view' THEN
    UPDATE public.cards SET views_count = views_count + 1 WHERE id = v_card.id;
  ELSIF p_event_type = 'scan' THEN
    UPDATE public.cards SET scans_count = scans_count + 1 WHERE id = v_card.id;
  ELSIF p_event_type = 'vcard_download' THEN
    UPDATE public.cards SET downloads_count = downloads_count + 1 WHERE id = v_card.id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.record_card_event(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 13. RPC: Submit Lead Enquiry (Public Lead Capture with Auto Analytics)
CREATE OR REPLACE FUNCTION public.submit_card_lead(
  p_card_slug TEXT,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_card RECORD;
  v_lead_id UUID;
BEGIN
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Name is required');
  END IF;

  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Phone is required');
  END IF;

  SELECT id, business_id, is_active INTO v_card
  FROM public.cards
  WHERE slug = p_card_slug;

  IF NOT FOUND OR v_card.is_active = FALSE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found or inactive');
  END IF;

  INSERT INTO public.leads (
    business_id, card_id, name, phone, email, message, status, source
  ) VALUES (
    v_card.business_id, v_card.id, trim(p_name), trim(p_phone), trim(p_email), trim(p_message), 'New', 'public_card'
  ) RETURNING id INTO v_lead_id;

  -- Record telemetry event
  INSERT INTO public.analytics_events (
    card_id, event_type, created_at
  ) VALUES (
    v_card.id, 'lead_submit', now()
  );

  RETURN jsonb_build_object('success', true, 'lead_id', v_lead_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_card_lead(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
