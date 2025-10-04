import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const authHandler = toNextJsHandler(auth);

export const { GET } = authHandler;

export async function POST(request: Request) {
    return authHandler.POST(request);
}
