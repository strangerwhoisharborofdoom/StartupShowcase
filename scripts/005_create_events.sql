-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  registration_link TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY IF NOT EXISTS "events_select_published_public" ON public.events
  FOR SELECT USING (status = 'published' AND auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS "events_select_published_authenticated" ON public.events
  FOR SELECT USING (status = 'published');

-- Admin full access
CREATE POLICY IF NOT EXISTS "events_admin_all" ON public.events
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON COLUMN public.events.event_date IS 'Event start date and time (UTC)';
COMMENT ON COLUMN public.events.status IS 'draft|published';
