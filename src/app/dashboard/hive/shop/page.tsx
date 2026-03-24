import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { HiveShopStorefront } from "@/components/hive/HiveShopStorefront";

export default async function HiveShopPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/?signin=required");

  return <HiveShopStorefront />;
}
