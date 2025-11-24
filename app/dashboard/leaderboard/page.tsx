
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { CandidateProfile, DigitalBadge } from '@/app/types/database.types'

interface LeaderboardEntry extends CandidateProfile {
  badge_count: number
  rank: number
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('candidate_profiles')
    .select('id, full_name, profile_photo_url, xp_points, headline')
    .order('xp_points', { ascending: false })
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return <div>Error loading leaderboard</div>
  }

  // Fetch all badges to count them
  // In a production app with many badges, we would aggregate this in a view or use a counter cache
  const { data: badges, error: badgesError } = await supabase
    .from('digital_badges')
    .select('candidate_id')

  if (badgesError) {
    console.error('Error fetching badges:', badgesError)
  }

  // Calculate badge counts
  const badgeCounts: Record<string, number> = {}
  badges?.forEach((badge) => {
    badgeCounts[badge.candidate_id] = (badgeCounts[badge.candidate_id] || 0) + 1
  })

  // Build leaderboard data
  const leaderboard: LeaderboardEntry[] = (profiles || []).map((profile, index) => ({
    ...profile,
    badge_count: badgeCounts[profile.id] || 0,
    rank: index + 1,
    // Fallback for xp_points if it doesn't exist yet (before migration)
    xp_points: profile.xp_points || 0 
  }))

  // Find current user's rank
  const currentUserId = user?.id
  // We need to find the candidate_id for the current user to highlight them
  // We can do this by fetching the current user's profile separately or checking if we have user_id in profiles
  // Since we didn't select user_id in the main query, let's just rely on the fact that we can't easily match without it.
  // Let's add user_id to the select.

  const { data: currentUserProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user?.id || '')
    .single()

  const currentUserRank = leaderboard.find(p => p.id === currentUserProfile?.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Malaysian Leaderboard</h1>
        <p className="text-gray-600 mt-2">
          Top talents ranked by XP points and achievements
        </p>
      </div>

      {/* Current User Rank Card */}
      {currentUserRank && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {currentUserRank.profile_photo_url ? (
                  <Image
                    src={currentUserRank.profile_photo_url}
                    alt={currentUserRank.full_name}
                    width={64}
                    height={64}
                    className="rounded-full border-4 border-white/20"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {currentUserRank.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="text-blue-100 font-medium text-sm uppercase tracking-wider">Your Rank</div>
                <div className="text-3xl font-bold">#{currentUserRank.rank}</div>
                <div className="text-blue-100 mt-1">{currentUserRank.headline}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-col md:flex-row gap-8">
                <div>
                  <div className="text-blue-100 text-sm">XP Points</div>
                  <div className="text-3xl font-bold">{currentUserRank.xp_points.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-blue-100 text-sm">Badges</div>
                  <div className="text-3xl font-bold">{currentUserRank.badge_count}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Talent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badges
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <tr 
                  key={entry.id} 
                  className={entry.id === currentUserProfile?.id ? 'bg-blue-50' : 'hover:bg-gray-50 transition-colors'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                      ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                        entry.rank === 2 ? 'bg-gray-200 text-gray-800' : 
                        entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}
                    `}>
                      {entry.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {entry.profile_photo_url ? (
                          <Image
                            src={entry.profile_photo_url}
                            alt={entry.full_name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                            {entry.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.full_name} 
                          {entry.id === currentUserProfile?.id && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{entry.headline || 'Talent'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">🏆</span>
                      <span className="text-sm font-medium text-gray-900">{entry.badge_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-indigo-600">
                      {entry.xp_points.toLocaleString()} XP
                    </div>
                  </td>
                </tr>
              ))}
              
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No talents found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

