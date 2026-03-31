"use client";

import { useEffect, useState } from "react";

interface Seller {
  id: string;
  name: string;
  phone: string;
  slug: string;
  active: boolean;
  clickCount: number;
}

const empty = { name: "", phone: "", slug: "", active: true };

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/admin/sellers");
    if (res.ok) setSellers(await res.json());
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = editing ? `/api/admin/sellers/${editing}` : "/api/admin/sellers";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error));
      return;
    }

    setForm(empty);
    setEditing(null);
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remover vendedor?")) return;
    await fetch(`/api/admin/sellers/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleActive(seller: Seller) {
    await fetch(`/api/admin/sellers/${seller.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !seller.active }),
    });
    setSellers((prev) =>
      prev.map((s) => (s.id === seller.id ? { ...s, active: !s.active } : s))
    );
  }

  function startEdit(s: Seller) {
    setForm({ name: s.name, phone: s.phone, slug: s.slug, active: s.active });
    setEditing(s.id);
    setShowForm(true);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vendedores</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie os vendedores para o modo normal.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          + Adicionar
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700">{editing ? "Editar Vendedor" : "Novo Vendedor"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Telefone (ex: 5511999990000)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Slug (para ?c=slug)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {sellers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">Nenhum vendedor cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Nome</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Telefone</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Slug</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium">Cliques</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium">Ativo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{s.slug}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700">{s.clickCount}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {s.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(s)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => remove(s.id)} className="text-red-500 hover:underline">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>
  );
}
