import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const teamId = searchParams.get('state');

    if (!code || !teamId) {
      return NextResponse.redirect(new URL('/dashboard/integrations?error=missing_oauth_params', request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify user belongs to this team
    const { data: memberCheck } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .single();

    if (!memberCheck) {
      return NextResponse.redirect(new URL('/dashboard/integrations?error=unauthorized_team', request.url));
    }

    const clientId = process.env.JIRA_CLIENT_ID;
    const clientSecret = process.env.JIRA_CLIENT_SECRET;
    
    let accessToken = "mock_access_token_abc123";
    let refreshToken = "mock_refresh_token_xyz987";
    let cloudId = "mock_cloud_id_0000";

    // Real Token Exchange
    if (clientId && clientSecret) {
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/jira/callback`;
      
      const tokenRes = await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri
        })
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to exchange Jira token");
      }

      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;

      // Fetch accessible resources (cloudId)
      const resourceRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const resourceData = await resourceRes.json();
      if (resourceData.length > 0) {
        cloudId = resourceData[0].id;
      }
    }

    // Check if connection exists
    const { data: existing } = await supabaseAdmin
      .from('oauth_connections')
      .select('id')
      .eq('team_id', teamId)
      .eq('provider', 'jira')
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from('oauth_connections')
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          metadata: { cloudId },
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('oauth_connections')
        .insert({
          team_id: teamId,
          provider: 'jira',
          access_token: accessToken,
          refresh_token: refreshToken,
          metadata: { cloudId }
        });
        
      if (insertError) throw insertError;
    }

    return NextResponse.redirect(new URL('/dashboard/integrations?success=jira_connected', request.url));

  } catch (error: unknown) {
    console.error("Jira Callback Error:", error);
    return NextResponse.redirect(new URL('/dashboard/integrations?error=jira_callback_failed', request.url));
  }
}
