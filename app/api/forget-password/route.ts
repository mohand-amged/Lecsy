import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Better Auth's forgot password functionality
    try {
      await auth.api.forgetPassword({
        body: {
          email,
          redirectTo: "/reset-password", // Redirect URL after clicking the reset link
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      });
    }
  } catch (error) {
    console.error('Forgot password request error:', error);
    return NextResponse.json({ 
      error: 'Failed to process password reset request' 
    }, { status: 500 });
  }
}