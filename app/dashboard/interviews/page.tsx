import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { AIInterview } from '@/app/types/database.types'

export default async function InterviewsPage() {
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

  // Fetch AI interviews
  const { data: interviews } = await supabase
    .from('ai_interviews')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('interview_date', { ascending: false })
    .returns<AIInterview[]>()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Interview</h1>
          <p className="text-gray-600 mt-2">
            Start voice-to-voice AI interviews tailored to your profile
          </p>
        </div>
        <Link
          href="/dashboard/interviews/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Start New Interview
        </Link>
      </div>

      <div className="space-y-6">
        {interviews && interviews.length > 0 ? (
          interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-4">🎤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interview yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first AI interview as the preliminary interview for your job application
            </p>
            <Link
              href="/dashboard/interviews/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Interview
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function InterviewCard({ interview }: { interview: AIInterview }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-blue-100 text-blue-800'
      case 'behavioral':
        return 'bg-green-100 text-green-800'
      case 'general':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const insights = interview.key_insights as any

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(interview.interview_type)}`}
            >
              {interview.interview_type.toUpperCase()}
            </span>
            {interview.duration_seconds && (
              <span className="text-sm text-gray-600">
                Duration: {formatDuration(interview.duration_seconds)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{formatDate(interview.interview_date)}</p>
        </div>
      </div>

      {interview.ai_summary && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">AI Summary</h4>
          <p className="text-blue-800 text-sm">{interview.ai_summary}</p>
        </div>
      )}

      {insights && (
        <div className="space-y-3 mb-4">
          {insights.strengths && insights.strengths.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2 text-sm">Strengths</h5>
              <div className="flex flex-wrap gap-2">
                {insights.strengths.map((strength: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}

          {insights.recommendation && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-1 text-sm">Recommendation</h5>
              <p className="text-gray-700 text-sm">{insights.recommendation}</p>
            </div>
          )}
        </div>
      )}

      <Link
        href={`/dashboard/interviews/${interview.id}`}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View Full Transcript →
      </Link>
    </div>
  )
}





