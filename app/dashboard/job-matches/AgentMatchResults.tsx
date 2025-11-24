'use client'

import { useCallback, useEffect, useState } from 'react'

type AgentMatchBreakdown = {
  skills: string
  salary: string
  benefits: string
  location: string
}

export type AgentMatchResult = {
  job_id: string
  job_title: string
  company_name: string
  match_score: number
  summary: string
  breakdown: AgentMatchBreakdown
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

export function AgentMatchResults({ limit = 5 }: { limit?: number }) {
  const [matches, setMatches] = useState<AgentMatchResult[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      const response = await fetch('/api/job-match-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
      })

      if (!response.ok) {
        throw new Error('Unable to load AI recommendations right now.')
      }

      const payload = (await response.json()) as { matches?: AgentMatchResult[] }
      setMatches(payload.matches || [])
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }, [limit])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches, refreshIndex])

  const handleRefresh = () => setRefreshIndex((prev) => prev + 1)

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Agentic Recommendations
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Best-fit roles for you</h2>
          <p className="text-sm text-gray-600">
            Gemini-powered recruiter agent reviews your profile and prioritizes matches.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {status === 'loading' && (
        <div className="animate-pulse space-y-4">
          {[0, 1].map((key) => (
            <div
              key={key}
              className="p-4 border border-gray-100 rounded-xl bg-gray-50/60 h-28 w-full"
            />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {status === 'ready' && matches.length === 0 && (
        <div className="p-4 border border-dashed border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50">
          No AI recommendations yet. Update your profile with skills, preferences, and experiences so
          the agent can personalize future matches.
        </div>
      )}

      {status === 'ready' && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match) => (
            <AgentRecommendationCard
              key={match.job_id}
              match={match}
              expanded={expandedId === match.job_id}
              onToggle={() =>
                setExpandedId((current) => (current === match.job_id ? null : match.job_id))
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}

function AgentRecommendationCard({
  match,
  expanded,
  onToggle,
}: {
  match: AgentMatchResult
  expanded: boolean
  onToggle: () => void
}) {
  const getMatchColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{match.job_title}</h3>
          <p className="text-sm text-gray-600">{match.company_name}</p>
          <p className="text-sm text-gray-700 mt-2">{match.summary}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`px-3 py-1 rounded-lg text-sm font-semibold border transition ${getMatchColor(
            match.match_score
          )} ${expanded ? 'ring-2 ring-offset-1 ring-offset-white ring-blue-400' : ''}`}
          aria-expanded={expanded}
          aria-label="View why this match was scored"
        >
          {expanded ? 'Hide' : 'View'} {match.match_score}% match
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
          <BreakdownCard label="Skills" value={match.breakdown.skills} />
          <BreakdownCard label="Salary" value={match.breakdown.salary} />
          <BreakdownCard label="Benefits" value={match.breakdown.benefits} />
          <BreakdownCard label="Location" value={match.breakdown.location} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Apply Now
        </button>
        <button className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Check Details
        </button>
        <button className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Save
        </button>
      </div>
    </div>
  )
}

function BreakdownCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="text-gray-800 mt-1">{value}</p>
    </div>
  )
}

export default AgentMatchResults


