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

    const clientId = process.env.LINEAR_CLIENT_ID;
    const clientSecret = process.env.LINEAR_CLIENT_SECRET;
    
    let accessToken = "mock_linear_access_token";

    // Real Token Exchange
    if (clientId && clientSecret) {
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/linear/callback`;
      
      const tokenRes = await fetch('https://api.linear.app/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri
        }).toString()
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to exchange Linear token");
      }

      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
    }

    // Check if connection exists
    const { data: existing } = await supabaseAdmin
      .from('oauth_connections')
      .select('id')
      .eq('team_id', teamId)
      .eq('provider', 'linear')
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from('oauth_connections')
        .update({
          access_token: accessToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
        
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('oauth_connections')
        .insert({
          team_id: teamId,
          provider: 'linear',
          access_token: accessToken
        });
        
      if (insertError) throw insertError;
    }

    return NextResponse.redirect(new URL('/dashboard/integrations?success=linear_connected', request.url));

  } catch (error: unknown) {
    console.error("Linear Callback Error:", error);
    return NextResponse.redirect(new URL('/dashboard/integrations?error=linear_callback_failed', request.url));
  }
}
