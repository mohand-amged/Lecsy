'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const urlError = searchParams.get('error');
        if (urlError === 'session_error') {
            setError('Your session has expired. Please log in again.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || 'Sign In failed');
            } else {
                // Redirect to callback URL if provided, otherwise go to dashboard
                const callbackUrl = searchParams.get('callbackUrl');
                router.push(callbackUrl || '/dashboard');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="email@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    aria-required="true"
                                    aria-invalid={error ? "true" : "false"}
                                    className="h-11"
                                    autoComplete="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link 
                                        href="/forget-password"
                                        className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                        tabIndex={0}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    placeholder="••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    aria-required="true"
                                    aria-invalid={error ? "true" : "false"}
                                    className="h-11"
                                    autoComplete="current-password"
                                />
                            </div>
                            {error && (
                                <div 
                                    className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    <span className="font-medium">Error:</span>
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full h-11 font-semibold" 
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="mr-2">Logging in</span>
                                    <span className="animate-pulse">…</span>
                                </>
                            ) : (
                                'Log in'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <div className="px-6 pb-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link 
                            href="/signup" 
                            className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
