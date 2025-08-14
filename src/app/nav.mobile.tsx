"use client";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default function MobileNav() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button aria-label="Open Menu" className="focus-ring rounded-lg px-3 py-2 border border-[color:var(--color-border)]">Menu</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-y-0 right-0 w-80 bg-[color:var(--bg)] border-l border-[color:var(--color-border)] p-6 flex flex-col gap-4">
          <Dialog.Close className="self-end border rounded-md px-2 py-1 text-sm">Close</Dialog.Close>
          <Link href="/#how">Product</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#creators">For Creators</Link>
          <Link href="/#brands">For Brands</Link>
          <Link href="/#docs">Docs</Link>
          <Link href="/app">Sign in</Link>
          <Link href="/signup" className={buttonVariants({ variant: "gradient" })}>Get Started</Link>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


