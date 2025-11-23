'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Education } from '@/app/types/database.types'

export default function EducationSection({
  education,
  candidateId,
}: {
  education: Education[]
  candidateId: string
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    current: false,
    grade: '',
    activities: '',
  })

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      current: false,
      grade: '',
      activities: '',
    })
    setIsAdding(false)
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (edu: Education) => {
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.field_of_study || '',
      start_date: edu.start_date || '',
      end_date: edu.end_date || '',
      current: edu.current,
      grade: edu.grade || '',
      activities: edu.activities || '',
    })
    setEditingId(edu.id)
    setIsAdding(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingId) {
        // Update existing
        const { error: updateError } = await supabase
          .from('education')
          .update({
            institution: formData.institution,
            degree: formData.degree,
            field_of_study: formData.field_of_study || null,
            start_date: formData.start_date || null,
            end_date: formData.current ? null : formData.end_date || null,
            current: formData.current,
            grade: formData.grade || null,
            activities: formData.activities || null,
          })
          .eq('id', editingId)

        if (updateError) throw updateError
      } else {
        // Create new
        const { error: insertError } = await supabase.from('education').insert([
          {
            candidate_id: candidateId,
            institution: formData.institution,
            degree: formData.degree,
            field_of_study: formData.field_of_study || null,
            start_date: formData.start_date || null,
            end_date: formData.current ? null : formData.end_date || null,
            current: formData.current,
            grade: formData.grade || null,
            activities: formData.activities || null,
          },
        ])

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
    if (!confirm('Are you sure you want to delete this education entry?')) return

    try {
      const { error } = await supabase.from('education').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (err) {
      alert('Failed to delete education entry')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {education.length === 0 && !isAdding && (
        <p className="text-gray-600">No education records added yet.</p>
      )}

      {education.map((edu) => (
        <div key={edu.id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
              <p className="text-gray-700">
                {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {edu.start_date} - {edu.current ? 'Present' : edu.end_date || 'N/A'}
              </p>
              {edu.grade && <p className="text-sm text-gray-600">Grade: {edu.grade}</p>}
              {edu.activities && <p className="text-sm text-gray-600 mt-2">{edu.activities}</p>}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(edu)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(edu.id)}
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
            {editingId ? 'Edit Education' : 'Add Education'}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution *
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study
              </label>
              <input
                type="text"
                value={formData.field_of_study}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
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
              <label className="ml-2 text-sm text-gray-700">I currently study here</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade/GPA
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3.8/4.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activities & Societies
              </label>
              <textarea
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          Add Education
        </button>
      )}
    </div>
  )
}
