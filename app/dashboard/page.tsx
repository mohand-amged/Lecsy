'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {

    const router = useRouter();
    const { data: session, isPending } = useSession();

    const userId = session?.user?.id;
    const userName = session?.user?.name;
    const userEmail = session?.user?.email;

    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.push('/login');
            }
        }
    }, [session, isPending, router]);

    if (!session) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Welcome Back</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{userName}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{userEmail}</p>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant='outline'
                        className="w-full bg-transparent"
                    >
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}