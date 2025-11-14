import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { FeaturedCard } from "@/components/featured-card"
import CountUp from "@/components/ui/count-up"
import Link from "next/link"

async function getFeaturedIdeas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("status", "approved")
    .eq("is_featured", true)
    .limit(6)

  if (error) {
    console.error("Error fetching featured ideas:", error)
    return []
  }

  return data || []
}

async function getStats() {
  const supabase = await createClient()

  const [approvedIdeas, totalUsers] = await Promise.all([
    supabase.from("ideas").select("id", { count: "exact" }).eq("status", "approved"),
    supabase.from("profiles").select("id", { count: "exact" }),
  ])

  return {
    ideas: approvedIdeas.count || 0,
    users: totalUsers.count || 0,
  }
}

async function getUpcomingEvents() {
  const supabase = await createClient()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return data || []
}

export default async function Home() {
  const featuredIdeas = await getFeaturedIdeas()
  const stats = await getStats()
  const upcomingEvents = await getUpcomingEvents()
  const supabase = await createClient()
  const { data: { user } = { data: { user: null } } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none z-0" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <h1
              className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent leading-tight"
              style={{
                background: "linear-gradient(90deg,#5A2A82,#0A0F2D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Share Your Startup Ideas
            </h1>

            <p className="text-xl text-neutral-dark max-w-2xl mx-auto">
              Showcase your innovation, connect with collaborators, and turn your ideas into reality. A platform built
              for student entrepreneurs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/browse"
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition transform hover:scale-105 inline-block"
              >
                Explore Ideas
              </Link>
              <Link
                href={user ? "/dashboard/ideas/new" : "/auth/sign-up"}
                className="px-8 py-3 bg-neutral-light text-foreground rounded-lg font-semibold hover:bg-neutral-dark hover:text-white transition transform hover:scale-105 inline-block"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary"><CountUp end={stats.ideas} className="inline-block" /></div>
              <div className="text-sm text-neutral-dark">Ideas Shared</div>
            </div>
            <div className="text-center">
                <div className="text-3xl font-bold text-foreground"><CountUp end={stats.users} className="inline-block" /></div>
              <div className="text-sm text-neutral-dark">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black"><CountUp end={12} suffix="+" className="inline-block" /></div>
              <div className="text-sm text-neutral-dark">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary"><CountUp end={100} suffix="%" className="inline-block" /></div>
              <div className="text-sm text-neutral-dark">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ideas + Events Section */}
      {(featuredIdeas.length > 0 || upcomingEvents.length > 0) && (
        <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-neutral-light/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Ideas</h2>
                    <p className="text-neutral-dark max-w-xl">
                      Check out some of the most exciting startup ideas from our community.
                    </p>
                  </div>
                  <Link
                    href="/browse"
                    className="inline-block px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition text-center"
                  >
                    View All Ideas
                  </Link>
                </div>
                {featuredIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredIdeas.map((idea: any) => (
                      <FeaturedCard
                        key={idea.id}
                        id={idea.id}
                        title={idea.title}
                        problem={idea.problem_statement}
                        category={idea.category}
                        tags={idea.tags || []}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-white/70 p-10 text-center text-muted-foreground">
                    No featured ideas yet. Check back soon!
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-white/80 shadow-sm p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">Upcoming Events</h3>
                    <p className="text-sm text-muted-foreground">Join our next sessions and meet fellow builders.</p>
                  </div>
                  <Link href="/events" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
                    View all
                  </Link>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-5">
                    {upcomingEvents.map((event: any) => (
                      <div key={event.id} className="rounded-xl border border-border/80 p-4 bg-background/80">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          {new Date(event.event_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-1">{event.title}</h4>
                        {event.location && <p className="text-sm text-muted-foreground mb-2">{event.location}</p>}
                        {event.description && (
                          <p className="text-sm text-neutral-dark line-clamp-3 mb-3">{event.description}</p>
                        )}
                        {event.registration_link && (
                          <a
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                          >
                            Register
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                    No upcoming events yet. Keep an eye on this space!
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Share Your Idea?</h2>
          <p className="text-neutral-dark mb-8 max-w-xl mx-auto">
            Join our community of student innovators and get your startup idea in front of mentors, investors, and
            collaborators.
          </p>
          <Link
            href={user ? "/dashboard/ideas/new" : "/auth/sign-up"}
            className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition transform hover:scale-105"
          >
            Sign Up Free
          </Link>
        </div>
      </section>
    </main>
  )
}
