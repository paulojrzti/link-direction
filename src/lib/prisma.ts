import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildPool() {
  const raw = process.env.DATABASE_URL!;
  const parsed = new URL(raw.replace(/^postgres:\/\//, "postgresql://"));
  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("pgbouncer");
  const connectionString = parsed.toString().replace(/^postgresql:\/\//, "postgres://");

  return new Pool({
    connectionString,
    ssl: raw.includes("supabase") ? { rejectUnauthorized: false } : undefined,
  });
}

function createPrismaClient() {
  const adapter = new PrismaPg(buildPool());
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
