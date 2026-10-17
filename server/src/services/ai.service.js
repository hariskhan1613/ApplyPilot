import { getEnv } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const MAX_JD_LENGTH = 30000
const INTERVIEW_CATEGORIES = ['Technical', 'HR', 'Behavioral']

function parseProviderResult(payload) {
  try {
    return JSON.parse(payload.choices?.[0]?.message?.content ?? '')
  } catch {
    throw new ApiError(502, 'The AI provider returned malformed output', 'AI_INVALID_RESPONSE')
  }
}

async function callProvider(messages, temperature = 0) {
  const { llmApiKey, llmModel, llmApiUrl } = getEnv()
  if (!llmApiKey || !llmModel) throw new ApiError(503, 'AI features are not configured yet', 'AI_NOT_CONFIGURED')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)
  try {
    const isGemini = new URL(llmApiUrl).hostname === 'generativelanguage.googleapis.com'
    let requestUrl = llmApiUrl
    let requestBody
    let headers = { 'Content-Type': 'application/json' }

    if (isGemini) {
      requestUrl = `${llmApiUrl.replace(/\/$/, '')}/${encodeURIComponent(llmModel)}:generateContent?key=${encodeURIComponent(llmApiKey)}`
      requestBody = {
        contents: messages.filter((message) => message.role !== 'system').map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
        systemInstruction: {
          parts: [{ text: messages.find((message) => message.role === 'system')?.content ?? '' }],
        },
        generationConfig: { temperature, responseMimeType: 'application/json' },
      }
    } else {
      headers = { ...headers, Authorization: `Bearer ${llmApiKey}` }
      requestBody = { model: llmModel, temperature, response_format: { type: 'json_object' }, messages }
    }

    const response = await fetch(requestUrl, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) throw new ApiError(502, 'The AI provider rejected the request. Check the model and API configuration.', 'AI_PROVIDER_ERROR')
    const payload = await response.json()
    if (isGemini) {
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new ApiError(502, 'The AI provider returned no content.', 'AI_INVALID_RESPONSE')
      try { return JSON.parse(text) } catch { throw new ApiError(502, 'The AI provider returned malformed JSON.', 'AI_INVALID_RESPONSE') }
    }
    return parseProviderResult(payload)
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') throw new ApiError(504, 'AI generation timed out. Please retry.', 'AI_TIMEOUT')
    throw new ApiError(502, 'The AI provider is unavailable. Please retry later.', 'AI_PROVIDER_ERROR')
  } finally {
    clearTimeout(timeout)
  }
}

function validateResumeResult(result) {
  const validItems = (items, keys) => items.every((item) => item && keys.every((key) => typeof item[key] === 'string'))
  if (!result || typeof result.summary !== 'string' || !Array.isArray(result.matchedSkills) ||
      !Array.isArray(result.notFoundOrUnclear) || !Array.isArray(result.suggestions) ||
      typeof result.disclaimer !== 'string' ||
      !validItems(result.matchedSkills, ['skill', 'evidence']) ||
      !validItems(result.notFoundOrUnclear, ['requirement', 'explanation']) ||
      !validItems(result.suggestions, ['suggestion', 'rationale']) ||
      result.matchedSkills.length > 20 || result.notFoundOrUnclear.length > 20 || result.suggestions.length > 20) {
    throw new ApiError(502, 'The AI provider returned an invalid analysis', 'AI_INVALID_RESPONSE')
  }
  return result
}

export async function analyzeResume({ resumeText, jobDescription }) {
  if (typeof jobDescription !== 'string' || jobDescription.trim().length < 20 || jobDescription.length > MAX_JD_LENGTH) {
    throw new ApiError(400, 'Job description must be between 20 and 30,000 characters', 'INVALID_JOB_DESCRIPTION')
  }
  const result = await callProvider([
    { role: 'system', content: 'Compare only explicit resume evidence with the job description. Never invent facts or metrics. Return JSON with summary, matchedSkills [{skill,evidence}], notFoundOrUnclear [{requirement,explanation}], suggestions [{suggestion,rationale}], and disclaimer. Not found in the resume does not mean the candidate lacks the skill.' },
    { role: 'user', content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription.trim()}` },
  ])
  return validateResumeResult(result)
}

function validateQuestions(result, category) {
  const questions = Array.isArray(result) ? result : result?.questions
  if (!Array.isArray(questions) || questions.length < 3 || questions.length > 10 ||
      questions.some((item) => !item || typeof item.question !== 'string' || item.question.trim().length < 5)) {
    throw new ApiError(502, 'The AI provider returned invalid interview questions', 'AI_INVALID_RESPONSE')
  }
  return { questions: questions.map((item) => ({ category, question: item.question.trim() })) }
}

export async function generateInterviewQuestions({ role, category }) {
  if (typeof role !== 'string' || role.trim().length < 2 || role.trim().length > 160) {
    throw new ApiError(400, 'Role must be between 2 and 160 characters', 'INVALID_ROLE')
  }
  if (!INTERVIEW_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Category must be one of: ${INTERVIEW_CATEGORIES.join(', ')}`, 'INVALID_CATEGORY')
  }
  const result = await callProvider([
    { role: 'system', content: 'Generate interview practice material only. Do not claim these are guaranteed interview questions. Return JSON with questions: an array of 3 to 10 objects, each containing question. Keep questions relevant to the requested role and category.' },
    { role: 'user', content: `Role: ${role.trim()}\nCategory: ${category}` },
  ], 0.2)
  return validateQuestions(result, category)
}
