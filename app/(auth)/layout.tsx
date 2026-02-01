"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./_components/sidebar"
import { Header } from "./_components/header"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <Header />
        <main className="max-w-7xl mx-auto w-full p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
