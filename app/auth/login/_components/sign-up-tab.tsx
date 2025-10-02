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

const SignUpSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type SignUpForm = z.infer<typeof SignUpSchema>

export function SignUpTab() {
    const router = useRouter();
    const form = useForm<SignUpForm>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    })

    async function handleSignUp(data: SignUpForm) {
        try {
            await authClient.signUp.email(
                {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    callbackURL: "/dashboard"
                }, 
                {
                    onRequest: () => {
                        console.log("Attempting sign up...");
                    },
                    onError: (ctx) => {
                        console.error("Sign up error:", ctx.error);
                        toast.error(ctx.error.message || "Something went wrong")
                    },
                    onSuccess: () => {
                        toast.success("Account created successfully!")
                        router.push("/dashboard")
                    }
                }
            )
        } catch (error) {
            console.error("Unexpected error during sign up:", error);
            toast.error("Failed to connect to the server. Please check your connection and try again.")
        }
    }

    return <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(handleSignUp)}>
            <FormField control={form.control}
            name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                    <FormControl>
                        <Input 
                            placeholder="Enter your full name" 
                            className="h-11"
                            {...field} 
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

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
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                        <PasswordInput 
                            placeholder="Create a password" 
                            className="h-11"
                            {...field} 
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <FormField control={form.control}
            name="confirmPassword" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                    <FormControl>
                        <PasswordInput 
                            placeholder="Confirm your password" 
                            className="h-11"
                            {...field} 
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <div className="pt-2">
                <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-medium" 
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating account...
                        </div>
                    ) : (
                        "Create Account"
                    )}
                </Button>
            </div>

            <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-4">
                By creating an account, you agree to our{" "}
                <button type="button" className="text-primary hover:underline">
                    Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-primary hover:underline">
                    Privacy Policy
                </button>
            </p>
        </form>
    </Form>
}