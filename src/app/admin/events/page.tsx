import AdminShell from "@/components/admin/AdminShell";
import EventManager from "@/components/admin/EventManager";
import { requireAdminSession } from "@/lib/admin-session";
import { listEvents } from "@/lib/content";
import { getContentStorageMode } from "@/lib/db";

export const metadata = { title: "Event | Clevio CMS" };

export default async function AdminEventsPage() {
  await requireAdminSession("/admin/events");
  const events = await listEvents();
  return <AdminShell storageMode={getContentStorageMode()}><EventManager initialItems={events} /></AdminShell>;
}
