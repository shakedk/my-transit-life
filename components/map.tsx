/* eslint-disable react/react-in-jsx-scope */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayersControl, MapContainer, Marker, Pane, Polyline, TileLayer, useMapEvents } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useRouter } from "next/router";
import { getPosterIDInDB } from "../pages/posters/utils";

import StopLabel from "./stopLabel";
import axios from "axios";
import { Icon } from "leaflet";
import PropTypes from "prop-types";
import { StopType } from "./stopLabel";


const RouteMap = ({
  multiPolyLine,
  stops,
  backgroundColor,
  mapOpacity,
  tileLayerName,
  pathColor,
  pathWeight,
  mapZoom,
  font,
  showGeoLayer,
  smoothFactor,
  showMarkers,
  isInEditMode,
  stopFontSize,
  stopFontColor,
  stopIDsToDisplayFromConfig,
  stopColor,
  stopCircleSize,
  stopBackgroundColor,
  isSingleDot,
  isPrintMode
}) => {
  /**
   * Lat Lon markers, leave here for testing lat lon vs. xy positions
   */

  const [posterID, setPosterID] = useState(null);
  const [stopDataFromDB, setStopDataFromDB] = useState({});

  const [displayedStops, setDisplayedStops] = useState(stops.reduce((stopObj, stop) => {
    if (!stopIDsToDisplayFromConfig || stopIDsToDisplayFromConfig.includes(stop.stop_id)) {
      stopObj[stop.stop_id] = true;
    }
    return stopObj;
  }, {}));

  const tileNameToUrl = {
    StamenToner:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png",
    StamenTonerLite:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png",
    StamenTonerLines:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png",
    StamenTonerBackground:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png",
    StamenTerrainLines:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-lines/{z}/{x}/{y}{r}.png",
    StamenHybrid:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png",
    CartoDBLiteNoLabels:
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  };
  const getTileLayer = (tileLayerName) => (
    <TileLayer
      opacity={mapOpacity || 0.5}
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
    };
    params[stopID] = {
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
    };
    params[stopID] = {
      toDisplay
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
    };
    params[stopID] = {
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
  useEffect(() => {
    async function getData() {
      const posterType = router.query.posterType;
      const _routeID = router.query.routeID;
      const id = await getPosterIDInDB(posterType, _routeID);

      const res = await axios.get(`/api/poster/${id}`);
      setPosterID(id);
      setStopDataFromDB(res.data || {});
    }
    getData();
  }, [router.query]);
  const labels = useMemo(() => {
    return (
      stopDataFromDB &&
      stops.map((stop) => {
        return (
          <StopLabel
            posterID={posterID}
            key={stop.stop_id}
            stop={stop}
            // stopDataFromDB={stopDataFromDB}
            markerLat={
              stopDataFromDB[stop.stop_id]?.label_lat || stop.stop_lat
            }
            markerLon={
              stopDataFromDB[stop.stop_id]?.label_lon || stop.stop_lon
            }
            labelWidthFromDB={stopDataFromDB[stop.stop_id]?.labelWidth}
            labelHeightFromDB={stopDataFromDB[stop.stop_id]?.labelHeight}
            stopModifiedName={
              stopDataFromDB[stop.stop_id]?.stopModifiedName || stop.stop_name
            }
            stopPropetiesChanedHandler={stopPropetiesChanedHandler}
            stopOriginalName={stop.stop_name}
            font={font}
            fontSize={stopFontSize}
            stopFontColor={stopFontColor}
            isInEditMode={isInEditMode}
            stopBackgroundColor={stopBackgroundColor}
          />
        );
      })
    );
  }, [stopDataFromDB, posterID, stops]);
  const stopCircleSvg = isSingleDot ?
    `<svg xmlns="http://www.w3.org/2000/svg" width="67" height="67">
      <g>
        <circle id="1" cx="34" cy="34" r="1" stroke="${stopBackgroundColor}" stroke-width="1.5" fill="none"/>
        <circle id="2" cx="34" cy="34" r="1" fill="${stopColor}" />
    </g>
    </svg>` :
    `<svg xmlns="http://www.w3.org/2000/svg" width="67" height="67">
      <g>
       <circle id="1" cx="34" cy="34" r="3.2" stroke="snow" stroke-width="1.5" fill="none"/>
             <circle id="1" cx="34" cy="34" r="3" stroke="${stopColor}" stroke-width="1.5" fill="none"/>
             <circle id="2" cx="34" cy="34" r="1" fill="${stopColor}" />
    </g>
    </svg>`;

  const url = encodeURI("data:image/svg+xml," + stopCircleSvg).replaceAll("#", "%23");

  const CustomIcon = Icon.extend({
    options: {
      iconSize: [stopCircleSize, stopCircleSize],
      iconAnchor: [stopCircleSize / 2, stopCircleSize / 2],
    },
  });

  const circleMarkers = stops.map((stop) => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const newPosition = markerRef.current.getLatLng();
          stopMarkerCircleChangedHandler(
            posterID,
            stop.stop_id,
            newPosition.lat,
            newPosition.lng
          );
        },
      }),
      [posterID]
    );
    if (
      displayedStops[stop.stop_id]
    ) {
      return (
        stop.stop_id !== 'OPTIBUS_background' &&
        <Marker
          key={`${stop.stop_name} (${stop.stop_id})`}
          eventHandlers={eventHandlers}
          ref={markerRef}
          position={[
            stopDataFromDB[stop.stop_id]?.marker_lat || stop.stop_lat,
            stopDataFromDB[stop.stop_id]?.marker_lon || stop.stop_lon,
          ]}
          draggable={isInEditMode}
          icon={
            //@ts-ignore
            new CustomIcon({ iconUrl: url })
          }
          zIndexOffset={500}
        ></Marker>
      );
    } else {
      return null;
    }
  });

  const middleOfRoute = Math.round(multiPolyLine[0].length / 2);
  const reverseMultiPolyLine = useMemo((): [number, number][][] => {
    return multiPolyLine.map((polyLine) =>
      polyLine.map((coord) => [coord[1], coord[0]])
    );
  }, [multiPolyLine]);

  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map) {
      map.fitBounds(reverseMultiPolyLine, { maxZoom: mapZoom });
    }
  }, [map]);

  useEffect(() => {
    if (Object.keys(stopDataFromDB).length > 0) {
      setDisplayedStops(Object.keys(stopDataFromDB).reduce((stopsToDisplay, stop_id) => {
        if (stopDataFromDB[stop_id].toDisplay) {
          stopsToDisplay[stop_id] = true;
          return stopsToDisplay;
        } else {
          return stopsToDisplay;
        }
      }, {}))
    }
  }, [stopDataFromDB]);

  const routePath =
    <Polyline
      key="routePath"
      pathOptions={{ color: pathColor, weight: pathWeight || 10 }}
      positions={reverseMultiPolyLine}
      smoothFactor={smoothFactor}
    />

  const MapEventer = useCallback(() => {
    useMapEvents({
      overlayadd(overlay) {
        const stopID = (overlay.name.match(/\((.*?)\)/)[1]);
        stopDisplayToggleHandler(posterID, stopID, true);

      },
      overlayremove(overlay) {
        const stopID = (overlay.name.match(/\((.*?)\)/)[1]);
        stopDisplayToggleHandler(posterID, stopID, false);
      }
    })

    return null;

  }, [displayedStops, setDisplayedStops, routePath, posterID]);

  return (
    <MapContainer
      ref={setMap}
      id="map"
      center={reverseMultiPolyLine[0][middleOfRoute]}
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
      <Pane name="route-path" style={{ zIndex: 499, cursor: "default" }}>
        <Polyline
          pathOptions={{ color: "snow", weight: pathWeight + 10 || 10 }}
          positions={reverseMultiPolyLine}
          smoothFactor={smoothFactor}
        />
        {routePath}
        {!isPrintMode && <LayersControl position="topright">
          {labels.sort((a, b) => {
            const aName = `${a.props.stop.stop_name} (${a.props.stop.stop_id})`;
            const bName = `${b.props.stop.stop_name} (${b.props.stop.stop_id})`;
            return aName.localeCompare(bName);
          }).map(label => {
            return (
              <LayersControl.Overlay key={`${label.props.stop.stop_name} (${label.props.stop.stop_id})`}
                name={`${label.props.stop.stop_name} (${label.props.stop.stop_id})`}
                // NOT WORKING WHY
                checked={displayedStops[label.props.stop.stop_id]}>

                {label}
              </LayersControl.Overlay>
            )
          })}
        </LayersControl>
        }
        {isPrintMode && labels && labels.filter(stopLabel => displayedStops[stopLabel.key])}
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
      PropTypes.arrayOf(function (props, propName, componentName) {
        if (
          !Array.isArray(props.TWO_NUMBERS) ||
          props.TWO_NUMBERS.length != 2 ||
          !props.TWO_NUMBERS.every(Number.isInteger)
        ) {
          return new Error(`${propName} needs to be an array of two numbers`);
        }

        return null;
      })
    ).isRequired
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
  isInEditMode: PropTypes.bool,
  isPrintMode: PropTypes.bool,
};

RouteMap.defaultProps = {
  showGeoLayer: true,
  smoothFactor: 5,
  showMarkers: false,
};

export default RouteMap;
