// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth/auth-client";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Sign-in failed";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
