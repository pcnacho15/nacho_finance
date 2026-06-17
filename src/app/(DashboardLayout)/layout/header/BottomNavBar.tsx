'use client';
import Link from "next/link";
import type { UserRole } from "@/types/next-auth";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

type Role = UserRole;

interface SidebarItem {
  title: string;
  url?: string;
  icon?: string;
  iconOutline?: string;
  roles?: Role[];
}

const bottombarData: SidebarItem[] = [
  {
    title: "Resumen",
    url: "/finance",
    icon: "solar:widget-2-linear",
  },
  {
    title: "Ingresos",
    url: "/finance/income",
    icon: "solar:money-bag-bold",
    iconOutline: "solar:money-bag-outline",
  },
  {
    title: "Gastos",
    url: "/finance/expense",
    icon: "solar:card-send-bold",
    iconOutline: "solar:card-send-outline",
  },
  {
    title: "Deudas",
    url: "/finance/debts",
    icon: "solar:document-text-bold",
    iconOutline: "solar:document-text-outline",
  },
  {
    title: "Metas de Ahorro",
    url: "/finance/savings",
    icon: "solar:chat-round-money-bold",
    iconOutline: "solar:chat-round-money-outline",
  },
  //   {
  //     title: "Reportes",
  //     url: "/finance/reports",
  //     icon: "solar:pie-chart-2-bold",
  //   },
];

export const BottomNavBar = () => {
    const pathname = usePathname();

  return (
    <div className="flex justify-center fixed md:hidden w-full bottom-3 mt-5">
      <nav
        className={`rounded-full py-2 max-w-full  backdrop-blur-md flex items-center px-3`}
      >
        <div className="flex items-center justify-between gap-2">
          {bottombarData.map((item) => (
            <Link
              key={item.title}
              href={item.url || "#"}
              className={`rounded-full px-4 py-2 text-dark dark:text-white ${pathname === item.url ? "bg-muted transition-all duration-300 ease-in-out" : ""}`}
            >
              {item.icon && (
                <Icon
                  icon={(pathname === item.url ? item.icon : item.iconOutline || item.icon)}
                  className="size-6"
                />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
