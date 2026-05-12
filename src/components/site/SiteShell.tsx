import * as React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 min-w-0 overflow-x-clip">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
