import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type InterviewMessage = {
  speaker: string
  content: string
  timestamp?: string
}

export default async function InterviewTranscriptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (!profile) {
    notFound()
  }

  const interviewId = resolvedParams.id

  // Verify interview belongs to user
  const { data: interview } = await supabase
    .from('ai_interviews')
    .select('id, interview_type, interview_date, ai_summary, transcript')
    .eq('id', interviewId)
    .eq('candidate_id', profile.id)
    .single()

  if (!interview) {
    notFound()
  }

  // Prefer granular messages
  const { data: messages } = await supabase
    .from('interview_messages')
    .select('speaker, content, timestamp')
    .eq('interview_id', interviewId)
    .order('message_order', { ascending: true })

  let transcript: InterviewMessage[] = []
  if (messages && messages.length > 0) {
    transcript = messages
  } else if (interview.transcript) {
    transcript = interview.transcript as unknown as InterviewMessage[]
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/dashboard/interviews"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Interviews
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Transcript</h1>
            <p className="text-sm text-gray-600">
              {interview.interview_type?.toUpperCase()} •{' '}
              {new Date(interview.interview_date).toLocaleString()}
            </p>
          </div>
        </div>

        {interview.ai_summary && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">AI Summary</h3>
            <p className="text-blue-800 text-sm">{interview.ai_summary}</p>
          </div>
        )}

        {transcript.length === 0 ? (
          <p className="text-sm text-gray-600">No transcript available for this interview.</p>
        ) : (
          <div className="space-y-4">
            {transcript.map((msg, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {msg.speaker}
                  </span>
                  {msg.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
