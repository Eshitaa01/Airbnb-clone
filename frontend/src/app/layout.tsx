import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "airhome | Find your next stay",
  description: "Book unique homes, cabins, lofts and villas around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased bg-white text-ink">
        <UserProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
