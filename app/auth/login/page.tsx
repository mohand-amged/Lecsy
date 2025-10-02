import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignUpTab } from "./_components/sign-up-tab";
import { SignInTab } from "./_components/sign-in-tab";


export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome to Lecsy
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
                        Sign in to your account or create a new one
                    </p>
                </div>
                
                <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                        <TabsTrigger value="signin" className="text-xs sm:text-sm">Sign In</TabsTrigger>
                        <TabsTrigger value="signup" className="text-xs sm:text-sm">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin" className="space-y-0">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl font-semibold text-center">
                                    Sign in to your account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
                                <SignInTab />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-0">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl font-semibold text-center">
                                    Create your account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
                                <SignUpTab />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}