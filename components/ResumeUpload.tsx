'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ResumeUploadProps {
  candidateId: string
  currentResumeUrl?: string
}

export default function ResumeUpload({ candidateId, currentResumeUrl }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError(null)
    setSuccess(null)
    setUploading(true)

    try {
      // 1. Upload to Supabase Storage
      const fileExt = 'pdf'
      const fileName = `${candidateId}-${Date.now()}.${fileExt}`
      const filePath = `resumes/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 2. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath)

      // 3. Update profile with resume URL
      const { error: updateError } = await supabase
        .from('candidate_profiles')
        .update({ resume_url: publicUrl })
        .eq('id', candidateId)

      if (updateError) throw updateError

      setUploading(false)
      setParsing(true)
      setSuccess('Resume uploaded! Parsing content...')

      // 4. Parse resume and populate fields
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, resumeUrl: publicUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse resume')
      }

      const result = await response.json()

      setParsing(false)
      setSuccess(
        `Resume parsed successfully! Added ${result.summary.education || 0} education entries, ${result.summary.experience || 0} experiences, ${result.summary.skills || 0} skills, and ${result.summary.achievements || 0} achievements.`
      )

      // Reload page after 2 seconds to show new data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setUploading(false)
      setParsing(false)
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resume Upload</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload your resume (PDF) and we&apos;ll automatically populate your profile
          </p>
        </div>
        {currentResumeUrl && (
          <a
            href={currentResumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View Current Resume →
          </a>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          disabled={uploading || parsing}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Uploading resume...</p>
          </div>
        ) : parsing ? (
          <div className="space-y-3">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Parsing resume with AI...</p>
            <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
          </div>
        ) : (
          <>
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Choose PDF File
            </button>
            <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
            <p className="text-xs text-gray-400 mt-2">PDF up to 5MB</p>
          </>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          AI-Powered Parsing
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Automatically extracts education, experience, and skills</li>
          <li>• Identifies achievements and certifications</li>
          <li>• Populates all profile sections instantly</li>
          <li>• You can review and edit all extracted information</li>
        </ul>
      </div>
    </div>
  )
}




