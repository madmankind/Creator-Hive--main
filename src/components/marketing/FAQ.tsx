"use client";
import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "How fast can we start?",
      answer: "Most matches happen within a week—often 48 hours."
    },
    {
      question: "Who owns the work?",
      answer: "You do. IP and usage are set in your contract."
    },
    {
      question: "How do payments work?",
      answer: "Payouts follow milestone approvals. No surprise fees."
    },
    {
      question: "What if it's not a fit?",
      answer: "We'll rematch you quickly—no drama."
    }
  ];

  return (
    <section className="container py-24">
      <h2 className="text-3xl font-bold">Questions, answered</h2>
      <div className="mt-8 space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)]">
            <button
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[color:var(--grey-800)] transition rounded-2xl"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-medium">{faq.question}</span>
              <span className={`transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                ↓
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-sm text-[color:var(--color-muted-foreground)]">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
