'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewInterviewPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastPlayedIndex, setLastPlayedIndex] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [allowRecording, setAllowRecording] = useState(false)
  const recognitionRef = useRef<any>(null)
  const transcriptBufferRef = useRef('')
  const currentAnswerRef = useRef('')
  const ignoreResultsRef = useRef(false)
  const wasRecordingBeforeTTSRef = useRef(false)
  const shouldAutoRestartRef = useRef(true)
  const interviewActiveRef = useRef(false)
  const [remainingSeconds, setRemainingSeconds] = useState(60)
  const finalizingRef = useRef(false)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const startInterview = async (type: string) => {
    setIsLoading(true)
    setSelectedType(type)

    try {
      const response = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewType: type }),
      })

      const data = await response.json()

      if (data.success) {
        setInterviewId(data.interviewId)
        const safeQuestions =
          Array.isArray(data.questions) && data.questions.length > 0
            ? data.questions
            : ['Question 1', 'Question 2', 'Question 3']
        setQuestions(safeQuestions)
        setIsInterviewActive(true)
        setStartTime(Date.now())
        setLastPlayedIndex(null)
        setRemainingSeconds(60)
        setCurrentAnswer('')
        setIsRecording(false)
        transcriptBufferRef.current = ''
        currentAnswerRef.current = ''
        setAllowRecording(false)
        shouldAutoRestartRef.current = false
        finalizingRef.current = false
      } else {
        alert('Failed to start interview: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to start interview:', error)
      alert('Failed to start interview. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    console.log('submitAnswer called')
    if (!interviewId) {
      console.error('No interviewId, returning')
      return
    }
    
    // On the last question, allow completion even with empty answer
    const isLastQuestion = currentQuestionIndex >= questions.length - 1
    console.log('Is last question:', isLastQuestion, 'Current answer:', currentAnswer)
    
    if (!currentAnswer.trim() && !isLastQuestion) {
      console.log('No answer and not last question, returning')
      return
    }

    // Stop recording immediately to prevent interference
    shouldAutoRestartRef.current = false
    if (isRecording) {
      console.log('Stopping recording...')
      recognitionRef.current?.stop()
      setIsRecording(false)
    }

    try {
      // Only save answer if there is one
      if (currentAnswer.trim()) {
        console.log('Saving answer to API...')
        await fetch('/api/ai-interview', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewId,
            questionIndex: currentQuestionIndex,
            question: questions[currentQuestionIndex] || '',
            candidateResponse: currentAnswer,
          }),
        })
        console.log('Answer saved successfully')
      }

      const newAnswers = [...answers, currentAnswer]
      setAnswers(newAnswers)
      setCurrentAnswer('')
      transcriptBufferRef.current = ''
      currentAnswerRef.current = ''
      setAllowRecording(false)

      if (currentQuestionIndex < questions.length - 1) {
        console.log('Moving to next question')
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // Interview complete
        console.log('Interview complete, calling finalizeInterview')
        await finalizeInterview()
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('Failed to submit answer. Please try again.')
    }
  }

  const finalizeInterview = async () => {
    if (finalizingRef.current) return
    finalizingRef.current = true
    if (!interviewId || !startTime) {
      console.error('Cannot finalize: missing interviewId or startTime')
      finalizingRef.current = false
      return
    }

    console.log('Starting finalization process...')
    
    // Stop recording and clear all speech recognition
    shouldAutoRestartRef.current = false
    ignoreResultsRef.current = true
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore if already stopped
      }
    }
    setIsRecording(false)
    
    setIsLoading(true)
    setIsInterviewActive(false)
    setShowCompletionScreen(true)
    setIsEvaluating(true)

    try {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000)

      console.log('Finalizing interview with duration:', durationSeconds)
      
      // Finalize interview
      const response = await fetch('/api/ai-interview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          durationSeconds,
        }),
      })

      const data = await response.json()
      console.log('Finalize response:', data)

      if (data.success) {
        console.log('Starting virtual panel evaluation...')
        // Trigger virtual panel evaluation
        const panelResponse = await fetch('/api/virtual-panel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewId }),
        })

        const panelData = await panelResponse.json()
        console.log('Panel evaluation response:', panelData)

        setIsEvaluating(false)
      } else {
        console.error('Finalization failed:', data.error)
        setIsEvaluating(false)
        alert('Interview saved but evaluation may have failed.')
      }
    } catch (error) {
      console.error('Failed to finalize interview:', error)
      setIsEvaluating(false)
      alert('Interview saved but evaluation may have failed.')
    } finally {
      setIsLoading(false)
      finalizingRef.current = false
      console.log('Finalization complete. Completion screen should be visible.')
    }
  }

  const speakQuestion = async () => {
    if (!questions[currentQuestionIndex]) return
    setIsSpeaking(true)
    setAllowRecording(false)
    ignoreResultsRef.current = true
    wasRecordingBeforeTTSRef.current = isRecording
    if (isRecording) {
      shouldAutoRestartRef.current = false
      stopRecording()
    }

    let url = ''
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questions[currentQuestionIndex] }),
      })

      const data = await response.json()
      if (!data?.audio) {
        throw new Error('No audio returned')
      }

      const audioBuffer = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      await audio.play()
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve()
        audio.onerror = () => reject(new Error('Audio playback error'))
      })
    } catch (error) {
      console.error('Failed to play TTS:', error)
      alert('Could not play the question audio. Please try again.')
    } finally {
      if (url) {
        URL.revokeObjectURL(url)
      }
      setIsSpeaking(false)
      ignoreResultsRef.current = false
      setAllowRecording(true)
      shouldAutoRestartRef.current = true
      if (wasRecordingBeforeTTSRef.current) {
        startRecording()
      }
      wasRecordingBeforeTTSRef.current = false
    }
  }

  // Auto-play question when it changes
  useEffect(() => {
    if (!isInterviewActive) return
    if (lastPlayedIndex === currentQuestionIndex) return
    if (!questions[currentQuestionIndex]) return

    speakQuestion()
    setLastPlayedIndex(currentQuestionIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isInterviewActive, questions])

  // Countdown timer to keep interview under 1 minute total
  useEffect(() => {
    if (!isInterviewActive || !startTime) return

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, 60 - elapsed)
      setRemainingSeconds(remaining)
      if (remaining <= 0 && !finalizingRef.current) {
        finalizingRef.current = true
        finalizeInterview()
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterviewActive, startTime])

  // Setup speech-to-text (browser-only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    setSpeechSupported(true)
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      if (ignoreResultsRef.current) return
      let finalTranscript = transcriptBufferRef.current
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript.trim()
        if (!text) continue
        if (result.isFinal) {
          finalTranscript = `${finalTranscript} ${text}`.replace(/\s+/g, ' ').trim()
        } else {
          interimTranscript = `${interimTranscript} ${text}`.replace(/\s+/g, ' ').trim()
        }
      }

      const combinedTranscript = `${finalTranscript} ${interimTranscript}`.replace(/\s+/g, ' ').trim()
      if (!combinedTranscript) return

      transcriptBufferRef.current = finalTranscript
      currentAnswerRef.current = combinedTranscript
      setCurrentAnswer(combinedTranscript)
    }

    recognition.onend = () => {
      setIsRecording(false)
      transcriptBufferRef.current = currentAnswerRef.current
      if (
        shouldAutoRestartRef.current &&
        interviewActiveRef.current &&
        !ignoreResultsRef.current
      ) {
        try {
          ignoreResultsRef.current = false
          recognition.start()
          setIsRecording(true)
        } catch (err) {
          console.error('Failed to restart speech recognition', err)
          setIsRecording(false)
        }
      }
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
  }, [])

  useEffect(() => {
    interviewActiveRef.current = isInterviewActive
    if (!isInterviewActive) {
      shouldAutoRestartRef.current = false
      recognitionRef.current?.stop?.()
    }
  }, [isInterviewActive])

  const startRecording = () => {
    if (isInterviewActive && !allowRecording) return
    if (!speechSupported || !recognitionRef.current) {
      alert('Voice input is required. Please switch to a browser that supports speech recognition (e.g., Chrome).')
      return
    }
    if (isRecording) return
    try {
      shouldAutoRestartRef.current = true
      ignoreResultsRef.current = false
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start speech recognition', err)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return
    shouldAutoRestartRef.current = false
    recognitionRef.current.stop()
  }

  // Auto-start recording on each question if supported
  useEffect(() => {
    if (
      !isInterviewActive ||
      !speechSupported ||
      !questions[currentQuestionIndex] ||
      isSpeaking ||
      !allowRecording
    )
      return
    if (isRecording) return
    startRecording()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isInterviewActive, speechSupported, isSpeaking, allowRecording])

  // Completion screen after interview finishes
  if (showCompletionScreen) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
            <p className="text-gray-600">
              Great job! You've successfully completed all 3 questions.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <span className="text-3xl mr-4">🤖</span>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Virtual Hiring Panel Evaluation</h3>
                {isEvaluating ? (
                  <div className="space-y-2">
                    <p className="text-blue-800">
                      Our AI panel is currently evaluating your interview responses...
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-700">
                        HR Specialist, Tech Lead, and Career Coach are reviewing
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Evaluation Complete!</span>
                    </div>
                    <p className="text-blue-800">
                      Your interview has been evaluated by our virtual hiring panel from HR, Tech Lead, and Career Coach perspectives.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard/ai-panel')}
              disabled={isEvaluating}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>View Results & Analysis</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={() => router.push('/dashboard/interviews')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              View All Interviews
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">What's Next?</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Review your scores from HR Specialist, Tech Lead, and Career Coach
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Get detailed feedback on your strengths and areas for improvement
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Be prepared for the AI interview since this is the preliminary interview for your job application
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (isInterviewActive && questions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : ''} Interview
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-semibold text-blue-700">
                  Time left: {remainingSeconds}s
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-3xl mr-4">🤖</span>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-blue-900">AI Interviewer:</h3>
                  <button
                    onClick={speakQuestion}
                    disabled={isSpeaking}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpeaking ? 'Playing...' : 'Play question'}
                  </button>
                </div>
                <p className="text-blue-800 text-lg">{questions[currentQuestionIndex]}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer (voice input only):
            </label>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={(isInterviewActive && !allowRecording) || isSpeaking}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecording ? 'Stop voice input' : 'Start voice input'}
              </button>
              {!speechSupported && (
                <span className="text-xs text-gray-500">Voice input not supported in this browser</span>
              )}
            </div>
            <textarea
              value={currentAnswer}
              readOnly
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              placeholder="Voice transcription will appear here... (15-20 seconds recommended)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={submitAnswer}
              disabled={(currentQuestionIndex < questions.length - 1 && !currentAnswer.trim()) || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question ->' : 'Complete Interview'}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Voice-only interview: microphone required. Question audio powered by ElevenLabs. Virtual panel evaluation runs automatically after completion.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/dashboard/interviews"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Interviews
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Preliminary AI Interview</h1>
          <p className="text-gray-600">
            Choose your interview type - 3 questions, 1 minute maximum
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <InterviewTypeCard
            title="Technical Interview"
            description="Answer coding problems, system design, and technical concepts"
            icon="💻"
            type="technical"
            onStart={startInterview}
            disabled={isLoading}
          />
          <InterviewTypeCard
            title="Behavioral Interview"
            description="Work on communication skills, past experiences, and soft skills"
            icon="💬"
            type="behavioral"
            onStart={startInterview}
            disabled={isLoading}
          />
          <InterviewTypeCard
            title="General Interview"
            description="Mixed interview covering various topics and general questions"
            icon="🎯"
            type="general"
            onStart={startInterview}
            disabled={isLoading}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">What to Expect:</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              3 questions tailored to your profile and experience
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Maximum 1 minute total duration (15-20 seconds per question)
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Virtual Hiring Panel evaluates your responses automatically
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Get detailed feedback from HR, Tech Lead, and Career Coach perspectives
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function InterviewTypeCard({
  title,
  description,
  icon,
  type,
  onStart,
  disabled,
}: {
  title: string
  description: string
  icon: string
  type: string
  onStart: (type: string) => void
  disabled: boolean
}) {
  return (
    <button
      onClick={() => onStart(type)}
      disabled={disabled}
      className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start">
        <span className="text-4xl mr-4">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </button>
  )
}
