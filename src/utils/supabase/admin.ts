import { createClient } from "@supabase/supabase-js";

// Note: This client uses the SERVICE ROLE KEY. 
// It will completely bypass all Row Level Security (RLS) policies.
// NEVER expose this client to the frontend or pass it to client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
