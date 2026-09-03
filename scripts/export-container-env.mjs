import { once } from "node:events";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
await once(process.stdin, "end");

const [container] = JSON.parse(input);
if (!container?.Config?.Env) {
  throw new Error("container environment is unavailable");
}

for (const entry of container.Config.Env) {
  const separator = entry.indexOf("=");
  if (separator < 1) continue;
  const key = entry.slice(0, separator);
  const value = entry.slice(separator + 1);
  if (value.includes("\n")) {
    throw new Error(`environment value for ${key} contains a newline`);
  }
  process.stdout.write(`${key}=${value}\n`);
}
