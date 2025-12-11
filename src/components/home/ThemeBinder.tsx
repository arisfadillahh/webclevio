'use client';

import { useEffect } from "react";
import type { SiteContent } from "@/types/content";
import { bindTemplate, DEFAULT_ROOT_ID } from "@/lib/themeBinding";

interface Props {
  content: SiteContent;
  rootId?: string;
}

export default function ThemeBinder({ content, rootId = DEFAULT_ROOT_ID }: Props) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const cleanups = bindTemplate(root, content, {
      attachWindowEvents: true,
      enableSmoothScroll: true,
      rootId,
      documentRef: document,
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [content, rootId]);

  return null;
}
