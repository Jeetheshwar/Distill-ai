-- Add custom schema columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS custom_standup_schema TEXT,
ADD COLUMN IF NOT EXISTS custom_retro_schema TEXT;
