import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "German Vocabulary Tester",

  description:
    "Practice German vocabulary from A1 to B2 with AI-generated quizzes and progressive difficulty.",

  applicationName: "German Vocabulary Tester",

  metadataBase: new URL(
    "https://german-vocab-tester.vercel.app"
  ),
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <ServiceWorkerRegistration />
      {children}
      </body>
    </html>
  );
}
