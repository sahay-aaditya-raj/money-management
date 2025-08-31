import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ExpensesProvider } from "./expenses-provider";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Money Software",
  description: "Our Software for Managing Finances",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ExpensesProvider>
          <nav className="p-4 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
            <div className="mx-auto max-w-6xl flex items-center gap-6">
              <a href="/" className="text-sm font-medium hover:opacity-80">
                Home
              </a>
              <a href="/add" className="text-sm text-gray-600 hover:text-black">
                Add Record
              </a>
              <a
                href="/summary"
                className="text-sm text-gray-600 hover:text-black"
              >
                Summary
              </a>
            </div>
          </nav>
          {children}
        </ExpensesProvider>
      </body>
    </html>
  );
}
