// app/api/auth/signout/route.ts
import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth/auth-client";


export async function POST() {
  try {
    const result = await authClient.signOut(); // ✅ check docs, should be correct for better-auth
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Logout failed";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
