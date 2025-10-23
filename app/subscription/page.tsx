'use client';

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavBar } from "@/app/dashboard/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Crown, 
  Zap, 
  Clock, 
  CreditCard, 
  Download,
  Sparkles,
  TrendingUp,
  Shield,
  X
} from "lucide-react";

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Sparkles,
    features: [
      { text: '30 minutes of transcription', included: true },
      { text: 'Basic transcription quality', included: true },
      { text: 'Standard processing speed', included: true },
      { text: '5 file uploads per month', included: true },
      { text: 'Email support', included: true },
      { text: 'Priority processing', included: false },
      { text: 'Advanced accuracy', included: false },
      { text: 'Export to multiple formats', included: false },
    ],
    popular: false,
    cta: 'Current Plan',
    variant: 'outline' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: 'month',
    description: 'For professionals and power users',
    icon: Zap,
    features: [
      { text: '500 minutes of transcription', included: true },
      { text: 'High-quality transcription', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Unlimited file uploads', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Export to DOCX, PDF, TXT', included: true },
      { text: 'Advanced editing tools', included: true },
      { text: 'API access', included: false },
    ],
    popular: true,
    cta: 'Upgrade to Pro',
    variant: 'default' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For teams and organizations',
    icon: Crown,
    features: [
      { text: 'Unlimited transcription', included: true },
      { text: 'Ultra-high quality', included: true },
      { text: 'Instant processing', included: true },
      { text: 'Unlimited uploads', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'All export formats', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Full API access', included: true },
    ],
    popular: false,
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [currentPlan] = useState('free');
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return null;
  }

  const handleUpgrade = (planId: string) => {
    if (planId === 'enterprise') {
      console.log('Contact sales for enterprise plan');
    } else {
      console.log('Upgrade to:', planId);
    }
  };

  const handleManageBilling = () => {
    console.log('Open billing portal');
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock powerful transcription features tailored to your needs
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-full p-1 inline-flex">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                isYearly
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 bg-green-500 text-white hover:bg-green-500">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const finalPrice = isYearly && plan.price > 0 
              ? Math.round(plan.price * 12 * 0.8) 
              : plan.price;
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={`relative bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-white shadow-2xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-white text-black font-bold px-4 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                    <Icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-white">
                        ${finalPrice}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-400 ml-2">
                          /{isYearly ? 'year' : plan.period}
                        </span>
                      )}
                    </div>
                    {isYearly && plan.price > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        ${plan.price}/month billed annually
                      </p>
                    )}
                  </div>

                  {isCurrentPlan ? (
                    <Badge variant="secondary" className="w-full py-2">
                      Current Plan
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-white text-black hover:bg-gray-200'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  )}
                </CardHeader>

                <Separator className="bg-gray-800" />

                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-white' : 'text-gray-600'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Subscription Details */}
        {currentPlan !== 'free' && (
          <Card className="bg-gray-900 border-gray-800 mb-12">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your subscription and billing information
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  className="border-gray-700 hover:bg-gray-800 text-white"
                >
                  Manage Billing
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Current Plan
                  </div>
                  <p className="text-white font-semibold text-lg">Pro Plan</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Next Billing Date
                  </div>
                  <p className="text-white font-semibold text-lg">Dec 22, 2025</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Usage This Month
                  </div>
                  <p className="text-white font-semibold text-lg">145 / 500 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Comparison */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Why Upgrade?
            </CardTitle>
            <CardDescription className="text-gray-400">
              Unlock premium features to enhance your transcription experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Lightning Fast</h3>
                <p className="text-gray-400 text-sm">
                  Priority processing means your transcriptions are ready in seconds
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Ultra Accurate</h3>
                <p className="text-gray-400 text-sm">
                  Advanced AI models deliver industry-leading transcription accuracy
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                  <Download className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Export Anywhere</h3>
                <p className="text-gray-400 text-sm">
                  Download in DOCX, PDF, TXT, or any format you need
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Have Questions?
          </h2>
          <p className="text-gray-400 mb-6">
            We&apos;re here to help! Contact our support team for any questions about pricing or features.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/help')}
            className="border-gray-700 hover:bg-gray-800 text-white"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering to prevent prerender issues
export const dynamic = 'force-dynamic';

// Alternative: You can also use this to mark as client-only
export const runtime = 'edge';