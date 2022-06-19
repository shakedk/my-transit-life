import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Moveable from "react-moveable";
import { Textarea } from "theme-ui";

import MoveableHelper from "moveable-helper";

import useDimensions from "react-cool-dimensions";
import { useAppContext } from "../src/context/state";
import axios from "axios";

const StopLabel = ({
  x,
  y,
  labelWidth,
  labelHeight,
  stopModifiedName,
  stopPropetiesChanedHandler,
  // stop,
  stopOriginalName,
  //  pointPositions,
  font,
  // posterID,
}) => {
  const [label, setLabel] = useState(stopModifiedName);
  const ref = useRef(null);
  const { width, height } = useDimensions({ ref });
  // pointPositions.push([width, height]);
  const [helper] = useState(() => {
    return new MoveableHelper();
  });

  // const stopOriginalName = stop.stop_name;
  const stopID = stopOriginalName.replace(".", "");

  const targetRef = React.useRef<HTMLDivElement>(null);
  const sharedState = useAppContext();
  const showStopBoxes = sharedState.showStopBoxes;

  // Update the stop label in DB
  // useEffect(() => {
  //   const params = {
  //     posterID,
  //   };
  //   params[stopID] = {
  //     stopOriginalName,
  //     stopModifiedName,
  //     x,
  //     y,
  //   };
  //   axios.put(`/api/poster/${posterID}`, params);
  // }, [stopID, x, y, posterID, stopOriginalName, stopModifiedName]);

  const handleTextChange = async function (event) {
    // console.log(event.target)
    setLabel(event.target.value);
    console.log("stopPropetiesChanedHandler in handleTextChange")
    stopPropetiesChanedHandler(
      stopID,
      x,
      y,
      labelWidth,
      labelHeight,
      stopOriginalName,
      event.target.value
    );
    // updateStopData();
  };

  return (
    <div className="container">
      <Textarea
        //@ts-ignore
        ref={targetRef}
        value={label}
        onChange={(e) => {
          handleTextChange(e);
        }}
        onMouseUp={(e) => {
          console.log("stopPropetiesChanedHandler on MouseUp");
          console.log(e.currentTarget.offsetParent)
          stopPropetiesChanedHandler(
            stopID,
            e.currentTarget.offsetTop,
            e.currentTarget.offsetLeft,
            e.currentTarget.offsetWidth,
            e.currentTarget.offsetHeight,
            stopOriginalName,
            stopModifiedName
          );
        }}
        // contentEditable="true"
        sx={{
          position: "absolute",
          // height: 60,
          top: y, // For some reason, it puts the points the correct location compared to lat lon
          left: x,
          padding: 0,
          width: labelWidth || 'auto',
          height: labelHeight || 'auto',
          fontSize: 40,
          fontFamily: font || "Helvetica",
          color: "#FFFFFF",
          border: "none",
        }}
        bg="transparent"
      ></Textarea>
      <Moveable
      // ref={l}
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
        // onDragEnd={({ clientX, clientY }) => {
        //   console.log("stopPropetiesChanedHandler in onDragEnd")
        //   stopPropetiesChanedHandler(
        //     stopID,
        //     clientX,
        //     clientY,
        //     // targetRef.current.offsetLeft,
        //     // targetRef.current.offsetTop,
        //     labelWidth,
        //     labelHeight,
        //     stopOriginalName,
        //     stopModifiedName,
        //   );
        //   // updateStopData();
        // }}
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
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  labelWidth: PropTypes.number,
  labelHeight: PropTypes.number,
  stopModifiedName: PropTypes.string.isRequired,
  stopPropetiesChanedHandler: PropTypes.func.isRequired,
  // stop: PropTypes.shape({
  //   stop_lat: PropTypes.number.isRequired,
  //   stop_lon: PropTypes.number.isRequired,
  //   stop_id: PropTypes.string.isRequired,
  //   stop_name: PropTypes.string.isRequired,
  // }),
  stopOriginalName: PropTypes.string.isRequired,
  // stopModifiedName: PropTypes.string.isRequired,
  font: PropTypes.string,
  // pointPositions: PropTypes.any.isRequired,
  // posterID: PropTypes.string,
};
export default StopLabel;
