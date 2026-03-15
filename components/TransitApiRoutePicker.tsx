"use client";

import React, { useState } from "react";
import Link from "next/link";
import NetworkSelect from "./dataSelectors/NetworkSelect";
import RouteSelector from "./dataSelectors/RouteSelector";
import { IPtNetwork } from "../src/types";

const DEFAULT_POSTER_TYPE = "PosterGeoLogo";

export default function TransitApiRoutePicker() {
  const [selectedNetwork, setSelectedNetwork] = useState<IPtNetwork | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedRouteName, setSelectedRouteName] = useState<string>("");

  const handleRouteChange = (option: { value: string; label: string } | null) => {
    if (!option) {
      setSelectedRouteId(null);
      setSelectedRouteName("");
      return;
    }
    setSelectedRouteId(option.value);
    setSelectedRouteName(option.label);
  };

  return (
    <section
      style={{
        marginBottom: 40,
        padding: "20px 24px",
        borderRadius: 18,
        border: "1px solid rgba(148, 163, 184, 0.45)",
        background: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 12px 28px rgba(148, 163, 184, 0.2)",
      }}
    >
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
          From Transit API
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#4b5563",
            maxWidth: 640,
            lineHeight: 1.6,
          }}
        >
          Fetch live route data from the Transit API. Choose a network and route,
          then open the poster editor with that data.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 280 }}>
          <label
            htmlFor="transit-network"
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#6b7280",
              marginBottom: 6,
            }}
          >
            Network
          </label>
          <NetworkSelect onSelectChange={setSelectedNetwork} />
        </div>
        {selectedNetwork && (
          <div style={{ minWidth: 280 }}>
            <label
              htmlFor="transit-route"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#6b7280",
                marginBottom: 6,
              }}
            >
              Route
            </label>
            <RouteSelector
              networkId={selectedNetwork.networkId}
              lat={selectedNetwork.lat}
              lon={selectedNetwork.lon}
              onRouteSelect={handleRouteChange}
            />
          </div>
        )}
        {selectedRouteId && (
          <Link
            href={`/posters/poster?posterType=${encodeURIComponent(
              DEFAULT_POSTER_TYPE
            )}&source=transit&routeID=${encodeURIComponent(selectedRouteId)}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 22px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #020617 0%, #0f172a 40%, #4338ca 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.35)",
            }}
          >
            Design poster with “{selectedRouteName}”
          </Link>
        )}
      </div>
    </section>
  );
}
