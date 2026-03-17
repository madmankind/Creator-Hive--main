/**
 * Server-side PDF generation for User Agreements
 * Uses jspdf for branded, clean output.
 */

import { jsPDF } from "jspdf";
import type { AgreementVariables } from "@/lib/legal/user-agreement-template";
import {
  renderTemplate,
  TEMPLATE_BODY,
  DEFAULT_ENTITY,
  DEFAULT_CONTACT,
} from "@/lib/legal/user-agreement-template";

const MARGIN = 40;
const PAGE_WIDTH = 595;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;
const TITLE_FONT = 16;
const BODY_FONT = 10;
const HEADER_FONT = 8;

export function generateUserAgreementPdf(vars: AgreementVariables): Uint8Array {
  const doc = new jsPDF({ format: "a4", unit: "pt" });
  const body = renderTemplate(TEMPLATE_BODY, {
    ...vars,
    entityName: vars.entityName || DEFAULT_ENTITY,
    contactEmail: vars.contactEmail || DEFAULT_CONTACT,
    phone: vars.phone ? " | " + vars.phone : "",
  });

  let y = MARGIN;

  doc.setFontSize(TITLE_FONT);
  doc.setFont("helvetica", "bold");
  doc.text("Creator Hive", MARGIN, y);
  y += LINE_HEIGHT * 2;

  doc.setFontSize(HEADER_FONT);
  doc.setFont("helvetica", "normal");
  doc.text("User Agreement", MARGIN, y);
  y += LINE_HEIGHT * 2;

  doc.setFontSize(BODY_FONT);
  doc.setFont("helvetica", "normal");

  const lines = doc.splitTextToSize(body.trim(), CONTENT_WIDTH);
  const pageHeight = 842;
  const bottomMargin = 50;

  for (const line of lines) {
    if (y > pageHeight - bottomMargin) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  }

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
