import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin · Bravura Esporte Clube",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminSession())) redirect("/entrar-admin");

  return (
    <div className="flex min-h-screen bg-brand-black">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
