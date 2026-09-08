CREATE TABLE IF NOT EXISTS public.saved_properties (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Assuming Supabase Auth is used
    property_id BIGINT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved properties"
    ON public.saved_properties
    FOR ALL
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.watchlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlists"
    ON public.watchlists
    FOR ALL
    USING (auth.uid() = user_id);
