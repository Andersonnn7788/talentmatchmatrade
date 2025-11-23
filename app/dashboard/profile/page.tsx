import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import ResumeUpload from '@/components/ResumeUpload'
import EducationSection from '@/components/EducationSection'
import ExperienceSection from '@/components/ExperienceSection'
import SkillsSection from '@/components/SkillsSection'
import AchievementsSection from '@/components/AchievementsSection'
import type { CandidateProfile, Education, Experience, CandidateSkill, Achievement } from '@/app/types/database.types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch candidate profile
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single<CandidateProfile>()

  // Fetch education
  const { data: education } = await supabase
    .from('education')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('start_date', { ascending: false })
    .returns<Education[]>()

  // Fetch experience
  const { data: experience } = await supabase
    .from('experience')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('start_date', { ascending: false })
    .returns<Experience[]>()

  // Fetch skills
  const { data: skills } = await supabase
    .from('candidate_skills')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('proficiency_level', { ascending: false })
    .returns<CandidateSkill[]>()

  // Fetch achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('candidate_id', profile?.id || '')
    .order('date_achieved', { ascending: false })
    .returns<Achievement[]>()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information, education, experience, and skills
        </p>
      </div>

      <div className="space-y-6">
        {/* Resume Upload */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border-2 border-blue-200">
          <div className="p-6">
            <ResumeUpload candidateId={profile?.id || ''} currentResumeUrl={profile?.resume_url} />
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6">
            <ProfileForm profile={profile} candidateId={profile?.id || ''} />
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Education</h2>
          </div>
          <div className="p-6">
            <EducationSection education={education || []} candidateId={profile?.id || ''} />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
          </div>
          <div className="p-6">
            <ExperienceSection experience={experience || []} candidateId={profile?.id || ''} />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
          </div>
          <div className="p-6">
            <SkillsSection skills={skills || []} candidateId={profile?.id || ''} />
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Achievements & Awards</h2>
          </div>
          <div className="p-6">
            <AchievementsSection achievements={achievements || []} candidateId={profile?.id || ''} />
          </div>
        </div>
      </div>
    </div>
  )
}

