'use client'

import React from 'react'
import { SUPPORTED_OAUTH_PROVIDER_DETAILS, SUPPORTED_OAUTH_PROVIDERS } from '@/lib/o-auth-providers'
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';


function SocialAuthButtons() {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider)=>{
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon;

    //TODO: Add loading state when redirecting
    return (
        <Button variant="outline" key={provider} onClick={()=>{
            authClient.signIn.social({provider, callbackURL: "/dashboard" });
        }} className="w-full">
            <Icon className="w-5 h-5 mr-2"/>
            {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
        </Button>
    )
  })
}

export default SocialAuthButtons