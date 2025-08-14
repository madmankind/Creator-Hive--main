"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export function Tabs({ className, ...props }: TabsPrimitive.TabsProps & { className?: string }) {
  return <TabsPrimitive.Root className={className} {...props} />;
}

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps & { className?: string }) {
  return <TabsPrimitive.List className={cn("inline-flex gap-1 p-1 rounded-lg border border-[color:var(--color-border)]", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps & { className?: string }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "px-3 py-1.5 rounded-md text-sm data-[state=active]:bg-[color:var(--grey-800)]",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps & { className?: string }) {
  return <TabsPrimitive.Content className={cn("mt-4", className)} {...props} />;
}


