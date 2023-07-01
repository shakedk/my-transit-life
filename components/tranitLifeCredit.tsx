/* eslint-disable react/prop-types */
import React from 'react';
import { Badge } from "theme-ui";
import PropTypes from "prop-types";
const TransitLifeCredit = (props) => {
  const { creditFontSize, font } = props;
  return (
    <Badge
      sx={{
        zIndex: 100,
        fontSize: creditFontSize || 14, 
        fontWeight: "normal",
        padding: 0,
        fontFamily: font || "Oswald",
      }}
      p={0}
      color="black"
      bg="transparent"
    >
      Produced by www.transitlife.co
    </Badge>
  );
};

TransitLifeCredit.prototype = {
  fontSize: PropTypes.string,
  font: PropTypes.string,
};
export default TransitLifeCredit;
