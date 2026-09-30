import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { formatLimitError, validateContentTextLimits } from "../src/lib/content-limits.ts";

test("current website content can be saved, including level images", () => {
  const content = JSON.parse(readFileSync(new URL("../data/content.json", import.meta.url), "utf8"));
  assert.deepEqual(validateContentTextLimits(content), []);
});

test("section descriptions stay capped and the error names the field", () => {
  const issues = validateContentTextLimits({
    benefits: { description: "a".repeat(481) },
  });
  assert.equal(issues.length, 1);
  assert.equal(issues[0]?.path, "benefits.description");
  assert.equal(issues[0]?.limit, 480);
  assert.equal(issues[0]?.length, 481);
  assert.match(formatLimitError(issues), /benefits\.description \(481\/480\)/);
});
