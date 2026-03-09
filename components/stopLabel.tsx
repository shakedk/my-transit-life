/* eslint-disable react/react-in-jsx-scope */
"use client";

import mapboxgl from "mapbox-gl";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "theme-ui";
import Color from "color";
import { Marker, Popup } from "react-map-gl/mapbox-legacy";
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
}: {
  posterID?: string;
  showStopLabels?: boolean;
  stopModifiedName: string;
  stopPropetiesChanedHandler: (
    posterID: string,
    stopID: string,
    label_lat: number,
    label_lon: number,
    labelWidth: number,
    labelHeight: number,
    stopOriginalName: string,
    stopModifiedName: string
  ) => void;
  stop: { stop_id: string; stop_name: string; stop_lat: number; stop_lon: number };
  stopOriginalName: string;
  markerLat: number;
  markerLon: number;
  labelWidthFromDB?: number;
  labelHeightFromDB?: number;
  font?: string;
  fontSize?: number;
  stopFontColor?: string;
  stopBackgroundColor?: string;
  isInEditMode: boolean;
}) => {
  interface IStopProps {
    label: string;
    labelWidth: number | undefined;
    labelHeight: number | undefined;
    longitude: number;
    latitude: number;
  }

  const [stopProps, setStopProps] = useState<IStopProps>({
    label: stopModifiedName,
    labelWidth: labelWidthFromDB,
    labelHeight: labelHeightFromDB,
    longitude: markerLon,
    latitude: markerLat,
  });

  useEffect(() => {
    setStopProps((oldState) => ({
      ...oldState,
      label: stopModifiedName,
      labelWidth: labelWidthFromDB,
      labelHeight: labelHeightFromDB,
      longitude: markerLon,
      latitude: markerLat,
    }));
  }, [
    stopModifiedName,
    labelWidthFromDB,
    labelHeightFromDB,
    markerLat,
    markerLon,
  ]);

  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (marker != null && marker.getLngLat) {
      const { lng, lat } = marker.getLngLat();
      setStopProps((oldState) => {
        stopPropetiesChanedHandler(
          posterID ?? "",
          stop.stop_id,
          lat,
          lng,
          oldState.labelWidth ?? 0,
          oldState.labelHeight ?? 0,
          stopOriginalName,
          oldState.label
        );
        return {
          ...oldState,
          longitude: lng,
          latitude: lat,
        };
      });
    }
  }, [posterID, stopPropetiesChanedHandler, stopOriginalName, stop.stop_id]);

  const iconUrl =
    stop.stop_name !== "OPTIBUS"
      ? isInEditMode
        ? "/point.svg"
        : "/transparentPoint.svg"
      : "/logos/optibus.svg";

  const iconSize = stop.stop_name === "OPTIBUS" ? [500, 500] : [300, 300];

  return (
    <>
      <Marker
        ref={markerRef}
        longitude={stopProps.longitude}
        latitude={stopProps.latitude}
        draggable={isInEditMode}
        onDragEnd={handleDragEnd}
        style={{ zIndex: 2000 }}
      >
        <div
          style={{
            width: iconSize[0],
            height: iconSize[1],
            backgroundImage: `url(${iconUrl})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            cursor: isInEditMode ? "grab" : "default",
          }}
        />
      </Marker>
      {stop.stop_name !== "OPTIBUS" && showStopLabels && (
        <Popup
          longitude={stopProps.longitude}
          latitude={stopProps.latitude}
          closeButton={false}
          closeOnClick={false}
          anchor="center"
          offset={[0, -iconSize[1] / 2]}
          className={styles.markerTooltip}
        >
          <Textarea
            value={stopProps.label}
            disabled={!isInEditMode}
            backgroundColor={
              stopBackgroundColor &&
              Color(stopBackgroundColor).alpha(0.85).string()
            }
            onChange={(e) => {
              setStopProps((oldState) => {
                stopPropetiesChanedHandler(
                  posterID ?? "",
                  stop.stop_id,
                  oldState.latitude,
                  oldState.longitude,
                  oldState.labelWidth ?? 0,
                  oldState.labelHeight ?? 0,
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
                    posterID ?? "",
                    stop.stop_id,
                    oldState.latitude,
                    oldState.longitude,
                    (e.target as HTMLTextAreaElement).offsetWidth ||
                      (oldState.labelWidth ?? 0),
                    (e.target as HTMLTextAreaElement).offsetHeight ||
                      (oldState.labelHeight ?? 0),
                    stopOriginalName,
                    oldState.label
                  );
                  return {
                    ...oldState,
                    labelWidth: (e.target as HTMLTextAreaElement).offsetWidth,
                    labelHeight: (e.target as HTMLTextAreaElement).offsetHeight,
                  };
                });
              }
            }}
            sx={{
              resize: isInEditMode ? "both" : "none",
              padding: 0,
              width: stopProps.labelWidth || "min-content",
              height: stopProps.labelHeight || "min-content",
              fontSize: fontSize || 40,
              fontWeight: "bold",
              fontFamily: font || "Helvetica",
              color: stopFontColor || "#FFFFFF",
              border: isInEditMode ? "2px solid black" : "none",
              textAlign: "center",
              borderRadius: 50,
            }}
          />
        </Popup>
      )}
    </>
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
