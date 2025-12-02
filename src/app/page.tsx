import HomePage from "@/components/home/HomePage";
import { getSiteContent } from "@/lib/content";

export default async function Home() {
  const content = await getSiteContent();
  return <HomePage content={content} />;
}
