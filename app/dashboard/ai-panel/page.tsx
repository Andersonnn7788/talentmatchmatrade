import { createClient } from '@/lib/supabase/server'
import type { PanelReview } from '@/app/types/database.types'
import AgentReview from './AgentReview'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AIPanelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: reviews } = await supabase
    .from('panel_reviews')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('reviewed_at', { ascending: false })
    .returns<PanelReview[]>()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Virtual Hiring Panel Reviews</h1>
        <p className="text-gray-600 mt-2">
          AI-powered evaluations from HR, Tech Lead, and Career Coach perspectives
        </p>
      </div>

      <div className="space-y-6">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => <PanelReviewCard key={review.id} review={review} />)
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No panel reviews yet</h3>
            <p className="text-gray-600">
              Complete your preliminary interview to receive AI panel evaluations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PanelReviewCard({ review }: { review: PanelReview }) {
  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('Strong fit')) return 'bg-green-100 text-green-800 border-green-200'
    if (verdict.includes('Reach role')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Panel Evaluation</h3>
          <p className="text-sm text-gray-600">Reviewed on {formatDate(review.reviewed_at)}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-600 mb-2">{review.overall_score}/100</div>
          <span
            className={`inline-block px-4 py-1 rounded-full text-sm font-medium border ${getVerdictColor(
              review.overall_verdict
            )}`}
          >
            {review.overall_verdict}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <AgentReview
          name="HR Specialist"
          icon="🤝"
          score={review.hr_score}
          verdict={review.hr_verdict}
          justification={review.hr_justification}
          pros={review.hr_pros}
          cons={review.hr_cons}
        />
        <AgentReview
          name="Tech Lead"
          icon="🛠️"
          score={review.tech_score}
          verdict={review.tech_verdict}
          justification={review.tech_justification}
          pros={review.tech_pros}
          cons={review.tech_cons}
        />
        <AgentReview
          name="Career Coach"
          icon="🎯"
          score={review.coach_score}
          verdict={review.coach_verdict}
          justification={review.coach_justification}
          pros={review.coach_pros}
          cons={review.coach_cons}
        />
      </div>
    </div>
  )
}

