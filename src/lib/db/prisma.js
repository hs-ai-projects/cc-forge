import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env";

const globalForPrisma = globalThis;

const logLevels = process.env.NODE_ENV === "development"
  ? (process.env.PRISMA_LOG_QUERIES === "1" ? ["query", "error", "warn"] : ["error", "warn"])
  : ["error"];

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: logLevels });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
