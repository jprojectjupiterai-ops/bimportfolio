import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "John Paul Maulion | Architect Portfolio",
  description: "High-end scrollytelling architectural portfolio of John Paul Maulion, Registered Licensed Architect and BIM Coordinator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        "min-h-screen bg-background font-sans text-foreground antialiased",
        inter.variable,
        montserrat.variable
      )}>
        {children}
      </body>
    </html>
  );
}
