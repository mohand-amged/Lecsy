// Client-side HTML sanitization using DOMPurify
// This file should only be imported in client components, not in middleware

'use client'

import DOMPurify from 'dompurify'

// Client-side HTML sanitization with DOMPurify
export function sanitizeHtmlClient(input: string): string {
  if (typeof window === 'undefined') {
    // Fallback for SSR - use simple sanitization
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  })
}

// Sanitize HTML but allow safe tags
export function sanitizeHtmlSafe(input: string): string {
  if (typeof window === 'undefined') {
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i'],
    ALLOWED_ATTR: [],
  })
}

// Sanitize for rich text content
export function sanitizeRichText(input: string): string {
  if (typeof window === 'undefined') {
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a'
    ],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOWED_URI_REGEXP: /^https?:\/\//,
  })
}
