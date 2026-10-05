-- Migration: 20261004_initial_cards_schema.sql
-- Create cards table, indexes, RLS policies, and increment_card_metric function

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_slug ON public.cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_is_active ON public.cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON public.cards(created_at DESC);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public visitors can view active cards" ON public.cards;
CREATE POLICY "Public visitors can view active cards"
  ON public.cards FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can create their own cards" ON public.cards;
CREATE POLICY "Users can create their own cards"
  ON public.cards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own cards" ON public.cards;
CREATE POLICY "Users can view their own cards"
  ON public.cards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cards" ON public.cards;
CREATE POLICY "Users can update their own cards"
  ON public.cards FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards" ON public.cards;
CREATE POLICY "Users can delete their own cards"
  ON public.cards FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.company_name IS NULL OR NEW.company_name = '' THEN
    NEW.company_name = NEW.company;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cards_updated_at ON public.cards;
CREATE TRIGGER trigger_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_cards_updated_at();

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
