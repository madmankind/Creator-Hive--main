import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/?signin=required");

  return <DocumentsClient />;
}
