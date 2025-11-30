import prisma from "@/lib/db";
export const runtime = "nodejs";

export async function GET() {
    const weeklyCount = await prisma.weeklyPromotion.count();
    const specialsCount = await prisma.specialPromotion.count();
    return Response.json({ok:true, weeklyCount, specialsCount})
    
}