'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

export default function ForgetPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [, setSuccess] = useState(false);
    const [error, setError] = useState('');

     const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/forget-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            // Redirect to dashboard or home page
            setSuccess(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // return
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Forget Password</CardTitle>
                    <CardDescription>Enter your email to reset your password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
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
                                />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Password Link'}
                        </Button>
                        <Button asChild variant="outline" type="button" className="w-full bg-transparent">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}