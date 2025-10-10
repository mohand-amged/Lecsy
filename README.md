# Lecsy - AI-Powered SaaS Platform

Lecsy is a modern SaaS application built with Next.js, featuring secure authentication, user management, and AI-powered transcription capabilities. Designed for seamless user experiences with a focus on productivity and ease of use.

## Features

- **Secure Authentication**: Integrated with Better Auth for robust user authentication, including Google OAuth support
- **User Dashboard**: Personalized dashboard for authenticated users with profile management
- **Profile Management**: Comprehensive user profile settings with avatar upload and account management
- **AI Transcription**: Advanced transcription services via integrated API endpoints
- **Responsive Design**: Modern UI built with React and Tailwind CSS for optimal experience across devices
- **Route Protection**: Middleware-based authentication guards ensuring secure access to protected routes

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Authentication**: Better Auth with MongoDB adapter
- **Database**: MongoDB for data persistence
- **Styling**: Tailwind CSS with custom UI components
- **Icons**: Lucide React for consistent iconography
- **Deployment**: Optimized for Vercel deployment

## Project Structure

```
app/
├── (auth)/                 # Authentication routes (sign-in, sign-up)
├── api/                    # API endpoints (auth, transcribe)
├── dashboard/             # Protected user dashboard
└── layout.tsx             # Root layout component

components/
├── ui/                    # Reusable UI components
├── AuthForm.tsx          # Authentication forms
├── DashboardNavBar.tsx   # Navigation for dashboard
├── FileUpload.tsx        # File upload functionality
└── ProfileManagement.tsx # User profile management

lib/
├── auth/                 # Authentication utilities and context
├── prisma.ts            # Database connection
└── utils.ts             # General utilities

prisma/
└── schema.prisma        # Database schema definitions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- Google OAuth credentials (optional, for social login)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lecsy

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-lecsy
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Flow

- **Public Routes**: Landing page, authentication pages
- **Protected Routes**: Dashboard and user-specific pages require authentication
- **Social Login**: Google OAuth integration for seamless sign-in
- **Session Management**: Secure session handling with automatic redirects

## Development

### Key Components

- **ProfileManagement**: Handles user profile updates, avatar management, and sign-out functionality
- **AuthContext**: Provides authentication state across the application
- **Middleware**: Protects routes and manages authentication redirects

### Building for Production

```bash
npm run build
npm start
```

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds on push

For manual deployment, ensure all environment variables are configured in your hosting platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue in the repository or contact the development team.
