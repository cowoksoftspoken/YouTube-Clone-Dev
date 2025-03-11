import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import SidebarDesktop from "@/components/sidebar-desktop";
import SessionProvider from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouTube Clone",
  description: "A Simple YouTube Clone",
  applicationName: "YouTube Clone",
  authors: [{ name: "ISB", url: "https://youtubeclones.vercel.app" }],
  creator: "Inggrit Setya Budi",
  keywords: ["YouTube", "video streaming", "Next.js", "React", "clone"],
  openGraph: {
    title: "YouTube Clone",
    description: "A modern YouTube clone built with Next.js 15",
    url: "https://youtubeclones.vercel.app",
    siteName: "YouTube Clone",
    images: [
      {
        url: "https://youtubeclones.vercel.app/android-chrome-512x512.png",
        width: 1200,
        height: 630,
        alt: "YouTube Clone Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Clone",
    description: "A modern YouTube clone built with Next.js 15",
    images: ["https://youtubeclones.vercel.app/android-chrome-512x512.png"],
    creator: "@ISB",
  },
  robots: "index, follow",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://youtubeclones.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF0000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen flex-col">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <SidebarDesktop />
                <main className="flex-1 overflow-y-auto p-4">{children}</main>
              </div>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
