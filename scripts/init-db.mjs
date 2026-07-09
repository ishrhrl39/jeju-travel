import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

function loadEnvLocal() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    process.env[key] = value;
  }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL 환경 변수가 필요합니다.");
  process.exit(1);
}

const schemaPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "schema.sql",
);
const schema = readFileSync(schemaPath, "utf8");

const url = new URL(databaseUrl);
  const usesPooler = url.port === "6543";

const sql = postgres(databaseUrl, {
  ssl: "require",
  max: 1,
  prepare: usesPooler,
});

try {
  await sql.unsafe(schema);
  console.log("Database schema initialized successfully.");

  const seedPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "supabase",
    "seed.sql",
  );
  const seed = readFileSync(seedPath, "utf8");
  await sql.unsafe(seed);
  console.log("Database seed applied successfully.");
} catch (error) {
  console.error("Failed to initialize database schema:", error);

  if (error instanceof Error && error.message.includes("ENOTFOUND")) {
    console.error("");
    console.error(
      "Direct host(db.*.supabase.co)는 Windows/IPv4 환경에서 연결되지 않을 수 있습니다.",
    );
    console.error(
      "Supabase 대시보드 -> Project Settings -> Database -> Connection pooling 의 Session mode URI를 DATABASE_URL에 사용하세요.",
    );
  }

  process.exit(1);
} finally {
  await sql.end();
}
