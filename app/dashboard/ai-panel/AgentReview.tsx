'use client'

import { useState } from 'react'

type Props = {
  name: string
  icon: string
  score: number
  verdict: string
  justification?: string
  pros?: string[]
  cons?: string[]
}

export default function AgentReview({
  name,
  icon,
  score,
  verdict,
  justification,
  pros,
  cons,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{verdict}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-blue-600">{score}/100</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
          {justification && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Justification</h5>
              <p className="text-gray-700 text-sm">{justification}</p>
            </div>
          )}

          {pros && pros.length > 0 && (
            <div>
              <h5 className="font-medium text-green-900 mb-2">Strengths</h5>
              <ul className="list-disc list-inside space-y-1">
                {pros.map((pro, idx) => (
                  <li key={idx} className="text-green-800 text-sm">
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cons && cons.length > 0 && (
            <div>
              <h5 className="font-medium text-orange-900 mb-2">Areas for Improvement</h5>
              <ul className="list-disc list-inside space-y-1">
                {cons.map((con, idx) => (
                  <li key={idx} className="text-orange-800 text-sm">
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
