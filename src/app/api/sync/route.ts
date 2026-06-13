import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const isRetro = payload.metadata?.schema_applied === "retro";
    
    let tickets: any[] = [];
    if (isRetro) {
      tickets = payload.entities?.retro_categories?.action_items || [];
    } else {
      tickets = payload.entities?.extracted_tickets || [];
    }

    if (tickets.length === 0) {
      return NextResponse.json({ message: "No tickets to sync." }, { status: 200 });
    }

    // Find user's active team
    const { data: memberData } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!memberData) {
      return NextResponse.json({ error: "No team workspace found." }, { status: 400 });
    }

    const teamId = memberData.team_id;

    // Fetch active OAuth connections for this team
    const { data: connections } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('team_id', teamId);

    const activeConnections = connections || [];
    const results = [];

    // Sync logic
    if (activeConnections.length === 0) {
      // Fallback: Check if user has a custom webhook in user_settings
      const { data: settings } = await supabase.from('user_settings').select('webhook_url').eq('user_id', user.id).single();
      if (settings?.webhook_url) {
        try {
          await fetch(settings.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          results.push({ provider: 'webhook', status: 'success' });
        } catch (e: any) {
          results.push({ provider: 'webhook', status: 'failed', error: e.message });
        }
      } else {
        return NextResponse.json({ error: "No active integrations or webhooks found for this team." }, { status: 400 });
      }
    }

    for (const conn of activeConnections) {
      if (conn.provider === 'jira') {
        results.push(await syncToJira(conn, tickets));
      } else if (conn.provider === 'linear') {
        results.push(await syncToLinear(conn, tickets));
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Sync Engine Error Block:", error);
    return NextResponse.json({ 
      error: "Internal Server Error during sync.", 
      details: error.message || error.toString() 
    }, { status: 500 });
  }
}

async function syncToJira(connection: any, tickets: any[]) {
  try {
    const { access_token, metadata } = connection;
    const cloudId = metadata?.cloudId;

    if (access_token.startsWith("mock_")) {
      console.log(`[SYNC ENGINE] 🚀 Simulating Jira Push for ${tickets.length} tickets to Cloud ID: ${cloudId || 'unknown'}`);
      
      const payloadSample = tickets.map(t => ({
        fields: {
          project: { key: "DEMO" },
          summary: t.title,
          description: {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: t.description || "No description." }] }]
          },
          issuetype: { name: t.type || "Task" }
        }
      }));
      
      console.log(`[SYNC ENGINE] 📦 Jira ADF Payload Constructed:\n${JSON.stringify(payloadSample, null, 2)}`);
      return { provider: 'jira', status: 'success', mocked: true, count: tickets.length };
    }

    // TODO: Real API call to https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/bulk
    return { provider: 'jira', status: 'failed', error: 'Real Jira push not implemented yet.' };

  } catch (err: any) {
    return { provider: 'jira', status: 'failed', error: err.message };
  }
}

async function syncToLinear(connection: any, tickets: any[]) {
  try {
    const { access_token } = connection;

    if (access_token.startsWith("mock_")) {
      console.log(`[SYNC ENGINE] 🚀 Simulating Linear Push for ${tickets.length} tickets.`);
      
      const payloadSample = tickets.map(t => ({
        query: `mutation IssueCreate($title: String!, $description: String) { issueCreate(input: { title: $title, description: $description, teamId: "TEAM_ID" }) { issue { id title } } }`,
        variables: {
          title: t.title,
          description: t.description || "No description"
        }
      }));

      console.log(`[SYNC ENGINE] 📦 Linear GraphQL Payload Constructed:\n${JSON.stringify(payloadSample, null, 2)}`);
      return { provider: 'linear', status: 'success', mocked: true, count: tickets.length };
    }

    // TODO: Real API call to https://api.linear.app/graphql
    return { provider: 'linear', status: 'failed', error: 'Real Linear push not implemented yet.' };

  } catch (err: any) {
    return { provider: 'linear', status: 'failed', error: err.message };
  }
}
