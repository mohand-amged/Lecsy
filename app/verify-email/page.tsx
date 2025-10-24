'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. Please check your email for the correct link.');
                return;
            }

            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully! You can now log in.');
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push('/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Email verification failed. The link may have expired.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred during verification. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && '✓ Email Verified'}
                        {status === 'error' && '✗ Verification Failed'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' && 'Please wait while we verify your email address'}
                        {status === 'success' && 'Your account is now active'}
                        {status === 'error' && 'Something went wrong'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className={`text-center ${
                        status === 'success' ? 'text-green-600' : 
                        status === 'error' ? 'text-red-600' : 
                        'text-muted-foreground'
                    }`}>
                        {message}
                    </p>

                    {status === 'loading' && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-2">
                            <Button asChild className="w-full">
                                <Link href="/login">Go to Login</Link>
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-2">
                            <Button asChild className="w-full">
                                <Link href="/signup">Create New Account</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Verifying Email...</CardTitle>
                        <CardDescription>Please wait while we verify your email address</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
