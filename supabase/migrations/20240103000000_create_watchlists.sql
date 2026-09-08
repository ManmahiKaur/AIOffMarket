-- Drop the watchlists table if it exists (since it has no data and we need a fresh schema)
DROP TABLE IF EXISTS public.watchlists;

-- Create the watchlists table
CREATE TABLE public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_types TEXT[] DEFAULT '{}',
    minimum_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (for local dev / demo purposes)
-- In a real app with auth, these would check auth.uid()
CREATE POLICY "Enable read access for all users"
    ON public.watchlists
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users"
    ON public.watchlists
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users"
    ON public.watchlists
    FOR UPDATE
    USING (true);

CREATE POLICY "Enable delete for all users"
    ON public.watchlists
    FOR DELETE
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_watchlists_modtime
BEFORE UPDATE ON public.watchlists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RPC function to efficiently count matching properties
CREATE OR REPLACE FUNCTION get_watchlist_matches(
    p_location TEXT,
    p_event_types TEXT[],
    p_minimum_score NUMERIC
)
RETURNS BIGINT AS $$
DECLARE
    match_count BIGINT;
BEGIN
    SELECT COUNT(DISTINCT p.id)
    INTO match_count
    FROM public.properties p
    LEFT JOIN public.events e ON e.property_id = p.id
    LEFT JOIN public.opportunity_scores os ON os.property_id = p.id
    WHERE 
        (p_location IS NULL OR p_location = '' OR p.suburb_name ILIKE '%' || p_location || '%')
        AND (array_length(p_event_types, 1) IS NULL OR e.event_type = ANY(p_event_types))
        AND (p_minimum_score IS NULL OR os.score >= (p_minimum_score / 100.0)); -- score in DB is 0-1, min_score in UI is 0-100

    RETURN match_count;
END;
$$ LANGUAGE plpgsql;
