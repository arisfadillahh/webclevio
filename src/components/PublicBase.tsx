"use client";

import { createContext, useContext, type ReactNode } from "react";

import { withBase } from "@/lib/camp-path";

const PublicBaseContext = createContext("");

export function PublicBaseProvider({ base, children }: { base: string; children: ReactNode }) {
  return <PublicBaseContext.Provider value={base}>{children}</PublicBaseContext.Provider>;
}

export function usePublicBase() {
  return useContext(PublicBaseContext);
}

export function usePublicPath() {
  const base = usePublicBase();
  return (path: string) => withBase(base, path);
}
