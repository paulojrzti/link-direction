"use client";

import { useState } from "react";

interface Props {
  currentMode: "NORMAL" | "LAUNCH";
}

export default function ModeToggle({ currentMode }: Props) {
  const [mode, setMode] = useState<"NORMAL" | "LAUNCH">(currentMode);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = mode === "NORMAL" ? "LAUNCH" : "NORMAL";
    setLoading(true);
    await fetch("/api/admin/mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: next }),
    });
    setMode(next);
    setLoading(false);
  }

  const isLaunch = mode === "LAUNCH";

  return (
    <div
      className={`rounded-2xl p-6 flex items-center justify-between transition-all ${
        isLaunch
          ? "bg-amber-50 border-2 border-amber-400"
          : "bg-green-50 border-2 border-green-400"
      }`}
    >
      <div>
        <p className={`text-xl font-bold ${isLaunch ? "text-amber-700" : "text-green-700"}`}>
          Modo {isLaunch ? "LANÇAMENTO" : "NORMAL"}
        </p>
        <p className={`text-sm mt-1 ${isLaunch ? "text-amber-600" : "text-green-600"}`}>
          {isLaunch
            ? "Redirecionando para grupos de WhatsApp"
            : "Redirecionando para vendedores individuais (round-robin)"}
        </p>
      </div>

      <button
        onClick={toggle}
        disabled={loading}
        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${
          isLaunch
            ? "bg-amber-500 text-white hover:bg-amber-600"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {loading ? "Alterando..." : `Mudar para ${isLaunch ? "NORMAL" : "LANÇAMENTO"}`}
      </button>
    </div>
  );
}
