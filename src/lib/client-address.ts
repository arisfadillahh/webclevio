function normalizeAddress(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    return (end > 1 ? trimmed.slice(1, end) : trimmed).toLowerCase();
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(trimmed)) {
    return trimmed.slice(0, trimmed.lastIndexOf(":"));
  }
  return trimmed.toLowerCase();
}

function ipv4Parts(address: string) {
  const match = address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return null;
  return parts;
}

function isTrustedProxyAddress(address: string) {
  const ip = normalizeAddress(address);
  if (ip.startsWith("::ffff:")) return isTrustedProxyAddress(ip.slice("::ffff:".length));
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;
  if (ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) return true;

  const parts = ipv4Parts(ip);
  if (!parts) return false;
  const [first, second] = parts;
  if (first === 10 || first === 127 || first === 0) return true;
  if (first === 192 && second === 168) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 169 && second === 254) return true;
  return false;
}

export function selectClientAddress(forwardedFor: string | null, realIp: string | null) {
  const forwarded = (forwardedFor ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  for (let index = forwarded.length - 1; index >= 0; index -= 1) {
    if (!isTrustedProxyAddress(forwarded[index])) return normalizeAddress(forwarded[index]);
  }

  const real = realIp?.trim();
  if (real && !isTrustedProxyAddress(real)) return normalizeAddress(real);
  if (forwarded[0]) return normalizeAddress(forwarded[0]);
  if (real) return normalizeAddress(real);
  return "unknown";
}
