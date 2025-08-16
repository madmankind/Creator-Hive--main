"use client";
import { useState } from "react";

export function Roles() {
  const roles = [
    {
      name: "UGC Creator",
      bullets: ["Short video, hooks, mobile-native", "Platform optimization", "Authentic storytelling"]
    },
    {
      name: "Videographer", 
      bullets: ["Shoots, edits, color, delivery", "Multi-camera setups", "Post-production workflow"]
    },
    {
      name: "Animator",
      bullets: ["2D/3D motion for ads & explainers", "Character animation", "Motion graphics"]
    },
    {
      name: "Creative Director",
      bullets: ["Concept, boards, treatment", "Brand strategy", "Campaign oversight"]
    },
    {
      name: "Copywriter",
      bullets: ["Scripts, hooks, ad copy, CTAs", "Brand voice development", "Performance optimization"]
    },
    {
      name: "Social Manager",
      bullets: ["Calendars, posting, reporting", "Community engagement", "Analytics & insights"]
    }
  ];

  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Video", "Creative", "Strategy"];

  return (
    <section className="container py-24">
      <h2 className="text-3xl font-bold">Roles & results you need</h2>
      <p className="mt-4 text-[color:var(--color-muted-foreground)]">
        Start small and scale as you grow—or spin up a pod of specialists.
      </p>
      
      <div className="mt-8 flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              activeFilter === filter
                ? "bg-[color:var(--accent-to)] text-black"
                : "bg-[color:var(--grey-800)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--grey-700)]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.name} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)] p-6 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,123,255,0.15)] transition">
            <h3 className="font-medium text-lg">{role.name}</h3>
            <ul className="mt-4 space-y-2">
              {role.bullets.map((bullet, i) => (
                <li key={i} className="text-sm text-[color:var(--color-muted-foreground)] flex items-start gap-2">
                  <span className="text-[color:var(--accent-to)] mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
