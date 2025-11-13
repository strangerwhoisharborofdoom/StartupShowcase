import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can run migrations' }, { status: 403 })
    }

    // Run the migration - Add whatsapp_group_url column
    const migrationSQL = `
      ALTER TABLE public.ideas
      ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;
    `

    // Execute using raw SQL query
    const { error: migrationError } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    })

    if (migrationError) {
      console.error('Migration error:', migrationError)
      return NextResponse.json({ 
        error: 'Migration failed. Please run SQL manually in Supabase Dashboard.',
        sql: migrationSQL,
        details: migrationError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully! whatsapp_group_url column added to ideas table.' 
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error.message,
      instruction: 'Please run this SQL manually in Supabase Dashboard > SQL Editor:\nALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;'
    }, { status: 500 })
  }
}
