import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const logLevels = process.env.NODE_ENV === "development"
  ? (process.env.PRISMA_LOG_QUERIES === "1" ? ["query", "error", "warn"] : ["error", "warn"])
  : ["error"];

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: logLevels });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
