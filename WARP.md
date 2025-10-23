# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Lecsy is a Next.js-based audio transcription platform that allows users to upload audio files and receive AI-powered transcriptions with advanced features like speaker diarization, sentiment analysis, and automatic summarization. The platform uses AssemblyAI for transcription services and Better Auth for authentication.

## Development Commands

### Basic Development
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm run start`
- **Lint code**: `npm run lint`

### Database Operations
- **Generate migrations**: `npm run db:generate`
- **Push schema changes**: `npm run db:push`
- **Open Drizzle Studio**: `npm run db:studio`

### Environment Setup
Create `.env` file with:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/lecsy_db"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ASSEMBLYAI_API_KEY="your-assemblyai-api-key"
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS with Framer Motion animations
- **UI Components**: Radix UI primitives with custom components
- **Authentication**: Better Auth with email/password and OAuth support
- **Database**: PostgreSQL with Drizzle ORM
- **Transcription**: AssemblyAI API integration
- **File Storage**: Vercel Blob for audio file storage

### Directory Structure

#### Core Application (`/app`)
- Uses Next.js App Router with file-based routing
- API routes handle authentication, file uploads, transcription, and webhooks
- Protected routes use middleware for session validation
- Key routes: `/dashboard`, `/chat/[id]`, `/login`, `/signup`

#### Database Layer (`/db`)
- **`schema.ts`**: Complete database schema with user management, audio files, and transcriptions
- **`drizzle.ts`**: Database connection and configuration
- Tables: `user`, `session`, `account`, `audioFiles`, `transcriptions`
- Rich transcription data includes speakers, sentiment, entities, summaries, and chapters

#### Authentication (`/lib/auth.ts` & `/lib/auth-client.ts`)
- Server-side auth configuration with Drizzle adapter
- Client-side hooks for session management
- Supports email/password and OAuth providers
- Session-based authentication with automatic redirects

#### Components Architecture
- **`/components/ui`**: Reusable UI primitives (buttons, inputs, dialogs)
- **`/components/landing`**: Landing page sections (hero, features, pricing)
- **`/app/dashboard/components`**: Dashboard-specific components
- Component composition follows atomic design principles

#### Business Logic (`/lib/AssemblyAI`)
- **`assemblyai.ts`**: AssemblyAI client configuration and transcription logic
- **`database.ts`**: Database operations for audio files and transcriptions
- Handles file uploads, webhook processing, and status polling

#### Custom Hooks (`/hooks`)
- **`useTranscription.ts`**: Complete transcription lifecycle management
- Handles status polling, progress tracking, and error handling
- Provides real-time updates during transcription processing

### Data Flow

1. **File Upload**: User uploads audio → stored in Vercel Blob → metadata saved to `audioFiles` table
2. **Transcription**: AssemblyAI processes file → webhook updates status → results stored in `transcriptions` table
3. **Real-time Updates**: Client polls transcription status → UI updates with progress/results
4. **Export Options**: Generate PDF/Word documents from transcription data

### Key Integration Points

#### AssemblyAI Integration
- Webhook endpoint: `/api/webhooks/assemblyai`
- Status polling via `/api/transcribe/[id]`
- Advanced features: speaker diarization, sentiment analysis, auto-chapters
- Error handling with retry logic and user feedback

#### Authentication Flow
- Better Auth handles session management
- Middleware protects `/dashboard` routes
- Automatic redirects for unauthenticated users
- OAuth integration ready for Google/other providers

#### Database Relations
- Users → AudioFiles → Transcriptions (one-to-many relationships)
- Foreign key constraints ensure data integrity
- Soft delete patterns for user data management

## Development Notes

### File Processing Pipeline
Audio files go through: Upload → Storage → Transcription Request → Processing → Webhook → Database Update → Client Notification

### State Management
- Server state managed via API routes and database
- Client state uses React hooks and context for UI state
- Real-time updates through polling (can be upgraded to WebSockets)

### Error Handling
- API routes include comprehensive error handling
- Client-side error boundaries and user feedback
- Transcription failures are logged and retryable

### Security Considerations
- File uploads validated for type and size
- Authentication middleware protects sensitive routes
- Database queries use parameterized statements via Drizzle
- CORS configured for trusted origins only