import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Strip sslmode/pgbouncer from URL so the ssl object below takes full control
const rawUrl = process.env.DATABASE_URL!.replace(/^postgres:\/\//, "postgresql://");
const parsed = new URL(rawUrl);
parsed.searchParams.delete("sslmode");
parsed.searchParams.delete("pgbouncer");
const connectionString = parsed.toString().replace(/^postgresql:\/\//, "postgres://");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@link.local" },
    update: {},
    create: {
      email: "admin@link.local",
      passwordHash,
    },
  });

  await prisma.link.upsert({
    where: { slug: "vendas" },
    update: {},
    create: {
      slug: "vendas",
      mode: "NORMAL",
      currentSellerIndex: 0,
    },
  });

  console.log("Seed concluído.");
  console.log("  Admin: admin@link.local / admin123");
  console.log("  Link: /r/vendas");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
