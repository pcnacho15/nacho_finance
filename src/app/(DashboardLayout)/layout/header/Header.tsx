"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { Menu } from "lucide-react";
import Profile from "./Profile";
import Notifications from "./Notifications";
import { AppSidebar } from "@/components/AppSidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Search from "./Search";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { openMobile, setOpenMobile, toggleSidebar } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          isSticky ? "backdrop-blur-lg shadow-md fixed w-full" : "bg-background"
        }`}
      >
        <nav
          className={`rounded-none py-4 max-w-full  dark:bg-dark flex items-center px-5`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="xl:hidden"
            >
              <Menu className="size-5" />
            </Button>
            <SidebarTrigger className="hidden xl:flex" />
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="hidden xl:flex items-center gap-2">
              <div className="relative">
                <Search />
              </div>
            </div>
            <div className="flex w-full justify-end items-end">
              <div className="flex gap-4 items-center">
                <div
                  className="group focus:ring-0 rounded-full flex justify-center items-center cursor-pointer relative"
                  onClick={toggleMode}
                >
                  <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2 hover:after:bg-muted">
                    {!mounted ? (
                      <Icon
                        icon="tabler:moon"
                        width="20"
                        className="text-foreground dark:text-muted-foreground group-hover:text-foreground z-10"
                      />
                    ) : theme === "light" ? (
                      <Icon
                        icon="tabler:moon"
                        width="20"
                        className="text-foreground dark:text-muted-foreground group-hover:text-foreground z-10"
                      />
                    ) : (
                      <Icon
                        icon="solar:sun-bold-duotone"
                        width="20"
                        className="text-foreground dark:text-muted-foreground group-hover:text-foreground z-10"
                      />
                    )}
                  </span>
                </div>

                {/* <div className="xl:block">
                  <div className="flex gap-0 items-center relative">
                    <Notifications />
                  </div>
                </div> */}

                <Profile />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <Sheet
        open={openMobile}
        onOpenChange={setOpenMobile}
      >
        <SheetContent
          side="left"
          className="w-64 p-0"
        >
          <VisuallyHidden>
            <SheetTitle>sidebar</SheetTitle>
          </VisuallyHidden>
          <AppSidebar />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
