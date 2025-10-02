"use client";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

type SignInForm = z.infer<typeof SignInSchema>

export function SignInTab() {
    const router = useRouter();
    const form = useForm<SignInForm>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    async function handleSignIn(data: SignInForm) {
        try {
            await authClient.signIn.email(
                { 
                    email: data.email,
                    password: data.password,
                    callbackURL: "/dashboard" 
                }, 
                {
                    onRequest: () => {
                        console.log("Attempting sign in...");
                    },
                    onError: (ctx) => {
                        console.error("Sign in error:", ctx.error);
                        toast.error(ctx.error.message || "Invalid email or password")
                    },
                    onSuccess: () => {
                        toast.success("Signed in successfully!")
                        router.push("/dashboard")
                    }
                }
            )
        } catch (error) {
            console.error("Unexpected error during sign in:", error);
            toast.error("Failed to connect to the server. Please check your connection and try again.")
        }
    }

    return <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(handleSignIn)}>
            <FormField control={form.control}
            name="email" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                        <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="h-11"
                            {...field} 
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <FormField control={form.control}
            name="password" render={({ field }) => (
                <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => {
                                toast.info("Forgot password feature coming soon!")
                            }}
                        >
                            Forgot password?
                        </button>
                    </div>
                    <FormControl>
                        <PasswordInput 
                            placeholder="Enter your password" 
                            className="h-11"
                            {...field} 
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <Button 
                type="submit" 
                className="w-full h-11 text-sm font-medium" 
                disabled={form.formState.isSubmitting}
            >
                {form.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                    </div>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    </Form>
}