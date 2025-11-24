import { createClient } from '@/lib/supabase/server'
import type { AgentMatch, JobPosting } from '@/app/types/database.types'
import AgentMatchResults from './AgentMatchResults'

type JobMatchWithDetails = AgentMatch & {
  job_postings?: JobPosting | null
}

export default async function JobMatchesPage() {
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

  // Fetch job matches with job details (only if profile exists)
  const matches =
    profile?.id
      ? (
          await supabase
            .from('agent_matches')
            .select('*, job_postings(*)')
            .eq('candidate_id', profile.id)
            .order('match_score', { ascending: false })
            .returns<JobMatchWithDetails[]>()
        ).data || []
      : []

  // Fetch fallback job postings so users always see opportunities
  const { data: jobPostings } = await supabase
    .from('job_postings')
    .select('*')
    .eq('status', 'active')
    .order('posted_date', { ascending: false })
    .limit(10)
    .returns<JobPosting[]>()

  const newMatches = matches.filter((m) => m.match_status === 'new')
  const viewedMatches = matches.filter((m) => m.match_status === 'viewed')
  const appliedMatches = matches.filter((m) => m.match_status === 'applied')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agentic Job Matches</h1>
        <p className="text-gray-600 mt-2">
          AI-powered job recommendations tailored to your skills and preferences
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatBox label="New Matches" value={newMatches.length} color="blue" />
        <StatBox label="Viewed" value={viewedMatches.length} color="gray" />
        <StatBox label="Applied" value={appliedMatches.length} color="green" />
      </div>

      {/* AI Agent Recommendations + Matches */}
      <div className="space-y-6">
        <AgentMatchResults />
        {matches.length > 0 ? (
          <>
            {newMatches.length > 0 && <Section title="New Matches" matches={newMatches} />}
            {viewedMatches.length > 0 && <Section title="Viewed Matches" matches={viewedMatches} />}
            {appliedMatches.length > 0 && <Section title="Applied" matches={appliedMatches} />}
          </>
        ) : jobPostings && jobPostings.length > 0 ? (
          <JobListingSection jobs={jobPostings} />
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job matches yet</h3>
            <p className="text-gray-600 mb-4">
              Complete your profile with skills and preferences to get personalized job
              recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'blue' | 'gray' | 'green'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  }

  return (
    <div className={`p-6 rounded-xl border ${colors[color]}`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  )
}

function Section({ title, matches }: { title: string; matches: JobMatchWithDetails[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {matches.map((match) => (
          <JobMatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}

function JobListingSection({ jobs }: { jobs: JobPosting[] }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Active Opportunities</h2>
          <p className="text-gray-600 text-sm">
            These roles are currently open. Complete your profile to get personalized match scores.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobPostingCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}

function JobMatchCard({ match }: { match: JobMatchWithDetails }) {
  const getMatchColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const job = match.job_postings

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {job?.job_title || 'Job Opportunity'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{job?.company_name}</span>
            {job?.location && (
              <>
                <span>•</span>
                <span>📍 {job.location}</span>
              </>
            )}
            {job?.remote_policy && (
              <>
                <span>•</span>
                <span className="capitalize">{job.remote_policy}</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Matched on {new Date(match.created_at).toLocaleDateString()}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-lg border font-bold ${getMatchColor(match.match_score)}`}
        >
          {match.match_score}% Match
        </div>
      </div>

      {/* Job Description Preview */}
      {job?.job_description && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.job_description}</p>
      )}

      {/* Required Skills */}
      {job?.required_skills && job.required_skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Required Skills:</p>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.slice(0, 6).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 6 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{job.required_skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Salary Range */}
      {job?.salary_min_rm && job?.salary_max_rm && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-900">
            💰 RM {job.salary_min_rm.toLocaleString()} - RM {job.salary_max_rm.toLocaleString()}{' '}
            per month
          </p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {match.skills_match_explanation && (
          <ExplanationItem
            icon="🎯"
            label="Skills Match"
            text={match.skills_match_explanation}
          />
        )}
        {match.salary_alignment_explanation && (
          <ExplanationItem
            icon="💰"
            label="Salary Alignment"
            text={match.salary_alignment_explanation}
          />
        )}
        {match.benefits_match_explanation && (
          <ExplanationItem
            icon="✨"
            label="Benefits Match"
            text={match.benefits_match_explanation}
          />
        )}
        {match.location_fit_explanation && (
          <ExplanationItem
            icon="📍"
            label="Location Fit"
            text={match.location_fit_explanation}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          View Job Details
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          Not Interested
        </button>
      </div>
    </div>
  )
}

function JobPostingCard({ job }: { job: JobPosting }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.job_title}</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{job.company_name}</span>
            {job.location && (
              <>
                <span>•</span>
                <span>📍 {job.location}</span>
              </>
            )}
            {job.remote_policy && (
              <>
                <span>•</span>
                <span className="capitalize">{job.remote_policy}</span>
              </>
            )}
            {job.employment_type && (
              <>
                <span>•</span>
                <span className="capitalize">{job.employment_type}</span>
              </>
            )}
          </div>
          {job.posted_date && (
            <p className="text-xs text-gray-500 mt-1">
              Posted on {new Date(job.posted_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-gray-500">General Listing</span>
      </div>

      {job.job_description && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{job.job_description}</p>
      )}

      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Key Skills:</p>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.slice(0, 6).map((skill, idx) => (
              <span
                key={`${job.id}-skill-${skill}-${idx}`}
                className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border border-gray-200"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 6 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{job.required_skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {job.salary_min_rm && job.salary_max_rm && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-semibold text-blue-900">
            💰 RM {job.salary_min_rm.toLocaleString()} - RM {job.salary_max_rm.toLocaleString()}{' '}
            per month
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          View Job Details
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          Save for Later
        </button>
      </div>
    </div>
  )
}

function ExplanationItem({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
      <span className="text-xl mr-3">{icon}</span>
      <div>
        <h4 className="font-medium text-gray-900 text-sm mb-1">{label}</h4>
        <p className="text-gray-700 text-sm">{text}</p>
      </div>
    </div>
  )
}

