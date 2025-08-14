export type ActivityItem = {
  id: string;
  client: string;
  project: string;
  amount: number;
  timestamp: string;
  status: "paid" | "pending" | "dispute";
};

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    client: "Brand A",
    project: "Campaign Shoot",
    amount: 2550,
    timestamp: new Date().toISOString(),
    status: "paid",
  },
  {
    id: "2",
    client: "Agency X",
    project: "Quarterly Retainer",
    amount: 1800,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "pending",
  },
];

export async function createPaymentLink(_data: { amount: number; email: string; description?: string; dueDate?: string }) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: Math.random().toString(36).slice(2), url: `https://creator.hi/pay/${Date.now()}` };
}

export async function createInvoice(_data: { amount: number; client: string; dueDate?: string }) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: Math.random().toString(36).slice(2), status: "draft" as const };
}

export async function createProject(data: { name: string; client: string; milestones: Array<{ name: string; amount: number }> }) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: Math.random().toString(36).slice(2), ...data };
}


