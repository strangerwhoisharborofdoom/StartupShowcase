import { createClient } from '@supabase/supabase-js'

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your .env.local file')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const migrationSQL = `
-- Add whatsapp_group_url column to ideas table
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;
`

  console.log('Running migration: 002_add_whatsapp_group.sql')
  console.log('SQL:', migrationSQL)

  try {
    // Execute the SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration failed:', error.message)
      console.log('\nAlternative: Run this SQL directly in Supabase Dashboard > SQL Editor:')
      console.log(migrationSQL)
      process.exit(1)
    }

    console.log('✓ Migration completed successfully!')
    console.log('The whatsapp_group_url column has been added to the ideas table.')
  } catch (err: any) {
    console.error('Error running migration:', err.message || err)
    console.log('\nPlease run this SQL manually in Supabase Dashboard > SQL Editor:')
    console.log(migrationSQL)
  }
}

runMigration()
