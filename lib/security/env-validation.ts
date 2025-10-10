import { z } from 'zod'

// Environment variables schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  
  // Optional OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Email (if using email features)
  EMAIL_FROM: z.string().optional(),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

// Validate environment variables
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env)
    
    // Additional security checks
    if (env.NODE_ENV === 'production') {
      // Production-specific validations
      if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
        throw new Error('Production requires a strong BETTER_AUTH_SECRET (32+ characters)')
      }
      
      if (env.BETTER_AUTH_URL?.includes('localhost')) {
        throw new Error('Production cannot use localhost URLs')
      }
      
      if (env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
        throw new Error('Production cannot use localhost URLs')
      }
    }
    
    console.log('✅ Environment validation passed')
    return env
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    process.exit(1)
  }
}

// Initialize environment validation (only in Node.js runtime)
export const env = typeof process !== 'undefined' ? validateEnv() : {} as Env
