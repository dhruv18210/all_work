import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AI CRM | Next-Gen AI Calling Platform",
  description: "Automate your sales and support with low-latency AI agents. Qualified leads, automated CRM, and real-time analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="app-container">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
