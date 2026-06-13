import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get the user's team
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
    const clientId = process.env.JIRA_CLIENT_ID;
    
    // Fallback for MVP if user hasn't set up Atlassian App yet
    if (!clientId) {
      console.warn("JIRA_CLIENT_ID missing, mocking OAuth flow for testing...");
      return NextResponse.redirect(new URL(`/api/integrations/jira/callback?code=mock_jira_code_123&state=${teamId}`, request.url));
    }

    // Real Atlassian OAuth Redirect
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/jira/callback`;
    const scope = encodeURIComponent('read:jira-work write:jira-work manage:jira-project');
    
    const atlassianAuthUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${teamId}&response_type=code&prompt=consent`;

    return NextResponse.redirect(atlassianAuthUrl);

  } catch (error: any) {
    console.error("Jira Connect Error:", error);
    return NextResponse.json({ error: "Failed to initiate Jira connection" }, { status: 500 });
  }
}
