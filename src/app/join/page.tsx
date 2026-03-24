import type { Metadata } from "next";
import { JoinClient } from "./client";

export const metadata: Metadata = {
  title: "Join Creator Hive — Apply for Access",
  description: "Creator Hive is invite-only. Apply to join the world's most vetted creative talent platform.",
  openGraph: {
    title: "Join Creator Hive",
    description: "Apply for access to the world's most vetted creative talent platform.",
    url: "https://creatorhive.ae/join",
  },
};

export default function JoinPage() {
  return <JoinClient />;
}
