# Lecsy Database Schemas Overview

This document outlines all the database schemas (Prisma models) required for the Lecsy SaaS application. The schemas are designed to support user management, transcription services, and usage tracking using MongoDB.

## Database Configuration

- **Provider**: MongoDB
- **ORM**: Prisma Client JS
- **Environment Variable**: `DATABASE_URL` (MongoDB connection string)

## Models

### 1. User Model

**Purpose**: Stores user account information and manages relationships with transcriptions and usage statistics.

**Fields**:
- `id` (String, ObjectId): Unique identifier for the user
- `email` (String): User's email address (unique)
- `name` (String, optional): User's display name
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations**:
- One-to-many with `Transcription` (user can have multiple transcriptions)
- One-to-one with `UsageStats` (tracks user's usage data)

**Indexes**:
- Unique index on `email`

### 2. Transcription Model

**Purpose**: Manages audio/video transcription jobs, including file details, processing status, and results.

**Fields**:
- `id` (String, ObjectId): Unique identifier for the transcription job
- `userId` (String, ObjectId): Foreign key referencing the User model
- `fileName` (String): Original name of the uploaded file
- `fileSize` (Int): Size of the file in bytes
- `fileDuration` (Float, optional): Duration of the media file in seconds
- `language` (String): Language code for transcription (e.g., 'en', 'es')
- `transcript` (String, optional): The transcribed text content
- `jobId` (String, unique): External job identifier from transcription service
- `status` (String): Current status ('pending', 'processing', 'completed', 'failed')
- `estimatedCost` (Float, optional): Estimated processing cost
- `retryCount` (Int): Number of retry attempts (default: 0)
- `errorMessage` (String, optional): Error details if processing fails
- `createdAt` (DateTime): Job creation timestamp
- `completedAt` (DateTime, optional): Completion timestamp

**Relations**:
- Many-to-one with `User` (belongs to a specific user)

**Indexes**:
- Index on `userId` for efficient user-based queries
- Index on `status` for filtering by processing status

### 3. UsageStats Model

**Purpose**: Tracks user activity, including transcription counts, processing time, and costs for billing and analytics.

**Fields**:
- `id` (String, ObjectId): Unique identifier for the usage stats record
- `userId` (String, ObjectId, unique): Foreign key referencing the User model
- `totalTranscriptions` (Int): Lifetime total number of transcriptions
- `totalMinutesProcessed` (Float): Total minutes of media processed
- `totalCost` (Float): Total cost incurred by the user
- `monthlyTranscriptions` (Int): Transcriptions in the current month
- `monthlyMinutes` (Float): Minutes processed in the current month
- `monthlyCost` (Float): Cost for the current month
- `lastResetDate` (DateTime): Date when monthly stats were last reset
- `maxMonthlyMinutes` (Float): Monthly processing limit (default: 60 minutes)
- `maxMonthlyCost` (Float): Monthly cost limit (default: $10)

**Relations**:
- One-to-one with `User` (each user has one usage stats record)

## Schema Relationships

- **User ↔ Transcription**: One user can have many transcriptions (one-to-many)
- **User ↔ UsageStats**: One user has one set of usage statistics (one-to-one)
- **Transcription → User**: Each transcription belongs to one user (many-to-one)

## Usage Notes

- All models use MongoDB ObjectId for primary keys
- Timestamps are automatically managed with `@createdAt` and `@updatedAt`
- Cascade delete is enabled for related records (e.g., deleting a user deletes their transcriptions and usage stats)
- The schema supports scalable transcription services with job tracking and cost management
- Monthly usage limits help control costs and prevent abuse

This schema provides a solid foundation for a SaaS transcription platform with user management and analytics capabilities.
