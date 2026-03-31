/**
 * Setup script — run with: node setup.js
 *
 * This script:
 * 1. Runs the Prisma migration (creates the SQLite database)
 * 2. Seeds the admin user and default link
 *
 * IMPORTANT: Run this from a local copy of the project
 * (not directly from Google Drive, as npm may have issues with that path).
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const prismaBin = path.join(__dirname, "node_modules", ".bin", "prisma");
const env = { ...process.env, DATABASE_URL: "file:./prisma/dev.db" };

console.log("=== Link Direction Setup ===\n");

// 1. Run Prisma migrate
console.log("1. Running database migration...");
try {
  execSync(`node ${path.join(__dirname, "node_modules/prisma/build/index.js")} migrate deploy`, {
    stdio: "inherit",
    env,
    cwd: __dirname,
  });
} catch {
  // Try with npx fallback
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env, cwd: __dirname });
  } catch (e2) {
    console.error("Migration failed. Run manually: npx prisma migrate dev --name init");
  }
}

// 2. Generate Prisma client
console.log("\n2. Generating Prisma client...");
try {
  execSync(`node ${path.join(__dirname, "node_modules/prisma/build/index.js")} generate`, {
    stdio: "inherit",
    env,
    cwd: __dirname,
  });
} catch {
  execSync("npx prisma generate", { stdio: "inherit", env, cwd: __dirname });
}

// 3. Seed data using better-sqlite3
console.log("\n3. Seeding database...");
try {
  const Database = require("better-sqlite3");
  const bcrypt = require("bcryptjs");
  const { nanoid } = require("nanoid");

  const dbPath = path.join(__dirname, "prisma", "dev.db");
  const db = new Database(dbPath);

  const passwordHash = bcrypt.hashSync("admin123", 12);

  db.exec(`
    INSERT OR IGNORE INTO User (id, email, passwordHash, createdAt)
    VALUES ('${nanoid()}', 'admin@link.local', '${passwordHash}', datetime('now'));

    INSERT OR IGNORE INTO Link (id, slug, mode, currentSellerIndex, createdAt)
    VALUES ('${nanoid()}', 'vendas', 'NORMAL', 0, datetime('now'));
  `);

  db.close();

  console.log("\n✓ Seed concluído!");
  console.log("  Admin: admin@link.local");
  console.log("  Senha: admin123");
  console.log("  Link público: http://localhost:3000/r/vendas");
  console.log("\nRode: npm run dev");
} catch (err) {
  console.error("Seed falhou:", err.message);
  console.log("Seed manual: insira um usuário admin diretamente no banco com bcrypt.");
}
