import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Event, EventRegistration } from '@/app/types/database.types'

export default async function MyEventsPage() {
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

  // Fetch user's registrations with event details
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select(`
      event_id,
      registration_status,
      events:event_id (*)
    `)
    .eq('candidate_id', profile?.id || '')
    .returns<(EventRegistration & { events: Event })[]>()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events & Challenges</h1>
        <p className="text-gray-600 mt-2">
          Join hackathons, business challenges, and case studies to build your portfolio
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-8">
        <Link
          href="/dashboard/events"
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Available Events
        </Link>
        <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
          My Registrations
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registrations?.map((registration) => (
          <EventCard
            key={registration.event_id}
            event={registration.events}
            isRegistered={true}
            status={registration.registration_status}
          />
        ))}
      </div>

      {!registrations || registrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No registered events</h3>
          <p className="text-gray-600 mb-4">You haven&apos;t registered for any events yet.</p>
          <Link 
            href="/dashboard/events"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Events
          </Link>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, isRegistered, status }: { event: Event; isRegistered: boolean; status?: string }) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      {event.banner_image_url ? (
        <img
          src={event.banner_image_url}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-6xl">
          🎯
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}
          >
            {event.event_type.replace('_', ' ').toUpperCase()}
          </span>
          {isRegistered && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
              {status || 'Registered'}
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(event.start_date)} - {formatDate(event.end_date)}
          </div>
          {event.prize_pool && (
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Prize Pool: RM {event.prize_pool.toLocaleString()}
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/dashboard/events/${event.id}`}
          className={`block w-full text-center px-4 py-2 rounded-lg font-medium transition ${
            isRegistered
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRegistered ? 'View Details' : 'Learn More'}
        </Link>
      </div>
    </div>
  )
}

