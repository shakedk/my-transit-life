import React, { useState } from "react";
import Select from "react-select";
import { IPattern } from "../../src/types";

interface PatternSelectorOnMapProps {
  patterns: IPattern[];
  onSelectChange: (selectedPatterns: IPattern[] | null) => void;
}

const PatternSelectorOnMap = ({ patterns, onSelectChange }: PatternSelectorOnMapProps) => {

  
  const getAsOptions = (ptrns: IPattern[]) => ptrns.map((p) => ({
    value: p,
    label: p.patternName, 
  }));
  
  const selectedPatterns = patterns.filter(p => p.toDisplay);
  const handleSelectChange = (selectedOptions: any) => {
  const newSelectedPatterns = selectedOptions ? selectedOptions.map((option: any) => option.value).map((p: IPattern) => p.patternId) : [];
  onSelectChange(  patterns.map((p) => ({
    ...p,
    toDisplay: newSelectedPatterns.includes(p.patternId),
  })));
  };

  return (
    <div>
      <label htmlFor="pattern-select">Select Patterns:</label>
      <Select
        isMulti
        id="pattern-select"
        options={getAsOptions(patterns)}
        onChange={handleSelectChange}
        value={getAsOptions(selectedPatterns)}
        placeholder="Select"
        isClearable
        isSearchable
        className="basic-multi-select"
        classNamePrefix="select"
      />
    </div>
  );
};

export default PatternSelectorOnMap;
