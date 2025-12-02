'use client';

import { useEffect } from "react";

interface Props {
  rootId?: string;
}

export function fixAssetPaths(scope: ParentNode) {
  const fixAttribute = (element: Element, attr: "src" | "href") => {
    const value = element.getAttribute(attr);
    if (value && value.startsWith("assets/")) {
      element.setAttribute(attr, `/${value}`);
    }
  };

  scope.querySelectorAll("img[src]").forEach((img) => fixAttribute(img, "src"));
  scope.querySelectorAll("link[href]").forEach((link) => fixAttribute(link, "href"));
  scope.querySelectorAll("script[src]").forEach((script) => fixAttribute(script, "src"));
}

export default function PreviewAssets({ rootId }: Props = {}) {
  useEffect(() => {
    const root = rootId ? document.getElementById(rootId) : document;
    if (!root) return;
    fixAssetPaths(root);
  }, [rootId]);

  return null;
}
