import type { DesignConfig } from "../../../components/DesignControls";

type StopLike = { stop_id?: string; stop_name?: string };
type PatternProps = {
  route_short_name?: string;
  route_long_name?: string;
};

function isBlank(s: unknown): boolean {
  return typeof s !== "string" || !s.trim();
}

function firstPatternProperties(
  routeData: Record<string, unknown> | null | undefined
): PatternProps | undefined {
  const patterns = routeData?.patterns;
  if (!Array.isArray(patterns) || patterns.length === 0) return undefined;
  const p0 = patterns[0] as { properties?: PatternProps };
  return p0?.properties;
}

function deriveDefaultRouteTitle(
  routeData: Record<string, unknown> | null | undefined,
  routeId: string,
  routeNameHint?: string
): string {
  const hint = routeNameHint?.trim();
  if (hint) return hint;
  const props = firstPatternProperties(routeData);
  const shortName = props?.route_short_name?.trim();
  if (shortName) return shortName;
  const longName = props?.route_long_name?.trim();
  if (longName) return longName;
  return routeId.trim() || "Route";
}

function deriveDefaultSubtitle(
  routeData: Record<string, unknown> | null | undefined,
  resolvedTitle: string
): string {
  const stops = routeData?.stops as StopLike[] | undefined;
  if (Array.isArray(stops) && stops.length >= 2) {
    const a = String(stops[0]?.stop_name ?? "").trim();
    const b = String(stops[stops.length - 1]?.stop_name ?? "").trim();
    if (a && b) return a === b ? a : `${a} – ${b}`;
  }
  if (Array.isArray(stops) && stops.length === 1) {
    const n = String(stops[0]?.stop_name ?? "").trim();
    if (n && n !== resolvedTitle) return n;
  }
  const longName = firstPatternProperties(routeData)?.route_long_name?.trim();
  if (longName && longName !== resolvedTitle) return longName;
  return "";
}

/** First and last `stop_id` along the route `stops` array (or a single id if only one). */
export function firstLastStopIdsForRouteStops(
  stops: Array<{ stop_id?: string }> | undefined
): string[] | undefined {
  if (!Array.isArray(stops) || stops.length === 0) return undefined;
  const first = String(stops[0]?.stop_id ?? "").trim();
  if (!first) return undefined;
  const last = String(stops[stops.length - 1]?.stop_id ?? "").trim();
  if (!last || last === first) return [first];
  return [first, last];
}

/**
 * Fills title, subtitle, and stop visibility defaults for a poster that has no
 * saved document yet (first visit / editor only).
 */
export function applyNewPosterDefaults(
  design: DesignConfig,
  routeData: Record<string, unknown> | null | undefined,
  routeId: string,
  options?: { routeNameHint?: string }
): DesignConfig {
  const out: DesignConfig = { ...design };

  if (isBlank(out.routeName)) {
    out.routeName = deriveDefaultRouteTitle(
      routeData,
      routeId,
      options?.routeNameHint
    );
  }

  const resolvedTitle = String(out.routeName ?? "").trim();
  if (isBlank(out.routeDesc) && isBlank(out.routeType)) {
    out.routeDesc = deriveDefaultSubtitle(routeData, resolvedTitle);
  } else if (isBlank(out.routeDesc) && !isBlank(out.routeType)) {
    const sub = deriveDefaultSubtitle(routeData, resolvedTitle);
    if (sub) out.routeDesc = sub;
  }

  const existing = out.stopIDsToDisplayFromConfig;
  if (!Array.isArray(existing) || existing.length === 0) {
    const ids = firstLastStopIdsForRouteStops(
      routeData?.stops as StopLike[] | undefined
    );
    if (ids?.length) {
      (out as Record<string, unknown>).stopIDsToDisplayFromConfig = ids;
    }
  }

  return out;
}
