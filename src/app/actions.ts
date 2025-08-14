"use server";
import { createInvoice, createPaymentLink, createProject } from "@/lib/mock";

export async function actionCreatePaymentLink(data: { amount: number; email: string; description?: string; dueDate?: string }) {
  return createPaymentLink(data);
}

export async function actionCreateInvoice(data: { amount: number; client: string; dueDate?: string }) {
  return createInvoice(data);
}

export async function actionCreateProject(data: { name: string; client: string; milestones: Array<{ name: string; amount: number }> }) {
  return createProject(data);
}


