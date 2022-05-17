import PropTypes from "prop-types";
import React, { useRef } from "react";
import Moveable from "react-moveable";
import { Badge } from "theme-ui";

import MoveableHelper from "moveable-helper";

import useDimensions from "react-cool-dimensions";

const StopLabel = ({ xPos, yPos, stop, pointPositions, font }) => {
  const ref = useRef(null);
  const { width, height } = useDimensions({ ref });
  pointPositions.push([width, height]);
  const [helper] = React.useState(() => {
    return new MoveableHelper();
  });

  const targetRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className="container">
      <Badge
        ref={targetRef}
        sx={{
          position: "absolute",
          height: 30,
          padding: 0,
          top: yPos, // For some reason, it puts the points the correct location compared to lat lon
          left: xPos,
          fontSize: 40,
          fontFamily: font || "Helvetica",
          color: "#FFFFFF",
        }}
        bg="transparent"
      >
        <div ref={ref}>{stop.stop_name}</div>
      </Badge>
      <Moveable
        className={"moveable1"}
        target={targetRef}
        draggable={true}
        resizable={true}
        rotatable={true}
        origin={false}
        onDragStart={helper.onDragStart}
        onDrag={helper.onDrag}
        onResizeStart={helper.onResizeStart}
        onResize={helper.onResize}
        onRotateStart={helper.onRotateStart}
        onRotate={helper.onRotate}
      />
    </div>
  );
};

export const StopType = PropTypes.shape({
  stop_lat: PropTypes.number.isRequired,
  stop_lon: PropTypes.number.isRequired,
  stop_id: PropTypes.string.isRequired,
  stop_name: PropTypes.string.isRequired,
});

StopLabel.propTypes = {
  xPos: PropTypes.number.isRequired,
  yPos: PropTypes.number.isRequired,
  stop: PropTypes.shape({
    stop_lat: PropTypes.number.isRequired,
    stop_lon: PropTypes.number.isRequired,
    stop_id: PropTypes.string.isRequired,
    stop_name: PropTypes.string.isRequired,
  }),
  font: PropTypes.string,
  pointPositions: PropTypes.any.isRequired,
};
export default StopLabel;
