import {
  MapContainer,
  Polyline,
  MapConsumer,
  Marker,
  Pane,
  useMapEvents,
} from "react-leaflet";
import React, { useState, useMemo } from "react";
import { Icon, Point } from "leaflet";
import "leaflet/dist/leaflet.css";

import { polyline, stops } from "./r60 path";
// import { polyline, stops } from "./rNycF path";
import StopLabel from "./stopLabel";
import { Stop } from "./types";

const middleOfRoute = Math.round(polyline.length / 2);

interface stopLabelsProps {
  stops: Stop[]
}

const  StopLabels = ({stops}: stopLabelsProps) => {
  const [labels, setLabels] = useState(null);

  const map = useMapEvents({
    moveend() {
      setLabels(
        stops.map((stop: Stop) => {
          const xyPos = map.latLngToLayerPoint([stop.stop_lat, stop.stop_lon]);
          return (
            <StopLabel
              key={stop.stop_id}
              xyPos={xyPos}
              stop={stop}
            />
          );
        })
      );
    },
  });
  return labels === null ? null : (
    <Pane name="stop-labels" style={{ zIndex: 200, cursor: "default" }}>
      {labels}
    </Pane>
  );
}

/**
 * Lat Lon markers, leave here for testing lat lon vs. xy positions
 */
const markers = stops.map((stop) => {
  return (
    <Marker
      key={stop.stop_id}
      position={[stop.stop_lat, stop.stop_lon]}
      icon={
        new Icon({
          iconUrl: "/point.svg",
          iconSize: [50, 50],
        })
      }
      zIndexOffset={200}
    >
      {/* <Tooltip permanent className={styles.markerTooltip}>
      {stop.stop_name}
    </Tooltip> */}
    </Marker>
  );
});

const RouteMap = () => {
  const reversePolyLine = useMemo((): [number, number][] => {
    return polyline.map((coord) => [coord[1], coord[0]]);
  }, [polyline]);

  return (
    <MapContainer
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
        background: "pink",
        height: 1754,
        width: 1240,
        border: "50px GhostWhite solid",
      }}
    >
      <MapConsumer>
        {(map) => {
          map.fitBounds(reversePolyLine, { maxZoom: 11.5
           });
          return (
            <Pane name="route-path" style={{ zIndex: 100, cursor: "default" }}>
              <Polyline
                pathOptions={{ color: "white", weight: 10 }}
                positions={reversePolyLine}
              />
              {markers}
            </Pane>
          );
        }}
      </MapConsumer>
      <StopLabels stops={stops}/>
    </MapContainer>
  );
};

export default RouteMap;
