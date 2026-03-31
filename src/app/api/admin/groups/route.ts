import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validations";

const DEFAULT_LINK_SLUG = "vendas";

async function getDefaultLink() {
  return prisma.link.findUnique({ where: { slug: DEFAULT_LINK_SLUG } });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await getDefaultLink();
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const groups = await prisma.group.findMany({
    where: { linkId: link.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await getDefaultLink();
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = groupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      linkId: link.id,
      name: parsed.data.name,
      inviteCode: parsed.data.inviteCode,
      slug: parsed.data.slug,
      active: parsed.data.active ?? true,
    },
  });

  return NextResponse.json(group, { status: 201 });
}
