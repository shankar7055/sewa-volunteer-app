"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type React from "react"
import { AppSidebar } from "./AppSidebar"
import { Header } from "./Header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
