import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const normalizeString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str.length > 0 ? str : null
}

const normalizeDate = (value: unknown): string | null => {
  const str = normalizeString(value)
  if (!str) return null

  // Accept formats: YYYY, YYYY-MM, YYYY-MM-DD
  if (/^\d{4}$/.test(str)) {
    return `${str}-01-01`
  }
  if (/^\d{4}-\d{2}$/.test(str)) {
    return `${str}-01`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }
  return null
}

const normalizeStringArray = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => normalizeString(item))
      .filter((item): item is string => Boolean(item))
    return cleaned.length > 0 ? cleaned : null
  }

  if (typeof value === 'string') {
    const cleaned = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    return cleaned.length > 0 ? cleaned : null
  }

  return null
}

type EducationInsert = {
  candidate_id: string
  institution: string
  degree: string
  field_of_study: string | null
  start_date: string | null
  end_date: string | null
  current: boolean
  grade: string | null
  activities: string | null
}

type ExperienceInsert = {
  candidate_id: string
  company: string
  title: string
  employment_type: string | null
  location: string | null
  start_date: string
  end_date: string | null
  current: boolean
  description: string | null
  skills_used: string[] | null
}

type AchievementInsert = {
  candidate_id: string
  title: string
  description: string | null
  date_achieved: string | null
  category: string | null
  issuer: string | null
  url: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { candidateId, resumeUrl } = await request.json()

    if (!candidateId || !resumeUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if API key exists
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      console.error('GOOGLE_GEMINI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GOOGLE_GEMINI_API_KEY to .env.local' },
        { status: 500 }
      )
    }

    // Initialize Gemini with 2.0 Flash (latest model)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Fetch PDF content
    const pdfResponse = await fetch(resumeUrl)
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    // Parse resume with Gemini
    const prompt = `You are a resume parser. Extract structured information from this resume and return it in JSON format.

Extract the following sections:
1. education: Array of {institution, degree, field_of_study, start_date (YYYY-MM format or YYYY), end_date (YYYY-MM format or YYYY), current (boolean), grade, activities}
2. experience: Array of {company, title, employment_type (full-time/part-time/internship/contract), location, start_date (YYYY-MM format), end_date (YYYY-MM format), current (boolean), description, skills_used (array of strings)}
3. skills: Array of {skill_name, skill_category (technical/soft/language/tool/other), proficiency_level (beginner/intermediate/advanced/expert), years_of_experience (number)}
4. achievements: Array of {title, description, date_achieved (YYYY-MM format), category (academic/professional/hackathon/certification/award/volunteer), issuer, url}

Rules:
- For dates, use YYYY-MM format if month is available, otherwise YYYY
- If currently studying/working, set current=true and end_date=null
- Extract all skills mentioned, categorize them appropriately
- Include certifications, awards, and notable achievements in achievements array
- Be thorough and extract all relevant information
- If a field is not found, omit it or use null

Return ONLY valid JSON with no additional text. Format:
{
  "education": [...],
  "experience": [...],
  "skills": [...],
  "achievements": [...]
}`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      { text: prompt },
    ])

    const responseText = result.response.text()
    
    // Clean the response to extract JSON
    let jsonText = responseText
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const parsedData = JSON.parse(jsonText)

    // Insert data into Supabase
    const supabase = await createClient()
    const summary = {
      education: 0,
      experience: 0,
      skills: 0,
      achievements: 0,
    }

    // Insert education
    if (parsedData.education && parsedData.education.length > 0) {
      const educationData = parsedData.education
        .map((edu: any): EducationInsert | null => {
          const institution = normalizeString(edu.institution)
          const degree = normalizeString(edu.degree)

          if (!institution || !degree) return null

          return {
            candidate_id: candidateId,
            institution,
            degree,
            field_of_study: normalizeString(edu.field_of_study),
            start_date: normalizeDate(edu.start_date),
            end_date: edu.current ? null : normalizeDate(edu.end_date),
            current: Boolean(edu.current),
            grade: normalizeString(edu.grade),
            activities: normalizeString(edu.activities),
          }
        })
        .filter((item: EducationInsert | null): item is EducationInsert => item !== null)

      if (educationData.length > 0) {
        const { data, error } = await supabase.from('education').insert(educationData).select()
        if (error) {
          console.error('Failed to insert education data:', error)
        } else if (data) {
          summary.education = data.length
        }
      }
    }

    // Insert experience
    if (parsedData.experience && parsedData.experience.length > 0) {
      const experienceData = parsedData.experience
        .map((exp: any): ExperienceInsert | null => {
          const company = normalizeString(exp.company)
          const title = normalizeString(exp.title)
          const startDate = normalizeDate(exp.start_date)

          // Required fields per schema
          if (!company || !title || !startDate) return null

          return {
            candidate_id: candidateId,
            company,
            title,
            employment_type: normalizeString(exp.employment_type),
            location: normalizeString(exp.location),
            start_date: startDate,
            end_date: exp.current ? null : normalizeDate(exp.end_date),
            current: Boolean(exp.current),
            description: normalizeString(exp.description),
            skills_used: normalizeStringArray(exp.skills_used),
          }
        })
        .filter((item: ExperienceInsert | null): item is ExperienceInsert => item !== null)

      if (experienceData.length > 0) {
        const { data, error } = await supabase.from('experience').insert(experienceData).select()
        if (error) {
          console.error('Failed to insert experience data:', error)
        } else if (data) {
          summary.experience = data.length
        }
      }
    }

    // Insert skills (with duplicate handling)
    if (parsedData.skills && parsedData.skills.length > 0) {
      for (const skill of parsedData.skills) {
        const skillName = normalizeString(skill.skill_name)
        if (!skillName) continue

        const { error } = await supabase.from('candidate_skills').insert({
          candidate_id: candidateId,
          skill_name: skillName,
          skill_category: normalizeString(skill.skill_category),
          proficiency_level: normalizeString(skill.proficiency_level),
          years_of_experience:
            typeof skill.years_of_experience === 'number'
              ? skill.years_of_experience
              : skill.years_of_experience
              ? Number(skill.years_of_experience)
              : null,
        })

        if (!error) summary.skills++
      }
    }

    // Insert achievements
    if (parsedData.achievements && parsedData.achievements.length > 0) {
      const achievementsData = parsedData.achievements
        .map((ach: any): AchievementInsert | null => {
          const title = normalizeString(ach.title)
          if (!title) return null

          return {
            candidate_id: candidateId,
            title,
            description: normalizeString(ach.description),
            date_achieved: normalizeDate(ach.date_achieved),
            category: normalizeString(ach.category),
            issuer: normalizeString(ach.issuer),
            url: normalizeString(ach.url),
          }
        })
        .filter((item: AchievementInsert | null): item is AchievementInsert => item !== null)

      if (achievementsData.length > 0) {
        const { data, error } = await supabase.from('achievements').insert(achievementsData).select()
        if (error) {
          console.error('Failed to insert achievements data:', error)
        } else if (data) {
          summary.achievements = data.length
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary,
      message: 'Resume parsed and profile updated successfully',
    })
  } catch (error) {
    console.error('Resume parsing error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to parse resume',
      },
      { status: 500 }
    )
  }
}

