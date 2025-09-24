"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { getCharacterByName } from "@/lib/characters";

export default function RightPanel() {
  const params = useSearchParams();
  const name = (params.get("character") || "Bronn").trim() || "Bronn";
  const character = getCharacterByName(name) || {
    name,
    image: "/images/Bronn.jpeg",
    sections: [],
  } as any;

  return (
    <aside className="card p-4 sticky top-6">
      <h3 className="text-sm font-semibold">Character</h3>
      <p className="mt-1 text-sm">{character.name}</p>

      <div className="hr-muted my-4" />

      <div className="mt-4 flex items-center gap-3">
        <img
          src={character.image}
          alt={`${character.name} avatar`}
          className="w-[80px] h-[80px] rounded-full items-center]"
        />
      </div>

      <p className="mt-4 text-sm text-muted leading-6">
        Chatting with {character.name}. Ask naturally; responses reflect their persona.
      </p>

      <div className="hr-muted my-4" />

      <h4 className="text-sm font-semibold">How to use this chat</h4>
      <ul className="mt-2 text-sm text-muted space-y-2 leading-6">
        <li>
          <b>Normal mode:</b> Ask naturally. Answers stay concise and actionable.
        </li>
        <li>
          <b>OCC mode (Operator Command Channel):</b> Prefix with
          <code className="px-1 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] ml-1">/occ</code>
          for step-by-step outputs.
        </li>
        <li>
          Tip: State constraints (time, tools, limits) for better responses.
        </li>
      </ul>
    </aside>
  );
}
