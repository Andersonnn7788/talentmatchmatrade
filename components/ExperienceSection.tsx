'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Experience } from '@/app/types/database.types'

export default function ExperienceSection({
  experience,
  candidateId,
}: {
  experience: Experience[]
  candidateId: string
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    company: '',
    title: '',
    employment_type: '',
    location: '',
    start_date: '',
    end_date: '',
    current: false,
    description: '',
    skills_used: '',
  })

  const resetForm = () => {
    setFormData({
      company: '',
      title: '',
      employment_type: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      skills_used: '',
    })
    setIsAdding(false)
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (exp: Experience) => {
    setFormData({
      company: exp.company,
      title: exp.title,
      employment_type: exp.employment_type || '',
      location: exp.location || '',
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      current: exp.current,
      description: exp.description || '',
      skills_used: exp.skills_used ? exp.skills_used.join(', ') : '',
    })
    setEditingId(exp.id)
    setIsAdding(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const skillsArray = formData.skills_used
        ? formData.skills_used.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      const data = {
        company: formData.company,
        title: formData.title,
        employment_type: formData.employment_type || null,
        location: formData.location || null,
        start_date: formData.start_date,
        end_date: formData.current ? null : formData.end_date || null,
        current: formData.current,
        description: formData.description || null,
        skills_used: skillsArray.length > 0 ? skillsArray : null,
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from('experience')
          .update(data)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('experience')
          .insert([{ ...data, candidate_id: candidateId }])
        if (insertError) throw insertError
      }

      resetForm()
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const { error } = await supabase.from('experience').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (err) {
      alert('Failed to delete experience')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {experience.length === 0 && !isAdding && (
        <p className="text-gray-600">No experience records added yet.</p>
      )}

      {experience.map((exp) => (
        <div key={exp.id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-gray-700">{exp.company}</p>
              <p className="text-sm text-gray-600 mt-1">
                {exp.employment_type} • {exp.location}
              </p>
              <p className="text-sm text-gray-600">
                {exp.start_date} - {exp.current ? 'Present' : exp.end_date || 'N/A'}
              </p>
              {exp.description && <p className="text-sm text-gray-700 mt-3">{exp.description}</p>}
              {exp.skills_used && exp.skills_used.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {exp.skills_used.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(exp)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(exp.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {isAdding ? (
        <form onSubmit={handleSubmit} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Experience' : 'Add Experience'}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.current}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                className="rounded"
              />
              <label className="ml-2 text-sm text-gray-700">I currently work here</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills Used (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills_used}
                onChange={(e) => setFormData({ ...formData, skills_used: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, Node.js, Python"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Experience
        </button>
      )}
    </div>
  )
}
