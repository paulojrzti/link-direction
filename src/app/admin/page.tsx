import { prisma } from "@/lib/prisma";
import ModeToggle from "@/components/ModeToggle";
import CopyLink from "@/components/CopyLink";

const DEFAULT_SLUG = "vendas";

export default async function DashboardPage() {
  const link = await prisma.link.findUnique({
    where: { slug: DEFAULT_SLUG },
    include: {
      _count: {
        select: {
          sellers: { where: { active: true } },
          groups: { where: { active: true } },
          clicks: true,
        },
      },
    },
  });

  if (!link) {
    return (
      <div className="text-red-600">
        Link &quot;{DEFAULT_SLUG}&quot; não encontrado. Execute o seed primeiro.
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const clicksToday = await prisma.click.count({
    where: { linkId: link.id, createdAt: { gte: todayStart } },
  });

  const publicUrl = `${process.env.NEXTAUTH_URL ?? ""}/r/${DEFAULT_SLUG}`;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie o modo e veja o desempenho do seu link.</p>
      </div>

      {/* Mode Toggle */}
      <ModeToggle currentMode={link.mode as "NORMAL" | "LAUNCH"} />

      {/* Public URL */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-2">Seu link público</p>
        <CopyLink url={publicUrl} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Cliques hoje" value={clicksToday} />
        <StatCard label="Vendedores ativos" value={link._count.sellers} />
        <StatCard label="Grupos ativos" value={link._count.groups} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
