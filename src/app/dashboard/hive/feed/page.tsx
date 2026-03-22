import { redirect } from "next/navigation";

export default function LegacyHiveFeedRedirect() {
  redirect("/dashboard/hive");
}
