import multer from 'multer'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter(req, file, callback) {
    if (file.mimetype !== 'application/pdf' || !file.originalname.toLowerCase().endsWith('.pdf')) {
      return callback(new Error('Only PDF resume files are accepted'))
    }
    callback(null, true)
  },
})

export function uploadResume(req, res, next) {
  upload.single('resume')(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Resume must be 5 MB or smaller', code: 'FILE_TOO_LARGE' })
      return res.status(400).json({ message: error.message, code: 'INVALID_FILE' })
    }
    next()
  })
}
