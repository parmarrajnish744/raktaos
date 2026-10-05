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

-- 3. Digital Cards Table
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
  services JSONB DEFAULT '[]'::jsonb,
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
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  scans_count INTEGER DEFAULT 0 NOT NULL,
  downloads_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Safe Column Additions for existing cards table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'business_id') THEN
    ALTER TABLE public.cards ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'status') THEN
    ALTER TABLE public.cards ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'company_name') THEN
    ALTER TABLE public.cards ADD COLUMN company_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'addresses') THEN
    ALTER TABLE public.cards ADD COLUMN addresses JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'social_links') THEN
    ALTER TABLE public.cards ADD COLUMN social_links JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'services') THEN
    ALTER TABLE public.cards ADD COLUMN services JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 4. Business Services Table (Supports both business_id and card_id)
CREATE TABLE IF NOT EXISTS public.business_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'business_services' AND column_name = 'card_id') THEN
    ALTER TABLE public.business_services ADD COLUMN card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE;
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
    'view', 'page_view', 'scan', 'qr_scan', 'vcard_download', 'call_click', 'whatsapp_click',
    'email_click', 'website_click', 'map_click', 'location_click', 'share', 'share_click', 'lead_submit'
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
CREATE INDEX IF NOT EXISTS idx_business_services_card_id ON public.business_services(card_id);
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

-- 9. Comprehensive RLS Policies

-- Businesses RLS
DROP POLICY IF EXISTS "Users can view their own businesses" ON public.businesses;
CREATE POLICY "Users can view their own businesses"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
CREATE POLICY "Public can view active businesses"
  ON public.businesses FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can create their own businesses" ON public.businesses;
CREATE POLICY "Users can create their own businesses"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own businesses" ON public.businesses;
CREATE POLICY "Users can update their own businesses"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own businesses" ON public.businesses;
CREATE POLICY "Users can delete their own businesses"
  ON public.businesses FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Business Services RLS
DROP POLICY IF EXISTS "Users can view their own business services" ON public.business_services;
CREATE POLICY "Users can view their own business services"
  ON public.business_services FOR SELECT
  TO authenticated
  USING (
    (business_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_services.business_id AND b.owner_id = auth.uid()))
    OR
    (card_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.cards c WHERE c.id = business_services.card_id AND c.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Public can view active services" ON public.business_services;
CREATE POLICY "Public can view active services"
  ON public.business_services FOR SELECT
  TO anon, authenticated
  USING (
    is_active = TRUE AND (
      (business_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_services.business_id AND b.is_active = TRUE))
      OR
      (card_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.cards c WHERE c.id = business_services.card_id AND c.is_active = TRUE))
    )
  );

DROP POLICY IF EXISTS "Users can create services for their businesses" ON public.business_services;
CREATE POLICY "Users can create services for their businesses"
  ON public.business_services FOR INSERT
  TO authenticated
  WITH CHECK (
    (business_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_services.business_id AND b.owner_id = auth.uid()))
    OR
    (card_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.cards c WHERE c.id = business_services.card_id AND c.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can update their own services" ON public.business_services;
CREATE POLICY "Users can update their own services"
  ON public.business_services FOR UPDATE
  TO authenticated
  USING (
    (business_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_services.business_id AND b.owner_id = auth.uid()))
    OR
    (card_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.cards c WHERE c.id = business_services.card_id AND c.user_id = auth.uid()))
  )
  WITH CHECK (
    (business_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_services.business_id AND b.owner_id = auth.uid()))
    OR
    (card_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.cards c WHERE c.id = business_services.card_id AND c.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can delete their own services" ON public.business_services;
CREATE POLICY "Users can delete their own services"
  ON public.business_services FOR DELETE
  TO authenticated
  USING (
    (business_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_services.business_id AND b.owner_id = auth.uid()))
    OR
    (card_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.cards c WHERE c.id = business_services.card_id AND c.user_id = auth.uid()))
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

-- Leads RLS (STRICT SECURITY: Public can insert; ONLY owners can view/manage)
DROP POLICY IF EXISTS "Public visitors can insert leads" ON public.leads;
CREATE POLICY "Public visitors can insert leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0 AND length(name) <= 100 AND
    phone IS NOT NULL AND length(trim(phone)) > 0 AND length(phone) <= 30
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

-- 10. Automated updated_at Triggers (Both functions created to eliminate missing function bugs)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- Keep company and company_name synchronized
  IF NEW.company_name IS NULL OR NEW.company_name = '' THEN
    NEW.company_name = NEW.company;
  END IF;
  -- Keep status and is_active synchronized
  IF NEW.is_active IS FALSE THEN
    NEW.status = 'inactive';
  ELSIF NEW.status = 'inactive' THEN
    NEW.is_active = FALSE;
  ELSE
    NEW.status = 'active';
    NEW.is_active = TRUE;
  END IF;
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
  ELSIF metric_type = 'download' OR metric_type = 'vcard_download' THEN
    UPDATE public.cards SET downloads_count = downloads_count + 1 WHERE slug = card_slug AND is_active = TRUE;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_card_metric(TEXT, TEXT) TO anon, authenticated;

-- Backwards compatibility alias for metric_name parameter
CREATE OR REPLACE FUNCTION public.increment_card_metric(card_slug TEXT, metric_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF metric_name = 'view' THEN
    UPDATE public.cards SET views_count = views_count + 1 WHERE slug = card_slug AND is_active = TRUE;
  ELSIF metric_name = 'scan' THEN
    UPDATE public.cards SET scans_count = scans_count + 1 WHERE slug = card_slug AND is_active = TRUE;
  ELSIF metric_name = 'download' OR metric_name = 'vcard_download' THEN
    UPDATE public.cards SET downloads_count = downloads_count + 1 WHERE slug = card_slug AND is_active = TRUE;
  END IF;
END;
$$;

-- 12. RPC: Comprehensive Event Tracker with Anti-Abuse Rate Limiting
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
  v_normalized_type TEXT;
  v_recent_count INT;
BEGIN
  -- Normalize event type aliases
  IF p_event_type = 'page_view' THEN
    v_normalized_type := 'view';
  ELSIF p_event_type = 'qr_scan' THEN
    v_normalized_type := 'scan';
  ELSIF p_event_type = 'share' THEN
    v_normalized_type := 'share_click';
  ELSIF p_event_type = 'location_click' THEN
    v_normalized_type := 'map_click';
  ELSE
    v_normalized_type := p_event_type;
  END IF;

  SELECT id, is_active INTO v_card
  FROM public.cards
  WHERE slug = p_card_slug;

  IF NOT FOUND OR v_card.is_active = FALSE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found or inactive');
  END IF;

  -- Anti-abuse rate-limit check: Deduplicate rapid duplicate events from same user-agent (within 5s)
  IF p_user_agent IS NOT NULL THEN
    SELECT COUNT(*) INTO v_recent_count
    FROM public.analytics_events
    WHERE card_id = v_card.id
      AND event_type = v_normalized_type
      AND user_agent = p_user_agent
      AND created_at > (now() - INTERVAL '5 seconds');

    IF v_recent_count > 0 THEN
      -- Silently accept duplicate without spamming the database
      RETURN jsonb_build_object('success', true, 'rate_limited', true);
    END IF;
  END IF;

  -- Insert event record
  INSERT INTO public.analytics_events (
    card_id, event_type, referrer, device_type, user_agent, created_at
  ) VALUES (
    v_card.id, v_normalized_type, substring(p_referrer from 1 for 255),
    substring(p_device_type from 1 for 50), substring(p_user_agent from 1 for 255), now()
  );

  -- Increment aggregate counters
  IF v_normalized_type = 'view' THEN
    UPDATE public.cards SET views_count = views_count + 1 WHERE id = v_card.id;
  ELSIF v_normalized_type = 'scan' THEN
    UPDATE public.cards SET scans_count = scans_count + 1 WHERE id = v_card.id;
  ELSIF v_normalized_type = 'vcard_download' THEN
    UPDATE public.cards SET downloads_count = downloads_count + 1 WHERE id = v_card.id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.record_card_event(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 13. RPC: Submit Lead Enquiry (Public Lead Capture with Auto Analytics and Validation)
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
  v_trimmed_name TEXT;
  v_trimmed_phone TEXT;
BEGIN
  v_trimmed_name := trim(COALESCE(p_name, ''));
  v_trimmed_phone := trim(COALESCE(p_phone, ''));

  IF length(v_trimmed_name) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Name is required');
  END IF;

  IF length(v_trimmed_name) > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Name exceeds maximum length of 100 characters');
  END IF;

  IF length(v_trimmed_phone) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Phone number is required');
  END IF;

  IF length(v_trimmed_phone) > 30 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Phone number exceeds maximum length of 30 characters');
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
    v_card.business_id,
    v_card.id,
    v_trimmed_name,
    v_trimmed_phone,
    substring(trim(COALESCE(p_email, '')) from 1 for 150),
    substring(trim(COALESCE(p_message, '')) from 1 for 1000),
    'New',
    'public_card'
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

-- 14. Storage Bucket Policies (card-assets bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-assets',
  'card-assets',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

DROP POLICY IF EXISTS "Public can view card assets" ON storage.objects;
CREATE POLICY "Public can view card assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'card-assets');

DROP POLICY IF EXISTS "Users can upload their own card assets" ON storage.objects;
CREATE POLICY "Users can upload their own card assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'card-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own card assets" ON storage.objects;
CREATE POLICY "Users can update their own card assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'card-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own card assets" ON storage.objects;
CREATE POLICY "Users can delete their own card assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'card-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
