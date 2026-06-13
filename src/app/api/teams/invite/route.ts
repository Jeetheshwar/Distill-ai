import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, teamId } = await request.json();
    if (!email || !teamId) {
      return NextResponse.json({ error: "Email and Team ID are required" }, { status: 400 });
    }

    // Verify the caller is an admin of the team
    const { data: memberCheck, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (memberError || memberCheck?.role !== 'admin') {
      return NextResponse.json({ error: "You must be a team admin to invite members" }, { status: 403 });
    }

    // Create admin client to search for the user by email
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // List users (For MVP, we find them in memory. In prod, we'd use an RPC or invite table)
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const userToInvite = usersData.users.find(u => u.email === email);

    if (!userToInvite) {
      return NextResponse.json({ 
        error: "User not found. They must sign up for an account before being added to a team." 
      }, { status: 404 });
    }

    if (userToInvite.id === user.id) {
        return NextResponse.json({ error: "You are already in the team." }, { status: 400 });
    }

    // Add them to the team using Admin to bypass RLS
    const { error: insertError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userToInvite.id,
        role: 'member'
      });

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        return NextResponse.json({ error: "User is already in this team" }, { status: 400 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: error.message || "Failed to invite user" }, { status: 500 });
  }
}
