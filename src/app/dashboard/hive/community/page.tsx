import { redirect } from "next/navigation";

export default function LegacyHiveCommunityRedirect() {
  redirect("/dashboard/hive");
}
