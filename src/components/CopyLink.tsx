"use client";

import { useState } from "react";

export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 truncate">
        {url}
      </code>
      <button
        onClick={copy}
        className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition whitespace-nowrap"
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
