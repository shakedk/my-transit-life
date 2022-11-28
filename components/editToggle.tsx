/* eslint-disable react/prop-types */


import { Button } from 'theme-ui';
import React from 'react';
 
const EditToggle = ({ isInEditMode, setIsInEditMode, isPrintMode }) => {
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
