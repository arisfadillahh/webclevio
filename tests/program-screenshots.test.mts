import assert from "node:assert/strict";
import test from "node:test";

import { programScreenshots } from "../src/lib/program-screenshots.ts";

test("keeps every saved level screenshot and still accepts the old single image", () => {
  assert.deepEqual(
    programScreenshots({
      projectImages: ["/uploads/one.jpg", " /uploads/two.jpg ", ""],
      projectImage: "/uploads/old.jpg",
      image: "/uploads/card.jpg",
    }),
    ["/uploads/one.jpg", "/uploads/two.jpg"],
  );
  assert.deepEqual(
    programScreenshots({
      projectImage: "/uploads/old.jpg",
      image: "/uploads/card.jpg",
    }),
    ["/uploads/old.jpg"],
  );
  assert.deepEqual(
    programScreenshots({
      projectImages: [],
      projectImage: "/uploads/old.jpg",
      image: "/uploads/card.jpg",
    }),
    [],
  );
});
