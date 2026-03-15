import { IPtNetwork, IRoute } from "../../types";
import { IDataAccess } from "./dataAccess";
import db from "../db";

export class TransitDataAccess implements IDataAccess {
  initialized = false;
  API_KEY: string;
  BASE_URL: string;

  constructor() {
    this.BASE_URL = "https://external.transitapp.com/v3/public";
    this.API_KEY = process.env.TRANSIT_API_KEY ?? "";
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  async getAvailableNetworks(apiKeyOverride?: string): Promise<IPtNetwork[]> {
    const dbNetworks = await db.collection("ptNetworks").doc("networks").get();
    if (dbNetworks.exists) {
      const data = dbNetworks.data();
      if (!data) return [];
      const now = new Date();
      const date = new Date(data.updated);
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      const netowkrData = data.networks as IPtNetwork[];
      const hasCenterCoords = netowkrData.some((n) => n.lat != null && n.lon != null);
      if (diffInHours > 72 || !hasCenterCoords) {
        await db.collection("ptNetworks").doc("networks").delete();
      } else {
        return netowkrData;
      }
    }
    const apiKey = apiKeyOverride || (typeof process !== "undefined" ? process.env?.TRANSIT_API_KEY : undefined) || this.API_KEY;
    const url = `${this.BASE_URL}/available_networks`;
    const req = {
      method: "GET",
      headers: new Headers({
        apiKey,
      }),
    };
    const response = await fetch(url, req);
    const responseData = await response.json().catch(() => ({}));
    const rawNetworks = response.ok && Array.isArray(responseData?.networks)
      ? responseData.networks
      : [];
    const networkData = rawNetworks.map((network: {
      network_name?: string;
      network_id?: string;
      network_geometry_center?: { geometry?: { coordinates?: [number, number] } };
    }) => {
      const coords = network.network_geometry_center?.geometry?.coordinates;
      return {
        networkName: network.network_name ?? "",
        networkId: network.network_id ?? "",
        lon: Array.isArray(coords) ? coords[0] : undefined,
        lat: Array.isArray(coords) ? coords[1] : undefined,
      };
    });
    const networkDataDeduped = networkData.filter(
      (v, i, a) =>
        a.findIndex((v2) => ["networkId"].every((k) => v2[k] === v[k])) === i
    );

    if (networkDataDeduped.length > 0) {
      try {
        await db.collection("ptNetworks").doc("networks").set(
          {
            networks: networkDataDeduped,
            updated: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("TransitDataAccess: could not cache networks", e);
      }
    }
    if (networkDataDeduped.length === 0) {
      networkDataDeduped.push({
        networkId: "demo",
        networkName: "Demo (static routes — no API key required)",
      });
    }
    return networkDataDeduped;
  }

  async getRoutesbyNetworkId(
    networkId: string,
    lat?: number,
    lon?: number,
  ): Promise<{ routeName: string; routeId: string }[]> {
    if (networkId === "demo") {
      return [
        { routeId: "nyc2", routeName: "NYC - 2 Train" },
        { routeId: "tlvRed", routeName: "Tel Aviv Red Line" },
        { routeId: "tflVictoria", routeName: "London Victoria Line" },
        { routeId: "berlin100", routeName: "Berlin Bus 100" },
        { routeId: "ratp11", routeName: "Paris Métro 11" },
      ];
    }
    if (!lat || !lon) return [];

    // The Transit API v3 public API does not have a routes_for_network endpoint.
    // We use nearby_routes at the network's center to discover routes instead.
    const url = `${this.BASE_URL}/nearby_routes?lat=${lat}&lon=${lon}&max_distance=1500`;
    const response = await fetch(url, {
      method: "GET",
      headers: new Headers({ apiKey: this.API_KEY }),
    });
    const data = await response.json().catch(() => ({}));
    const routes = response.ok && Array.isArray(data?.routes) ? data.routes : [];
    return routes
      .map((route: { route_short_name?: string; route_long_name?: string; global_route_id?: string }) => ({
        routeName: `${route.route_short_name ?? ""} - ${route.route_long_name ?? ""}`.trim() || "Unknown",
        routeId: route.global_route_id ?? "",
      }))
      .filter((r: { routeId: string }) => r.routeId !== "");
  }

  /**
   * Decode Google-style encoded polyline to [lat, lng][] (precision 5).
   * Caller converts to [lon, lat] for GeoJSON/Mapbox.
   */
  private static decodePolyline(encoded: string): [number, number][] {
    const points: [number, number][] = [];
    let i = 0;
    let lat = 0;
    let lng = 0;
    const precision = 5;
    const factor = 10 ** precision;
    while (i < encoded.length) {
      let b = 0;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(i++) - 63;
        result |= (b & 31) << shift;
        shift += 5;
      } while (b >= 32);
      const dLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dLat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(i++) - 63;
        result |= (b & 31) << shift;
        shift += 5;
      } while (b >= 32);
      const dLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dLng;
      points.push([lat / factor, lng / factor]);
    }
    return points;
  }

  /**
   * Approximate middle of the route’s area (from routeId / network) for v4 nearby_routes.
   * Used when route_detail is unavailable; we don’t have the shape yet, so we infer from the route id.
   */
  private static getCenterForRouteId(routeId: string): { lat: number; lon: number } | null {
    const upper = routeId.toUpperCase();
    if (upper.startsWith("TFL") || upper.includes("TFLB0UK")) return { lat: 51.5074, lon: -0.1278 };
    if (upper.startsWith("STM")) return { lat: 45.5017, lon: -73.5673 };
    if (upper.startsWith("NYC") || upper.startsWith("MTA")) return { lat: 40.7128, lon: -74.006 };
    if (upper.startsWith("RATP")) return { lat: 48.8566, lon: 2.3522 };
    if (upper.startsWith("BVG") || upper.startsWith("BERLIN")) return { lat: 52.52, lon: 13.405 };
    return null;
  }

  /**
   * Fetches full route geometry and stops from the Transit API.
   * Tries route_detail first; if that fails (e.g. 404), falls back to v4 nearby_routes
   * with include_stops_and_shapes. Center for the fallback is computed from the route
   * (approximate network/region middle based on routeId) so we don't need to pass it in.
   */
  async getRouteDataByRouteId(routeId: string): Promise<IRoute> {
    const apiKey =
      process.env.NODE_ENV === "development"
        ? process.env.TRANSIT_API_KEY ?? ""
        : process.env.TRANSIT_API_KEY ?? "";

    try {
      const url = `${this.BASE_URL}/route_detail?route_id=${encodeURIComponent(routeId)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: apiKey ? new Headers({ apiKey }) : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        const shape: [number, number][] = Array.isArray(data.shape)
          ? data.shape
          : Array.isArray(data.geometry?.coordinates)
            ? data.geometry.coordinates
            : [];
        const stops: { stopId: string; stopName: string; location: [number, number] }[] =
          Array.isArray(data.stops)
            ? data.stops.map(
                (s: {
                  stop_id?: string;
                  stop_name?: string;
                  stop_lat?: number;
                  stop_lon?: number;
                  id?: string;
                  name?: string;
                }) => ({
                  stopId: s.stop_id ?? s.id ?? "",
                  stopName: s.stop_name ?? s.name ?? "",
                  location: [
                    typeof s.stop_lon === "number" ? s.stop_lon : 0,
                    typeof s.stop_lat === "number" ? s.stop_lat : 0,
                  ] as [number, number],
                })
              )
            : [];
        return {
          routeId,
          routeName: data.route_name ?? data.route_long_name ?? routeId,
          shape,
          stops,
        };
      }

      const fallback = await this.getRouteDataFromV4Nearby(routeId, apiKey);
      if (fallback) return fallback;
      const stub = this.getMinimalRouteStub(routeId);
      const center = TransitDataAccess.getCenterForRouteId(routeId);
      return {
        ...stub,
        centerHint: center ? { longitude: center.lon, latitude: center.lat } : undefined,
      };
    } catch {
      const fallback = await this.getRouteDataFromV4Nearby(routeId, apiKey);
      if (fallback) return fallback;
      const stub = this.getMinimalRouteStub(routeId);
      const center = TransitDataAccess.getCenterForRouteId(routeId);
      return {
        ...stub,
        centerHint: center ? { longitude: center.lon, latitude: center.lat } : undefined,
      };
    }
  }

  /**
   * Fallback: get route shape/stops from v4 nearby_routes with include_stops_and_shapes.
   * Center is computed from the route (approximate middle of the route’s network/region
   * based on routeId) so the route appears in the nearby results.
   */
  private async getRouteDataFromV4Nearby(
    routeId: string,
    apiKey: string
  ): Promise<IRoute | null> {
    const center = TransitDataAccess.getCenterForRouteId(routeId);
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/b35c7edc-47d9-449a-9920-64ed8e20325a", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "transitDataAccess.ts:getRouteDataFromV4Nearby:entry",
        message: "v4 fallback entry",
        data: { routeId, hasCenter: !!center, apiKeyLen: apiKey?.length ?? 0 },
        timestamp: Date.now(),
        hypothesisId: "v4why",
      }),
    }).catch(() => {});
    // #endregion
    if (!center || !apiKey) return null;

    const v4Url = `https://external.transitapp.com/v4/public/nearby_routes?lat=${center.lat}&lon=${center.lon}&max_distance=10000&include_stops_and_shapes=true`;
    const res = await fetch(v4Url, {
      method: "GET",
      headers: new Headers({ apiKey }),
    }).catch(() => null);
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/b35c7edc-47d9-449a-9920-64ed8e20325a", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "transitDataAccess.ts:getRouteDataFromV4Nearby:afterFetch",
        message: "v4 response",
        data: { status: res?.status, ok: res?.ok, routeId },
        timestamp: Date.now(),
        hypothesisId: "v4why",
      }),
    }).catch(() => {});
    // #endregion
    if (!res?.ok) return null;

    const data = (await res.json().catch(() => null)) as {
      nearby_routes?: Array<{
        global_route_id?: string;
        route_long_name?: string;
        route_short_name?: string;
        merged_itineraries?: Array<{
          itineraries?: Array<{
            shape?: string;
            stops?: Array<{
              stop_lat?: number;
              stop_lon?: number;
              stop_name?: string;
              stop_id?: string;
              global_stop_id?: string;
            }>;
          }>;
        }>;
      }>;
    } | null;
    const routes = data?.nearby_routes ?? [];
    const routeIdNorm = routeId.trim();
    const route = routes.find((r) => {
      const id = (r.global_route_id ?? "").trim();
      if (id === routeIdNorm) return true;
      try {
        if (decodeURIComponent(id) === routeIdNorm) return true;
        if (id === encodeURIComponent(routeIdNorm)) return true;
      } catch {
        // ignore
      }
      return false;
    });
    const routeIdsSample = routes.slice(0, 10).map((r) => r.global_route_id);
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/b35c7edc-47d9-449a-9920-64ed8e20325a", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "transitDataAccess.ts:getRouteDataFromV4Nearby:findRoute",
        message: "route match",
        data: {
          routeId,
          routesCount: routes.length,
          found: !!route,
          routeIdsSample,
          mergedItinerariesLen: route?.merged_itineraries?.length ?? 0,
        },
        timestamp: Date.now(),
        hypothesisId: "v4why",
      }),
    }).catch(() => {});
    // #endregion
    if (!route?.merged_itineraries?.length) return null;

    let shape: [number, number][] = [];
    const stopsMap = new Map<string, { stopId: string; stopName: string; location: [number, number] }>();

    for (const merged of route.merged_itineraries) {
      for (const it of merged.itineraries ?? []) {
        if (typeof it.shape === "string" && it.shape.length > 0) {
          const decoded = TransitDataAccess.decodePolyline(it.shape);
          if (decoded.length > 0) {
            shape = decoded.map(([lat, lng]) => [lng, lat]) as [number, number][];
            break;
          }
        }
      }
      if (shape.length > 0) break;
    }

    for (const merged of route.merged_itineraries) {
      for (const it of merged.itineraries ?? []) {
        for (const s of it.stops ?? []) {
          const lat = typeof s.stop_lat === "number" ? s.stop_lat : 0;
          const lon = typeof s.stop_lon === "number" ? s.stop_lon : 0;
          const id = s.global_stop_id ?? s.stop_id ?? "";
          if (id && !stopsMap.has(id)) {
            stopsMap.set(id, {
              stopId: id,
              stopName: s.stop_name ?? "",
              location: [lon, lat],
            });
          }
        }
      }
    }

    const stops = Array.from(stopsMap.values());
    const routeName = [route.route_short_name, route.route_long_name].filter(Boolean).join(" - ") || routeId;
    if (shape.length === 0 && stops.length === 0) return null;

    const outShape = shape.length > 0 ? shape : [[0, 0], [0.01, 0.01]];
    return {
      routeId,
      routeName,
      shape: outShape,
      stops,
    };
  }

  private getMinimalRouteStub(routeId: string): IRoute {
    return {
      routeId,
      routeName: `Route ${routeId}`,
      shape: [[0, 0], [0.01, 0.01]] as [number, number][],
      stops: [],
    };
  }
}
