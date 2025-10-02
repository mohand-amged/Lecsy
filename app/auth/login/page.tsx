import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignUpTab } from "./_components/sign-up-tab";
import { SignInTab } from "./_components/sign-in-tab";


export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome to Lecsy
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to your account or create a new one
                    </p>
                </div>
                
                <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                        <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin" className="space-y-0">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl font-semibold text-center">
                                    Sign in to your account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <SignInTab />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-0">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl font-semibold text-center">
                                    Create your account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <SignUpTab />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}