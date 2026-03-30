"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";

interface SidebarItem {
  title: string;
  url?: string;
  icon?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarData: SidebarSection[] = [
  {
    title: "Inicio",
    items: [
      {
        title: "Resumen",
        url: "/finance",
        icon: "solar:widget-2-linear",
      },
    ],
  },
  {
    title: "Finanzas",
    items: [
      {
        title: "Ingresos",
        url: "/finance/income",
        icon: "solar:money-bag-bold",
      },
      {
        title: "Gastos",
        url: "/finance/expense",
        icon: "solar:card-send-bold",
      },
      {
        title: "Deudas",
        url: "/finance/debts",
        icon: "solar:document-text-bold",
      },
      {
        title: "Metas de Ahorro",
        url: "/finance/savings",
        icon: "solar:chat-round-money-bold",
      },
      {
        title: "Reportes",
        url: "/finance/reports",
        icon: "solar:pie-chart-2-bold",
      },
      {
        title: "Categorías",
        url: "/finance/categories",
        icon: "solar:tag-bold",
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`${isCollapsed ? "justify-center" : ""}`}>
        <div
          className={`flex justify-start items-center gap-2 px-2 py-2 ${isCollapsed ? "hidden" : "block"}`}
        >
          <Icon
            icon="game-icons:nachos"
            className="size-10 bg-muted rounded-lg"
          />
          <div className="flex flex-col">
            <h1 className="text-xl card-title">Nacho</h1>
            <p className="text-xs text-muted-foreground">Finance app</p>
          </div>
        </div>
        {isCollapsed && (
          <Link
            href="/"
            className="flex justify-center w-full"
          >
            <Icon
              icon="game-icons:nachos"
              className="size-9 bg-muted rounded-lg"
            />
          </Link>
        )}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.map((section) => (
          <SidebarGroup key={section.title}>
            <Collapsible
              defaultOpen={!isCollapsed}
              className="group/collapsible"
            >
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2">
                  <span className={isCollapsed ? "hidden" : ""}>
                    {section.title}
                  </span>
                  {!isCollapsed && (
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  )}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url || "#"}>
                            {item.icon && (
                              <Icon
                                icon={item.icon}
                                className="size-4"
                              />
                            )}
                            <span
                              className={
                                isCollapsed
                                  ? "hidden group-data-[collapsible=icon]:inline"
                                  : ""
                              }
                            >
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
