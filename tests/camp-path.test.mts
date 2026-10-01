import assert from "node:assert/strict";
import test from "node:test";

import { isCampPath, stripCampPrefix, withBase } from "../src/lib/camp-path.ts";

test("camp prefix keeps root paths untouched and prefixes camp paths once", () => {
  assert.equal(withBase("", "/admin"), "/admin");
  assert.equal(withBase("/camp", "/admin"), "/camp/admin");
  assert.equal(withBase("/camp", "/camp/admin"), "/camp/admin");
  assert.equal(withBase("/camp", "/"), "/camp");
  assert.equal(withBase("/camp", "/#about"), "/camp/#about");
  assert.equal(withBase("/camp", "#programs"), "#programs");
  assert.equal(withBase("/camp", "https://clev.io/events"), "https://clev.io/events");
  assert.equal(stripCampPrefix("/camp/admin"), "/admin");
  assert.equal(stripCampPrefix("/camp"), "/");
  assert.equal(stripCampPrefix("/admin"), "/admin");
  assert.equal(isCampPath("/camp/login"), true);
  assert.equal(isCampPath("/login"), false);
});
