import type { SiteContent } from "@/types/content";
import ThemeBinder from "@/components/home/ThemeBinder";
import { getBoundTemplateMarkup } from "@/lib/template";
import { DEFAULT_ROOT_ID } from "@/lib/themeBinding";

interface Props {
  content: SiteContent;
  rootId?: string;
}

export default async function HomePage({ content, rootId = DEFAULT_ROOT_ID }: Props) {
  const markup = await getBoundTemplateMarkup(content, rootId);

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
