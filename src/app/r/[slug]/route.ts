import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRedirect, NotFoundError, NoDestinationError } from "@/lib/redirect";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const campaign = new URL(req.url).searchParams.get("c");

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;
  const userAgent = req.headers.get("user-agent") ?? null;

  try {
    const result = await resolveRedirect(slug, campaign);

    // Fire-and-forget click log — don't await so redirect is instant
    prisma.click
      .create({
        data: {
          linkId: result.linkId,
          sellerId: result.sellerId ?? null,
          groupId: result.groupId ?? null,
          campaign,
          ip,
          userAgent,
          mode: result.mode,
        },
      })
      .catch(console.error);

    return NextResponse.redirect(result.url, { status: 302 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return new NextResponse("Link não encontrado", { status: 404 });
    }
    if (err instanceof NoDestinationError) {
      return new NextResponse("Nenhum destino ativo configurado", { status: 503 });
    }
    console.error(err);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
