import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['Technical', 'HR', 'Behavioral'], required: true },
    question: { type: String, required: true, trim: true, maxlength: 1000 },
    notes: { type: String, trim: true, maxlength: 5000, default: '' },
    practiced: { type: Boolean, default: false },
  },
  { _id: true },
)

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, enum: ['Technical', 'HR', 'Behavioral'], required: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (questions) => questions.length > 0 && questions.length <= 10,
        message: 'Questions must contain between 1 and 10 items',
      },
    },
  },
  { timestamps: true },
)

interviewSessionSchema.index({ userId: 1, updatedAt: -1 })

export const InterviewSession =
  mongoose.models.InterviewSession ?? mongoose.model('InterviewSession', interviewSessionSchema)
