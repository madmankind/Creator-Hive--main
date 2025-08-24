export function track(event: string, props?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") return;
  // TODO: wire to your analytics provider
  console.log("track", event, props);
}

