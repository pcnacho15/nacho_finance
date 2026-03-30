'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Header from './layout/header/Header'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <div className="container mx-auto px-6 py-30 flex-1">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
