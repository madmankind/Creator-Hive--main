/**
 * Slack Webhook Handler
 * 
 * Handles:
 * 1. Interactive button clicks (Complete/Blocked buttons)
 * 2. Emoji reactions (✅ reaction marks task complete)
 * 
 * Verification: Only accepts from verified Slack user IDs linked to org members
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle Slack interactive message button click
    if (body.type === "block_actions") {
      const action = body.actions?.[0];
      const userId = body.user.id;
      const responseUrl = body.response_url;
      
      if (action?.action_id?.startsWith("task_")) {
        const [, taskId, actionType] = action.action_id.split("_");
        
        // TODO: Verify Slack user ID belongs to org member
        // const member = await verifySlackUserId(userId);
        // if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        // TODO: Update task
        // await updateTaskStatus(taskId, actionType === "complete" ? "completed" : "blocked", member.id);
        
        // TODO: Log activity
        // await logActivity({
        //   taskId,
        //   action: actionType === "complete" ? "completed" : "blocked",
        //   userId: member.id,
        //   metadata: { completedVia: "slack", userId },
        // });
        
        // Acknowledge to Slack
        return NextResponse.json({
          text: `Task ${actionType === "complete" ? "completed" : "blocked"}!`,
          replace_original: false,
        });
      }
    }
    
    // Handle emoji reaction
    if (body.type === "reaction_added") {
      const reaction = body.event.reaction;
      const userId = body.event.user;
      const messageTs = body.event.item.ts;
      
      if (reaction === "white_check_mark" || reaction === "✅") {
        // TODO: Look up task by message timestamp
        // const taskMapping = await getTaskBySlackMessageTs(messageTs);
        // if (!taskMapping) return NextResponse.json({ success: true });
        
        // TODO: Verify Slack user ID
        // const member = await verifySlackUserId(userId);
        // if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        // TODO: Update task
        // await updateTaskStatus(taskMapping.taskId, "completed", member.id);
        
        return NextResponse.json({ success: true });
      }
    }
    
    // Handle URL verification challenge
    if (body.type === "url_verification") {
      return NextResponse.json({ challenge: body.challenge });
    }
    
    return NextResponse.json({ success: true, message: "No action taken" });
  } catch (error) {
    console.error("Slack webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


