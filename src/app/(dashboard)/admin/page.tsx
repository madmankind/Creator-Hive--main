"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/DataTable";

type User = { id: string; name: string; role: string; briefs: number };

const columns: ColumnDef<User>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { header: "Role", accessorKey: "role" },
  { header: "Briefs", accessorKey: "briefs" },
];

const DATA: User[] = Array.from({ length: 500 }).map((_, i) => ({
  id: `u_${i + 1}`,
  name: `User ${i + 1}`,
  role: i % 3 === 0 ? "CREATOR" : i % 3 === 1 ? "BRAND" : "ADMIN",
  briefs: Math.floor(Math.random() * 12),
}));

export default function AdminPage() {
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold">Admin · Users</h1>
      <div className="mt-6">
        <DataTable columns={columns} data={DATA} height={520} />
      </div>
    </main>
  );
}

