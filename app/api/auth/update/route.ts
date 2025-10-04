import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface UserProfile {
  id: string
  name?: string
  email?: string
  bio?: string
  avatar?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Profile update request received")

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      console.log("[v0] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Session user ID:", session.user.id)

    const body = await request.json()
    const { name, email, bio, avatar } = body

    console.log("[v0] Update data:", { name, email, bio, avatar: avatar ? "present" : "none" })

    const db = await getDatabase()
    const usersCollection = db.collection("user")

    const updateData: Partial<UserProfile> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    const result = await usersCollection.updateOne({ id: session.user.id }, { $set: updateData })

    console.log("[v0] Update result:", { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount })

    if (result.matchedCount === 0) {
      console.log("[v0] User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = await usersCollection.findOne({ id: session.user.id })
    console.log("[v0] Updated user retrieved:", updatedUser ? "success" : "failed")

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        bio: updatedUser?.bio,
        avatar: updatedUser?.avatar,
      },
    })
  } catch (error) {
    console.error("[v0] Error updating user profile:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}