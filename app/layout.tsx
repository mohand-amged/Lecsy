import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lecsy - AI-Powered Lecture Transcription for Students",
    template: "%s | Lecsy"
  },
  description: "Never miss a lecture detail again. Lecsy uses advanced AI to transcribe your lectures in minutes with PDF and Word export. Free for students.",
  keywords: ["transcription", "AI transcription", "lecture notes", "student tools", "audio to text", "lecture transcription", "study tools"],
  authors: [{ name: "Lecsy" }],
  creator: "Lecsy",
  publisher: "Lecsy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Lecsy - AI-Powered Lecture Transcription for Students",
    description: "Never miss a lecture detail again. AI-powered transcription with PDF and Word export.",
    siteName: "Lecsy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lecsy - AI-Powered Lecture Transcription",
    description: "Never miss a lecture detail again. AI-powered transcription for students.",
    creator: "@lecsy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
