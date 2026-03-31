import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:prisma/dev.db",
});
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
