'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CandidateSkill } from '@/app/types/database.types'

export default function SkillsSection({
  skills,
  candidateId,
}: {
  skills: CandidateSkill[]
  candidateId: string
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    skill_name: '',
    skill_category: '',
    proficiency_level: '',
    years_of_experience: '',
  })

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800'
      case 'advanced':
        return 'bg-blue-100 text-blue-800'
      case 'intermediate':
        return 'bg-green-100 text-green-800'
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const resetForm = () => {
    setFormData({
      skill_name: '',
      skill_category: '',
      proficiency_level: '',
      years_of_experience: '',
    })
    setIsAdding(false)
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (skill: CandidateSkill) => {
    setFormData({
      skill_name: skill.skill_name,
      skill_category: skill.skill_category || '',
      proficiency_level: skill.proficiency_level || '',
      years_of_experience: skill.years_of_experience?.toString() || '',
    })
    setEditingId(skill.id)
    setIsAdding(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = {
        skill_name: formData.skill_name,
        skill_category: formData.skill_category || null,
        proficiency_level: formData.proficiency_level || null,
        years_of_experience: formData.years_of_experience
          ? parseFloat(formData.years_of_experience)
          : null,
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from('candidate_skills')
          .update(data)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('candidate_skills')
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
    if (!confirm('Are you sure you want to delete this skill?')) return

    try {
      const { error } = await supabase.from('candidate_skills').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (err) {
      alert('Failed to delete skill')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {skills.length === 0 && !isAdding && <p className="text-gray-600">No skills added yet.</p>}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className={`px-4 py-2 rounded-lg ${getProficiencyColor(skill.proficiency_level || '')} relative group`}
            >
              <div className="font-medium">{skill.skill_name}</div>
              <div className="text-xs mt-1">
                {skill.proficiency_level}
                {skill.years_of_experience && ` • ${skill.years_of_experience} yrs`}
              </div>
              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                <button
                  onClick={() => handleEdit(skill)}
                  className="px-2 py-1 bg-white rounded text-xs text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="px-2 py-1 bg-white rounded text-xs text-red-600 hover:bg-red-50"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <form onSubmit={handleSubmit} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Skill' : 'Add Skill'}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.skill_name}
                  onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., JavaScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.skill_category}
                  onChange={(e) => setFormData({ ...formData, skill_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="technical">Technical</option>
                  <option value="soft">Soft Skill</option>
                  <option value="language">Language</option>
                  <option value="tool">Tool/Software</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency Level
                </label>
                <select
                  value={formData.proficiency_level}
                  onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) =>
                    setFormData({ ...formData, years_of_experience: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
          Add Skill
        </button>
      )}
    </div>
  )
}
