import { handlers } from "@/auth";

// Auth.js route handler — serves /api/auth/* (session, signin, callback, etc.)
export const { GET, POST } = handlers;

// Vercel Hobby plan max — prevents Cloudflare 524 gateway timeout
export const maxDuration = 10;
