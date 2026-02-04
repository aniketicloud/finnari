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
      <div className="flex w-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-7xl p-6">{children}</main>
      </div>
    </SidebarProvider>
  )
}
