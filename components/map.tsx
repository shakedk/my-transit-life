import {
  MapContainer,
  Pane,
  useMapEvents,
  TileLayer,
  Marker,
  Polyline,
} from "react-leaflet";
import React, { useState, useMemo, useEffect } from "react";

import "leaflet/dist/leaflet.css";
import "leaflet-offline";
import { useRouter } from "next/router";
import { getPosterIDInDB } from "../pages/posters/utils";

import StopLabel, { StopType } from "./stopLabel";
import PropTypes from "prop-types";
import { Icon } from "leaflet";
import axios from "axios";

const StopLabels = ({ stops, font, posterID }) => {
  const [labels, setLabels] = useState(null);
  const getStopLabelLocation = (map, stop, stopDataFromDB) => {
    const xy = map.latLngToLayerPoint([
      stop.stop_lat,
      stop.stop_lon,
    ]);
    // The +10 and -20 is required to adjust the labels correctly
    // The 228 237 is probably due to the text area size
    const x = stopDataFromDB && stopDataFromDB.x ? stopDataFromDB.x - 475
     : xy.x + 10;
    const y = stopDataFromDB && stopDataFromDB.y ? stopDataFromDB.y - 120
     : xy.y - 20;
    return [x, y];
  };

  // // const [stopDataFromDB, setStopDataFromDB] = useState(null);
  // useEffect(() => {
  //   async function fetchData() {
  //   const res = await axios.get(`/api/poster/${posterID}`);
  //   // setStopDataFromDB(res.data);
  // }

  //   // fetchData();
  // }, []);

  // const pointPositions = [];

  const stopPropetiesChanedHandler = (
    stopID: string,
    x: number,
    y: number,
    labelWidth: number,
    labelHieght: number,
    stopOriginalName: string,
    stopModifiedName: string
  ) => {
    const params = {
      posterID,
    };
    params[stopID] = {
      stopOriginalName,
      stopModifiedName,
      x,
      y,
      labelWidth,
      labelHieght,
    };

    console.log(stopOriginalName, " ", params)

    axios.put(`/api/poster/${posterID}`, params);
  };
  const map = useMapEvents({
    async moveend() {
      const res = await axios.get(`/api/poster/${posterID}`);
      const stopDataFromDB = res.data;

      setLabels(
        stops.map((stop) => {
          const stopOriginalName = stop.stop_name.replace(".", "");
          const [x, y] = getStopLabelLocation(
            map,
            stop,
            stopDataFromDB[stopOriginalName]
          );

          return posterID ? (
            <StopLabel
              // pointPositions={pointPositions}
              key={stopOriginalName}
              stopPropetiesChanedHandler={stopPropetiesChanedHandler}
              x={x}
              y={y}
              labelWidth={
                stopDataFromDB[stopOriginalName] &&
                stopDataFromDB[stopOriginalName].labelWidth
              }
              labelHeight={
                stopDataFromDB[stopOriginalName] &&
                stopDataFromDB[stopOriginalName].labelHeight
              }
              stopOriginalName={stop.stop_name}
              stopModifiedName={
                (stopDataFromDB[stopOriginalName] &&
                  stopDataFromDB[stopOriginalName].stopModifiedName) ||
                stop.stop_name
              }
              font={font}
              // posterID={posterID}
            />
          ) : null;
        })
      );
    },
  });
  // Labels wont load until we solve the fit bounds issue
  return labels !== null ? (
    <Pane name="stop-labels" style={{ zIndex: 5000, cursor: "default" }}>
      {labels}
    </Pane>
  ) : null;
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
  multiPolyLine,
  stops,
  backgroundColor,
  tileLayerName,
  pathColor,
  mapZoom,
  font,
  showGeoLayer,
  smoothFactor,
  showMarkers,

}) => {
  /**
   * Lat Lon markers, leave here for testing lat lon vs. xy positions
   */

  const [posterID, setPosterID] = useState(null);
  const markers = stops.map((stop) => {
    return (
      <Marker
        key={stop.stop_id}
        position={[stop.stop_lat, stop.stop_lon]}
        icon={
          new Icon({
            iconUrl: "/point.svg",
            iconSize: [300, 300],
          })
        }
        zIndexOffset={500}
      >
        {/* <Tooltip permanent className={styles.markerTooltip}>
      {stop.stop_name}
    </Tooltip> */}
      </Marker>
    );
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

  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const posterType = router.pathname.replace("/posters/", "");
      const _routeID = router.query.routeID;
      const id = await getPosterIDInDB(posterType, _routeID);

      setPosterID(id);
    };
    fetchData();
  }, []);


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
          pathOptions={{ color: pathColor, weight: 10 }}
          positions={reverseMultiPolyLine}
          smoothFactor={smoothFactor}
        />
        {showMarkers && markers}
      </Pane>

      <Pane name="stop-dots" style={{ zIndex: 500, cursor: "default" }}>
        {posterID && (
          <StopLabels
            stops={stops}
            font={font}
            posterID={posterID}
            // routeID={routeID}
          />
        )}
      </Pane>
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
  mapZoom: PropTypes.number,
  font: PropTypes.string,
  showGeoLayer: PropTypes.bool,
  smoothFactor: PropTypes.number,
  showMarkers: PropTypes.bool,
};

RouteMap.defaultProps = {
  showGeoLayer: true,
  smoothFactor: 5,
  showMarkers: false,
};

export default RouteMap;
