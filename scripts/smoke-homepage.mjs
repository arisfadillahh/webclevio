const url = process.argv[2] ?? "http://127.0.0.1:3000";

try {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(8_000),
  });
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`unexpected HTTP status ${response.status}`);
  }

  const requiredCopy = [
    "Di Clevio, teknologi adalah alat.",
    "Karya Anak Layak untuk Dilihat Dunia",
    "Gallery Karya",
  ];
  const missing = requiredCopy.filter((copy) => !html.includes(copy));

  if (missing.length > 0) {
    throw new Error(`missing homepage markers: ${missing.join(", ")}`);
  }

  console.log(`smoke test passed: ${response.status} ${url}`);
} catch (error) {
  console.error(`smoke test failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
