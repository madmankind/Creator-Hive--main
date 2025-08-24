"use client";
import { CreatorCard } from "@/components/cards/CreatorCard";
import { FilterBar } from "@/components/filters/FilterBar";
import { useFilters, Role } from "@/store/useFilters";

const MOCK = Array.from({ length: 8 }).map((_, i) => ({
  name: ["Layla", "Omar", "Yasmin", "Khalid", "Noor", "Hassan", "Aisha", "Zayed"][i % 8] + " " + (i + 1),
  avatar: "/vercel.svg",
  role: ["Motion Designer", "Photographer", "UGC Creator", "Art Director"][i % 4],
  rate: 650 + i * 40,
  accent: (i % 2 ? "cyan" : "purple") as "purple" | "cyan",
}));

export default function CreatorsPage() {
  const { query, roles, minRate, maxRate, availability } = useFilters();
  const filtered = MOCK.filter((c) => {
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.role.toLowerCase().includes(query.toLowerCase())) return false;
    if (roles.length && !roles.includes(c.role as Role)) return false;
    if (typeof minRate === "number" && c.rate < minRate) return false;
    if (typeof maxRate === "number" && c.rate > maxRate) return false;
    if (availability && availability !== "Open") return true; // demo stub: only Open/other split
    return true;
  });
  return (
    <main className="min-h-screen">
      <FilterBar />
      <section className="container py-10">
        <h1 className="text-3xl font-semibold">Top Creators</h1>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((c) => (
            <CreatorCard key={c.name} name={c.name} avatar={c.avatar} role={c.role} rate={c.rate} accent={c.accent} />
          ))}
        </div>
      </section>
    </main>
  );
}

