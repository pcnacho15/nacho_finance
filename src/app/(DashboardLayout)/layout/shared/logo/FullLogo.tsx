"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const FullLogo = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Image
        src="/images/logos/dark-logo.svg"
        alt="logo"
        width={204}
        height={36}
        className="rtl:scale-x-[-1]"
      />
    );
  }

  return (
    <>
      <Image
        src="/images/logos/dark-logo.svg"
        alt="logo"
        width={204}
        height={36}
        className="block dark:hidden rtl:scale-x-[-1]"
      />
      <Image
        src="/images/logos/light-logo.svg"
        alt="logo"
        width={204}
        height={36}
        className="hidden dark:block rtl:scale-x-[-1]"
      />
    </>
  );
};

export default FullLogo;
