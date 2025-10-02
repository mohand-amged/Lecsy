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
        await authClient.signIn.email(
            { ...data, callbackURL: "/" }, 
            {
                onError: (error) => {
                    toast.error(error.error.message || "Invalid email or password")
                },
                onSuccess: () => {
                    toast.success("Signed in successfully!")
                    router.push("/")
                }
            }
        )
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
                                // TODO: Implement forgot password
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