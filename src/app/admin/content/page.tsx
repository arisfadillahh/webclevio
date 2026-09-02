import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/admin-session";
import { getSiteContent } from "@/lib/content";
import { getContentStorageMode } from "@/lib/db";
import { getTemplateMarkup } from "@/lib/template";

export const metadata = { title: "Konten Website | Clevio CMS" };

export default async function WebsiteContentPage() {
  await requireAdminSession("/admin/content");
  const content = await getSiteContent();
  const templateMarkup = await getTemplateMarkup(content.branding.logo);
  return (
    <AdminShell storageMode={getContentStorageMode()}>
      <AdminDashboard initialContent={content} templateMarkup={templateMarkup} embedded />
    </AdminShell>
  );
}
