import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get the actual session from better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to MongoDB and fetch user profile
    const db = await getDatabase()
    const usersCollection = db.collection("user")

    const user = await usersCollection.findOne({ id: session.user.id })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || "Student",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
