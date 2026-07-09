import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;

function getPostgresOptions(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const usesPooler = url.port === "6543";

  return {
    ssl: "require" as const,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: usesPooler,
  };
}

export async function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
  }

  if (!sql) {
    sql = postgres(databaseUrl, getPostgresOptions(databaseUrl));
    await sql`SELECT 1 AS ok`;
  }

  return sql;
}
