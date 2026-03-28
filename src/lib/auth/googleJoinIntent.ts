/**
 * Tells the server (NextAuth Google callback) whether the next Google sign-in
 * should create a CREATOR vs AGENCY account. Only consulted on user **create**;
 * existing users keep their DB role.
 *
 * Call from the browser immediately before `signIn("google", ...)`.
 */
export function setGoogleJoinIntentForNextSignIn(intent: "creator" | "client") {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `ch_google_join_as=${intent}; Path=/; Max-Age=600; SameSite=Lax${secure}`;
}
