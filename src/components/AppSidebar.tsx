"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
import type { UserRole } from "@/types/next-auth";

type Role = UserRole;

interface SidebarItem {
  title: string;
  url?: string;
  icon?: string;
  roles?: Role[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  roles?: Role[];
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
  {
    title: "Premium",
    roles: ["investor", "admin"],
    items: [
      {
        title: "USDT en vivo",
        url: "/finance/crypto",
        icon: "solar:chart-square-bold",
        roles: ["investor", "admin"],
      },
      {
        title: "Ofertas P2P",
        url: "/finance/crypto/p2p",
        icon: "solar:dollar-minimalistic-bold",
        roles: ["investor", "admin"],
      },
      {
        title: "Mis Billeteras",
        url: "/finance/crypto/wallets",
        icon: "solar:wallet-money-bold",
        roles: ["investor", "admin"],
      },
      {
        title: "Dashboard P&L",
        url: "/finance/crypto/dashboard",
        icon: "solar:chart-2-bold",
        roles: ["investor", "admin"],
      },
      {
        title: "Chat",
        url: "/finance/crypto/chat",
        icon: "solar:chat-round-line-bold",
        roles: ["investor", "admin"],
      },
    ],
  },
];

function isVisible(roles: Role[] | undefined, current: Role) {
  if (!roles || roles.length === 0) return true;
  return roles.includes(current);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "user") as Role;

  const visibleSections = sidebarData
    .filter((section) => isVisible(section.roles, role))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isVisible(item.roles, role)),
    }))
    .filter((section) => section.items.length > 0);

  const onClose = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`${isCollapsed ? "justify-center" : ""}`}>
        <div
          className={`flex justify-start items-center gap-2 px-2 py-2 ${isCollapsed ? "hidden" : "block"}`}
        >
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
        {visibleSections.map((section) => (
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
                      <SidebarMenuItem
                        key={item.title}
                        className="mb-3"
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                          onClick={onClose}
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
