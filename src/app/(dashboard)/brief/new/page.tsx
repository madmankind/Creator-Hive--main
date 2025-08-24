"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const Schema = z.object({
  objectives: z.string().min(8, "Please outline objectives"),
  deliverables: z.string().min(3),
  budget: z.number().min(100),
  timeline: z.string().min(3),
});

type FormValues = z.infer<typeof Schema>;

export default function BriefWizardPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { objectives: "", deliverables: "", budget: 1000, timeline: "2 weeks" },
    mode: "onChange",
  });

  // Autosave stub
  useEffect(() => {
    const sub = form.watch(() => {
      // hook: send to API (debounced)
    });
    return () => sub.unsubscribe();
  }, [form]);

  const onSubmit = form.handleSubmit((values) => {
    console.log("Submit brief", values);
  });

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold">New Brief</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-6 max-w-2xl">
        <label className="grid gap-2">
          <span>Objectives</span>
          <textarea {...form.register("objectives")} className="min-h-28 rounded-md bg-[color:var(--muted)] border border-[color:var(--color-border)] p-3" />
          {form.formState.errors.objectives && <span className="text-red-400 text-sm">{form.formState.errors.objectives.message}</span>}
        </label>
        <label className="grid gap-2">
          <span>Deliverables</span>
          <input {...form.register("deliverables")} className="h-10 rounded-md bg-[color:var(--muted)] border border-[color:var(--color-border)] px-3" />
          {form.formState.errors.deliverables && <span className="text-red-400 text-sm">{form.formState.errors.deliverables.message}</span>}
        </label>
        <label className="grid gap-2">
          <span>Budget (USD)</span>
          <input type="number" {...form.register("budget", { valueAsNumber: true })} className="h-10 rounded-md bg-[color:var(--muted)] border border-[color:var(--color-border)] px-3" />
          {form.formState.errors.budget && <span className="text-red-400 text-sm">{form.formState.errors.budget.message}</span>}
        </label>
        <label className="grid gap-2">
          <span>Timeline</span>
          <input {...form.register("timeline")} className="h-10 rounded-md bg-[color:var(--muted)] border border-[color:var(--color-border)] px-3" />
          {form.formState.errors.timeline && <span className="text-red-400 text-sm">{form.formState.errors.timeline.message}</span>}
        </label>
        <div>
          <button type="submit" className="px-5 h-10 rounded-md bg-[color:var(--color-accent)] text-black font-medium">Continue</button>
        </div>
      </form>
    </main>
  );
}

