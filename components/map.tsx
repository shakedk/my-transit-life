import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Pane, Polyline, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useRouter } from "next/router";
import { getPosterIDInDB } from "../pages/posters/utils";

import StopLabel from "./stopLabel";
// import StopLabel, { StopType } from "./stopLabelNew";
import axios from "axios";
import { Icon } from "leaflet";
import PropTypes from "prop-types";
import { StopType } from "./stopLabel";
import { redirect } from "next/dist/server/api-utils";

// const StopLabels = ({ stops, font, posterID }) => {
//   const [labels, setLabels] = useState(null);
//   const getStopLabelLocation = (map, stop, stopDataFromDB) => {
//     const xy = map.latLngToLayerPoint([
//       stop.stop_lat,
//       stop.stop_lon,
//     ]);
//     // The +10 and -20 is required to adjust the labels correctly
//     // The 228 237 is probably due to the text area size
//     const x = stopDataFromDB && stopDataFromDB.x ? stopDataFromDB.x - 475
//      : xy.x + 10;
//     const y = stopDataFromDB && stopDataFromDB.y ? stopDataFromDB.y - 120
//      : xy.y - 20;
//     return [x, y];
// };

// // const [stopDataFromDB, setStopDataFromDB] = useState(null);
// useEffect(() => {
//   async function fetchData() {
//   const res = await axios.get(`/api/poster/${posterID}`);
//   // setStopDataFromDB(res.data);
// }

//   // fetchData();
// }, []);

// const pointPositions = [];

// const stopPropetiesChanedHandler = (
//   stopID: string,
//   label_lat: number,
//   label_lon: number,
//   labelWidth: number,
//   labelHeight: number,
//   stopOriginalName: string,
//   stopModifiedName: string
// ) => {
//   const params = {
//     posterID,
//   };
//   params[stopID] = {
//     stopOriginalName,
//     stopModifiedName,
//     label_lat,
//     label_lon,
//     labelWidth,
//     labelHeight,
//   };

//   console.log(stopOriginalName, " ", params)

//   // axios.put(`/api/poster/${posterID}`, params);
// };
//   const map = useMapEvents({
//     async moveend() {
//       const res = await axios.get(`/api/poster/${posterID}`);
//       const stopDataFromDB = res.data;

//       setLabels(
//         stops.map((stop) => {
//           const stopOriginalName = stop.stop_name.replace(".", "");
//           // const [x, y] = getStopLabelLocation(
//           //   map,
//           //   stop,
//           //   stopDataFromDB[stopOriginalName]
//           // );

//           return posterID ? (
//             <StopLabel
//               // pointPositions={pointPositions}
//               key={stopOriginalName}
//               stopPropetiesChanedHandler={stopPropetiesChanedHandler}
//               x={x}
//               y={y}
//               labelWidth={
//                 stopDataFromDB[stopOriginalName] &&
//                 stopDataFromDB[stopOriginalName].labelWidth
//               }
//               labelHeight={
//                 stopDataFromDB[stopOriginalName] &&
//                 stopDataFromDB[stopOriginalName].labelHeight
//               }
//               stopOriginalName={stop.stop_name}
//               stopModifiedName={
//                 (stopDataFromDB[stopOriginalName] &&
//                   stopDataFromDB[stopOriginalName].stopModifiedName) ||
//                 stop.stop_name
//               }
//               font={font}
//               // posterID={posterID}
//             />
//           ) : null;
//         })
//       );
//     },
//   });
//   // Labels wont load until we solve the fit bounds issue
//   return labels !== null ? (
//     <Pane name="stop-labels" style={{ zIndex: 5000, cursor: "default" }}>
//       {labels}
//     </Pane>
//   ) : null;
// };

// StopLabels.propTypes = {
//   stops: PropTypes.arrayOf(StopType),
// };

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
  stopCircleSize,
  stopBackgroundColor
}) => {
  /**
   * Lat Lon markers, leave here for testing lat lon vs. xy positions
   */

  const [posterID, setPosterID] = useState(null);
  const [stopDataFromDB, setStopDataFromDB] = useState({});

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
    return stopDataFromDB &&
      stops.map((stop) => (
        <StopLabel
          posterID={posterID}
          key={stop.stop_id}
          stop={stop}
          // stopDataFromDB={stopDataFromDB}
          markerLat={stopDataFromDB[stop.stop_id]?.label_lat || stop.stop_lat}
          markerLon={stopDataFromDB[stop.stop_id]?.label_lon || stop.stop_lon}
          labelWidthFromDB={stopDataFromDB[stop.stop_id]?.labelWidth}
          labelHeightFromDB={stopDataFromDB[stop.stop_id]?.labelHeight}
          stopModifiedName={
            stopDataFromDB[stop.stop_id]?.stopModifiedName || stop.stop_name
          }
          stopPropetiesChanedHandler={stopPropetiesChanedHandler}
          stopOriginalName={stop.stop_name}
          font={font}
          fontSize={stopFontSize}
          stopColor={stopFontColor}
          isInEditMode={isInEditMode}
          stopBackgroundColor={stopBackgroundColor}
        />
      ));
  }, [stopDataFromDB, posterID, stops]);
  const circleMarkers = stops.map((stop) => {
    return (
      <Marker
        key={stop.stop_id}
        position={[stop.stop_lat, stop.stop_lon]}
        icon={
          new Icon({
            iconUrl: "/point.svg",
            iconSize: [stopCircleSize || 300, stopCircleSize|| 300],
          })
        }
        sx={{fill: "red"}}
        zIndexOffset={500}
      ></Marker>
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const posterType = router.pathname.replace("/posters/", "");
  //     const _routeID = router.query.routeID;
  //     const id = await getPosterIDInDB(posterType, _routeID);

  //     setPosterID(id);
  //   };
  //   fetchData();
  // }, []);


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
          pathOptions={{ color: 'snow', weight: pathWeight + 20 || 20 }}
          positions={reverseMultiPolyLine}
          smoothFactor={smoothFactor}
          />
        <Polyline
          pathOptions={{ color: pathColor, weight: pathWeight || 10 }}
          positions={reverseMultiPolyLine}
          smoothFactor={smoothFactor}
        />
        {labels}
        {showMarkers && circleMarkers}
      </Pane>

      {/* <Pane name="stop-dots" style={{ zIndex: 500, cursor: "default" }}>
        {posterID && (
          <StopLabels
            stops={stops}
            font={font}
            posterID={posterID}
            // routeID={routeID}
          />
        )}
      </Pane> */}
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
  mapOpacity: PropTypes.number,
  stopCircleSize: PropTypes.number,
  stopBackgroundColor: PropTypes.string
};

RouteMap.defaultProps = {
  showGeoLayer: true,
  smoothFactor: 5,
  showMarkers: false,
};

export default RouteMap;
