import { Point } from "leaflet";
import React from "react";
import { Badge } from "theme-ui";
import { Stop } from "./types";

interface Props {
  xyPos: Point;
  stop: Stop
}

const StopLabel = ({ xyPos, stop }: Props) => {
  return (
    <Badge
      sx={{
        zIndex: 200,
        position: "absolute",
        height: 30,
        padding: 0,
        top: xyPos.y - 10, // For some reason, it puts the points the correct location compared to lat lon
        left: xyPos.x - 1,
        fontSize: 15,
        fontFamily: "Gill",
        color: "white",
        // transform: "rotate(50deg)"
        transform: "translate(-110%, 0)",
      }}
      bg="transparent"
    >
      {stop.stop_name}
    </Badge>
  );
};

export default StopLabel;
