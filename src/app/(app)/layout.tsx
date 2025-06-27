// Next.js layout for (app) routes
import React from "react";
import { InventoryProvider } from "../InventoryProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <InventoryProvider>{children}</InventoryProvider>;
}
