import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { CandidateProfile, DigitalBadge, AgentMatch, PanelReview } from '@/app/types/database.types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch candidate profile
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single<CandidateProfile>()

  // Fetch badges count
  const { count: badgeCount } = await supabase
    .from('digital_badges')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', profile?.id || '')

  // Fetch new job matches count
  const { count: newMatchesCount } = await supabase
    .from('agent_matches')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', profile?.id || '')
    .eq('match_status', 'new')

  // Fetch recent panel reviews
  const { data: recentReviews } = await supabase
    .from('panel_reviews')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('created_at', { ascending: false })
    .limit(1)
    .returns<PanelReview[]>()

  // Fetch registered events count
  const { count: eventsCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', profile?.id || '')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s your career dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="New Job Matches"
          value={newMatchesCount || 0}
          icon="💼"
          color="blue"
          link="/dashboard/job-matches"
        />
        <StatCard
          title="Digital Badges"
          value={badgeCount || 0}
          icon="🏆"
          color="yellow"
          link="/dashboard/badges"
        />
        <StatCard
          title="Registered Events"
          value={eventsCount || 0}
          icon="🎯"
          color="green"
          link="/dashboard/events"
        />
        <StatCard
          title="Profile Completeness"
          value={calculateProfileCompleteness(profile)}
          icon="📊"
          color="purple"
          suffix="%"
          link="/dashboard/profile"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Update Profile"
            description="Keep your information current"
            icon="✏️"
            link="/dashboard/profile"
          />
          <QuickActionCard
            title="Browse Events"
            description="Join hackathons and challenges"
            icon="🎯"
            link="/dashboard/events"
          />
          <QuickActionCard
            title="Start AI Interview"
            description="Practice with AI interviewer"
            icon="🎤"
            link="/dashboard/interviews/new"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Panel Review */}
        {recentReviews && recentReviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Latest AI Panel Review</h2>
              <Link
                href="/dashboard/ai-panel"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </Link>
            </div>
            <PanelReviewCard review={recentReviews[0]} />
          </div>
        )}

        {/* Profile Visibility */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Visibility</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Visible to Employers</h3>
                <p className="text-sm text-gray-600">
                  {profile?.visible_to_employers
                    ? 'Employers can view your profile'
                    : 'Your profile is hidden from employers'}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.visible_to_employers
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {profile?.visible_to_employers ? 'Active' : 'Hidden'}
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Manage Privacy Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  suffix = '',
  link,
}: {
  title: string
  value: number
  icon: string
  color: string
  suffix?: string
  link: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <Link href={link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-3xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">
        {value}
        {suffix}
      </h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </Link>
  )
}

function QuickActionCard({
  title,
  description,
  icon,
  link,
}: {
  title: string
  description: string
  icon: string
  link: string
}) {
  return (
    <Link
      href={link}
      className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
    >
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </Link>
  )
}

function PanelReviewCard({ review }: { review: PanelReview }) {
  const getVerdictColor = (verdict: string) => {
    if (verdict === 'Strong fit') return 'bg-green-100 text-green-800'
    if (verdict === 'Reach role') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-900">{review.overall_score}/100</div>
          <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getVerdictColor(review.overall_verdict)}`}>
            {review.overall_verdict}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <ReviewAgent name="HR" score={review.hr_score} verdict={review.hr_verdict} />
        <ReviewAgent name="Tech Lead" score={review.tech_score} verdict={review.tech_verdict} />
        <ReviewAgent name="Career Coach" score={review.coach_score} verdict={review.coach_verdict} />
      </div>
    </div>
  )
}

function ReviewAgent({
  name,
  score,
  verdict,
}: {
  name: string
  score: number
  verdict: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{name}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{score}/100</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-600">{verdict}</span>
      </div>
    </div>
  )
}

function calculateProfileCompleteness(profile: CandidateProfile | null): number {
  if (!profile) return 0

  const fields = [
    profile.full_name,
    profile.email,
    profile.phone,
    profile.location,
    profile.headline,
    profile.bio,
    profile.linkedin_url,
    profile.github_url,
    profile.preferred_roles && profile.preferred_roles.length > 0,
    profile.preferred_locations && profile.preferred_locations.length > 0,
    profile.min_salary_rm,
    profile.employment_status,
  ]

  const filledFields = fields.filter(Boolean).length
  return Math.round((filledFields / fields.length) * 100)
}





