"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import {
  Upload,
  Mic,
  Zap,
  Lightbulb,
  BookOpen,
  Plus,
  Search,
  Settings,
  Bell,
  X,
  ChevronDown,
  FileAudio,
  Sparkles,
  LogOut,
  Download,
  Share2,
  Copy,
  Check,
  Trash2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Clock,
  Calendar,
} from "lucide-react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ChatMessage {
  id: string
  title: string
  date: string
  preview: string
  duration?: string
  transcript?: string
  summary?: string
  keyPoints?: string[]
}

export default function DashboardPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const chatHistory: ChatMessage[] = [
    {
      id: "1",
      title: "Machine Learning Lecture 5",
      date: "2 hours ago",
      duration: "45:32",
      preview: "Discussion about neural networks, backpropagation, and gradient descent algorithms...",
      transcript:
        "Today we're going to dive deep into neural networks and the backpropagation algorithm. Neural networks are computational models inspired by the human brain, consisting of interconnected nodes or neurons organized in layers...",
      summary:
        "This lecture covers the fundamentals of neural networks, including architecture, forward propagation, backpropagation algorithm, and gradient descent optimization techniques.",
      keyPoints: [
        "Neural network architecture and layer types",
        "Forward propagation process",
        "Backpropagation algorithm explained",
        "Gradient descent and learning rate",
        "Common activation functions",
      ],
    },
    {
      id: "2",
      title: "Database Systems Notes",
      date: "Yesterday",
      duration: "38:15",
      preview: "SQL queries, normalization, ACID properties, and transaction management concepts...",
      transcript:
        "Let's start with database normalization. Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity...",
      summary:
        "Comprehensive overview of database systems including SQL fundamentals, normalization forms, ACID properties, and transaction management.",
      keyPoints: [
        "Database normalization (1NF, 2NF, 3NF)",
        "SQL query optimization",
        "ACID properties explained",
        "Transaction isolation levels",
        "Indexing strategies",
      ],
    },
    {
      id: "3",
      title: "Physics Lab Recording",
      date: "2 days ago",
      duration: "52:08",
      preview: "Experiment on electromagnetic induction, Faraday's law, and Lenz's law demonstration...",
      transcript:
        "In today's lab, we'll be exploring electromagnetic induction through hands-on experiments. We'll verify Faraday's law and observe Lenz's law in action...",
      summary:
        "Laboratory session demonstrating electromagnetic induction principles with practical experiments and real-world applications.",
      keyPoints: [
        "Faraday's law of electromagnetic induction",
        "Lenz's law and energy conservation",
        "Experimental setup and procedure",
        "Data collection and analysis",
        "Real-world applications",
      ],
    },
    {
      id: "4",
      title: "Calculus Tutorial Session",
      date: "3 days ago",
      duration: "41:20",
      preview: "Integration techniques, partial derivatives, and multivariable calculus problems...",
      transcript:
        "Welcome to our calculus tutorial. Today we're focusing on advanced integration techniques and their applications in multivariable calculus...",
      summary:
        "Tutorial covering advanced calculus topics including integration techniques, partial derivatives, and multivariable optimization.",
      keyPoints: [
        "Integration by parts",
        "Partial derivatives and chain rule",
        "Multivariable optimization",
        "Lagrange multipliers",
        "Double and triple integrals",
      ],
    },
    {
      id: "5",
      title: "Software Engineering Meeting",
      date: "1 week ago",
      duration: "35:45",
      preview: "Agile methodologies, sprint planning, and software development lifecycle discussion...",
      transcript:
        "Let's discuss our approach to agile development and how we can improve our sprint planning process...",
      summary:
        "Team meeting discussing agile methodologies, sprint planning strategies, and software development best practices.",
      keyPoints: [
        "Agile vs Waterfall methodologies",
        "Sprint planning and estimation",
        "Daily standup best practices",
        "Code review processes",
        "Continuous integration/deployment",
      ],
    },
  ]

  const courses = [
    { id: 1, name: "Computer Science 101", color: "bg-indigo-500" },
    { id: 2, name: "Mathematics 201", color: "bg-purple-500" },
    { id: 3, name: "Physics 301", color: "bg-blue-500" },
  ]

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault()
          document.getElementById("search-input")?.focus()
        } else if (e.key === "u") {
          e.preventDefault()
          fileInputRef.current?.click()
        }
      }
      if (e.key === "Escape") {
        setSelectedChat(null)
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    const dismissed = localStorage.getItem("welcomeDismissed")
    if (dismissed === "true") {
      setIsWelcomeDismissed(true)
    }
  }, [])

  const handleDismissWelcome = () => {
    setIsWelcomeDismissed(true)
    localStorage.setItem("welcomeDismissed", "true")
    addToast("Welcome message hidden", "info")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"]
    const maxSize = 100 * 1024 * 1024 // 100MB

    const invalidFiles = files.filter((file) => !validTypes.includes(file.type) || file.size > maxSize)

    if (invalidFiles.length > 0) {
      addToast("Some files are invalid. Please upload MP3, WAV, or M4A files under 100MB.", "error")
      return
    }

    addToast(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}...`, "info")
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            addToast("Upload complete! Processing transcription...", "success")
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleCopyTranscript = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId("transcript")
    addToast("Transcript copied to clipboard", "success")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedChatData = chatHistory.find((chat) => chat.id === selectedChat)

  const todaySessions = chatHistory.filter((chat) => chat.date.includes("hour") || chat.date === "Today").length

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"></div>

      {/*Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-card/50 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center glow-primary">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-foreground">AI Transcribe</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg border border-border">
            <Clock className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">Today</span>
              <span className="text-sm font-bold text-foreground leading-none mt-0.5">{todaySessions}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary relative h-8 w-8"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-all duration-200 group"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-sm font-medium text-foreground">Student</span>
              <ChevronDown
                className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                <button
                  className="w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors flex items-center gap-3 group"
                  onClick={() => {
                    addToast("Settings opened", "info")
                    setIsProfileMenuOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-foreground text-sm group-hover:text-primary transition-colors">Settings</span>
                </button>

                <button
                  className="w-full px-4 py-2.5 text-left hover:bg-destructive/10 transition-colors flex items-center gap-3 group border-t border-border"
                  onClick={() => {
                    addToast("Logged out successfully", "success")
                    setIsProfileMenuOpen(false)
                  }}
                >
                  <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                  <span className="text-foreground text-sm group-hover:text-destructive transition-colors">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-screen relative z-10 pt-14">
        {/* Sidebar */}
        <div className="w-64 bg-card/50 backdrop-blur-xl border-r border-border flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border space-y-3">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg glow-primary transition-all duration-300 group h-9">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Chat
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12 h-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-muted-foreground bg-muted rounded border border-border">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-custom">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <Card
                  key={chat.id}
                  className={`cursor-pointer transition-all duration-200 border group ${
                    selectedChat === chat.id
                      ? "bg-primary/10 border-primary/30 shadow-lg"
                      : "bg-card/50 border-border hover:bg-card hover:border-border/50"
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selectedChat === chat.id ? "bg-primary" : "bg-secondary"
                        }`}
                      >
                        <FileAudio className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{chat.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-muted-foreground">{chat.date}</p>
                          {chat.duration && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {chat.duration}
                              </p>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{chat.preview}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-sm font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-xs text-muted-foreground px-4">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                  <FileAudio className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">No transcriptions yet</h3>
                <p className="text-xs text-muted-foreground mb-4 px-4">Upload your first recording to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!isWelcomeDismissed && (
            <div className="bg-card/30 backdrop-blur-xl border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-1 text-balance">Welcome back, Student! 👋</h2>
                  <p className="text-muted-foreground text-sm">
                    Upload your recordings and get AI-powered transcriptions instantly
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismissWelcome}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 ml-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-custom">
            {selectedChatData ? (
              // Chat Detail View
              <div className="max-w-5xl mx-auto p-6 animate-fade-in">
                {/* Chat Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedChat(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">Press ESC to close</span>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">{selectedChatData.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {selectedChatData.date}
                      </span>
                      {selectedChatData.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedChatData.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyTranscript(selectedChatData.transcript || "")}
                      className="border-border hover:bg-secondary"
                    >
                      {copiedId === "transcript" ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-secondary bg-transparent"
                      onClick={() => addToast("Download started", "success")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-secondary bg-transparent"
                      onClick={() => addToast("Share link copied", "success")}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-destructive/10 hover:text-destructive bg-transparent"
                      onClick={() => {
                        addToast("Transcription deleted", "success")
                        setSelectedChat(null)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Audio Player */}
                <Card className="border-border bg-card/50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Button
                        size="icon"
                        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 glow-primary"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                      </Button>

                      <div className="flex-1">
                        <div className="w-full bg-secondary rounded-full h-2 mb-2">
                          <div className="h-full bg-primary rounded-full w-1/3"></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>15:24</span>
                          <span>{selectedChatData.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Section */}
                {selectedChatData.summary && (
                  <Card className="border-border bg-gradient-to-br from-primary/5 to-accent/5 mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">{selectedChatData.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Key Points */}
                {selectedChatData.keyPoints && (
                  <Card className="border-border bg-card/50 mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Lightbulb className="w-5 h-5 text-accent" />
                        Key Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedChatData.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{index + 1}</span>
                            </div>
                            <span className="text-foreground leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Full Transcript */}
                <Card className="border-border bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <FileAudio className="w-5 h-5" />
                      Full Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedChatData.transcript}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Upload Section
              <div className="max-w-5xl mx-auto p-6">
                {/* Upload Card */}
                <Card className="border-border bg-card/50 backdrop-blur-xl mb-8 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center glow-primary">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground mb-2 text-balance">
                      Upload Your Recording
                    </CardTitle>
                    <p className="text-muted-foreground">Drag and drop your audio files or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Press <kbd className="px-2 py-1 text-xs bg-secondary rounded border border-border">⌘U</kbd> to
                      upload
                    </p>
                  </CardHeader>

                  <CardContent className="p-8">
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                        isDragging
                          ? "border-primary bg-primary/5 scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-secondary/30"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center gap-6">
                        <div
                          className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isDragging ? "bg-primary scale-110 rotate-6" : "bg-gradient-to-br from-primary to-accent"
                          }`}
                        >
                          <Upload
                            className={`w-12 h-12 text-white transition-transform duration-300 ${isDragging ? "scale-125" : ""}`}
                          />
                        </div>

                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {isDragging ? "✨ Drop your files here!" : "Upload Audio Recording"}
                          </h3>
                          <p className="text-muted-foreground mb-6 text-lg">
                            Support for MP3, WAV, M4A files up to 100MB
                          </p>

                          {isUploading && (
                            <div className="mb-6">
                              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">Uploading... {uploadProgress}%</p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg glow-primary transition-all duration-300 group"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                              Choose Files
                            </Button>
                            <Button
                              variant="outline"
                              size="lg"
                              className="border-2 border-border bg-secondary text-foreground hover:bg-secondary/80 hover:border-primary/50 px-10 py-6 text-lg group"
                            >
                              <Mic className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                              Record Live
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Course Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Select Course (Optional)</h3>
                  <div className="relative inline-block" ref={dropdownRef}>
                    <Button
                      variant="outline"
                      className="border-border bg-secondary text-foreground hover:bg-secondary/80"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Select Course
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {isDropdownOpen && (
                      <div className="absolute top-full mt-2 left-0 w-64 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                        {courses.map((course) => (
                          <button
                            key={course.id}
                            className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3 group"
                            onClick={() => {
                              addToast(`Selected ${course.name}`, "success")
                              setIsDropdownOpen(false)
                            }}
                          >
                            <div className={`w-3 h-3 rounded-full ${course.color}`}></div>
                            <span className="text-foreground text-sm group-hover:text-primary transition-colors">
                              {course.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1 border-border bg-card/50 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300"></div>
                      <CardContent className="p-8 text-center relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 glow-primary">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">Quick Transcribe</h3>
                        <p className="text-sm text-muted-foreground">Get instant transcriptions in seconds</p>
                      </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 transform hover:-translate-y-1 border-border bg-card/50 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/10 group-hover:to-accent/5 transition-all duration-300"></div>
                      <CardContent className="p-8 text-center relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 glow-accent">
                          <Lightbulb className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">AI Summary</h3>
                        <p className="text-sm text-muted-foreground">Get key points and summaries</p>
                      </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1 border-border bg-card/50 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/5 transition-all duration-300"></div>
                      <CardContent className="p-8 text-center relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">Study Notes</h3>
                        <p className="text-sm text-muted-foreground">Generate organized study materials</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border animate-slide-in-right ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-500"
                : toast.type === "error"
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-primary/10 border-primary/30 text-primary"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && <Check className="w-5 h-5" />}
              {toast.type === "error" && <X className="w-5 h-5" />}
              {toast.type === "info" && <Sparkles className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
