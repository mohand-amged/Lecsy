"use client";

import { NavBar } from "@/app/dashboard/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  BookOpen,
  Bug,
  Lightbulb,
  LifeBuoy,
  ExternalLink,
  FileQuestion,
  Search,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HelpPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/help/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <HelpCircle className="h-8 w-8 mr-3" />
            Help & Support
          </h1>
          <p className="text-gray-400">Find answers, get help, and learn how to get the most out of Lecsy.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles, e.g. ‘upload audio’, ‘export PDF’"
              className="pl-10 bg-gray-900 border-gray-800 text-white"
            />
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Getting Started
              </CardTitle>
              <CardDescription className="text-gray-400">
                Learn the basics and common workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help/articles/uploading-audio" className="text-white hover:underline inline-flex items-center">
                    How to upload and transcribe audio
                    <ExternalLink className="h-3.5 w-3.5 ml-2 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/help/articles/chat-with-your-transcript" className="text-white hover:underline inline-flex items-center">
                    Chat with your transcript
                    <ExternalLink className="h-3.5 w-3.5 ml-2 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/help/articles/exporting-results" className="text-white hover:underline inline-flex items-center">
                    Exporting results (TXT, DOCX, PDF)
                    <ExternalLink className="h-3.5 w-3.5 ml-2 text-gray-400" />
                  </Link>
                </li>
              </ul>
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white" asChild>
                <Link href="/help/guide">View the full guide</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <LifeBuoy className="h-5 w-5 mr-2" />
                Contact Support
              </CardTitle>
              <CardDescription className="text-gray-400">
                Reach our team for help
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button className="bg-white text-black hover:bg-gray-200" asChild>
                  <Link href="mailto:support@lecsy.app">
                    <Mail className="h-4 w-4 mr-2" /> Email us
                  </Link>
                </Button>
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white" asChild>
                  <Link href="/help/new-ticket">
                    <MessageSquare className="h-4 w-4 mr-2" /> Open a ticket
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-gray-500">Typical response time: under 24 hours on weekdays.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bug className="h-5 w-5 mr-2" />
                Report a Bug
              </CardTitle>
              <CardDescription className="text-gray-400">
                Help us improve by reporting issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-gray-300">
                <p>Please include steps to reproduce, expected vs. actual behavior, and screenshots if possible.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white" asChild>
                  <Link href="/help/report-bug">Report a bug</Link>
                </Button>
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white" asChild>
                  <Link href="/help/status">System status</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Feature Requests
              </CardTitle>
              <CardDescription className="text-gray-400">
                Share ideas and vote on features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white" asChild>
                  <Link href="/help/roadmap">View roadmap</Link>
                </Button>
                <Button className="bg-white text-black hover:bg-gray-200" asChild>
                  <Link href="/help/feature-request">Submit a request</Link>
                </Button>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Crown className="h-4 w-4 mr-2" />
                Some features may require a Pro plan.
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileQuestion className="h-5 w-5 mr-2" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <details className="group">
              <summary className="cursor-pointer text-white font-medium group-open:text-white">What file formats are supported?</summary>
              <p className="mt-2 text-gray-300">You can upload common audio formats like MP3, WAV, and M4A. Large files are supported within your plan limits.</p>
            </details>
            <Separator className="bg-gray-800" />
            <details className="group">
              <summary className="cursor-pointer text-white font-medium group-open:text-white">How long does transcription take?</summary>
              <p className="mt-2 text-gray-300">Typical processing time is near real-time for short files; longer files may take several minutes depending on length and load.</p>
            </details>
            <Separator className="bg-gray-800" />
            <details className="group">
              <summary className="cursor-pointer text-white font-medium group-open:text-white">How do I cancel or change my subscription?</summary>
              <p className="mt-2 text-gray-300">Go to Subscription from the profile menu or use the link below to manage your plan and billing details.</p>
              <div className="mt-2">
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white" asChild>
                  <Link href="/subscription">Manage subscription</Link>
                </Button>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const runtime = "edge";
