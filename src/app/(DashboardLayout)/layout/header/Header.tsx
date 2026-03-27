"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import Profile from "./Profile";
import Notifications from "./Notifications";
import SidebarLayout from "../sidebar/Sidebar";
import FullLogo from "../shared/logo/FullLogo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Search from "./Search";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [isSticky, setIsSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMode = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <>
      <header
        className={`sticky top-0 z-20 ${
          isSticky ? "bg-background shadow-md fixed w-full" : "bg-transparent"
        }`}
      >
        <nav
          className={`rounded-none py-4 sm:ps-6 max-w-full! sm:pe-10 dark:bg-dark flex justify-between items-center px-6`}
        >
          <div className="flex items-center h-10 xl:hidden">
            <FullLogo />
          </div>

          

          <div className="flex items-center justify-between w-full">
            <div className="hidden xl:flex items-center gap-2">
              <div className="relative">
                <Search />
              </div>
            </div>
            <div className="flex w-full justify-end items-end">
              <div className="flex gap-0 items-center">
                <div
                  className="hover:text-primary px-15 group focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-gray relative"
                  onClick={toggleMode}
                >
                  <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2 group-hover:after:bg-lightprimary">
                    {theme === "light" ? (
                      <Icon icon="tabler:moon" width="20" className="text-foreground dark:text-muted-foreground group-hover:text-primary" />
                    ) : (
                      <Icon
                        icon="solar:sun-bold-duotone"
                        width="20"
                        className="text-foreground dark:text-muted-foreground group-hover:text-primary"
                      />
                    )}
                  </span>
                </div>

                <div className="xl:block">
                  <div className="flex gap-0 items-center relative">
                    <Notifications />
                  </div>
                </div>

                <Profile />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>sidebar</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
