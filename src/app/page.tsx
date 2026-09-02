import HomePage from "@/components/home/HomePage";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  return <HomePage content={content} />;
}
