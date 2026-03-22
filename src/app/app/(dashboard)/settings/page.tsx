import { redirect } from "next/navigation";

export default function LegacyAppSettingsRedirect() {
  redirect("/dashboard/settings");
}
