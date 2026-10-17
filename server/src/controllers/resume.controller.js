import { ResumeAnalysis } from '../models/ResumeAnalysis.js'
import { analyzeResume } from '../services/ai.service.js'
import { extractResumeText } from '../services/pdf.service.js'

export async function analyze(req, res) {
  const { text, pageCount } = await extractResumeText(req.file?.buffer)
  const result = await analyzeResume({ resumeText: text, jobDescription: req.body.jobDescription })
  const saved = await ResumeAnalysis.create({
    userId: req.userId,
    result,
    sourceMetadata: { fileName: req.file.originalname, pageCount, createdAt: new Date() },
  })
  res.status(201).json({ analysis: saved })
}
