import winston from 'winston'
import path from 'path'

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    })
  })
)

// Create logger instance
export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: {
    service: 'lecsy-ai',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          return `${timestamp} [${level}]: ${message} ${metaStr}`
        })
      ),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
    }),
  ],
})

// Structured logging helpers
export const logAuth = {
  signInAttempt: (email: string, ip?: string) => {
    logger.info('Authentication attempt', {
      event: 'auth.signin.attempt',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially mask email
      ip,
    })
  },

  signInSuccess: (userId: string, email: string, ip?: string) => {
    logger.info('Authentication successful', {
      event: 'auth.signin.success',
      userId,
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      ip,
    })
  },

  signInFailure: (email: string, reason: string, ip?: string) => {
    logger.warn('Authentication failed', {
      event: 'auth.signin.failure',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      reason,
      ip,
    })
  },

  signUpAttempt: (email: string, ip?: string) => {
    logger.info('Registration attempt', {
      event: 'auth.signup.attempt',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      ip,
    })
  },

  signUpSuccess: (userId: string, email: string, ip?: string) => {
    logger.info('Registration successful', {
      event: 'auth.signup.success',
      userId,
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      ip,
    })
  },

  signOut: (userId: string, ip?: string) => {
    logger.info('User signed out', {
      event: 'auth.signout',
      userId,
      ip,
    })
  },

  passwordReset: (email: string, ip?: string) => {
    logger.info('Password reset requested', {
      event: 'auth.password.reset',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      ip,
    })
  },
}

export const logApi = {
  request: (method: string, url: string, userId?: string, ip?: string) => {
    logger.http('API request', {
      event: 'api.request',
      method,
      url,
      userId,
      ip,
    })
  },

  response: (method: string, url: string, status: number, duration: number, userId?: string) => {
    logger.http('API response', {
      event: 'api.response',
      method,
      url,
      status,
      duration,
      userId,
    })
  },

  error: (method: string, url: string, error: string, userId?: string, ip?: string) => {
    logger.error('API error', {
      event: 'api.error',
      method,
      url,
      error,
      userId,
      ip,
    })
  },

  rateLimitExceeded: (ip: string, endpoint: string) => {
    logger.warn('Rate limit exceeded', {
      event: 'api.ratelimit.exceeded',
      ip,
      endpoint,
    })
  },
}

export const logDatabase = {
  query: (operation: string, table: string, duration: number, userId?: string) => {
    logger.debug('Database query', {
      event: 'db.query',
      operation,
      table,
      duration,
      userId,
    })
  },

  error: (operation: string, table: string, error: string, userId?: string) => {
    logger.error('Database error', {
      event: 'db.error',
      operation,
      table,
      error,
      userId,
    })
  },

  connection: (status: 'connected' | 'disconnected' | 'error', details?: string) => {
    logger.info('Database connection', {
      event: 'db.connection',
      status,
      details,
    })
  },
}

export const logFile = {
  upload: (fileName: string, fileSize: number, userId: string, ip?: string) => {
    logger.info('File upload', {
      event: 'file.upload',
      fileName,
      fileSize,
      userId,
      ip,
    })
  },

  uploadError: (fileName: string, error: string, userId: string, ip?: string) => {
    logger.error('File upload error', {
      event: 'file.upload.error',
      fileName,
      error,
      userId,
      ip,
    })
  },

  transcription: (jobId: string, status: string, userId: string, duration?: number) => {
    logger.info('Transcription update', {
      event: 'transcription.update',
      jobId,
      status,
      userId,
      duration,
    })
  },
}

export const logSecurity = {
  suspiciousActivity: (activity: string, ip: string, userId?: string, details?: any) => {
    logger.warn('Suspicious activity detected', {
      event: 'security.suspicious',
      activity,
      ip,
      userId,
      details,
    })
  },

  invalidInput: (input: string, endpoint: string, ip?: string, userId?: string) => {
    logger.warn('Invalid input detected', {
      event: 'security.invalid_input',
      input: input.substring(0, 100), // Limit input logging
      endpoint,
      ip,
      userId,
    })
  },

  corsViolation: (origin: string, ip?: string) => {
    logger.warn('CORS violation', {
      event: 'security.cors_violation',
      origin,
      ip,
    })
  },
}

// Ensure logs directory exists
import fs from 'fs'
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

export default logger
