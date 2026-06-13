import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: memberData } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!memberData) {
      return NextResponse.redirect(new URL('/dashboard/integrations?error=need_team', request.url));
    }

    const teamId = memberData.team_id;
    const clientId = process.env.LINEAR_CLIENT_ID;
    
    // Fallback for MVP
    if (!clientId) {
      console.warn("LINEAR_CLIENT_ID missing, mocking OAuth flow for testing...");
      return NextResponse.redirect(new URL(`/api/integrations/linear/callback?code=mock_linear_code_456&state=${teamId}`, request.url));
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/linear/callback`;
    const scope = encodeURIComponent('read write');
    
    const linearAuthUrl = `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${teamId}&scope=${scope}&prompt=consent`;

    return NextResponse.redirect(linearAuthUrl);

  } catch (error: any) {
    console.error("Linear Connect Error:", error);
    return NextResponse.json({ error: "Failed to initiate Linear connection" }, { status: 500 });
  }
}
