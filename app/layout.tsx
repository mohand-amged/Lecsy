import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { NotificationProvider } from "@/lib/notifications/NotificationContext";
import { ToastProvider } from "@/hooks/use-toast";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lecsy - AI Lecture Transcription for Students",
  description: "Never miss a lecture again. AI-powered transcription for students."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} dark`}>
        {/* Wrapped children with AuthProvider and Suspense boundary */}
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>{children}</ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}