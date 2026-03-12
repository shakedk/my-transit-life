import React from "react";
import Link from "next/link";

const EXAMPLE_ROUTES = [
  { id: "nyc2", city: "New York", label: "NYC Subway" },
  { id: "tlvRed", city: "Tel Aviv", label: "Tel Aviv Red Line" },
  { id: "tflVictoria", city: "London", label: "London Victoria Line" },
  { id: "berlin100", city: "Berlin", label: "Berlin Bus 100" },
  { id: "ratp11", city: "Paris", label: "Paris Métro 11" },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "$19",
    cadence: "per poster",
    description: "Perfect for a one-off gift or a single favorite route.",
    features: [
      "High‑resolution download",
      "One standard poster size",
      "Basic color customization",
    ],
    ctaLabel: "Create your first poster",
  },
  {
    name: "Enthusiast",
    price: "$39",
    cadence: "per bundle",
    description: "For transit lovers who want a small gallery at home.",
    features: [
      "Up to 3 different routes",
      "Multiple poster sizes",
      "Advanced color & layout controls",
      "Print‑ready PDF exports",
    ],
    ctaLabel: "Design a 3‑poster set",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$79",
    cadence: "per project",
    description: "For studios, offices, and professional installations.",
    features: [
      "Unlimited route variations in one project",
      "All poster layouts and sizes",
      "Branding & logo placement options",
      "Priority support and export help",
    ],
    ctaLabel: "Talk about a larger project",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        margin: "0 auto",
        padding: "56px 24px 64px",
        maxWidth: 1100,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Heebo', sans-serif",
        background:
          "radial-gradient(circle at top left, #f3f4ff 0, transparent 45%), radial-gradient(circle at bottom right, #ffe8f0 0, transparent 45%)",
      }}
    >
      {/* Hero + primary CTA */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1.2fr)",
          gap: 32,
          alignItems: "center",
          marginBottom: 56,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.06)",
              color: "#0f172a",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                background: "#16a34a",
              }}
            />
            Live with real transit data
          </div>
          <h1
            style={{
              fontSize: "clamp(2.6rem, 5vw, 3.6rem)",
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              marginBottom: 16,
              fontFamily: "Oswald, system-ui, sans-serif",
            }}
          >
            Turn your daily commute into
            <span style={{ display: "block" }}>museum‑grade wall art.</span>
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.75,
              color: "#334155",
              maxWidth: 560,
              marginBottom: 24,
            }}
          >
            My Transit Life transforms real‑world networks and routes into bold,
            data‑driven posters. Celebrate the journeys that shaped your life,
            from your first subway line to the bus you still take every day.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Link
              href="/routeSelector"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 26px",
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #020617 0%, #0f172a 40%, #4338ca 100%)",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.35)",
              }}
            >
              Start designing a poster
            </Link>
            <Link
              href="/signin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 22px",
                borderRadius: 999,
                border: "1px solid rgba(15, 23, 42, 0.12)",
                background: "rgba(255, 255, 255, 0.7)",
                color: "#020617",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Sign in to view past designs
            </Link>
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              maxWidth: 460,
            }}
          >
            No design skills required. Start with curated layouts, then fine‑tune
            every detail—from typography and colors to route labels and station
            names.
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{
            borderRadius: 32,
            padding: 18,
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.95))",
            color: "white",
            boxShadow: "0 30px 80px rgba(15, 23, 42, 0.7)",
          }}
        >
          <div
            style={{
              borderRadius: 24,
              padding: 16,
              border: "1px solid rgba(148, 163, 184, 0.35)",
              background:
                "radial-gradient(circle at top left, rgba(248, 250, 252, 0.12), transparent 55%)",
              minHeight: 260,
              display: "grid",
              gridTemplateColumns: "1.2fr 0.9fr",
              gap: 12,
            }}
          >
            <div
              style={{
                borderRadius: 18,
                background: "#020617",
                padding: "18px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#9ca3af",
                    marginBottom: 6,
                  }}
                >
                  Poster preview
                </div>
                <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: "0.08em" }}>
                  RED LINE
                </div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#9ca3af",
                    marginTop: 4,
                  }}
                >
                  Tel Aviv Metropolitan Area
                </div>
              </div>
              <div
                style={{
                  height: 110,
                  borderRadius: 999,
                  background:
                    "radial-gradient(circle at 10% 0, #f97316 0, transparent 55%), radial-gradient(circle at 90% 80%, #22d3ee 0, transparent 55%), linear-gradient(to bottom, #fecaca, #0f172a)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "18% 16%",
                    borderRadius: 999,
                    border: "2px solid rgba(15, 23, 42, 0.7)",
                    boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.5)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                  fontSize: 10,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                <span>Scale 1:24,000</span>
                <span>Stations 23</span>
                <span>Origin TLV‑02</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "4px 2px 2px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#cbd5f5",
                    marginBottom: 8,
                  }}
                >
                  Based on real networks
                </div>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "#e5e7eb",
                    marginBottom: 12,
                  }}
                >
                  Choose from curated presets like{" "}
                  <span style={{ fontWeight: 600 }}>NYC Subway</span> or{" "}
                  <span style={{ fontWeight: 600 }}>London Victoria Line</span>, or
                  plug into your own GTFS data.
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 8,
                  fontSize: 11,
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    padding: "8px 9px",
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Print‑ready</div>
                  <div style={{ color: "#e5e7eb" }}>CMYK exports, up to A0 size.</div>
                </div>
                <div
                  style={{
                    borderRadius: 12,
                    padding: "8px 9px",
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Fully editable</div>
                  <div style={{ color: "#e5e7eb" }}>
                    Tweak colors, typography, spacing, and more.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples section */}
      <section style={{ marginBottom: 56 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginBottom: 6,
                color: "#020617",
              }}
            >
              Example posters in one click
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#4b5563",
                maxWidth: 540,
              }}
            >
              Start from a real transit line, then customize colors, title, and map
              style. Open any of these examples, adjust a few sliders, and export a
              print‑ready file.
            </p>
          </div>
          <Link
            href="/routeSelector"
            style={{
              fontSize: 13,
              textDecoration: "none",
              color: "#4338ca",
              fontWeight: 500,
            }}
          >
            Browse all available routes →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: 16,
          }}
        >
          {EXAMPLE_ROUTES.map((route) => (
            <Link
              key={route.id}
              href={`/posters/poster?posterType=PosterGeoLogo&routeID=${route.id}`}
              style={{
                padding: "16px 18px",
                borderRadius: 18,
                border: "1px solid rgba(148, 163, 184, 0.35)",
                background: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                color: "#020617",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
              }}
            >
              <div
                style={{
                  height: 120,
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg, #0f172a, #1d4ed8, #22c55e, #fbbf24)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 24px rgba(148, 163, 184, 0.45)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "14% 10%",
                    borderRadius: 999,
                    border: "1px solid rgba(15, 23, 42, 0.95)",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  {route.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#6b7280",
                  }}
                >
                  {route.city}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing section */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontSize: "1.45rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: 8,
              color: "#020617",
            }}
          >
            Simple pricing for posters you’ll actually print
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#4b5563",
              maxWidth: 580,
              margin: "0 auto",
            }}
          >
            Pay per project. Every plan includes access to the same design tools—you
            only pay more when you need more posters or more flexibility.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 18,
          }}
        >
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                position: "relative",
                borderRadius: 18,
                padding: "18px 18px 20px",
                background: plan.highlighted
                  ? "linear-gradient(145deg, #020617, #1f2937)"
                  : "rgba(255, 255, 255, 0.9)",
                color: plan.highlighted ? "white" : "#020617",
                border: plan.highlighted
                  ? "1px solid rgba(148, 163, 184, 0.65)"
                  : "1px solid rgba(148, 163, 184, 0.45)",
                boxShadow: plan.highlighted
                  ? "0 22px 60px rgba(15, 23, 42, 0.7)"
                  : "0 12px 28px rgba(148, 163, 184, 0.35)",
              }}
            >
              {plan.highlighted && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    borderRadius: 999,
                    padding: "4px 8px",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    background: "rgba(251, 191, 36, 0.12)",
                    color: "#facc15",
                    border: "1px solid rgba(250, 204, 21, 0.5)",
                  }}
                >
                  Most popular
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {plan.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 600,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: plan.highlighted ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    {plan.cadence}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: plan.highlighted ? "#e5e7eb" : "#4b5563",
                    minHeight: 36,
                  }}
                >
                  {plan.description}
                </p>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 14px",
                  fontSize: 12,
                  color: plan.highlighted ? "#e5e7eb" : "#374151",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        marginTop: 3,
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: plan.highlighted ? "#22c55e" : "#22c55e",
                      }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/routeSelector"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  marginTop: 4,
                  padding: "10px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: plan.highlighted
                    ? "1px solid rgba(251, 191, 36, 0.9)"
                    : "1px solid rgba(148, 163, 184, 0.7)",
                  background: plan.highlighted
                    ? "linear-gradient(135deg, #facc15, #f97316)"
                    : "rgba(248, 250, 252, 0.95)",
                  color: plan.highlighted ? "#020617" : "#020617",
                }}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary CTA & footer */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              color: "#4b5563",
              marginBottom: 6,
            }}
          >
            Ready to see your commute differently?
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Pick a route, choose a layout, and export a poster in minutes—not hours.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Link
            href="/routeSelector"
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              fontWeight: 600,
              textDecoration: "none",
              padding: "9px 16px",
              borderRadius: 999,
              border: "1px solid rgba(15, 23, 42, 0.9)",
              background: "#020617",
              color: "white",
            }}
          >
            Start from a route →
          </Link>
          <a
            href="https://www.transitlife.co"
            style={{
              fontSize: 12,
              color: "#6b7280",
              textDecoration: "underline",
            }}
          >
            Learn more at transitlife.co
          </a>
        </div>
      </section>
    </main>
  );
}