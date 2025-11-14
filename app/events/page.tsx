import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true })

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground mt-1">Upcoming and past events from the Incubation Centre</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && (
            <div className="col-span-full p-4 rounded border border-border bg-muted/30 text-sm">
              <p className="font-medium text-foreground mb-1">Events not available yet</p>
              <p className="text-muted-foreground">{error.message}</p>
              <div className="text-muted-foreground mt-2">
                If you are an admin, run the migration in Supabase SQL Editor and reload the schema cache:
                <pre className="mt-2 whitespace-pre-wrap text-xs p-2 bg-background border rounded">
{`-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  registration_link TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;`}
                </pre>
              </div>
            </div>
          )}
          {(events || []).map((e: any) => (
            <Card key={e.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{e.title}</CardTitle>
                {e.location && (
                  <CardDescription>{e.location}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-3">
                  {new Date(e.event_date).toLocaleString()}
                </div>
                {e.description && (
                  <p className="text-foreground whitespace-pre-wrap mb-4">{e.description}</p>
                )}
                <div className="flex gap-3">
                  {e.registration_link && (
                    <a
                      href={e.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Register
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!events || events.length === 0) && (
            <div className="text-sm text-muted-foreground">No events published yet.</div>
          )}
        </div>
      </div>
    </main>
  )
}
