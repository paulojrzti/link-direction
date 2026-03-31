"use client";

import { useEffect, useState } from "react";

interface Click {
  id: string;
  createdAt: string;
  mode: string;
  campaign: string | null;
  ip: string | null;
  seller: { name: string } | null;
  group: { name: string } | null;
}

interface Analytics {
  total: number;
  clicks: Click[];
  bySeller: { sellerId: string; name: string; count: number }[];
  byGroup: { groupId: string; name: string; count: number }[];
  byCampaign: { campaign: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/admin/analytics?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Histórico de cliques e distribuição.</p>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4 bg-white rounded-xl border border-gray-200 p-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">De</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Até</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50">
          {loading ? "Buscando..." : "Filtrar"}
        </button>
        <button onClick={() => { setFrom(""); setTo(""); setTimeout(load, 0); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Limpar
        </button>
      </div>

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total de Cliques" value={data.total} />
            <StatCard label="Vendedores atingidos" value={data.bySeller.length} />
            <StatCard label="Campanhas" value={data.byCampaign.length} />
          </div>

          {/* By Seller / By Group */}
          <div className="grid grid-cols-2 gap-4">
            {data.bySeller.length > 0 && (
              <DistCard title="Por Vendedor" rows={data.bySeller.map((r) => ({ label: r.name, count: r.count }))} />
            )}
            {data.byGroup.length > 0 && (
              <DistCard title="Por Grupo" rows={data.byGroup.map((r) => ({ label: r.name, count: r.count }))} />
            )}
            {data.byCampaign.length > 0 && (
              <DistCard title="Por Campanha (?c=)" rows={data.byCampaign.map((r) => ({ label: r.campaign, count: r.count }))} />
            )}
          </div>

          {/* Click log */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 font-medium text-sm text-gray-700">
              Últimos {data.clicks.length} cliques
            </div>
            {data.clicks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Nenhum clique registrado.</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Data</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Modo</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Destino</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Campanha</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.clicks.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">{new Date(c.createdAt).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${c.mode === "LAUNCH" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          {c.mode}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {c.seller?.name ?? c.group?.name ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-500 font-mono">{c.campaign ?? "—"}</td>
                      <td className="px-4 py-2 text-gray-400">{c.ip ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
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

function DistCard({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{r.label}</span>
            <span className="font-bold">{r.count}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
