import { GoogleIcon } from "@/components/auth/o-auth-icons";
import { ComponentProps, ElementType } from "react";

export const SUPPORTED_OAUTH_PROVIDERS = ['google'] as const;
export type OAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<OAuthProvider, 
    { name: string; Icon: ElementType<ComponentProps<"svg">> }
    > = {
        google: {name : "Google", Icon: GoogleIcon},
    }