"use server";
import { createInvoice, createPaymentLink, createProject } from "@/lib/mock";

export async function actionCreatePaymentLink() {
  return createPaymentLink();
}

export async function actionCreateInvoice() {
  return createInvoice();
}

export async function actionCreateProject(data: { name: string; client: string; milestones: Array<{ name: string; amount: number }> }) {
  return createProject(data);
}


