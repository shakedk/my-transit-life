/* eslint-disable react/react-in-jsx-scope */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StyleSpecification } from "mapbox-gl";
import Map, {
  Marker,
  Source,
  Layer,
  type MapRef,
} from "react-map-gl/mapbox-legacy";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./map.module.css";
import StopLabel from "./stopLabel";
import { getAuthAxios } from "../src/lib/api/apiClient";

const MAPBOX_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
const MAPBOX_STYLE_ID = "shakedk/clqbhnool00ab01pj57js18y6";

const tileNameToRasterUrl: Record<string, string> = {
  StamenToner:
    "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
  StamenTonerLite:
    "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}.png",
  StamenTonerLines:
    "https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}.png",
  StamenTonerBackground:
    "https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}.png",
  StamenTerrainLines:
    "https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}.png",
  CartoDBLiteNoLabels:
    "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
  AlidadeSmooth:
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png",
};

function getMapStyle(
  showGeoLayer: boolean,
  tileLayerName: string | undefined,
  mapOpacity: number,
  backgroundColor: string
): string | StyleSpecification {
  if (!showGeoLayer) {
    return {
      version: 8,
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": backgroundColor || "transparent",
          },
        },
      ],
    };
  }
  if (tileLayerName === "Mapbox") {
    return `mapbox://styles/${MAPBOX_STYLE_ID}`;
  }
  const rasterUrl = tileLayerName
    ? tileNameToRasterUrl[tileLayerName]
    : null;
  if (rasterUrl) {
    return {
      version: 8,
      sources: {
        "raster-tiles": {
          type: "raster",
          tiles: [rasterUrl],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "raster-layer",
          type: "raster",
          source: "raster-tiles",
          paint: { "raster-opacity": mapOpacity },
        },
      ],
    };
  }
  return "mapbox://styles/mapbox/light-v11";
}

function coordinatesToGeoJSON(
  paths: [number, number][][]
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = paths.map((coords) => ({
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  }));
  return { type: "FeatureCollection", features };
}

const RouteMap = ({
  multiPolyLine,
  patterns,
  stops,
  backgroundColor,
  mapOpacity,
  tileLayerName,
  pathColor,
  pathWeight,
  mapZoom,
  font,
  showGeoLayer = true,
  smoothFactor = 5, // eslint-disable-line @typescript-eslint/no-unused-vars -- was for Leaflet; Mapbox renders natively
  showMarkers = false,
  isInEditMode,
  stopFontSize,
  stopFontColor,
  stopFont = undefined,
  stopIDsToDisplayFromConfig,
  stopColor,
  stopCircleSize,
  stopBackgroundColor,
  isSingleDot,
  isSimpleDot = undefined,
  isPrintMode,
  stopDataFromDB,
  posterID,
  displsyedPatternsFromDB = {},
  routeOverlayPatternNumber = undefined,
  routeOverlayPatternColor = undefined,
  showStopLabels = false,
}: {
  multiPolyLine?: [number, number][][];
  patterns?: Array<{
    properties: { route_id: string };
    geometry: { coordinates: [number, number][] };
  }>;
  stops: Array<{
    stop_id: string;
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
  }>;
  backgroundColor?: string;
  mapOpacity?: number;
  tileLayerName?: string;
  pathColor?: string;
  pathWeight?: number;
  mapZoom?: number;
  font?: string;
  showGeoLayer?: boolean;
  smoothFactor?: number;
  showMarkers?: boolean;
  isInEditMode?: boolean;
  stopFontSize?: number;
  stopFontColor?: string;
  stopFont?: string;
  stopIDsToDisplayFromConfig?: string[];
  stopColor?: string;
  stopCircleSize?: number;
  stopBackgroundColor?: string;
  isSingleDot?: boolean;
  isSimpleDot?: boolean;
  isPrintMode?: boolean;
  stopDataFromDB?: Record<
    string,
    {
      marker_lat?: number;
      marker_lon?: number;
      label_lat?: number;
      label_lon?: number;
      labelWidth?: number;
      labelHeight?: number;
      stopModifiedName?: string;
      toDisplay?: boolean;
    }
  >;
  posterID?: string;
  displsyedPatternsFromDB?: Record<string, { toDisplay?: boolean }>;
  routeOverlayPatternNumber?: number;
  routeOverlayPatternColor?: string;
  showStopLabels?: boolean;
}) => {
  const mapRef = useRef<MapRef | null>(null);

  const initialDisplayedStops = useMemo(() => {
    return stops.reduce(
      (stopObj: Record<string, boolean>, stop) => {
        if (
          !stopIDsToDisplayFromConfig ||
          stopIDsToDisplayFromConfig.includes(stop.stop_id)
        ) {
          stopObj[stop.stop_id] = true;
        }
        return stopObj;
      },
      {}
    );
  }, [stops, stopIDsToDisplayFromConfig]);

  const [displayedStops, setDisplayedStops] =
    useState<Record<string, boolean>>(initialDisplayedStops);

  const mapStyle = useMemo(
    () =>
      getMapStyle(
        showGeoLayer ?? true,
        tileLayerName,
        mapOpacity ?? 1,
        backgroundColor || "transparent"
      ),
    [showGeoLayer, tileLayerName, mapOpacity, backgroundColor]
  );

  const stopMarkerCircleChangedHandler = useCallback(
    (posterID: string, stopID: string, marker_lat: number, marker_lon: number) => {
      getAuthAxios().put(`/api/poster/${posterID}`, {
        posterID,
        stops: { [stopID]: { marker_lat, marker_lon } },
      });
    },
    []
  );

  const stopDisplayToggleHandler = useCallback(
    (posterID: string, stopID: string, toDisplay: boolean) => {
      getAuthAxios().put(`/api/poster/${posterID}`, {
        posterID,
        stops: { [stopID]: { toDisplay } },
      });
      setDisplayedStops((prev) => ({ ...prev, [stopID]: toDisplay }));
    },
    []
  );

  const stopPropetiesChanedHandler = useCallback(
    (
      posterID: string,
      stopID: string,
      label_lat: number,
      label_lon: number,
      labelWidth: number,
      labelHeight: number,
      stopOriginalName: string,
      stopModifiedName: string
    ) => {
      getAuthAxios().put(`/api/poster/${posterID}`, {
        posterID,
        stops: {
          [stopID]: {
            stopOriginalName,
            stopModifiedName,
            label_lat,
            label_lon,
            labelWidth,
            labelHeight,
          },
        },
      });
    },
    []
  );

  const labels = useMemo(() => {
    if (!stopDataFromDB) return [];
    return stops
      .map((stop) => {
        const markerLat =
          stopDataFromDB[stop.stop_id]?.label_lat ?? stop.stop_lat;
        const markerLon =
          stopDataFromDB[stop.stop_id]?.label_lon ?? stop.stop_lon;
        if (
          typeof markerLat !== "number" ||
          typeof markerLon !== "number" ||
          isNaN(markerLat) ||
          isNaN(markerLon)
        ) {
          return null;
        }
        return (
          <StopLabel
            key={stop.stop_id}
            showStopLabels={showStopLabels}
            posterID={posterID}
            stop={stop}
            markerLat={markerLat}
            markerLon={markerLon}
            labelWidthFromDB={stopDataFromDB[stop.stop_id]?.labelWidth}
            labelHeightFromDB={stopDataFromDB[stop.stop_id]?.labelHeight}
            stopModifiedName={
              stopDataFromDB[stop.stop_id]?.stopModifiedName || stop.stop_name
            }
            stopPropetiesChanedHandler={stopPropetiesChanedHandler}
            stopOriginalName={stop.stop_name}
            font={stopFont || font}
            fontSize={stopFontSize}
            stopFontColor={stopFontColor}
            isInEditMode={isInEditMode ?? false}
            stopBackgroundColor={stopBackgroundColor}
          />
        );
      })
      .filter(Boolean);
  }, [
    stopDataFromDB,
    posterID,
    stops,
    showStopLabels,
    stopPropetiesChanedHandler,
    stopFont,
    font,
    stopFontSize,
    stopFontColor,
    isInEditMode,
    stopBackgroundColor,
  ]);

  const stopCircleSvg = isSingleDot
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="67" height="67">
      <g>
        <circle id="1" cx="34" cy="34" r="1" stroke="${stopBackgroundColor}" stroke-width="1.5" fill="none"/>
        <circle id="2" cx="34" cy="34" r="1" fill="${stopColor}" />
    </g>
    </svg>`
    : isSimpleDot
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="67" height="67">
      <g>
        <circle id="2" cx="34" cy="34" r="0.5" fill="${stopColor}" />
    </g>
    </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="67" height="67">
    <g>
      <circle id="1" cx="34" cy="34" r="3.2" stroke="snow" stroke-width="1.5" fill="none"/>
      <circle id="1" cx="34" cy="34" r="3" stroke="${stopColor}" stroke-width="1.5" fill="none"/>
      <circle id="2" cx="34" cy="34" r="1" fill="${stopColor}" />
  </g>
  </svg>`;

  const circleIconUrl = encodeURI(
    "data:image/svg+xml," + stopCircleSvg
  ).replaceAll("#", "%23");

  const circleMarkers = useMemo(() => {
    return stops
      .map((stop) => {
        if (
          !displayedStops[stop.stop_id] ||
          stop.stop_id === "OPTIBUS_background"
        ) {
          return null;
        }
        const markerLat =
          stopDataFromDB?.[stop.stop_id]?.marker_lat ?? stop.stop_lat;
        const markerLon =
          stopDataFromDB?.[stop.stop_id]?.marker_lon ?? stop.stop_lon;
        if (
          typeof markerLat !== "number" ||
          typeof markerLon !== "number" ||
          isNaN(markerLat) ||
          isNaN(markerLon)
        ) {
          return null;
        }
        return (
          <Marker
            key={`circle-${stop.stop_id}`}
            longitude={markerLon}
            latitude={markerLat}
            draggable={true}
            onDragEnd={(e) => {
              const { lng, lat } = e.target.getLngLat();
              stopMarkerCircleChangedHandler(
                posterID ?? "",
                stop.stop_id,
                lat,
                lng
              );
            }}
          >
            <div
              style={{
                backgroundImage: `url(${circleIconUrl})`,
                backgroundSize: `${stopCircleSize || 10}px ${stopCircleSize || 10}px`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: (stopCircleSize || 10) + 34,
                height: (stopCircleSize || 10) + 34,
                cursor: "grab",
              }}
            />
          </Marker>
        );
      })
      .filter(Boolean);
  }, [
    stops,
    displayedStops,
    stopDataFromDB,
    posterID,
    stopMarkerCircleChangedHandler,
    circleIconUrl,
    stopCircleSize,
  ]);

  const anyRoute = useMemo(() => {
    if (multiPolyLine) return multiPolyLine;
    if (patterns?.[0]) return [patterns[0].geometry.coordinates];
    return [[]];
  }, [patterns, multiPolyLine]);

  const routeGeoJSON = useMemo(
    () => coordinatesToGeoJSON(anyRoute),
    [anyRoute]
  );

  const middleCoord =
    anyRoute[0]?.length > 0
      ? anyRoute[0][Math.round(anyRoute[0].length / 2)]
      : [0, 0];
  const initialViewState = useMemo(
    () => ({
      longitude: middleCoord[0],
      latitude: middleCoord[1],
      zoom: mapZoom ?? 12,
    }),
    [middleCoord[0], middleCoord[1], mapZoom]
  );

  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (map && anyRoute.length > 0 && anyRoute[0].length > 0) {
      const bounds = anyRoute.flat().reduce(
        (acc, coord) => {
          acc[0] = Math.min(acc[0], coord[0]);
          acc[1] = Math.min(acc[1], coord[1]);
          acc[2] = Math.max(acc[2], coord[0]);
          acc[3] = Math.max(acc[3], coord[1]);
          return acc;
        },
        [Infinity, Infinity, -Infinity, -Infinity]
      );
      map.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { maxZoom: mapZoom ?? 12, padding: 20 }
      );
    }
  }, [anyRoute, mapZoom]);

  useEffect(() => {
    const newDisplayedStops: Record<string, boolean> = {};
    if (stopDataFromDB && Object.keys(stopDataFromDB).length > 0) {
      Object.keys(stopDataFromDB).forEach((stop_id) => {
        if (
          stopDataFromDB[stop_id]?.toDisplay &&
          (!stopIDsToDisplayFromConfig ||
            stopIDsToDisplayFromConfig.includes(stop_id))
        ) {
          newDisplayedStops[stop_id] = true;
        }
      });
    }
    if (stopIDsToDisplayFromConfig) {
      stopIDsToDisplayFromConfig.forEach((stop_id) => {
        const stopExists = stops.some((s) => s.stop_id === stop_id);
        if (
          stopExists &&
          (!stopDataFromDB?.[stop_id] ||
            stopDataFromDB[stop_id]?.toDisplay !== false)
        ) {
          newDisplayedStops[stop_id] = true;
        }
      });
    }
    setDisplayedStops(newDisplayedStops);
  }, [stopDataFromDB, stopIDsToDisplayFromConfig, stops]);

  const displayedPatterns =
    patterns?.filter(
      (p) =>
        displsyedPatternsFromDB[p.properties.route_id]?.toDisplay ?? true
    ) ?? [];

  const sortedLabels = useMemo(
    () =>
      [...labels].sort((a, b) => {
        const aName = `${(a as React.ReactElement).props.stop.stop_name} (${(a as React.ReactElement).props.stop.stop_id})`;
        const bName = `${(b as React.ReactElement).props.stop.stop_name} (${(b as React.ReactElement).props.stop.stop_id})`;
        return aName.localeCompare(bName);
      }),
    [labels]
  );

  return (
    <div
      id="map"
      style={{
        background: backgroundColor || "transparent",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        scrollZoom={false}
        doubleClickZoom={false}
        dragPan={false}
        dragRotate={false}
        touchZoomRotate={false}
        attributionControl={false}
        preserveDrawingBuffer={true}
      >

        {/* Route polylines */}
        {!patterns && anyRoute[0]?.length > 0 && (
          <>
            <Source id="route-outline" type="geojson" data={routeGeoJSON}>
              <Layer
                id="route-outline-layer"
                type="line"
                paint={{
                  "line-color": "snow",
                  "line-width": (pathWeight ?? 10) + 10,
                }}
              />
            </Source>
            <Source id="route-path" type="geojson" data={routeGeoJSON}>
              <Layer
                id="route-path-layer"
                type="line"
                paint={{
                  "line-color": pathColor || "#000",
                  "line-width": pathWeight ?? 10,
                }}
              />
            </Source>
            {routeOverlayPatternNumber != null &&
              multiPolyLine?.[routeOverlayPatternNumber] && (
                <Source
                  id="route-overlay"
                  type="geojson"
                  data={coordinatesToGeoJSON([
                    multiPolyLine[routeOverlayPatternNumber],
                  ])}
                >
                  <Layer
                    id="route-overlay-layer"
                    type="line"
                    paint={{
                      "line-color": routeOverlayPatternColor || "rgba(255,0,0,0.8)",
                      "line-width": (pathWeight ?? 10) * 0.7,
                    }}
                  />
                </Source>
              )}
          </>
        )}

        {patterns &&
          displayedPatterns.map((pattern) => (
            <Source
              key={pattern.properties.route_id}
              id={`pattern-${pattern.properties.route_id}`}
              type="geojson"
              data={coordinatesToGeoJSON([pattern.geometry.coordinates])}
            >
              <Layer
                id={`pattern-outline-${pattern.properties.route_id}`}
                type="line"
                paint={{
                  "line-color": "snow",
                  "line-width": (pathWeight ?? 10) + 10,
                }}
              />
              <Layer
                id={`pattern-path-${pattern.properties.route_id}`}
                type="line"
                paint={{
                  "line-color": pathColor || "#000",
                  "line-width": pathWeight ?? 10,
                }}
              />
            </Source>
          ))}

        {/* Stop toggle panel (replaces LayersControl) */}
        {!isPrintMode && sortedLabels.length > 0 && (
          <div
            className={styles.stopTogglePanel}
            style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}
          >
            <div
              style={{
                background: "white",
                padding: 8,
                borderRadius: 4,
                maxHeight: 300,
                overflowY: "auto",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              {sortedLabels.map((label) => {
                const stop = (label as React.ReactElement).props
                  .stop as (typeof stops)[0];
                return (
                  <label
                    key={stop.stop_id}
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={displayedStops[stop.stop_id] ?? false}
                      onChange={(e) =>
                        stopDisplayToggleHandler(
                          posterID ?? "",
                          stop.stop_id,
                          e.target.checked
                        )
                      }
                    />
                    {` ${stop.stop_name} (${stop.stop_id})`}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Stop labels and markers */}
        {showStopLabels &&
          labels.filter((label) =>
            displayedStops[
              (label as React.ReactElement).props.stop.stop_id as string
            ]
          )}
        {showMarkers && circleMarkers}
      </Map>
    </div>
  );
};

export default RouteMap;
