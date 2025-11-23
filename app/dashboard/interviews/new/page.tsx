import Link from 'next/link'

export default function NewInterviewPage() {
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

      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start AI Interview Practice</h1>
          <p className="text-gray-600">
            Choose your interview type and get ready for voice-to-voice practice
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <InterviewTypeCard
            title="Technical Interview"
            description="Practice coding problems, system design, and technical concepts"
            icon="💻"
            type="technical"
          />
          <InterviewTypeCard
            title="Behavioral Interview"
            description="Work on communication skills, past experiences, and soft skills"
            icon="💬"
            type="behavioral"
          />
          <InterviewTypeCard
            title="General Interview"
            description="Mixed interview covering various topics and general questions"
            icon="🎯"
            type="general"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Before You Start:</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Ensure your microphone is working and you&apos;re in a quiet environment
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              The AI will tailor questions based on your profile and target role
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              You&apos;ll receive detailed feedback and insights after the interview
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Interview duration: 15-30 minutes
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            This feature is coming soon! We&apos;re integrating ElevenLabs TTS and Google STT for the
            best voice interview experience.
          </p>
        </div>
      </div>
    </div>
  )
}

function InterviewTypeCard({
  title,
  description,
  icon,
  type,
}: {
  title: string
  description: string
  icon: string
  type: string
}) {
  return (
    <button
      disabled
      className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
    >
      <div className="flex items-start">
        <span className="text-4xl mr-4">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </button>
  )
}

