import { ImageResponse } from "next/og";
import { getAllContent, getContentBySlug } from "@/lib/content";
import { primaryTopicLabel } from "@/lib/seo";

const IMAGE_SIZES = {
  "16x9": { width: 1200, height: 675 },
  "4x3": { width: 1200, height: 900 },
  "1x1": { width: 1200, height: 1200 },
} as const;

type ImageRatio = keyof typeof IMAGE_SIZES;
type RouteContext = { params: Promise<{ path: string[] }> };

export const runtime = "nodejs";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllContent().flatMap((entry) =>
    (Object.keys(IMAGE_SIZES) as ImageRatio[]).map((ratio) => ({
      path: [...entry.slug.split("/"), ratio],
    })),
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const path = (await params).path;
  const ratio = path.at(-1) as ImageRatio | undefined;
  const size = ratio ? IMAGE_SIZES[ratio] : undefined;
  const entry = size ? getContentBySlug(path.slice(0, -1)) : undefined;

  if (!entry || !size) return new Response("Not found", { status: 404 });

  const isSquare = ratio === "1x1";
  const titleSize = isSquare ? 78 : ratio === "4x3" ? 72 : 68;
  const padding = isSquare ? 88 : 76;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        padding,
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f4f8ff",
        color: "#101318",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: isSquare ? -250 : -170,
          bottom: isSquare ? -260 : -300,
          display: "flex",
          width: isSquare ? 880 : 760,
          height: isSquare ? 880 : 760,
          borderRadius: "50%",
          background: "#d7e8ff",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          width: 14,
          height: "100%",
          background: "#075fea",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 39, fontWeight: 800, letterSpacing: -2 }}>
          vaktskolan<span style={{ color: "#075fea" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px 16px",
            border: "2px solid #c6d8f0",
            borderRadius: 999,
            color: "#31527d",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Källstödd guide
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: isSquare ? 930 : 900, flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            color: "#075fea",
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: 2.5,
            textTransform: "uppercase",
          }}
        >
          {primaryTopicLabel(entry.primaryTopic)}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 800,
            letterSpacing: -3.5,
            lineHeight: 1.03,
          }}
        >
          {entry.title}
        </div>
      </div>
    </div>,
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
