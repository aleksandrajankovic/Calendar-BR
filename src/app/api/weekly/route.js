export const runtime = "nodejs";
import prisma from "@/lib/db";

export async function GET() {
  const rows = await prisma.weeklyPromotion.findMany({
    orderBy: { weekday: "asc" },
  });
  return Response.json(rows);
}
