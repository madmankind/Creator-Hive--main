/**
 * Booking Order PDF — Creator Hive
 * Matches the CH invoice visual template (CH20260107 reference).
 * Generic pricing, no talent names. A4, jsPDF.
 */

import { jsPDF } from "jspdf";
import { CH_ISSUER, formatInvoiceDate } from "@/lib/invoice";

export interface BookingOrderPdfData {
  orderRef: string;           // e.g. CH20260402001
  issueDate: Date;
  clientName: string;
  clientCompany?: string;
  clientAddress?: string;
  clientTRN?: string;
  packageLabel: string;       // e.g. "UGC Spark — Monthly Retainer"
  scope: string[];            // bullet deliverables
  budgetAed: number;          // pre-VAT
  vatAed: number;
  totalAed: number;
  paymentSchedule: string;    // "50% advance, 50% on completion"
  advanceNote?: string;
}

const MM = { margin: 20, pageW: 210, pageH: 297, contentW: 170 };
const fmtAed = (n: number) => `${n.toLocaleString("en-AE", { minimumFractionDigits: 2 })} AED`;

export function generateBookingOrderPdf(data: BookingOrderPdfData): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { margin, pageW, contentW } = MM;
  let y = margin;

  // ── Header block ─────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const rightX = pageW - margin;
  const issuerLines = [
    CH_ISSUER.name,
    "Block B-B53-050, Sharjah Research Technology",
    "and Innovation Park, Sharjah, UAE",
    CH_ISSUER.email,
    `TRN: ${CH_ISSUER.trn}`,
  ];
  issuerLines.forEach((line) => {
    doc.text(line, rightX, y, { align: "right" });
    y += 5;
  });

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(`Booking Order ${data.orderRef}`, rightX, y + 4, { align: "right" });
  y += 14;

  // Horizontal rule
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Client block ─────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(data.clientName, margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  if (data.clientCompany) { doc.text(data.clientCompany, margin, y); y += 5; }
  if (data.clientAddress) {
    const addrLines = doc.splitTextToSize(data.clientAddress, 80);
    addrLines.forEach((l: string) => { doc.text(l, margin, y); y += 5; });
  }
  if (data.clientTRN) { doc.text(`TRN: ${data.clientTRN}`, margin, y); y += 5; }
  y += 3;

  // ── Dates row ─────────────────────────────────────────────────────────────
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const dateLabels = ["Order Date", "Valid Until", "Delivery Start"];
  const dueDate = new Date(data.issueDate);
  dueDate.setDate(dueDate.getDate() + 7);
  const startDate = new Date(data.issueDate);
  startDate.setDate(startDate.getDate() + 14);
  const dateVals = [
    formatInvoiceDate(data.issueDate),
    formatInvoiceDate(dueDate),
    formatInvoiceDate(startDate),
  ];
  const colW = contentW / 3;
  dateLabels.forEach((label, i) => {
    const x = margin + i * colW;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(label, x, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(dateVals[i], x, y + 5);
  });
  y += 14;
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Line item table header ────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 3, contentW, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("DESCRIPTION", margin + 2, y + 2);
  doc.text("QTY", margin + 110, y + 2);
  doc.text("UNIT PRICE", margin + 125, y + 2);
  doc.text("TAXES", margin + 148, y + 2);
  doc.text("VAT AMT", margin + 158, y + 2, { align: "right" });
  doc.text("AMOUNT", rightX - margin + 20, y + 2, { align: "right" });
  y += 10;

  // ── Line item ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(data.packageLabel, margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  y += 5;
  data.scope.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 100);
    wrapped.forEach((wl: string) => { doc.text(wl, margin + 2, y); y += 4.5; });
  });
  // right-aligned amounts on same line as package label
  const amtY = y - data.scope.length * 4.5 - 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("1.00", margin + 114, amtY);
  doc.text(fmtAed(data.budgetAed), margin + 130, amtY);
  doc.text("5%", margin + 150, amtY);
  doc.text(fmtAed(data.vatAed), margin + 162, amtY, { align: "right" });
  doc.text(fmtAed(data.budgetAed), rightX - margin + 20, amtY, { align: "right" });

  y += 4;

  // Advance note
  if (data.advanceNote) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(data.advanceNote, contentW - 4);
    noteLines.forEach((l: string) => { doc.text(l, margin + 2, y); y += 4.5; });
    y += 2;
  }

  // ── Totals block ──────────────────────────────────────────────────────────
  doc.line(margin, y, pageW - margin, y);
  y += 6;
  const totX = pageW - margin - 60;
  const totValX = rightX - margin + 20;
  const totRow = (label: string, val: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 9);
    doc.setTextColor(bold ? 20 : 100, bold ? 20 : 100, bold ? 20 : 100);
    doc.text(label, totX, y);
    doc.setTextColor(20, 20, 20);
    doc.text(val, totValX, y, { align: "right" });
    y += bold ? 7 : 5;
  };
  totRow("Untaxed Amount", fmtAed(data.budgetAed));
  totRow("VAT 5%", fmtAed(data.vatAed));
  doc.line(totX, y - 1, pageW - margin, y - 1);
  y += 1;
  totRow("Total", fmtAed(data.totalAed), true);
  y += 4;

  // ── Payment communication ─────────────────────────────────────────────────
  doc.line(margin, y, pageW - margin, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(`Payment Communication: ${data.orderRef}`, margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Please make payment to the following account:", margin, y);
  y += 5;
  const bankRows = [
    ["Account name", CH_ISSUER.accountName],
    ["Name of Bank", CH_ISSUER.bankName],
    ["Account number", CH_ISSUER.accountNumber],
    ["SWIFT CODE", CH_ISSUER.swiftCode],
    ["IBAN", CH_ISSUER.iban],
  ];
  bankRows.forEach(([label, val]) => {
    doc.setTextColor(120, 120, 120);
    doc.text(label, margin, y);
    doc.setTextColor(20, 20, 20);
    doc.text(val, margin + 40, y);
    y += 4.5;
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  y = MM.pageH - 18;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Page 1 / 1", pageW / 2, y, { align: "center" });

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
