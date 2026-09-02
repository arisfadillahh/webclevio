export function getPostgresSslConfig() {
  if (process.env.DATABASE_SSL !== "require") return undefined;

  const certificate = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n").trim();
  return certificate
    ? { rejectUnauthorized: true, ca: certificate }
    : { rejectUnauthorized: true };
}
