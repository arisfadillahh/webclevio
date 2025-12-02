import type { SiteContent } from "@/types/content";
import ThemeBinder from "@/components/home/ThemeBinder";
import { getTemplateMarkup } from "@/lib/template";

const DEFAULT_ROOT_ID = "clevio-template-root";

interface Props {
  content: SiteContent;
  rootId?: string;
}

export default async function HomePage({ content, rootId = DEFAULT_ROOT_ID }: Props) {
  const markup = await getTemplateMarkup();

  return (
    <>
      <div
        id={rootId}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      <ThemeBinder content={content} rootId={rootId} />
    </>
  );
}
