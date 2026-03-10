import React from "react";
import Link from "next/link";

const EXAMPLE_ROUTES = [
  { id: "nyc2", city: "New York", label: "NYC Subway" },
  { id: "tlvRed", city: "Tel Aviv", label: "Red Line" },
  { id: "tflVictoria", city: "London", label: "Victoria Line" },
  { id: "berlin100", city: "Berlin", label: "Bus 100" },
  { id: "ratp11", city: "Paris", label: "RATP 11" },
];

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily: "Oswald, system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 300,
          marginBottom: 16,
          letterSpacing: "0.02em",
        }}
      >
        My Transit Life
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          lineHeight: 1.6,
          marginBottom: 40,
          color: "#444",
          fontFamily: "Heebo, system-ui, sans-serif",
        }}
      >
        Design high-quality transit posters from real network and route data.
        Choose a route, customize your poster, and create something unique.
      </p>

      <div style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 500,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#666",
          }}
        >
          Get Started
        </h2>
        <Link
          href="/routeSelector"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "black",
            color: "white",
            textDecoration: "none",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          Browse All Routes
        </Link>
      </div>

      <div style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 500,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#666",
          }}
        >
          Example Posters
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {EXAMPLE_ROUTES.map((route) => (
            <Link
              key={route.id}
              href={`/posters/poster?posterType=PosterGeoLogo&routeID=${route.id}`}
              style={{
                padding: "16px 20px",
                border: "1px solid #ddd",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{route.label}</div>
              <div style={{ fontSize: "0.875rem", color: "#666" }}>
                {route.city}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p
        style={{
          fontSize: "0.9rem",
          color: "#888",
          fontFamily: "Heebo, system-ui, sans-serif",
        }}
      >
        Produced by{" "}
        <a
          href="https://www.transitlife.co"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          transitlife.co
        </a>
      </p>
    </main>
  );
}

