"use client";

import * as React from "react";

const CHARACTER = {
  name: "Bronn of the Blackwater",
  voice: "dry humor",
  style: "concise",
  edge: "pragmatic",
  avatarSrc: "/images/images (1).jpeg", // TODO: replace with your image path
  intro:
    "A sellsword with a sharp tongue and sharper instincts. Bronn keeps things practical, skips fluff, and focuses on what gets results.",
};

export default function RightPanel() {
  return (
    <aside className="card p-4 sticky top-6">
      {/* Header */}
      <h3 className="text-sm font-semibold">Character</h3>
      <p className="mt-1 text-sm">{CHARACTER.name}</p>

      <div className="hr-muted my-4" />

      {/* Traits */}
      <div className="space-y-2">
        <div className="badge">Voice: {CHARACTER.voice}</div>
        <div className="badge">Style: {CHARACTER.style}</div>
        <div className="badge">Edge: {CHARACTER.edge}</div>
      </div>

      {/* Avatar */}
      <div className="mt-4 flex items-center gap-3">
        <img
          src={CHARACTER.avatarSrc}
          alt={`${CHARACTER.name} avatar`}
          className="w-[80px] h-[80px] rounded-full items-center]"
        />
      </div>

      {/* Intro */}
      <p className="mt-4 text-sm text-muted leading-6">{CHARACTER.intro}</p>

      <div className="hr-muted my-4" />

      {/* How to use */}
      <h4 className="text-sm font-semibold">How to use this chat</h4>
      <ul className="mt-2 text-sm text-muted space-y-2 leading-6">
        <li>
          <b>Normal mode:</b> Ask naturally. Bronn will keep answers short,
          actionable, and no-nonsense.
        </li>
        <li>
          <b>OCC mode (Operator Command Channel):</b> Prefix with{" "}
          <code className="px-1 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)]">
            /occ
          </code>{" "}
          for surgical, step-by-step outputs (checklists, commands, exact
          sequences). Great when you want execution-ready instructions.
        </li>
        <li>
          Tip: State constraints (time, tools, limits). Bronn optimizes for the
          fastest viable path.
        </li>
      </ul>
    </aside>
  );
}
