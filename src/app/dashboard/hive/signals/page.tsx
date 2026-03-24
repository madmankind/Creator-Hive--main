import { redirect } from "next/navigation";

export default function LegacyHiveSignalsRedirect() {
  redirect("/dashboard/hive");
}
