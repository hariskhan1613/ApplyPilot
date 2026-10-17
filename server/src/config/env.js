import 'dotenv/config'

const requiredInProduction = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN']

export function getEnv() {
  const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 5000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    llmApiKey: process.env.LLM_API_KEY,
    llmModel: process.env.LLM_MODEL,
    llmApiUrl: process.env.LLM_API_URL ?? 'https://api.openai.com/v1/chat/completions',
  }
  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) throw new Error('PORT must be a valid TCP port')
  if (env.nodeEnv === 'production') {
    const missing = requiredInProduction.filter((name) => !process.env[name])
    if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  return env
}
