/* eslint-disable react/react-in-jsx-scope */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Pane,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useRouter } from "next/router";
import { getPosterIDInDB } from "../pages/posters/utils";
import styles from "./map.module.css";
import StopLabel from "./stopLabel";
import axios from "axios";
import { Icon } from "leaflet";
import PropTypes from "prop-types";
import { StopType } from "./stopLabel";

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
  smoothFactor = 5,
  showMarkers = false,
  isInEditMode,
  stopFontSize,
  stopFontColor,
  stopFont,
  stopIDsToDisplayFromConfig,
  stopColor,
  stopCircleSize,
  stopBackgroundColor,
  isSingleDot,
  isSimpleDot,
  isPrintMode,
  stopDataFromDB,
  posterID,
  displsyedPatternsFromDB,
  routeOverlayPatternNumber,
  routeOverlayPatternColor,
  showStopLabels,
}) => {
  /**
   * Lat Lon markers, leave here for testing lat lon vs. xy positions
   */

  // const [posterID, setPosterID] = useState(null);
  // const [stopDataFromDB, setStopDataFromDB] = useState({});
  // const [displsyedPatternsFromDB, setDisplsyedPatternsFromDB] = useState({});

  const initialDisplayedStops = useMemo(() => {
    return stops.reduce((stopObj, stop) => {
      // If no config is provided, show all stops
      // If config is provided, only show stops in the config
      if (
        !stopIDsToDisplayFromConfig ||
        stopIDsToDisplayFromConfig.includes(stop.stop_id)
      ) {
        stopObj[stop.stop_id] = true;
      }
      return stopObj;
    }, {});
  }, [stops, stopIDsToDisplayFromConfig]);

  const [displayedStops, setDisplayedStops] = useState(initialDisplayedStops);


  const tileNameToUrl = {
    StamenToner:
      "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png",
    StamenTonerLite:
      "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png",
    StamenTonerLines:
      "https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png",
    StamenTonerBackground:
      "https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.png",
    StamenTerrainLines:
      "https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}{r}.png",
    CartoDBLiteNoLabels:
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    AlidadeSmooth:
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    Mapbox:
      "https://api.mapbox.com/styles/v1/shakedk/clqbhnool00ab01pj57js18y6/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic2hha2VkayIsImEiOiJjbG9qMTZjajEwMTRtMmtwN2F0Mzk0OWVwIn0.VkgbKa4iLFUFERkCOqJC9g",
  };
  
  const getTileLayer = (tileLayerName) => (
    <TileLayer
      opacity={mapOpacity || 1}
      attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url={tileNameToUrl[tileLayerName]}
      subdomains="abcd"
      minZoom={0}
      maxZoom={20}
    />
  );

  const stopMarkerCircleChangedHandler = (
    posterID: string,
    stopID: string,
    marker_lat: number,
    marker_lon: number
  ) => {
    const params = {
      posterID: posterID,
      stops: {},
    };
    params.stops[stopID] = {
      marker_lat,
      marker_lon,
    };
    axios.put(`/api/poster/${posterID}`, params);
  };
  const stopDisplayToggleHandler = (
    posterID: string,
    stopID: string,
    toDisplay: boolean
  ) => {
    const params = {
      posterID: posterID,
      stops: {},
    };
    params.stops[stopID] = {
      toDisplay,
    };
    axios.put(`/api/poster/${posterID}`, params);
  };
  const stopPropetiesChanedHandler = (
    posterID: string,
    stopID: string,
    label_lat: number,
    label_lon: number,
    labelWidth: number,
    labelHeight: number,
    stopOriginalName: string,
    stopModifiedName: string
  ) => {
    const params = {
      posterID: posterID,
      stops: {},
    };
    params.stops[stopID] = {
      stopOriginalName,
      stopModifiedName,
      label_lat,
      label_lon,
      labelWidth,
      labelHeight,
    };
    axios.put(`/api/poster/${posterID}`, params);
  };
  const router = useRouter();
  // useEffect(() => {
  //   async function getData() {
  //     const posterType = router.query.posterType;
  //     const _routeID = router.query.routeID;
  //     const id = await getPosterIDInDB(posterType, _routeID);

  //     const res = await axios.get(`/api/poster/${id}`);
  //     setPosterID(id);
  //     setStopDataFromDB(res.data.stops || {});
  //     setDisplsyedPatternsFromDB(res.data.patterns || {});
  //   }
  //   getData();
  // }, [router.query]);
  const labels = useMemo(() => {
    if (!stopDataFromDB) {
      return [];
    }
    return stops.map((stop) => {
      const markerLat = stopDataFromDB[stop.stop_id]?.label_lat ?? stop.stop_lat;
      const markerLon = stopDataFromDB[stop.stop_id]?.label_lon ?? stop.stop_lon;
      
      // Validate coordinates are valid numbers before creating StopLabel
      if (typeof markerLat !== 'number' || typeof markerLon !== 'number' || 
          isNaN(markerLat) || isNaN(markerLon)) {
        return null;
      }
      
      return (
        <StopLabel
          showStopLabels={showStopLabels}
          posterID={posterID}
          key={stop.stop_id}
          stop={stop}
          // stopDataFromDB={stopDataFromDB}
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
          isInEditMode={isInEditMode}
          stopBackgroundColor={stopBackgroundColor}
        />
      );
    }).filter(Boolean); // Remove null entries
  }, [stopDataFromDB, posterID, stops, showStopLabels, stopPropetiesChanedHandler, stopFont, font, stopFontSize, stopFontColor, isInEditMode, stopBackgroundColor]);
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

  const url = encodeURI(
    "data:image/svg+xml," + stopCircleSvg
  ).replaceAll("#", "%23");

  const CustomIcon = Icon.extend({
    options: {
      iconSize: [stopCircleSize, stopCircleSize],
      iconAnchor: [stopCircleSize / 2 + 17, stopCircleSize / 2 + 17],
    },
  });

  const circleMarkers = stops.map((stop) => {
    const eventHandlers = {
      dragend(e) {
        const marker = e.target;
        if (marker && marker.getLatLng) {
          const newPosition = marker.getLatLng();
          stopMarkerCircleChangedHandler(
            posterID,
            stop.stop_id,
            newPosition.lat,
            newPosition.lng
          );
        }
      },
    };
    
    
    if (displayedStops[stop.stop_id] && stop.stop_id !== "OPTIBUS_background") {
      const markerLat = stopDataFromDB?.[stop.stop_id]?.marker_lat ?? stop.stop_lat;
      const markerLon = stopDataFromDB?.[stop.stop_id]?.marker_lon ?? stop.stop_lon;
      
      // Validate coordinates are valid numbers
      if (typeof markerLat !== 'number' || typeof markerLon !== 'number' || 
          isNaN(markerLat) || isNaN(markerLon)) {
        return null;
      }
      
      return (
        <Marker
          key={`${stop.stop_name} (${stop.stop_id})`}
          eventHandlers={eventHandlers}
          position={[markerLat, markerLon]}
          draggable={true}
          icon={
            // @ts-ignore
            new CustomIcon({ iconUrl: url })
          }
          zIndexOffset={500}
        />
      );
    } else {
      return null;
    }
  });


  const anyRoute = useMemo(() => {
    if (multiPolyLine) {
      return multiPolyLine;
    } else {
      return [patterns[0].geometry.coordinates];
    }
  }, [patterns, multiPolyLine]);

  const middleOfRoute = Math.round(anyRoute[0].length / 2);
  const reverseMultiPolyLine = useCallback((path): [number, number][][] => {
    const rev = path.map((polyLine) =>
      polyLine.map((coord) => [coord[1], coord[0]])
    );
    return rev;
  }, []);

  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map) {
      map.fitBounds(reverseMultiPolyLine(anyRoute), { maxZoom: mapZoom });
    }
  }, [map, anyRoute, mapZoom]);

  useEffect(() => {
    const newDisplayedStops: { [key: string]: boolean } = {};
    
    // First, process stops from DB
    if (stopDataFromDB && Object.keys(stopDataFromDB).length > 0) {
      Object.keys(stopDataFromDB).forEach((stop_id) => {
        // Only include stops that:
        // 1. Have toDisplay: true in DB, AND
        // 2. Are in stopIDsToDisplayFromConfig (if config is provided)
        if (
          stopDataFromDB[stop_id]?.toDisplay &&
          (!stopIDsToDisplayFromConfig || stopIDsToDisplayFromConfig.includes(stop_id))
        ) {
          newDisplayedStops[stop_id] = true;
        }
      });
    }
    
    // Also include stops from stopIDsToDisplayFromConfig that don't have DB entries yet
    // but exist in the stops array
    if (stopIDsToDisplayFromConfig) {
      stopIDsToDisplayFromConfig.forEach((stop_id) => {
        const stopExists = stops.some((stop) => stop.stop_id === stop_id);
        // If stop exists in stops array and either:
        // - No DB entry exists yet, OR
        // - DB entry exists but toDisplay is not explicitly false
        if (stopExists && (!stopDataFromDB?.[stop_id] || stopDataFromDB[stop_id]?.toDisplay !== false)) {
          newDisplayedStops[stop_id] = true;
        }
      });
    }
    
    setDisplayedStops(newDisplayedStops);
  }, [stopDataFromDB, stopIDsToDisplayFromConfig, stops]);

  const MapEventer = useCallback(() => {
    useMapEvents({
      overlayadd(overlay) {
        const stopMatch = overlay.name.match(/\((.*?)\)/);
        if (stopMatch) {
          const stopID = stopMatch[1];
          stopDisplayToggleHandler(posterID, stopID, true);
        } else {
          const pattrenName = overlay.name;
        }
      },
      overlayremove(overlay) {
        const stopMatch = overlay.name.match(/\((.*?)\)/);
        if (stopMatch) {
          const stopID = stopMatch[1];
          stopDisplayToggleHandler(posterID, stopID, false);
        }
      },
    });

    return null;
  }, [displayedStops, setDisplayedStops, posterID]);

  return (
    <MapContainer
      ref={setMap}
      id="map"
      center={reverseMultiPolyLine(anyRoute)[0][middleOfRoute]}
      zoom={12}
      zoomSnap={0.1}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
      style={{
        background: backgroundColor || "transparent",
        height: "100%",
        width: "100%",
      }}
    >
      {showGeoLayer ? getTileLayer(tileLayerName) : null}
      {/* When there is only a single pattern - can be removed in the future */}
      <Pane name="route-path" style={{ zIndex: 499, cursor: "default" }}>
        {!patterns && (
          <Polyline
            pathOptions={{ color: "snow", weight: pathWeight + 10 || 10 }}
            positions={reverseMultiPolyLine(anyRoute)}
            smoothFactor={smoothFactor}
          />
        )}
        {!patterns && (
          <Polyline
            key="routePath"
            pathOptions={{ color: pathColor, weight: pathWeight || 10 }}
            positions={reverseMultiPolyLine(anyRoute)}
            smoothFactor={smoothFactor}
          />
        )}
        {/* Enabled routeOverlayPatternNumber for !patterns only out of laziness */}
        {!patterns && routeOverlayPatternNumber && (
          <Polyline
            className={styles.overlayRoute}
            pathOptions={{
              color: routeOverlayPatternColor,
              weight: pathWeight * 0.7 || 10,
              // dashArray: "20, 100",
            }}
            positions={reverseMultiPolyLine([
              multiPolyLine[routeOverlayPatternNumber],
            ])}
            smoothFactor={smoothFactor}
          />
        )}

        {/* Stop control */}
        {!isPrintMode && (
          <LayersControl position="topright">
            {labels
              .sort((a, b) => {
                const aName = `${a.props.stop.stop_name} (${a.props.stop.stop_id})`;
                const bName = `${b.props.stop.stop_name} (${b.props.stop.stop_id})`;
                return aName.localeCompare(bName);
              })
              .map((label) => {
                return (
                  <LayersControl.Overlay
                    key={`${label.props.stop.stop_name} (${label.props.stop.stop_id})`}
                    name={`${label.props.stop.stop_name} (${label.props.stop.stop_id})`}
                    checked={displayedStops[label.props.stop.stop_id]}
                  >
                    {label}
                  </LayersControl.Overlay>
                );
              })}
          </LayersControl>
        )}
        {patterns &&
          patterns.map((pattern) =>
            // displsyedPatternsFromDB[pattern.properties.route_id]?.toDisplay ?
            true ? (
              <>
                <Polyline
                  pathOptions={{
                    color: "snow",
                    weight: pathWeight + 10 || 10,
                  }}
                  positions={reverseMultiPolyLine([
                    pattern.geometry.coordinates,
                  ])}
                  smoothFactor={smoothFactor}
                />
                <Polyline
                  key={pattern.properties.route_id}
                  pathOptions={{
                    color: pathColor,
                    weight: pathWeight || 10,
                  }}
                  positions={reverseMultiPolyLine([
                    pattern.geometry.coordinates,
                  ])}
                  smoothFactor={smoothFactor}
                />
              </>
            ) : null
          )}
        {/* Print Mode Stops */}
        {isPrintMode &&
          showStopLabels &&
          labels.filter((label) => displayedStops[label.props.stop.stop_id])
        }
        {/* Edit Mode Stops - show labels directly */}
        {!isPrintMode &&
          showStopLabels &&
          labels.filter((label) => displayedStops[label.props.stop.stop_id])
        }
        {showMarkers && circleMarkers}
      </Pane>
      <MapEventer />
    </MapContainer>
  );
};

RouteMap.prototypes = {
  // Should be [number, number][]
  multiPolyLine: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.arrayOf(function (props, propName) {
        if (
          !Array.isArray(props.TWO_NUMBERS) ||
          props.TWO_NUMBERS.length != 2 ||
          !props.TWO_NUMBERS.every(Number.isInteger)
        ) {
          return new Error(`${propName} needs to be an array of two numbers`);
        }

        return null;
      })
    )
  ),
  patterns: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      properties: PropTypes.shape({
        route_id: PropTypes.string.isRequired,
        agency_id: PropTypes.string,
        route_short_name: PropTypes.string.isRequired,
        route_long_name: PropTypes.string.isRequired,
        route_desc: PropTypes.string,
        route_type: PropTypes.string,
        route_color: PropTypes.string,
      }),
      geometry: PropTypes.shape({
        type: PropTypes.string,
        coordinates: PropTypes.arrayOf(
          PropTypes.arrayOf(function (props, propName) {
            if (
              !Array.isArray(props.TWO_NUMBERS) ||
              props.TWO_NUMBERS.length != 2 ||
              !props.TWO_NUMBERS.every(Number.isInteger)
            ) {
              return new Error(
                `${propName} needs to be an array of two numbers`
              );
            }

            return null;
          })
        ),
      }),
    })
  ),
  stops: PropTypes.arrayOf(StopType).isRequired,
  backgroundColor: PropTypes.string,
  tileLayerName: PropTypes.oneOf(["StamenToner", null]),
  pathColor: PropTypes.string,
  pathWeight: PropTypes.number || null,
  mapZoom: PropTypes.number,
  font: PropTypes.string,
  showGeoLayer: PropTypes.bool,
  smoothFactor: PropTypes.number,
  showMarkers: PropTypes.bool,
  stopFontSize: PropTypes.number,
  stopFontColor: PropTypes.string,
  stopIDsToDisplayFromConfig: PropTypes.array,
  mapOpacity: PropTypes.number,
  stopCircleSize: PropTypes.number,
  stopBackgroundColor: PropTypes.string,
  isSingleDot: PropTypes.bool,
  isSimpleDot: PropTypes.bool,
  isInEditMode: PropTypes.bool,
  isPrintMode: PropTypes.bool,
  stopDataFromDB: PropTypes.any,
  posterID: PropTypes.string,
  displsyedPatternsFromDB: PropTypes.any,
  routeOverlayPatternNumber: PropTypes.number || null,
  routeOverlayPatternColor: PropTypes.string,
  showStopLabels: PropTypes.bool,
};


export default RouteMap;
