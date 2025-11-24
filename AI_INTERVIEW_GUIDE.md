# AI Interview & Virtual Panel Implementation Guide

## Overview

The AI Interview system has been implemented with the following configuration:
- **3 questions** per interview
- **1 minute maximum duration** (15-20 seconds per question)
- **Automatic Virtual Hiring Panel evaluation** after interview completion

## Architecture

### 1. Interview Agent (`lib/agents/interviewAgent.ts`)

**LangGraph Workflow:**
```
START → loadContext → generateQuestions → saveInterview → END
```

**Nodes:**
- `loadContext`: Builds RAG context from candidate profile, education, experience, skills, achievements, and badges
- `generateQuestions`: Uses Gemini Flash to generate 3 tailored questions based on interview type and candidate context
- `saveInterview`: Creates interview record in database

**Functions:**
- `runInterviewAgent()`: Starts new interview and generates questions
- `processInterviewResponse()`: Saves question-answer pairs to transcript
- `finalizeInterview()`: Generates AI summary and key insights

### 2. Virtual Panel Agent (`lib/agents/panelAgent.ts`)

**LangGraph Workflow:**
```
START → loadContext → evaluateParallel → aggregateResults → saveReview → END
```

**Parallel Agent Evaluation:**
- **HR Specialist**: Evaluates cultural fit, soft skills, communication, professionalism
- **Tech Lead**: Evaluates technical skills, problem-solving, technology expertise
- **Career Coach**: Evaluates career growth, learning mindset, leadership potential

**Each agent provides:**
- Score (0-100)
- Verdict: "Strong fit", "Reach role", or "Not recommended"
- Justification (1 sentence)
- Pros (3-4 items)
- Cons (1-2 items)

**Overall Score:**
- Average of all three agent scores
- Overall verdict based on score thresholds:
  - ≥75: "Strong fit"
  - ≥60: "Reach role"
  - <60: "Not recommended"

### 3. API Routes

#### `/api/ai-interview` (`app/api/ai-interview/route.ts`)

**POST** - Start new interview
```json
Request:
{
  "interviewType": "technical" | "behavioral" | "general"
}

Response:
{
  "success": true,
  "interviewId": "uuid",
  "questions": ["question1", "question2", "question3"]
}
```

**PUT** - Submit answer to question
```json
Request:
{
  "interviewId": "uuid",
  "questionIndex": 0,
  "question": "question text",
  "candidateResponse": "answer text"
}

Response:
{
  "success": true
}
```

**PATCH** - Finalize interview
```json
Request:
{
  "interviewId": "uuid",
  "durationSeconds": 60
}

Response:
{
  "success": true,
  "insights": {
    "summary": "...",
    "strengths": ["..."],
    "recommendation": "..."
  }
}
```

#### `/api/virtual-panel` (`app/api/virtual-panel/route.ts`)

**POST** - Run panel evaluation
```json
Request:
{
  "interviewId": "uuid" (optional)
}

Response:
{
  "success": true,
  "reviewId": "uuid",
  "overallScore": 85,
  "overallVerdict": "Strong fit"
}
```

**GET** - Get panel reviews
```json
Response:
{
  "reviews": [...]
}
```

### 4. User Interface

#### `/dashboard/interviews/new` (Updated)

**Features:**
- Three interview type cards: Technical, Behavioral, General
- Live interview interface with progress bar
- Text input for answers (voice input placeholder for ElevenLabs integration)
- Auto-submit to next question
- Automatic finalization and panel trigger on completion
- Redirect to interviews page after completion

**Flow:**
1. User selects interview type
2. System generates 3 questions using RAG context
3. User answers each question (text input)
4. After 3 questions, interview is finalized
5. Virtual Panel runs automatically
6. User redirected to view results

## Database Schema

All necessary tables already exist:

### `ai_interviews`
- Stores interview transcript, duration, AI summary, key insights
- Related to candidate_profiles

### `panel_reviews`
- Stores individual agent evaluations (HR, Tech, Coach)
- Stores overall score and verdict
- Related to candidate_profiles and ai_interviews

## Testing Instructions

1. **Start the development server:**
```bash
npm run dev
```

2. **Navigate to the interview page:**
```
http://localhost:3000/dashboard/interviews/new
```

3. **Test interview flow:**
   - Click on any interview type (Technical, Behavioral, or General)
   - Wait for questions to be generated (5-10 seconds)
   - Answer each of the 3 questions in the text area
   - Click "Next Question" or "Complete Interview"
   - System will redirect to interviews page

4. **View results:**
   - Go to `/dashboard/interviews` to see interview summary
   - Go to `/dashboard/ai-panel` to see Virtual Panel evaluation

## Budget Optimization

The system is designed for the $20 hackathon budget:

**Interview Agent:**
- 1 API call to generate 3 questions (~1,000 tokens)
- 1 API call to generate summary (~500 tokens)
- **Total per interview: ~1,500 tokens**

**Panel Agent:**
- 3 parallel API calls (HR, Tech, Coach) (~2,000 tokens each)
- **Total per evaluation: ~6,000 tokens**

**Total per complete interview + panel: ~7,500 tokens**

With Gemini Flash 2.5 pricing:
- ~$0.001 per 1K tokens
- **Cost per interview: ~$0.0075**
- **Budget allows: ~2,600 interviews**

## RAG Context

The system builds a comprehensive context for each candidate:

**Profile Data:**
- Name, summary, location, job preferences

**Education:**
- Degrees, institutions, dates, GPA

**Experience:**
- Job titles, companies, descriptions, dates

**Skills:**
- Skill names, proficiency levels, years of experience

**Achievements:**
- Certifications, awards, accomplishments

**Badges:**
- Digital badges from hackathons/challenges

**Interview Transcript:**
- Full Q&A history for panel evaluation

## Future Enhancements

1. **Voice Integration:**
   - ElevenLabs TTS for question playback
   - Google STT for voice answers
   - Real-time transcription

2. **Advanced Features:**
   - Interview recording and playback
   - Real-time feedback during interview
   - Practice mode vs. evaluated mode
   - Custom question pools
   - Industry-specific question banks

3. **Analytics:**
   - Interview performance trends
   - Improvement tracking
   - Comparison with other candidates
   - Skill gap identification

## Troubleshooting

### Interview doesn't start
- Check that `GOOGLE_GEMINI_API_KEY` is set in `.env.local`
- Ensure candidate profile exists
- Check browser console for errors

### Panel evaluation fails
- Verify interview completed successfully
- Check Supabase connection
- Review API logs for errors

### Questions not tailored
- Ensure profile is filled out completely
- Add more skills and experience
- Complete education and achievements sections

## Configuration

To modify the interview configuration:

**Change number of questions:**
- Edit `MAX_QUESTIONS` in `lib/agents/interviewAgent.ts`

**Change duration limit:**
- Edit `MAX_DURATION_SECONDS` in `lib/agents/interviewAgent.ts`
- Update UI messaging in `app/dashboard/interviews/new/page.tsx`

**Adjust agent prompts:**
- Modify prompts in `lib/agents/panelAgent.ts` for different evaluation criteria

**Change score thresholds:**
- Update aggregation logic in `createAggregateNode()` in `lib/agents/panelAgent.ts`

## Support

For issues or questions, refer to:
- `overall_concept.md` - System architecture
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- Supabase dashboard - Database and logs


