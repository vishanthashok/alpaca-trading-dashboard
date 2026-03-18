import "./globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Alpaca Trading Terminal",
  description: "Paper trading dashboard powered by Alpaca Markets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-terminal-bg text-terminal-bright">
        {children}
      </body>
    </html>
  );
}

