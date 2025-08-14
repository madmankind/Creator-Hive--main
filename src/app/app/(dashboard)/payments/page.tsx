"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { pushToast, ToastViewport } from "@/components/ui/toast";
import { createPaymentLink } from "@/lib/mock";

export default function PaymentsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payments</h1>
        <NewPaymentLink />
      </div>
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="links">Payment Links</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">No transactions yet.</TabsContent>
        <TabsContent value="links">No links yet.</TabsContent>
        <TabsContent value="invoices">No invoices yet.</TabsContent>
      </Tabs>
      <ToastViewport />
    </div>
  );
}

function NewPaymentLink() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          const res = await createPaymentLink({ amount: 100, email: "client@example.com" });
          pushToast({ title: "Payment link created", description: res.url });
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Creating..." : "Create Payment Link"}
    </Button>
  );
}


