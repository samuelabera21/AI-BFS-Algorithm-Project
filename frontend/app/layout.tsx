import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Analyzer UI",
  description: "Educational UI for password analysis and BFS workflow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
