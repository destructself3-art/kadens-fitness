import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { ensureDemoLeads } from "@/lib/demo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Every page of the panel except the login screen. Pages check the session again on their own. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  await ensureDemoLeads();
  const newLeads = await prisma.lead.count({ where: { status: "new" } });
  return (
    <>
      <AdminHeader newLeads={newLeads} />
      <main id="main" className="container-page pb-24 pt-8 md:pt-12">
        {children}
      </main>
    </>
  );
}
