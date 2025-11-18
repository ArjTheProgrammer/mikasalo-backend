import dotenv from 'dotenv'

dotenv.config()

const validateEnvVar = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const PORT = Number(process.env.PORT) || 3001

const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? validateEnvVar('TEST_MONGODB_URI')
  : validateEnvVar('MONGODB_URI')

export default {
  MONGODB_URI,
  PORT,
  NODE_ENV: process.env.NODE_ENV || 'development'
} as const