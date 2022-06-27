
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from 'theme-ui'

const EditToggle = ({ isInEditMode, setIsInEditMode }) => {
  return (
    <Button
    onClick={() => {
        setIsInEditMode(!isInEditMode);
      }}
    >
      {isInEditMode ? "Finish" : "Edit"}
    </Button>
  );
};
export default EditToggle;
