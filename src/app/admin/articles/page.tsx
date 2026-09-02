import AdminShell from "@/components/admin/AdminShell";
import ArticleManager from "@/components/admin/ArticleManager";
import { requireAdminSession } from "@/lib/admin-session";
import { listArticles } from "@/lib/content";
import { getContentStorageMode } from "@/lib/db";

export const metadata = { title: "Artikel | Clevio CMS" };

export default async function AdminArticlesPage() {
  await requireAdminSession("/admin/articles");
  const articles = await listArticles();
  return <AdminShell storageMode={getContentStorageMode()}><ArticleManager initialItems={articles} /></AdminShell>;
}
