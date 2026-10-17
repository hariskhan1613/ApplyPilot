import app from './app.js'
import { getEnv } from './config/env.js'
import { connectDatabase } from './config/database.js'

const { port, mongoUri } = getEnv()

try {
  await connectDatabase(mongoUri)
  app.listen(port, () => {
    console.log(`ApplyPilot API listening on port ${port}`)
  })
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
