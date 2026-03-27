"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

interface FloatingMenuProps {
  onOpenSidebar: () => void;
}

const menuItems = [
  {
    name: "Inicio",
    icon: "solar:widget-2-linear",
    url: "/finance",
  },
  {
    name: "Ingresos",
    icon: "solar:money-bag-bold",
    url: "/finance/income",
  },
  {
    name: "Gastos",
    icon: "solar:card-send-bold",
    url: "/finance/expense",
  },
  {
    name: "Ahorros",
    icon: "solar:wallet-bold",
    url: "/finance/savings",
  },
];

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative flex items-center gap-1">
      {menuItems.map((item, index) => (
        <Link
          key={index}
          href={item.url}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            pathname === item.url
              ? "bg-lightprimary text-primary dark:bg-darkprimary"
              : "hover:bg-lightprimary hover:text-primary"
          }`}
          aria-label={item.name}
        >
          <Icon icon={item.icon} width="22" height="22" />
        </Link>
      ))}

      <button
        // onClick={onOpenSidebar}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-lightprimary hover:text-primary transition-colors ml-1"
        aria-label="Abrir menú"
      >
        <Icon icon="tabler:layout-sidebar-left-expand-filled" width="22" height="22" />
      </button>
    </div>
  );
};

export default FloatingMenu;
