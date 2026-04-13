import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/Sidebar";

// TODO: plugar autenticação real aqui (NextAuth, Clerk, etc.) antes de expor o admin em produção.

export const metadata: Metadata = {
  title: "Admin · Bravura FC",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-black">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
