/* eslint-disable react/react-in-jsx-scope */
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Textarea } from "theme-ui";
import Color from "color";
import { Marker, Tooltip } from "react-leaflet";

import { Icon, LatLngExpression } from "leaflet";

import styles from "./stopLabel.module.css";
const StopLabel = ({
  posterID,
  showStopLabels,
  stopModifiedName,
  stopPropetiesChanedHandler,
  stop,
  stopOriginalName,
  markerLat,
  markerLon,
  labelWidthFromDB,
  labelHeightFromDB,
  font,
  fontSize,
  stopFontColor,
  stopBackgroundColor,

  isInEditMode,
}) => {
  // CHANGE ANY!
  // CHANGE ANY!
  // CHANGE ANY!

  interface IStopProps {
    label: string;
    labelWidth: number;
    labelHeight: number;
    position: LatLngExpression;
  }
  const [stopProps, setStopProps] = useState<IStopProps>({
    label: stopModifiedName,
    labelWidth: labelWidthFromDB,
    labelHeight: labelHeightFromDB,
    position: [markerLat, markerLon],
  });

  useEffect(() => {
    // Must update the state to change in props triggers re-render
    setStopProps((oldState) => {
      return {
        ...oldState,
        label: stopModifiedName,
        labelWidth: labelWidthFromDB,
        labelHeight: labelHeightFromDB,
        position: [markerLat, markerLon],
      };
    });
  }, [
    stopModifiedName,
    labelWidthFromDB,
    labelHeightFromDB,
    markerLat,
    markerLon,
  ]);
  const markerRef = useRef(null);
  const tooltipRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPosition = marker.getLatLng();

          setStopProps((oldState) => {
            stopPropetiesChanedHandler(
              posterID,
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
    [posterID]
  );

  return (
    <Marker
      key={stop.stop_id}
      position={stopProps.position}
      draggable={isInEditMode}
      ref={markerRef}
      icon={
        new Icon({
          iconUrl:
            stop.stop_name !== "OPTIBUS"
              ? isInEditMode
                ? "/point.svg"
                : "/transparentPoint.svg"
              : "/logos/optibus.svg",
          // iconSize: (isInEditMode || stop.stop_name === "OPTIBUS" )? [300, 300] : [100, 100],
          iconSize: stop.stop_name === "OPTIBUS" ? [500, 500] : [300, 300],
        })
      }
      zIndexOffset={2000}
      eventHandlers={eventHandlers}
    >
      {" "}
      {(stop.stop_name !== "OPTIBUS" && showStopLabels) ? (
        <div>
          <Tooltip
            ref={tooltipRef}
            interactive={true}
            permanent
            className={styles.markerTooltip}
            direction={"center"}
          >
            <Textarea
              value={stopProps.label}
              disabled={!isInEditMode}
              backgroundColor={
                stopBackgroundColor &&
                Color(stopBackgroundColor).alpha(0.3).string()
              }
              onChange={(e) => {
                setStopProps((oldState) => {
                  stopPropetiesChanedHandler(
                    posterID,
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
              onMouseUp={(e) => {
                if (isInEditMode) {
                  setStopProps((oldState) => {
                    stopPropetiesChanedHandler(
                      posterID,
                      stop.stop_id,
                      oldState.position[0],
                      oldState.position[1],
                      (e.target as HTMLTextAreaElement).offsetWidth ||
                        oldState.labelWidth, //tooltipRef.current.offsetWidth,
                      (e.target as HTMLTextAreaElement).offsetHeight ||
                        oldState.labelHeight, //tooltipRef.current.offsetHeight,
                      stopOriginalName,
                      oldState.label
                    );
                    return {
                      ...oldState,
                      labelWidth: (e.target as HTMLTextAreaElement).offsetWidth,
                      labelHeight: (e.target as HTMLTextAreaElement)
                        .offsetHeight,
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
                width: stopProps.labelWidth || "min-content",
                height: stopProps.labelHeight || "min-content",
                fontSize: fontSize || 40,
                fontWeight: "bold",
                fontFamily: font || "Helvetica",
                color: stopFontColor || "#FFFFFF",
                zIndex: 500,
                border: isInEditMode ? "2 solid black" : "none",
                textAlign: "center",
                borderRadius: 50,
              }}
            ></Textarea>
          </Tooltip>
        </div>
      ) : null}
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
  stop: StopType,
  posterID: PropTypes.string,
  showStopLabels: PropTypes.bool,
  stopOriginalName: PropTypes.string.isRequired,

  markerLat: PropTypes.number.isRequired,
  markerLon: PropTypes.number.isRequired,
  labelWidthFromDB: PropTypes.number,
  labelHeightFromDB: PropTypes.number,
  font: PropTypes.string.isRequired,
  stopBackgroundColor: PropTypes.string,
  isInEditMode: PropTypes.bool.isRequired,
};
export default StopLabel;
