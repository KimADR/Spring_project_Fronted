import type React from "react";
import { Sidebar } from "./_components/SideBar";
import './globals.css'
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
          <Toaster/>
      </body>
    </html>
  );
}
