import { createClient } from '@/lib/supabase/server'
import type { DigitalBadge } from '@/app/types/database.types'

export default async function BadgesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch candidate profile
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Fetch badges
  const { data: badges } = await supabase
    .from('digital_badges')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('issued_at', { ascending: false })
    .returns<DigitalBadge[]>()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Digital Badges</h1>
        <p className="text-gray-600 mt-2">
          Your achievements and QR-verifiable credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges && badges.length > 0 ? (
          badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
            <p className="text-gray-600">
              Participate in events and challenges to earn badges
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function BadgeCard({ badge }: { badge: DigitalBadge }) {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'winner':
        return 'from-yellow-400 to-orange-500'
      case 'top_5_percent':
        return 'from-purple-400 to-pink-500'
      case 'top_10_percent':
        return 'from-blue-400 to-indigo-500'
      case 'participant':
        return 'from-green-400 to-teal-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      <div
        className={`h-32 bg-gradient-to-br ${getBadgeColor(badge.badge_type)} flex items-center justify-center text-6xl`}
      >
        🏆
      </div>

      <div className="p-6">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
          {badge.badge_type.replace(/_/g, ' ').toUpperCase()}
        </span>

        <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">{badge.badge_name}</h3>
        <p className="text-gray-600 text-sm mb-4">{badge.badge_description}</p>

        {badge.metadata && (
          <div className="space-y-1 mb-4 text-sm text-gray-600">
            {(badge.metadata as any).rank && (
              <p>Rank: #{(badge.metadata as any).rank}</p>
            )}
            {(badge.metadata as any).total_participants && (
              <p>Out of {(badge.metadata as any).total_participants} participants</p>
            )}
            {(badge.metadata as any).score && (
              <p>Score: {(badge.metadata as any).score}</p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 mb-4">
          Issued on {formatDate(badge.issued_at)}
        </div>

        {badge.qr_verification_url && (
          <a
            href={badge.qr_verification_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Verify Badge
          </a>
        )}
      </div>
    </div>
  )
}

