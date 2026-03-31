import { prisma } from "@/lib/prisma";

export class NotFoundError extends Error {
  constructor() {
    super("Link not found");
  }
}

export class NoDestinationError extends Error {
  constructor() {
    super("No active destination configured");
  }
}

export interface RedirectResult {
  url: string;
  linkId: string;
  sellerId?: string;
  groupId?: string;
  mode: string;
}

export async function resolveRedirect(
  slug: string,
  campaignParam: string | null
): Promise<RedirectResult> {
  const link = await prisma.link.findUnique({
    where: { slug },
    include: {
      sellers: { where: { active: true }, orderBy: { createdAt: "asc" } },
      groups: { where: { active: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!link) throw new NotFoundError();

  const { mode } = link;

  // Pinning via ?c= parameter
  if (campaignParam) {
    if (mode === "NORMAL") {
      const pinned = link.sellers.find((s) => s.slug === campaignParam);
      if (pinned) {
        await prisma.seller.update({
          where: { id: pinned.id },
          data: { clickCount: { increment: 1 } },
        });
        return {
          url: buildWaMe(pinned.phone),
          linkId: link.id,
          sellerId: pinned.id,
          mode,
        };
      }
    } else {
      const pinned = link.groups.find((g) => g.slug === campaignParam);
      if (pinned) {
        await prisma.group.update({
          where: { id: pinned.id },
          data: { clickCount: { increment: 1 } },
        });
        return {
          url: buildGroupUrl(pinned.inviteCode),
          linkId: link.id,
          groupId: pinned.id,
          mode,
        };
      }
    }
    // ?c= didn't match anything — fall through to round-robin
  }

  // Round-robin — NORMAL mode → sellers
  if (mode === "NORMAL") {
    const sellers = link.sellers;
    if (sellers.length === 0) throw new NoDestinationError();

    const idx = link.currentSellerIndex % sellers.length;
    const chosen = sellers[idx];

    await prisma.link.update({
      where: { id: link.id },
      data: { currentSellerIndex: idx + 1 },
    });
    await prisma.seller.update({
      where: { id: chosen.id },
      data: { clickCount: { increment: 1 } },
    });

    return {
      url: buildWaMe(chosen.phone),
      linkId: link.id,
      sellerId: chosen.id,
      mode,
    };
  }

  // Round-robin — LAUNCH mode → groups
  if (mode === "LAUNCH") {
    const groups = link.groups;
    if (groups.length === 0) throw new NoDestinationError();

    const idx = link.currentSellerIndex % groups.length;
    const chosen = groups[idx];

    await prisma.link.update({
      where: { id: link.id },
      data: { currentSellerIndex: idx + 1 },
    });
    await prisma.group.update({
      where: { id: chosen.id },
      data: { clickCount: { increment: 1 } },
    });

    return {
      url: buildGroupUrl(chosen.inviteCode),
      linkId: link.id,
      groupId: chosen.id,
      mode,
    };
  }

  throw new Error(`Unknown mode: ${mode}`);
}

function buildWaMe(phone: string): string {
  const message = "Olá, vim pelo link!";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildGroupUrl(inviteCode: string): string {
  return `https://chat.whatsapp.com/${inviteCode}`;
}
