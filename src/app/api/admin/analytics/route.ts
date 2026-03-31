import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_LINK_SLUG = "vendas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await prisma.link.findUnique({ where: { slug: DEFAULT_LINK_SLUG } });
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
  };

  const where = {
    linkId: link.id,
    ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
  };

  const [total, clicks, bySeller, byGroup, byCampaign] = await Promise.all([
    prisma.click.count({ where }),
    prisma.click.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        seller: { select: { name: true } },
        group: { select: { name: true } },
      },
    }),
    prisma.click.groupBy({
      by: ["sellerId"],
      where: { ...where, sellerId: { not: null } },
      _count: { id: true },
    }),
    prisma.click.groupBy({
      by: ["groupId"],
      where: { ...where, groupId: { not: null } },
      _count: { id: true },
    }),
    prisma.click.groupBy({
      by: ["campaign"],
      where: { ...where, campaign: { not: null } },
      _count: { id: true },
    }),
  ]);

  // Enrich seller stats with names
  const sellerIds = bySeller.map((r) => r.sellerId).filter(Boolean) as string[];
  const sellerMap = sellerIds.length
    ? Object.fromEntries(
        (await prisma.seller.findMany({ where: { id: { in: sellerIds } }, select: { id: true, name: true } })).map(
          (s) => [s.id, s.name]
        )
      )
    : {};

  const groupIds = byGroup.map((r) => r.groupId).filter(Boolean) as string[];
  const groupMap = groupIds.length
    ? Object.fromEntries(
        (await prisma.group.findMany({ where: { id: { in: groupIds } }, select: { id: true, name: true } })).map(
          (g) => [g.id, g.name]
        )
      )
    : {};

  return NextResponse.json({
    total,
    clicks,
    bySeller: bySeller.map((r) => ({
      sellerId: r.sellerId,
      name: sellerMap[r.sellerId!] ?? "—",
      count: r._count.id,
    })),
    byGroup: byGroup.map((r) => ({
      groupId: r.groupId,
      name: groupMap[r.groupId!] ?? "—",
      count: r._count.id,
    })),
    byCampaign: byCampaign.map((r) => ({
      campaign: r.campaign ?? "(direto)",
      count: r._count.id,
    })),
  });
}
