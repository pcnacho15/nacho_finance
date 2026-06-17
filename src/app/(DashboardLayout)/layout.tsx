'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Header from './layout/header/Header'
import { FinanceProvider } from '@/app/context/finance-context/FinanceContext'
import { BottomNavBar } from "./layout/header/BottomNavBar"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <FinanceProvider>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <div className="container mx-auto px-6 pb-[70px] md:pb-auto md:py-30 flex-1">
              {children}
            </div>
            <BottomNavBar />
          </div>
        </div>
      </SidebarProvider>
    </FinanceProvider>
  )
}
