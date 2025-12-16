export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*", "/api/agency/:path*", "/api/invoices/:path*", "/api/wallet/:path*", "/api/pods"],
};
