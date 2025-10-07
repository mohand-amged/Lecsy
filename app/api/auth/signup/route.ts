// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth/auth-client";

export async function POST(req: Request) {
  const { email, password, name, image, callbackURL } = await req.json();

  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
      image,
      callbackURL,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
