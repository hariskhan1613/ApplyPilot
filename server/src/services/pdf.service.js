import { ApiError } from '../utils/ApiError.js'

const MAX_TEXT_LENGTH = 50000

export async function extractResumeText(buffer) {
  if (!buffer?.length) throw new ApiError(400, 'Resume file is required', 'RESUME_REQUIRED')
  let parser
  try {
    const { PDFParse } = await import('pdf-parse')
    parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    const text = result.text?.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH)
    if (!text || text.length < 40) {
      throw new ApiError(422, 'This PDF has no usable text. Scanned PDFs are not supported yet.', 'EMPTY_RESUME_TEXT')
    }
    return { text, pageCount: result.total }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(422, 'The PDF could not be read. Please upload a valid text-based PDF.', 'INVALID_PDF')
  } finally {
    await parser?.destroy()
  }
}
