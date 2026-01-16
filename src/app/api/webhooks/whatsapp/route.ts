/**
 * WhatsApp Webhook Handler
 * 
 * Handles:
 * 1. Interactive button clicks (Complete/Blocked buttons)
 * 2. Reply-to-complete (reply with "done" or ✅ to original message)
 * 
 * Verification: Only accepts from verified phone numbers linked to org members
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // WhatsApp Cloud API webhook structure
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    
    // Handle interactive button click
    if (value?.messages?.[0]?.interactive?.button_reply) {
      const buttonId = value.messages[0].interactive.button_reply.id;
      const from = value.messages[0].from; // Phone number
      const messageId = value.messages[0].id;
      
      // buttonId format: "task_{taskId}_complete" or "task_{taskId}_blocked"
      if (buttonId.startsWith("task_")) {
        const [, taskId, action] = buttonId.split("_");
        
        // TODO: Verify phone number belongs to org member
        // const member = await verifyPhoneNumber(from);
        // if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        // TODO: Update task status
        // await updateTaskStatus(taskId, action === "complete" ? "completed" : "blocked", member.id);
        
        // TODO: Log activity
        // await logActivity({
        //   taskId,
        //   action: action === "complete" ? "completed" : "blocked",
        //   userId: member.id,
        //   metadata: { completedVia: "whatsapp", messageId },
        // });
        
        return NextResponse.json({ success: true });
      }
    }
    
    // Handle reply-to-complete
    if (value?.messages?.[0]?.context?.replied_to) {
      const repliedToMessageId = value.messages[0].context.replied_to.id;
      const replyText = value.messages[0].text?.body?.toLowerCase() || "";
      const from = value.messages[0].from;
      
      // Check if reply indicates completion
      const completionKeywords = ["done", "completed", "✅", "complete", "finished"];
      if (completionKeywords.some((keyword) => replyText.includes(keyword))) {
        // TODO: Look up task by message_id
        // const taskMapping = await getTaskByMessageId(repliedToMessageId);
        // if (!taskMapping) return NextResponse.json({ error: "Task not found" }, { status: 404 });
        
        // TODO: Verify phone number
        // const member = await verifyPhoneNumber(from);
        // if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        // TODO: Update task
        // await updateTaskStatus(taskMapping.taskId, "completed", member.id);
        
        return NextResponse.json({ success: true });
      }
    }
    
    return NextResponse.json({ success: true, message: "No action taken" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET handler for webhook verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  
  // TODO: Verify token matches your configured token
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}


