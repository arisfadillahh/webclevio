'use client';

import { useEffect } from "react";

interface Props {
  keys: string[];
  rootId?: string;
}

export default function PreviewVisibility({ keys, rootId }: Props) {
  useEffect(() => {
    const root = rootId ? document.getElementById(rootId) : document;
    if (!root) return;

    const scope: ParentNode = rootId ? root : document;
    const allowed = new Set(keys);
    const nodes = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-preview]"),
    );
    const originals = nodes.map((node) => node.style.display);

    const preloader = root.querySelector<HTMLElement>("#preloader");
    if (preloader) preloader.style.display = "none";

    nodes.forEach((node, index) => {
      const key = node.dataset.preview ?? "";
      if (!allowed.has(key)) {
        node.style.display = "none";
      } else if (originals[index]) {
        node.style.display = originals[index];
      } else {
        node.style.removeProperty("display");
      }
    });

    const firstVisible = nodes.find((node) =>
      allowed.has(node.dataset.preview ?? ""),
    );
    if (firstVisible && !rootId) {
      requestAnimationFrame(() => {
        const top =
          firstVisible.getBoundingClientRect().top +
          window.scrollY -
          window.innerHeight * 0.05;
        window.scrollTo({
          top: Math.max(top, 0),
          behavior: "auto",
        });
      });
    }

    return () => {
      nodes.forEach((node, index) => {
        if (originals[index]) {
          node.style.display = originals[index];
        } else {
          node.style.removeProperty("display");
        }
      });
      if (!rootId) {
        window.scrollTo({ top: 0 });
      }
    };
  }, [keys, rootId]);

  return null;
}
