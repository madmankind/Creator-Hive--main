import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BookingsClient from "./BookingsClient";

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/?signin=required");
  return <BookingsClient />;
}
