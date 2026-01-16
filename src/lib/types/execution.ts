/**
 * Execution Hub Data Model
 * 
 * Campaign -> Deliverables -> Tasks -> Assignments -> ActivityLog
 */

export type TaskStatus = "open" | "in_progress" | "blocked" | "completed" | "overdue" | "cancelled";
export type TaskType = "contract" | "brief" | "production" | "delivery" | "review" | "go_live" | "payment" | "other";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  campaignId: string;
  deliverableId?: string; // Optional: task may be campaign-level
  type: TaskType;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: Date | null;
  assigneeId?: string; // Team member ID
  relatedEntityId?: string; // e.g., contract ID, deliverable ID
  dependencies?: string[]; // Array of task IDs that must complete first
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  completedBy?: string; // User ID who completed it
}

export interface Assignment {
  id: string;
  taskId: string;
  assigneeId: string; // Team member ID
  assignedBy: string; // User ID who assigned
  assignedAt: Date;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  campaignId: string;
  action: "created" | "assigned" | "updated" | "completed" | "blocked" | "unblocked" | "commented";
  userId: string;
  userName: string;
  userEmail: string;
  metadata?: Record<string, any>; // e.g., { completedVia: "whatsapp", messageId: "..." }
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "pm" | "member";
  phone?: string; // For WhatsApp linking
  slackUserId?: string; // For Slack linking
  avatarUrl?: string;
  createdAt: Date;
}

export interface ChecklistTemplate {
  id: string;
  name: string; // e.g., "Kickoff", "Contracting", "Production"
  campaignId: string;
  items: ChecklistItem[];
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  autoCompleteEvent?: string; // e.g., "contract_signed", "deliverable_approved"
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  order: number;
}

export interface Resource {
  id: string;
  campaignId: string;
  type: "drive_folder" | "whatsapp_group" | "slack_channel" | "brief_doc" | "credentials" | "other";
  title: string;
  url?: string;
  ownerId?: string;
  lastVerifiedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * Execution Hub View Queries
 */
export interface ExecutionHubData {
  attention: Task[]; // status = blocked OR overdue OR missing_dependency
  nextUp: Task[]; // status = open AND dueAt within next X days, sorted by dueAt
  updates: ActivityLog[]; // Recent events/notes (not tasks)
  resources: Resource[]; // Assets & Links
  checklist: {
    template: ChecklistTemplate;
    completionPercent: number;
    nextAction?: ChecklistItem;
  };
}


