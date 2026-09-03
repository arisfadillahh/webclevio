import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contentPath = new URL("../data/content.json", import.meta.url);
const templatePath = new URL("../src/templates/home.html", import.meta.url);

test("homepage content follows the approved revision", async () => {
  const content = JSON.parse(await readFile(contentPath, "utf8"));

  assert.equal(
    content.about.text,
    "Di Clevio, teknologi adalah alat. Yang kami bangun adalah kemampuan untuk  menciptakan solusi nyata, bukan sekedar menjadi pengguna. Kurikulum Clevio Innovator Camp mengacu pada 4 manfaat:",
  );
  assert.deepEqual(content.about.bullets, [
    "21st Century Skills",
    "Positive Characters",
    "Profil Pelajar Pancasila",
    "Technology and Entrepreneurship",
  ]);
  assert.equal(content.activities.items.length, 2);
  assert.deepEqual(content.activities.items.map((item) => item.title), ["Project-Based Learning", "Coaching"]);
  assert.deepEqual(content.benefits.items.map((item) => item.title), [
    "Explore",
    "Discover",
    "Create",
    "Collaborate",
    "Present",
    "Reflect",
  ]);
  assert.equal(content.blog.tagline, "Berita & Artikel");
  assert.equal(content.blog.title, "Clevio Stories");
  assert.equal(content.callToAction.title, "The Future Needs Innovators and Changemakers.");
});

test("homepage template includes the revised showcase, gallery, and social CTA", async () => {
  const template = await readFile(templatePath, "utf8");
  const requiredCopy = [
    "Karya Anak Layak untuk Dilihat Dunia",
    "Pitching Day",
    "Festival Technopreneur Clevio",
    "Lomba Cipta Game Nasional",
    "Ideas Become Real.",
    "AI &amp; Digital Projects",
    "Temukan cerita dari ruang belajar Clevio, karya anak, kegiatan komunitas, serta berbagai insight tentang teknologi, pendidikan, kreativitas, dan masa depan anak.",
    "Subscribe YouTube",
  ];

  requiredCopy.forEach((copy) => assert.ok(template.includes(copy), `Missing revised copy: ${copy}`));
  assert.match(template, /href="#free-trial"[^>]*><span>Coba Free Trial<\/span>/);
});
