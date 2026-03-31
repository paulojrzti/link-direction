import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { modeSchema } from "@/lib/validations";

const DEFAULT_LINK_SLUG = "vendas";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await prisma.link.findUnique({ where: { slug: DEFAULT_LINK_SLUG } });
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  return NextResponse.json({ mode: link.mode });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = modeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const link = await prisma.link.update({
    where: { slug: DEFAULT_LINK_SLUG },
    data: {
      mode: parsed.data.mode,
      currentSellerIndex: 0, // Reset round-robin on mode switch
    },
  });

  return NextResponse.json({ mode: link.mode });
}
