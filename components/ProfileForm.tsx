'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CandidateProfile } from '@/app/types/database.types'

export default function ProfileForm({
  profile,
  candidateId,
}: {
  profile: CandidateProfile | null
  candidateId: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    linkedin_url: profile?.linkedin_url || '',
    github_url: profile?.github_url || '',
    portfolio_url: profile?.portfolio_url || '',
    min_salary_rm: profile?.min_salary_rm?.toString() || '',
    notice_period_days: profile?.notice_period_days?.toString() || '',
    employment_status: profile?.employment_status || '',
    visible_to_employers: profile?.visible_to_employers || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('candidate_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          headline: formData.headline,
          bio: formData.bio,
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
          portfolio_url: formData.portfolio_url,
          min_salary_rm: formData.min_salary_rm ? parseFloat(formData.min_salary_rm) : null,
          notice_period_days: formData.notice_period_days ? parseInt(formData.notice_period_days) : null,
          employment_status: formData.employment_status,
          visible_to_employers: formData.visible_to_employers,
        })
        .eq('id', candidateId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      window.location.reload()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DisplayField label="Full Name" value={formData.full_name} />
          <DisplayField label="Email" value={formData.email} />
          <DisplayField label="Phone" value={formData.phone} />
          <DisplayField label="Location" value={formData.location} />
          <DisplayField label="Minimum Salary (RM)" value={formData.min_salary_rm} />
          <DisplayField label="Notice Period (Days)" value={formData.notice_period_days} />
          <DisplayField label="Employment Status" value={formData.employment_status} />
        </div>
        <DisplayField label="Headline" value={formData.headline} />
        <DisplayField label="Bio" value={formData.bio} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DisplayField label="LinkedIn" value={formData.linkedin_url} link />
          <DisplayField label="GitHub" value={formData.github_url} link />
          <DisplayField label="Portfolio" value={formData.portfolio_url} link />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.visible_to_employers}
            disabled
            className="rounded"
          />
          <span className="text-sm text-gray-700">Visible to employers</span>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Edit Profile
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            required
            disabled
            value={formData.email}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Kuala Lumpur, Malaysia"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Salary (RM)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.min_salary_rm}
            onChange={(e) => setFormData({ ...formData, min_salary_rm: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notice Period (Days)
          </label>
          <input
            type="number"
            value={formData.notice_period_days}
            onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
        <select
          value={formData.employment_status}
          onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select status</option>
          <option value="student">Student</option>
          <option value="fresh_grad">Fresh Graduate</option>
          <option value="employed">Employed</option>
          <option value="unemployed">Unemployed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Full-Stack Developer | AI Enthusiast"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
          <input
            type="url"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
          <input
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
          <input
            type="url"
            value={formData.portfolio_url}
            onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.visible_to_employers}
          onChange={(e) => setFormData({ ...formData, visible_to_employers: e.target.checked })}
          className="rounded"
        />
        <label className="text-sm text-gray-700">
          Make my profile visible to employers
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function DisplayField({
  label,
  value,
  link = false,
}: {
  label: string
  value: string
  link?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {link && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="text-gray-900">{value || '-'}</p>
      )}
    </div>
  )
}




