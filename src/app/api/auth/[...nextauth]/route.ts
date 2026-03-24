import { handlers } from "@/auth";

// Auth.js route handler — serves /api/auth/* (session, signin, callback, etc.)
// Ensure AUTH_URL/NEXTAUTH_URL in .env.local match dev server (e.g. http://127.0.0.1:3000)
export const { GET, POST } = handlers;
