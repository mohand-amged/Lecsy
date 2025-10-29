'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const result = await signUp.email({
                name,
                email,
                password,
            }, {
                onRequest: () => {
                    console.log('Signup request:', { name, email });
                },
                onSuccess: (ctx) => {
                    console.log('Signup success:', ctx);
                },
                onError: (ctx) => {
                    console.error('Signup error:', ctx.error);
                },
            });

            if (result.error) {
                console.error('Signup error details:', result.error);
                let errorMessage = result.error.message || 'Sign Up failed';
                const lower = errorMessage.toLowerCase();
                if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already')) {
                    errorMessage = 'Email already in use. Please sign in or use a different email.';
                }
                setError(errorMessage);
                toast.error(errorMessage);
            } else {
                console.log('Signup successful, redirecting to dashboard');
                toast.success('Account created successfully');
                // Redirect to dashboard after successful signup
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Signup exception:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // return
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create a new account to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                id="name" 
                                type="text" 
                                placeholder="John Doe" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                id="email" 
                                type="email" 
                                placeholder="email@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                id="password" 
                                type="password" 
                                placeholder="******" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input 
                                id="confirmPassword" 
                                type="password" 
                                placeholder="******" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
                <div className="mt-4 space-y-2 text-center text-sm">
                    <div>
                        Already have an account? {" "}
                        <Link 
                        href="/login" 
                        className="text-primary hover:underline"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    )
}