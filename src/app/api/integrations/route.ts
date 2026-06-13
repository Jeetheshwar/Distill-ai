import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the user's team
    const { data: memberData } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!memberData) {
      return NextResponse.json({ connections: [] });
    }

    // Fetch all active connections for this team
    const { data: connections, error } = await supabase
      .from('oauth_connections')
      .select('id, provider, metadata, updated_at')
      .eq('team_id', memberData.team_id);

    if (error) throw error;

    return NextResponse.json({ connections: connections || [] });

  } catch (error: any) {
    console.error("GET Integrations Error:", error);
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}
