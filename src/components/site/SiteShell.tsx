import * as React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
