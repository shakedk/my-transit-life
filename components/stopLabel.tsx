import PropTypes from "prop-types";
import React, { useMemo, useRef, useState } from "react";
import { Textarea } from "theme-ui";


import { Marker, Tooltip } from "react-leaflet";

import { Icon } from "leaflet";

import styles from "./stopLabel.module.css";
const StopLabel = ({
  stopModifiedName,
  stopPropetiesChanedHandler,
  stop,
  stopOriginalName,

  markerLat,
  markerLon,
  labelWidthFromDB,
  labelHeightFromDB,
  font,

  isInEditMode,
}) => {
  // CHANGE ANY!
  // CHANGE ANY!
  // CHANGE ANY!
  const [stopProps, setStopProps] = useState<any>({
    label: stopModifiedName,
    labelWidth: labelWidthFromDB,
    labelHeight: labelHeightFromDB,
    position: [markerLat, markerLon],
  });
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPosition = marker.getLatLng();

          setStopProps((oldState) => {
            stopPropetiesChanedHandler(
              stop.stop_id,
              newPosition.lat,
              newPosition.lng,
              oldState.labelWidth,
              oldState.labelHeight,
              stopOriginalName,
              oldState.label
            );
            return {
              ...oldState,
              position: [newPosition.lat, newPosition.lng],
            };
          });
        }
      },
    }),
    []
  );
  return (
    <Marker
      key={stop.stop_id}
      position={stopProps.position}
      draggable={isInEditMode}
      ref={markerRef}
      icon={
        new Icon({
          iconUrl: "/transparentPoint.svg",
          iconSize: [100, 100],
        })
      }
      zIndexOffset={600}
      eventHandlers={eventHandlers}
    >
      {/* Edit seems to work, add movability and width and height and send to DB */}
      <div>
        <Tooltip
          interactive={true}
          permanent
          className={styles.markerTooltip}
          direction={"center"}
        >
          <Textarea
            value={stopProps.label}
            disabled={!isInEditMode}
            onChange={(e) => {
              setStopProps((oldState) => {
                stopPropetiesChanedHandler(
                  stop.stop_id,
                  oldState.position[0],
                  oldState.position[1],
                  oldState.labelWidth,
                  oldState.labelHeight,
                  stopOriginalName,
                  e.target.value
                );
                return {
                  ...oldState,
                  label: e.target.value,
                };
              });
            }}
            onPointerUp={(e) => {
              if (
                isInEditMode &&
                e.currentTarget != null &&
                e.currentTarget.offsetWidth != null &&
                e.currentTarget.offsetHeight != null
              ) {
                setStopProps((oldState) => {
                  stopPropetiesChanedHandler(
                    stop.stop_id,
                    oldState.position[0],
                    oldState.position[1],
                    e.currentTarget && e.currentTarget.offsetWidth || oldState.labelWidth,
                    e.currentTarget && e.currentTarget.offsetHeight  || oldState.labelHeight,
                    stopOriginalName,
                    oldState.label
                  );
                  return {
                    ...oldState,
                    labelWidth: e.currentTarget.offsetWidth,
                    labelHeight: e.currentTarget.offsetHeight,
                  };
                });
              }
            }}
            sx={{
              // cursor: isInEditMode ? "pointer" : "default",
              resize: isInEditMode ? "both" : "none",
              position: "absolute",
              top: 10, // For some reason, it puts the points the correct location compared to lat lon
              left: 10,
              padding: 0,
              width: stopProps.labelWidth || "auto",
              height: stopProps.labelHeight || "auto",
              fontSize: 40,
              fontFamily: font || "Helvetica",
              color: "#FFFFFF",
              zIndex: 500,
              border: isInEditMode ? "2 solid black" : "none",
            }}
          ></Textarea>
        </Tooltip>
      </div>
    </Marker>
  );
};

export const StopType = PropTypes.shape({
  stop_lat: PropTypes.number.isRequired,
  stop_lon: PropTypes.number.isRequired,
  stop_id: PropTypes.string.isRequired,
  stop_name: PropTypes.string.isRequired,
});

StopLabel.propTypes = {
  stopModifiedName: PropTypes.string.isRequired,
  stopPropetiesChanedHandler: PropTypes.func.isRequired,
  stop: PropTypes.shape({
    stop_lat: PropTypes.number.isRequired,
    stop_lon: PropTypes.number.isRequired,
    stop_id: PropTypes.string.isRequired,
    stop_name: PropTypes.string.isRequired,
  }),
  stopOriginalName: PropTypes.string.isRequired,

  markerLat: PropTypes.number.isRequired,
  markerLon: PropTypes.number.isRequired,
  labelWidthFromDB: PropTypes.number,
  labelHeightFromDB: PropTypes.number,
  font: PropTypes.string.isRequired,

  isInEditMode:PropTypes.bool.isRequired

};
export default StopLabel;
