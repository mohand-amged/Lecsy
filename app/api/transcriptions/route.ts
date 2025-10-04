import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface Transcription {
  id: string
  userId: string
  title: string
  content: string
  audioUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Get all transcriptions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const transcriptionsCollection = db.collection("transcriptions")

    const transcriptions = await transcriptionsCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      transcriptions,
    })
  } catch (error) {
    console.error("[v0] Error fetching transcriptions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new transcription session
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title } = body

    const db = await getDatabase()
    const transcriptionsCollection = db.collection("transcriptions")

    const newTranscription: Transcription = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: title || "New Transcription",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await transcriptionsCollection.insertOne(newTranscription)

    return NextResponse.json({
      success: true,
      transcription: newTranscription,
    })
  } catch (error) {
    console.error("[v0] Error creating transcription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}