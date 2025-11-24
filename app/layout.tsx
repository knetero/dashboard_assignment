import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard - Agencies & Contacts",
  description: "Manage your agencies and contacts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
          <SignedOut>
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
              <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl dark:bg-gray-800">
                <div className="text-center">
                  <h2 className="text-3xl font-bold">Welcome Back</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to access your dashboard
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  <SignInButton mode="modal">
                    <button className="w-full bg-blue-600 text-white rounded-lg font-medium text-sm h-10 px-5 cursor-pointer hover:bg-blue-700">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-sm h-10 px-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      Create Account
                    </button>
                  </SignUpButton>
                </div>
              </div>
            </div>
          </SignedOut>
          <SignedIn>
            <DashboardLayout>{children}</DashboardLayout>
          </SignedIn>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
