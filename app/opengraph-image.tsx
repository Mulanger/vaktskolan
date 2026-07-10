import { ImageResponse } from "next/og";

export const alt = "Vaktskolan – träna inför väktarprovet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#f2f7ff", color: "#111827", fontFamily: "Arial, sans-serif", padding: "72px 80px", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ position: "absolute", width: 440, height: 440, borderRadius: 440, right: -80, bottom: -120, background: "#cde2ff" }} />
      <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>vaktskolan<span style={{ color: "#075fea" }}>.</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 880 }}>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>Träna inför väktarprovet med koll på varför.</div>
        <div style={{ fontSize: 26, color: "#4b5563" }}>Övningsfrågor och källstödda guider för VU1 och VU2.</div>
      </div>
    </div>,
    size,
  );
}
