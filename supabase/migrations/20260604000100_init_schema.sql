-- Create extractions table
CREATE TABLE IF NOT EXISTS public.extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_name TEXT,
    duration_seconds NUMERIC,
    model_used TEXT,
    schema_applied TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    key_hint TEXT NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create waitlist_emails table
CREATE TABLE IF NOT EXISTS public.waitlist_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    plan_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Policies for extractions
CREATE POLICY "Users can view their own extractions"
    ON public.extractions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extractions"
    ON public.extractions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for api_keys
CREATE POLICY "Users can view their own api keys"
    ON public.api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own api keys"
    ON public.api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- No public policies for waitlist_emails (Service Role bypasses RLS)

-- Create Indexes
CREATE INDEX IF NOT EXISTS extractions_user_id_created_at_idx ON public.extractions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS api_keys_user_id_created_at_idx ON public.api_keys(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS waitlist_emails_email_idx ON public.waitlist_emails(email);
