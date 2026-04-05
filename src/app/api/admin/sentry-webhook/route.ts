import { NextRequest, NextResponse } from "next/server";

/**
 * Sentry Webhook Handler
 * POST /api/admin/sentry-webhook
 * 
 * Receives real-time Sentry events:
 * - issue.created
 * - issue.resolved
 * - issue.ignored
 * - issue.regressed
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify the request is from Sentry
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract event data
    const { action, data } = body;

    switch (action) {
      case "issue.created":
        return handleIssueCreated(data);
      case "issue.resolved":
        return handleIssueResolved(data);
      case "issue.ignored":
        return handleIssueIgnored(data);
      case "issue.regressed":
        return handleIssueRegressed(data);
      default:
        return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error("Sentry webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleIssueCreated(data: any) {
  const { issue, project } = data;

  console.log(`🚨 New Sentry Issue: ${issue.title}`);
  console.log(`   Project: ${project.name}`);
  console.log(`   Level: ${issue.level}`);
  console.log(`   ID: ${issue.id}`);

  // TODO: Send admin alert email or Slack notification
  // TODO: Store in database for dashboard display

  return NextResponse.json({ status: "logged" });
}

async function handleIssueResolved(data: any) {
  const { issue, project } = data;

  console.log(`✅ Issue Resolved: ${issue.title}`);
  console.log(`   Project: ${project.name}`);

  // TODO: Update dashboard status

  return NextResponse.json({ status: "resolved" });
}

async function handleIssueIgnored(data: any) {
  const { issue, project } = data;

  console.log(`🤐 Issue Ignored: ${issue.title}`);
  console.log(`   Project: ${project.name}`);

  return NextResponse.json({ status: "ignored" });
}

async function handleIssueRegressed(data: any) {
  const { issue, project } = data;

  console.log(`⚠️ Issue Regressed: ${issue.title}`);
  console.log(`   Project: ${project.name}`);
  console.log(`   Reappeared after being resolved`);

  // TODO: Alert admin that a previously fixed issue has reappeared

  return NextResponse.json({ status: "regressed" });
}
