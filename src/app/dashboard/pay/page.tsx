import { redirect } from "next/navigation";

export default function PayPage() {
  redirect("/dashboard/campaigns?mode=pay");
}
