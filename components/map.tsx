import {
  MapContainer,
  Polyline,
  Pane,
  useMapEvents,
  TileLayer,
} from "react-leaflet";
import React, { useState, useMemo, useEffect } from "react";

import "leaflet/dist/leaflet.css";
import "leaflet-offline";

import StopLabel, { StopType } from "./stopLabel";
import PropTypes from "prop-types";

const StopLabels = ({ stops }) => {
  const [labels, setLabels] = useState(null);
  const getLocation = (x: number, y: number, pointPositions: any[]) => {
    const xyPos = [x + 10, y - 20];

    pointPositions.push(xyPos);
    return xyPos;
  };

  const pointPositions = [];
  const map = useMapEvents({
    moveend() {
      setLabels(
        stops.map((stop) => {
          const xyPos = map.latLngToLayerPoint([stop.stop_lat, stop.stop_lon]);
          const mapPixelOrigin = map.getPixelOrigin();
          const [xPos, yPos] = getLocation(xyPos.x, xyPos.y, pointPositions);
          return (
            <StopLabel
              pointPositions={pointPositions}
              key={stop.stop_id}
              xPos={xPos}
              yPos={yPos}
              stop={stop}
            />
          );
        })
      );
    },
  });
  // Labels wont load until we solve the fit bounds issue
  return labels === null ? null : (
    <Pane name="stop-labels" style={{ zIndex: 5000, cursor: "default" }}>
      {labels}
    </Pane>
  );
};

const getTileLayer = (tileLayerName) => {
  switch (tileLayerName) {
    case "StamenToner":
      return (
        <TileLayer
          opacity={0.2}
          attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          minZoom={0}
          maxZoom={20}
        />
      );
    default:
      break;
  }
};
StopLabels.propTypes = {
  stops: PropTypes.arrayOf(StopType),
};

const RouteMap = ({
  polyline,
  stops,
  backgroundColor,
  tileLayerName,
  pathColor,
  mapZoom,
}) => {
  /**
   * Lat Lon markers, leave here for testing lat lon vs. xy positions
   */
  // const markers = stops.map((stop) => {
  //   return (
  //     <Marker
  //       key={stop.stop_id}
  //       position={[stop.stop_lat, stop.stop_lon]}
  //       icon={
  //         new Icon({
  //           iconUrl: "/point.svg",
  //           iconSize: [50, 50],
  //         })
  //       }
  //       zIndexOffset={200}
  //     >
  //       {/* <Tooltip permanent className={styles.markerTooltip}>
  //     {stop.stop_name}
  //   </Tooltip> */}
  //     </Marker>
  //   );
  // });
  const middleOfRoute = Math.round(polyline.length / 2);
  const reversePolyLine = useMemo((): [number, number][] => {
    return polyline.map((coord) => [coord[1], coord[0]]);
  }, [polyline]);

  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map) {
      map.fitBounds(reversePolyLine, { maxZoom: mapZoom });
    }
  }, [map]);

  return (
    <MapContainer
      ref={setMap}
      id="map"
      center={reversePolyLine[middleOfRoute]}
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
      {getTileLayer(tileLayerName)}
      <Pane name="route-path" style={{ zIndex: 499, cursor: "default" }}>
        <Polyline
          pathOptions={{ color: pathColor, weight: 10 }}
          positions={reversePolyLine}
          smoothFactor={5}
        />
        {/* {markers} */}
      </Pane>

      <Pane name="stop-dots" style={{ zIndex: 500, cursor: "default" }}>
        <StopLabels stops={stops} />
      </Pane>
    </MapContainer>
  );
};

RouteMap.prototypes = {
  // Should be [number, number][]
  polyline: PropTypes.arrayOf(
    PropTypes.arrayOf(function (props, propName, componentName) {
      if (
        !Array.isArray(props.TWO_NUMBERS) ||
        props.TWO_NUMBERS.length != 2 ||
        !props.TWO_NUMBERS.every(Number.isInteger)
      ) {
        return new Error(`${propName} needs to be an array of two numbers`);
      }

      return null;
    }).isRequired
  ),
  stops: PropTypes.arrayOf(StopType).isRequired,
  backgroundColor: PropTypes.string,
  tileLayerName: PropTypes.oneOf(["StamenToner", null]),
  pathColor: PropTypes.string,
  mapZoom: PropTypes.number,
};

export default RouteMap;
