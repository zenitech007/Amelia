import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- PWA VIEWPORT SETTINGS ---
export const viewport: Viewport = {
  themeColor: '#1E1F22', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // This stops the screen from zooming in when you tap an input on mobile!
};

export const metadata: Metadata = {
  title: "Amelia",
  description: "Advanced Healthcare AI Assistant",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Amelia",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}