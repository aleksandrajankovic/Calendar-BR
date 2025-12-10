import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST() {
  try {
    revalidateTag("calendar-calendar-data");

    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error clearing calendar cache:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
