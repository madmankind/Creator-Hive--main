import { getPostHogClient } from "@/lib/posthog";

type AuditProps = Record<string, string | number | boolean | null | undefined>;

/**
 * Best-effort admin action telemetry.
 * Never throw from admin APIs if tracking is unavailable.
 */
export function trackAdminAction(adminUserId: string, action: string, props: AuditProps = {}) {
  try {
    const ph = getPostHogClient();
    ph?.capture({
      distinctId: adminUserId,
      event: "admin_action",
      properties: { action, ...props },
    });
  } catch (error) {
    console.warn("[admin-audit] Failed to capture admin action", { action, error });
  }
}

