'use client'

import React, { useState } from 'react'
import { SUPPORTED_OAUTH_PROVIDER_DETAILS, SUPPORTED_OAUTH_PROVIDERS } from '@/lib/o-auth-providers'
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';


function SocialAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  return SUPPORTED_OAUTH_PROVIDERS.map((provider)=>{
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon;
    const isLoading = loadingProvider === provider;

    return (
        <Button 
            variant="outline" 
            key={provider} 
            onClick={async ()=>{
                setLoadingProvider(provider);
                try {
                    await authClient.signIn.social({provider, callbackURL: "/dashboard" });
                } catch (error) {
                    console.error('Auth error:', error);
                    setLoadingProvider(null);
                }
            }} 
            className="w-full"
            disabled={isLoading}
        >
            <Icon className="w-5 h-5 mr-2"/>
            {isLoading ? 'Redirecting...' : SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
        </Button>
    )
  })
}

export default SocialAuthButtons