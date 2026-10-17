import mongoose from 'mongoose'

export const APPLICATION_STATUSES = ['Applied', 'In Review', 'Interview', 'Offer', 'Rejected']

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: APPLICATION_STATUSES, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
)

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, trim: true, maxlength: 120 },
    jobTitle: { type: String, required: true, trim: true, maxlength: 160 },
    jobUrl: { type: String, trim: true, maxlength: 2048 },
    location: { type: String, trim: true, maxlength: 120 },
    workMode: { type: String, trim: true, maxlength: 40 },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'Applied', required: true },
    appliedAt: { type: Date },
    followUpAt: { type: Date },
    notes: { type: String, trim: true, maxlength: 10000 },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true },
)

applicationSchema.index({ userId: 1, updatedAt: -1 })
applicationSchema.index({ userId: 1, status: 1 })

applicationSchema.pre('validate', function setInitialHistory() {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() })
  }
})

export const Application =
  mongoose.models.Application ?? mongoose.model('Application', applicationSchema)
