import Link from "next/link";
import React from "react";
import Head from "next/head";
import { server } from "../config";

const POSTER_LAYOUTS = [
  { id: "PosterGeoLogo", label: "Geo WITH Logo" },
  { id: "PosterGeoLogoHorizontal", label: "Geo WITH Logo Horizontal" },
  { id: "PosterGeoNoLogo", label: "Geo WITHOUT Logo" },
  { id: "PosterFullMapLogo", label: "Full Poster + Logo" },
  { id: "PosterBigFrameNoLogo", label: "Big border (no logo)" },
];

type Combo = {
  routeID: string;
  posterType: string;
};

export async function getServerSideProps() {
  const routeListRes = await fetch(`${server}/api/listOfRoutes`);
  const data = await routeListRes.json();
  const routeList: string[] = data.routeList || [];

  const readyCombos: Combo[] = [];
  const missingCombos: Combo[] = [];

  for (const layout of POSTER_LAYOUTS) {
    for (const routeID of routeList) {
      const [routeDataRes, designConfigRes] = await Promise.all([
        fetch(`${server}/api/routeData?routeID=${routeID}`),
        fetch(
          `${server}/api/routeDesignConfig${layout.id.replace(
            /poster/i,
            ""
          )}?routeID=${routeID}`
        ),
      ]);

      const target =
        routeDataRes.ok && designConfigRes.ok ? readyCombos : missingCombos;
      target.push({ routeID, posterType: layout.id });
    }
  }

  return {
    props: {
      readyCombos,
      missingCombos,
    },
  };
}

export default function RouteSelectorPage({
  readyCombos,
  missingCombos,
}: {
  readyCombos: Combo[];
  missingCombos: Combo[];
}) {
  const routeMap: Record<string, string> = {
    nyc2: "NYC - 2 Train",
    nycF: "NYC - F Train",
    nycN: "NYC - N Train",
    tflVictoria: "London Victoria Line",
    tflCircle: "London Circle Line",
    tflNorthern: "London Northern Line",
  };

  const groupByLayout = (combos: Combo[]) => {
    const grouped: Record<string, Combo[]> = {};
    for (const combo of combos) {
      if (!grouped[combo.posterType]) {
        grouped[combo.posterType] = [];
      }
      grouped[combo.posterType].push(combo);
    }
    return grouped;
  };

  const readyByLayout = groupByLayout(readyCombos);
  const missingByLayout = groupByLayout(missingCombos);

  const renderComboButtons = (combos: Combo[]) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        {combos.map(({ routeID, posterType }) => {
          const label = routeMap[routeID] ?? routeID;
          return (
            <Link
              key={`${posterType}-${routeID}`}
              href={`/posters/poster?posterType=${encodeURIComponent(
                posterType
              )}&routeID=${encodeURIComponent(routeID)}`}
              style={{
                textDecoration: "none",
              }}
            >
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148, 163, 184, 0.7)",
                  background: "rgba(255, 255, 255, 0.9)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#020617",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            </Link>
          );
        })}
      </div>
    );
  };

  const renderSection = (
    title: string,
    description: string,
    grouped: Record<string, Combo[]>,
    variant: "ready" | "missing"
  ) => {
    const hasAny = Object.values(grouped).some((arr) => arr.length > 0);
    if (!hasAny) return null;

    return (
      <section style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 16 }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#020617",
              marginBottom: 4,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#4b5563",
              maxWidth: 640,
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 10,
          }}
        >
          {POSTER_LAYOUTS.map((layout) => {
            const combos = grouped[layout.id] || [];
            if (!combos.length) return null;

            return (
              <details
                key={`${variant}-${layout.id}`}
                open={variant === "ready"}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(148, 163, 184, 0.45)",
                  background:
                    variant === "ready"
                      ? "rgba(255, 255, 255, 0.95)"
                      : "rgba(248, 250, 252, 0.9)",
                  padding: "10px 14px 12px",
                }}
              >
                <summary
                  style={{
                    listStyle: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "#020617",
                  }}
                >
                  {layout.label}{" "}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#6b7280",
                      marginLeft: 6,
                    }}
                  >
                    ({combos.length})
                  </span>
                </summary>
                {renderComboButtons(combos)}
              </details>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: "0 auto",
        padding: "56px 24px 64px",
        maxWidth: 1100,
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Heebo', sans-serif",
        background:
          "radial-gradient(circle at top left, #f3f4ff 0, transparent 45%), radial-gradient(circle at bottom right, #ffe8f0 0, transparent 45%)",
      }}
    >
      <Head>
        <title>Select a route and layout</title>
      </Head>

      <section
        style={{
          marginBottom: 40,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.1rem, 4vw, 2.8rem)",
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: 10,
            color: "#020617",
          }}
        >
          Pick a route and poster layout.
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#4b5563",
            maxWidth: 620,
          }}
        >
          Start from real transit routes we&apos;ve prepared, then choose a
          layout to open in the editor. Routes or layouts that are missing
          underlying data or design config are grouped separately.
        </p>
      </section>

      {renderSection(
        "Ready to design",
        "These route and layout combinations have full data and design config. Open any of them to start customizing immediately.",
        readyByLayout,
        "ready"
      )}

      {renderSection(
        "Missing data or design config",
        "These combinations are missing route data or design configuration. They are useful for debugging or future expansion, but may show an error or placeholder screen.",
        missingByLayout,
        "missing"
      )}
    </main>
  );
}

