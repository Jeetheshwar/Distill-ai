import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the user's team
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role, teams(id, name, created_at)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (memberError || !memberData || !memberData.teams) {
      return NextResponse.json({ team: null, members: [] });
    }

    // Supabase TS types sometimes infer one-to-many joins as arrays
    const team = Array.isArray(memberData.teams) ? memberData.teams[0] : memberData.teams;
    if (!team) {
      return NextResponse.json({ team: null, members: [] });
    }
    const currentUserRole = memberData.role;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all members of this team using admin to bypass RLS recursion
    const { data: allMembers, error: allError } = await supabaseAdmin
      .from('team_members')
      .select('id, user_id, role, created_at')
      .eq('team_id', team.id);

    if (allError) throw allError;

    // Fetch emails using admin client
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();

    const membersWithEmails = allMembers.map(m => {
      const u = usersData?.users.find(u => u.id === m.user_id);
      return {
        ...m,
        email: u?.email || "Unknown User"
      };
    });

    return NextResponse.json({ team, currentUserRole, members: membersWithEmails });

  } catch (error: unknown) {
    console.error("GET Team Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch team";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insert the team using Admin to bypass RLS
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert({ name })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add the user as admin to team_members using Admin
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) throw memberError;

    // Fetch the new team data to return
    const { data: allMembers, error: allError } = await supabaseAdmin
      .from('team_members')
      .select('id, user_id, role, created_at')
      .eq('team_id', team.id);

    try {
      await supabaseAdmin.from('user_settings')
        .update({ active_team_id: team.id })
        .eq('user_id', user.id);
    } catch (_e) {}

    return NextResponse.json({ success: true, team });

  } catch (error: unknown) {
    console.error("Create Team Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create team";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
