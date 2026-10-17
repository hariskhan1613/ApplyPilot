import mongoose from 'mongoose'

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required before starting the API')
  }

  await mongoose.connect(uri)
  return mongoose.connection
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
