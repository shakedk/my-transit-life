import {
  MapContainer,
  Polyline,
  MapConsumer,
  FeatureGroup,
  Marker,
  Tooltip,
  Pane,
  useMapEvents,
} from "react-leaflet";
import React, { useState } from "react";
import { Icon, Popup } from "leaflet";
import "leaflet/dist/leaflet.css";

import styles from "./map.module.css";
import { polyline, stops } from "./r60 path";
import { Badge } from "theme-ui";

const reverseCoordinates = (
  coordsArr: [number, number][]
): [number, number][] => {
  return coordsArr.map((coord) => [coord[1], coord[0]]);
};
const middleOfRoute = Math.round(polyline.length / 2);

function StopLabels(stops) {
  const [labels, setLabels] = useState(null);
  const map = useMapEvents({
    moveend() {
      setLabels(
        stops.stops.map((stop) => {
          const xyPos = map.latLngToLayerPoint([stop.stop_lat, stop.stop_lon]);
          return (
            <Badge
              key={stop.stop_id}
              sx={{
                zIndex: 200,
                position: "absolute",
                height: 30,
                padding: 0,
                top: xyPos.y,
                left: xyPos.x,
                fontSize: 10,
                fontFamily: "Gill",
                color: "black",
                // transform: "rotate(50deg)"
              }}
              color="white"
              bg="transparent"
            >
              {/* {stop.stop_name} */}
              {"\u2022"}
            </Badge>
          );
        })
      );
    },
  });
  return labels === null ? null : (
    <Pane name="stop-labels" style={{ zIndex: 200 }}>
      {labels}
    </Pane>
  );
}

const RouteMap = () => {
  return (
    <MapContainer
      id="map"
      center={reverseCoordinates(polyline)[middleOfRoute]}
      zoom={12}
      zoomSnap={0.1}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
      style={{
        background: "pink",
        height: 1754,
        width: 1240,
        // border: "50px white solid",
      }}
    >
      <MapConsumer>
        {(map) => {
          map.fitBounds(reverseCoordinates(polyline), { maxZoom: 11.5 });
          return (
            <Pane name="route-path" style={{ zIndex: 100 }}>
              <Polyline
                pathOptions={{ color: "white", weight: 10 }}
                positions={reverseCoordinates(polyline)}
              />
            </Pane>
          );
        }}
      </MapConsumer>
      <StopLabels stops={stops} />
    </MapContainer>
  );
};

export default RouteMap;
