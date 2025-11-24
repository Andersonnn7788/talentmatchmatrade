import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { ProjectSubmission, Event } from '@/app/types/database.types'

export default async function SubmissionsPage() {
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

  // Fetch submissions
  const { data: submissions } = await supabase
    .from('project_submissions')
    .select('*, events(*)')
    .eq('candidate_id', profile?.id || '')
    .order('submitted_at', { ascending: false })
    .returns<(ProjectSubmission & { events: Event })[]>()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-600 mt-2">Track your project submissions and scores</p>
      </div>

      <div className="space-y-6">
        {submissions && submissions.length > 0 ? (
          submissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600 mb-6">
              Register for events and submit your projects to build your portfolio
            </p>
            <Link
              href="/dashboard/events"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function SubmissionCard({
  submission,
}: {
  submission: ProjectSubmission & { events: Event }
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {submission.project_title}
          </h3>
          <p className="text-gray-600 text-sm">
            For: <span className="font-medium">{submission.events.title}</span>
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.submission_status)}`}
        >
          {submission.submission_status.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-700 mb-4">{submission.project_description}</p>

      {submission.tech_stack && submission.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {submission.tech_stack.map((tech, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {submission.ai_score !== null && submission.ai_score !== undefined && (
          <ScoreItem label="AI Score" score={submission.ai_score} />
        )}
        {submission.judge_score !== null && submission.judge_score !== undefined && (
          <ScoreItem label="Judge Score" score={submission.judge_score} />
        )}
        {submission.final_score !== null && submission.final_score !== undefined && (
          <ScoreItem label="Final Score" score={submission.final_score} />
        )}
        {submission.rank && <RankItem rank={submission.rank} />}
      </div>

      {submission.feedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-1">Feedback</h4>
          <p className="text-blue-800 text-sm">{submission.feedback}</p>
        </div>
      )}

      <div className="flex gap-3">
        {submission.github_url && (
          <a
            href={submission.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            GitHub →
          </a>
        )}
        {submission.demo_url && (
          <a
            href={submission.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Demo →
          </a>
        )}
        {submission.presentation_url && (
          <a
            href={submission.presentation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Presentation →
          </a>
        )}
      </div>
    </div>
  )
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600">{score.toFixed(1)}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  )
}

function RankItem({ rank }: { rank: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-purple-600">#{rank}</div>
      <div className="text-xs text-gray-600">Rank</div>
    </div>
  )
}





