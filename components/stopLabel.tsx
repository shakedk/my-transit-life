import PropTypes from "prop-types";
import React, { useRef } from "react";
import Moveable from "react-moveable";
import { Textarea } from "theme-ui";

import MoveableHelper from "moveable-helper";

import useDimensions from "react-cool-dimensions";
import { useAppContext } from "../src/context/state";

const StopLabel = ({ xPos, yPos, stop, pointPositions, font }) => {
  const ref = useRef(null);
  const { width, height } = useDimensions({ ref });
  pointPositions.push([width, height]);
  const [helper] = React.useState(() => {
    return new MoveableHelper();
  });
  const [inputValue, setInputValue] = React.useState(stop.stop_name);
  const targetRef = React.useRef<HTMLDivElement>(null);
  const sharedState = useAppContext();
  const showStopBoxes = sharedState.showStopBoxes;

  return (
    <div className="container">
      <Textarea
        //@ts-ignore
        ref={targetRef}
        value={inputValue}
        onChange={(e) => {

          setInputValue(e.target.value);
        }}
        // contentEditable="true"
        sx={{
          position: "absolute",
          height: 60,
          top: yPos, // For some reason, it puts the points the correct location compared to lat lon
          left: xPos,
          padding: 0,
          width: 250,
          fontSize: 40,
          fontFamily: font || "Helvetica",
          color: "#FFFFFF",
          border: "none",
        }}
        bg="transparent"
      ></Textarea>
      <Moveable
        className={showStopBoxes ? "moveable1" : "moveable1Hide"}
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
