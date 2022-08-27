import React from "react";
export default function PointIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="67" height="67">
      <circle cx="34" cy="34" r="3" fill={props.fill || "white"} />
    </svg>
  );
}
