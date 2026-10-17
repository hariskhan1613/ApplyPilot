import mongoose from 'mongoose'

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    sourceMetadata: {
      fileName: { type: String, trim: true, maxlength: 255 },
      pageCount: { type: Number, min: 1 },
      createdAt: { type: Date },
    },
  },
  { timestamps: true },
)

export const ResumeAnalysis =
  mongoose.models.ResumeAnalysis ?? mongoose.model('ResumeAnalysis', resumeAnalysisSchema)
