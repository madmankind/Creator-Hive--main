import type { Metadata } from "next";
import { TalentSignupClient } from "./client";

export const metadata: Metadata = {
  title: "Join Creator Hive — Talent Signup",
  description: "Apply to join the Creator Hive network. Get matched with UAE brands and agencies.",
};

export default function TalentSignupPage() {
  return <TalentSignupClient />;
}
