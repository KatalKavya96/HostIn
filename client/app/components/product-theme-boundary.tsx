"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { applyDefaultTheme } from "./theme-system";

const roleAppPath = /^\/[^/]+\/(owner|warden|guard|security|staff|tenant|parent)(?:\/|$)/;

export function ProductThemeBoundary() {
  const pathname = usePathname();

  useEffect(() => {
    if (!roleAppPath.test(pathname)) applyDefaultTheme();
  }, [pathname]);

  return null;
}
