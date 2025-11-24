import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RegisterButton from '@/components/RegisterButton'
import type { Event } from '@/app/types/database.types'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single<Event>()

  if (!event) {
    notFound()
  }

  // Fetch candidate profile
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Check if already registered
  const { data: registration } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event.id)
    .eq('candidate_id', profile?.id || '')
    .single()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon':
        return 'bg-blue-100 text-blue-800'
      case 'business_challenge':
        return 'bg-green-100 text-green-800'
      case 'case_study':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/dashboard/events"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {event.banner_image_url ? (
          <img
            src={event.banner_image_url}
            alt={event.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-8xl">
            🎯
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.event_type)}`}
            >
              {event.event_type.replace('_', ' ').toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {event.status.toUpperCase()}
            </span>
            {registration && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                You are registered
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          <p className="text-gray-700 text-lg mb-6">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoItem icon="📅" label="Start Date" value={formatDate(event.start_date)} />
            <InfoItem icon="🏁" label="End Date" value={formatDate(event.end_date)} />
            {event.registration_deadline && (
              <InfoItem
                icon="⏰"
                label="Registration Deadline"
                value={formatDate(event.registration_deadline)}
              />
            )}
            {event.max_participants && (
              <InfoItem
                icon="👥"
                label="Max Participants"
                value={event.max_participants.toString()}
              />
            )}
            {event.prize_pool && (
              <InfoItem
                icon="💰"
                label="Prize Pool"
                value={`RM ${event.prize_pool.toLocaleString()}`}
              />
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.judging_criteria && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Judging Criteria</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(event.judging_criteria).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{value}%</div>
                    <div className="text-sm text-gray-600 mt-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.rules && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rules</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700">{event.rules}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {!registration && event.status === 'open' && (
              <RegisterButton eventId={event.id} candidateId={profile?.id || ''} />
            )}
            {registration && (
              <Link
                href={`/dashboard/submissions/${event.id}`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
              >
                Submit Project
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start">
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-medium text-gray-900">{value}</div>
      </div>
    </div>
  )
}




