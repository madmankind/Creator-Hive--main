export default function BookingInvalidPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#07070B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: "40px" }}>Creator Hive</div>
      <div style={{ maxWidth: "400px", textAlign: "center" }}>
        <h1 style={{ fontSize: "20px", color: "#fff", marginBottom: "12px" }}>Link expired or invalid</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          This booking link has expired or is no longer valid. Please contact us at{" "}
          <a href="mailto:hello@creatorhive.ae" style={{ color: "rgba(255,255,255,0.6)" }}>hello@creatorhive.ae</a> if you need assistance.
        </p>
      </div>
    </div>
  );
}
