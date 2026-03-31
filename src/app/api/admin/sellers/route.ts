import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sellerSchema } from "@/lib/validations";

const DEFAULT_LINK_SLUG = "vendas";

async function getDefaultLink() {
  return prisma.link.findUnique({ where: { slug: DEFAULT_LINK_SLUG } });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await getDefaultLink();
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const sellers = await prisma.seller.findMany({
    where: { linkId: link.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(sellers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await getDefaultLink();
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = sellerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const seller = await prisma.seller.create({
    data: {
      linkId: link.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      slug: parsed.data.slug,
      active: parsed.data.active ?? true,
    },
  });

  return NextResponse.json(seller, { status: 201 });
}
