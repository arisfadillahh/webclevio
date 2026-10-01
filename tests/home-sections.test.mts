import assert from "node:assert/strict";
import test from "node:test";

import { isHomeSectionVisible, resolveSectionVisibility } from "../src/lib/home-sections.ts";

test("gallery and stories stay hidden until an editor turns them on", () => {
  const visibility = resolveSectionVisibility(undefined);
  assert.equal(visibility.gallery, false);
  assert.equal(visibility.news, false);
  assert.equal(visibility.hero, true);
  assert.equal(visibility.events, true);
  assert.equal(isHomeSectionVisible({ sectionVisibility: undefined }, "gallery"), false);
  assert.equal(isHomeSectionVisible({ sectionVisibility: { gallery: true } }, "gallery"), true);
});
