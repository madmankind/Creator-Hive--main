// src/lib/invoice.ts
// Creator Hive invoice number generation and formatting
// Format: CH{YYYYMMDD}{SEQ} — matches existing CH20260107 format

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;       // DD/MM/YYYY
  dueDate: string;           // DD/MM/YYYY
  deliveryDate?: string;     // DD/MM/YYYY

  // Creator Hive (issuer)
  issuerName: string;
  issuerAddress: string;
  issuerTRN: string;
  issuerEmail: string;

  // Client (recipient)
  clientName: string;
  clientAddress: string;
  clientTRN?: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Totals
  untaxedAmount: number;     // in AED
  vatRate: number;           // e.g. 5
  vatAmount: number;
  total: number;

  // Payment
  paymentCommunication: string; // same as invoiceNumber
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  iban: string;

  // Optional
  notes?: string;
  advanceNote?: string;      // "This invoice represents 50% advance."
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  amount: number;
}

// Creator Hive static issuer details
export const CH_ISSUER = {
  name: "Creator Hive FZE",
  address: "Block B-B53-050, Sharjah Research Technology and Innovation Park\nSharjah, United Arab Emirates",
  trn: "105298104800001",
  email: "hello@creatorhive.ae",
  bankName: "MASHREQ Bank PSC",
  accountName: "CREATOR HIVE FZE",
  accountNumber: "019101993648",
  swiftCode: "BOMLAEAD",
  iban: "AE810330000019101993648",
};

// Generate invoice number: CH{YYYYMMDD}{3-digit seq}
export function generateInvoiceNumber(seq: number): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const s = String(seq).padStart(3, "0");
  return `CH${y}${m}${d}${s}`;
}

// Format date as DD/MM/YYYY
export function formatInvoiceDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// Calculate VAT and totals
export function calcInvoiceTotals(amount: number, vatRate = 5): {
  untaxedAmount: number;
  vatAmount: number;
  total: number;
} {
  const vatAmount = Math.round(amount * (vatRate / 100) * 100) / 100;
  return {
    untaxedAmount: amount,
    vatAmount,
    total: amount + vatAmount,
  };
}

// Build a full InvoiceData object from a booking
export function buildInvoiceData(opts: {
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  clientTRN?: string;
  description: string;
  amount: number;          // pre-VAT in AED
  notes?: string;
  advanceNote?: string;
  daysUntilDue?: number;
}): InvoiceData {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + (opts.daysUntilDue ?? 0));
  const delivery = new Date(now);
  delivery.setDate(delivery.getDate() + 2);

  const { untaxedAmount, vatAmount, total } = calcInvoiceTotals(opts.amount);

  return {
    invoiceNumber: opts.invoiceNumber,
    invoiceDate: formatInvoiceDate(now),
    dueDate: formatInvoiceDate(due),
    deliveryDate: formatInvoiceDate(delivery),

    ...CH_ISSUER,
    issuerName: CH_ISSUER.name,
    issuerAddress: CH_ISSUER.address,
    issuerTRN: CH_ISSUER.trn,
    issuerEmail: CH_ISSUER.email,

    clientName: opts.clientName,
    clientAddress: opts.clientAddress,
    clientTRN: opts.clientTRN,

    lineItems: [{
      description: opts.description,
      quantity: 1,
      unitPrice: opts.amount,
      vatRate: 5,
      vatAmount,
      amount: opts.amount,
    }],

    untaxedAmount,
    vatRate: 5,
    vatAmount,
    total,

    paymentCommunication: opts.invoiceNumber,
    bankName: CH_ISSUER.bankName,
    accountName: CH_ISSUER.accountName,
    accountNumber: CH_ISSUER.accountNumber,
    swiftCode: CH_ISSUER.swiftCode,
    iban: CH_ISSUER.iban,

    notes: opts.notes,
    advanceNote: opts.advanceNote,
  };
}
