import React, { useState } from "react";
import Select from "react-select";
import { IPattern } from "../../src/types";

interface PatternSelectorOnMapProps {
  patterns: IPattern[];
  onSelectChange: (selectedPattern: IPattern | null) => void;
}

const PatternSelectorOnMap = ({ patterns, onSelectChange }: PatternSelectorOnMapProps) => {
  const [selectedPattern, setSelectedPattern] = useState<IPattern | null>(null);

  const patternOptions = patterns.map((p) => ({
    value: p,
    label: p.patternName,
  }));

  const handleSelectChange = (selectedOption: any) => {
    const selectedPattern = selectedOption ? selectedOption.value : null;
    setSelectedPattern(selectedPattern);
    onSelectChange(selectedPattern);
  };

  return (
    <div>
      <label htmlFor="route-select">Select a Route:</label>
      <Select
        isMulti
        id="pattern-select"
        options={patternOptions}
        onChange={handleSelectChange}
        value={selectedPattern}
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
