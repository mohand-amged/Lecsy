import { NextRequest, NextResponse } from "next/server";

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, bio, avatar } = body;

    // Mock user ID since we don't have session validation
    const mockUserId = "user_123";

    const updatedUser: UserProfile = {
      id: mockUserId,
      name: name || "Student",
      email: email || "student@example.com",
      bio: bio || "Passionate learner using Lecsy to transcribe and organize my study materials.",
      avatar: avatar || "",
    };

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
