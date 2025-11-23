'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Achievement } from '@/app/types/database.types'

export default function AchievementsSection({
  achievements,
  candidateId,
}: {
  achievements: Achievement[]
  candidateId: string
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_achieved: '',
    category: '',
    issuer: '',
    url: '',
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return '🎓'
      case 'professional':
        return '💼'
      case 'hackathon':
        return '🏆'
      case 'certification':
        return '📜'
      case 'award':
        return '🥇'
      case 'volunteer':
        return '❤️'
      default:
        return '⭐'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-50 border-blue-200'
      case 'professional':
        return 'bg-green-50 border-green-200'
      case 'hackathon':
        return 'bg-yellow-50 border-yellow-200'
      case 'certification':
        return 'bg-purple-50 border-purple-200'
      case 'award':
        return 'bg-pink-50 border-pink-200'
      case 'volunteer':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date_achieved: '',
      category: '',
      issuer: '',
      url: '',
    })
    setIsAdding(false)
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (achievement: Achievement) => {
    setFormData({
      title: achievement.title,
      description: achievement.description || '',
      date_achieved: achievement.date_achieved || '',
      category: achievement.category || '',
      issuer: achievement.issuer || '',
      url: achievement.url || '',
    })
    setEditingId(achievement.id)
    setIsAdding(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = {
        title: formData.title,
        description: formData.description || null,
        date_achieved: formData.date_achieved || null,
        category: formData.category || null,
        issuer: formData.issuer || null,
        url: formData.url || null,
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from('achievements')
          .update(data)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('achievements')
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
    if (!confirm('Are you sure you want to delete this achievement?')) return

    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (err) {
      alert('Failed to delete achievement')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {achievements.length === 0 && !isAdding && (
        <p className="text-gray-600">No achievements added yet.</p>
      )}

      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`p-4 border rounded-lg ${getCategoryColor(achievement.category || '')}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getCategoryIcon(achievement.category || '')}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                  {achievement.issuer && (
                    <p className="text-sm text-gray-700 mt-1">
                      Issued by: {achievement.issuer}
                    </p>
                  )}
                  {achievement.date_achieved && (
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(achievement.date_achieved).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {achievement.description && (
                    <p className="text-sm text-gray-700 mt-2">{achievement.description}</p>
                  )}
                  {achievement.url && (
                    <a
                      href={achievement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      View Certificate →
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(achievement)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(achievement.id)}
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
            {editingId ? 'Edit Achievement' : 'Add Achievement'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Best Project Award"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="academic">Academic</option>
                  <option value="professional">Professional</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="certification">Certification</option>
                  <option value="award">Award</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Achieved
                </label>
                <input
                  type="date"
                  value={formData.date_achieved}
                  onChange={(e) => setFormData({ ...formData, date_achieved: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuer/Organization
              </label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Google, University of Malaya"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your achievement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate/Proof URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
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
          Add Achievement
        </button>
      )}
    </div>
  )
}

