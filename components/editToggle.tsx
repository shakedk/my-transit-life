/* eslint-disable react/prop-types */


import React from "react";
import { Button } from "theme-ui";

const EditToggle = ({ isInEditMode, setIsInEditMode }) => {
  return (
    <Button
      onClick={() => {
        setIsInEditMode(!isInEditMode);
      }}
      sx={{
        px: 3,
        py: 2,
        borderRadius: 999,
        fontSize: 0,
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontWeight: 600,
        bg: isInEditMode ? "#0f172a" : "background",
        color: isInEditMode ? "white" : "#0f172a",
        border: "1px solid",
        borderColor: isInEditMode
          ? "rgba(15, 23, 42, 0.95)"
          : "rgba(148, 163, 184, 0.8)",
        boxShadow: isInEditMode
          ? "0 12px 30px rgba(15, 23, 42, 0.45)"
          : "none",
        "&:hover": {
          bg: isInEditMode ? "#020617" : "rgba(248, 250, 252, 0.95)",
        },
      }}
    >
      {isInEditMode ? "Finish" : "Edit poster"}
    </Button>
  );
};

export default EditToggle;
