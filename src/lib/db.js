// src/lib/db.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

let prisma;

if (!globalForPrisma._prisma) {
  try {
    globalForPrisma._prisma = new PrismaClient();
  } catch (e) {
    console.error("PRISMA INIT ERROR >>>", e);
    throw e;
  }
}

prisma = globalForPrisma._prisma;

export default prisma;
