import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, plan_type } = await request.json()
    
    // Validate
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    
    // Use service role key to insert into waitlist_emails
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase
      .from('waitlist_emails')
      .insert({ email, plan_type })
    
    if (error?.code === '23505') { // unique violation
      return NextResponse.json({ 
        message: "You're already on the list!" 
      }, { status: 200 })
    }
    
    if (error) {
      console.error("Waitlist insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: "You're on the list! We'll email you when it launches." 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
