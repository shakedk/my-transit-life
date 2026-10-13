/* eslint-disable react/react-in-jsx-scope */
"use client";

import mapboxgl from "mapbox-gl";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "theme-ui";
import Color from "color";
import { Marker, Popup } from "react-map-gl/mapbox-legacy";
import styles from "./stopLabel.module.css";

export interface StopLabelProps {
  posterID?: string;
  showStopLabels?: boolean;
  stopModifiedName: string;
  stopPropertiesChangedHandler: (
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
  /** Pixels from stop center to label inner edge (stop circle radius + gap). */
  labelOffsetXPx?: number;
}

export default function StopLabel({
  posterID,
  showStopLabels,
  stopModifiedName,
  stopPropertiesChangedHandler,
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
  labelOffsetXPx = 22,
}: StopLabelProps) {
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
        stopPropertiesChangedHandler(
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
  }, [posterID, stopPropertiesChangedHandler, stopOriginalName, stop.stop_id]);

  const iconUrl =
    stop.stop_name !== "OPTIBUS"
      ? isInEditMode
        ? "/point.svg"
        : "/transparentPoint.svg"
      : "/logos/optibus.svg";

  const iconSize = stop.stop_name === "OPTIBUS" ? [500, 500] : [300, 300];
  const isOptibus = stop.stop_name === "OPTIBUS";

  const labelFontPx =
    fontSize != null && Number.isFinite(fontSize) && fontSize > 0
      ? fontSize
      : 14;
  const outerSolid =
    stopBackgroundColor && String(stopBackgroundColor).trim() !== ""
      ? Color(stopBackgroundColor).alpha(1).rgb().string()
      : "#ffffff";
  const pillColor =
    stopFontColor && String(stopFontColor).trim() !== ""
      ? stopFontColor
      : "#0f172a";
  const pillMaxWidth = stopProps.labelWidth
    ? Math.min(Math.max(stopProps.labelWidth, 80), 380)
    : 300;

  return (
    <>
      {(isInEditMode || isOptibus) && (
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
      )}
      {!isOptibus && showStopLabels && (
        <Popup
          longitude={stopProps.longitude}
          latitude={stopProps.latitude}
          closeButton={false}
          closeOnClick={false}
          anchor="left"
          offset={[labelOffsetXPx, 0]}
          className={styles.markerTooltip}
        >
          <div
            className={styles.stopLabelOuter}
            style={{
              backgroundColor: outerSolid,
              maxWidth: pillMaxWidth,
            }}
          >
            <div
              className={styles.stopLabelPointer}
              style={{
                borderColor: `transparent ${outerSolid} transparent transparent`,
              }}
              aria-hidden
            />
            <div
              className={`${styles.stopLabelInner}${isInEditMode ? ` ${styles.stopLabelResizeHint}` : ""}`}
            >
              {isInEditMode ? (
                <Textarea
                  className={styles.stopLabelEdit}
                  value={stopProps.label}
                  backgroundColor="transparent"
                  onChange={(e) => {
                    setStopProps((oldState) => {
                      stopPropertiesChangedHandler(
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
                    setStopProps((oldState) => {
                      stopPropertiesChangedHandler(
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
                  }}
                  sx={{
                    resize: "both",
                    padding: "12px 18px",
                    width: stopProps.labelWidth || "100%",
                    height: stopProps.labelHeight || "min-content",
                    minWidth: 120,
                    minHeight: 48,
                    fontSize: labelFontPx,
                    fontWeight: 700,
                    fontFamily: font || "system-ui, sans-serif",
                    fontStretch: "condensed",
                    color: pillColor,
                    border: "none",
                    textAlign: "center",
                    borderRadius: 0,
                    outline: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  }}
                />
              ) : (
                <div
                  className={styles.stopLabelReadonly}
                  style={{
                    fontSize: labelFontPx,
                    fontWeight: 700,
                    fontFamily: font || "system-ui, sans-serif",
                    fontStretch: "condensed",
                    lineHeight: 1.35,
                    letterSpacing: "0.02em",
                    color: pillColor,
                  }}
                >
                  {stopProps.label}
                </div>
              )}
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}

export const StopType = PropTypes.shape({
  stop_lat: PropTypes.number.isRequired,
  stop_lon: PropTypes.number.isRequired,
  stop_id: PropTypes.string.isRequired,
  stop_name: PropTypes.string.isRequired,
});

StopLabel.propTypes = {
  stopModifiedName: PropTypes.string.isRequired,
  stopPropertiesChangedHandler: PropTypes.func.isRequired,
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
  labelOffsetXPx: PropTypes.number,
};
