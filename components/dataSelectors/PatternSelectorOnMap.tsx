import React, { useState } from "react";
import Select from "react-select";
import { IPattern } from "../../src/types";

interface PatternSelectorOnMapProps {
  patterns: IPattern[];
  onSelectChange: (selectedPatterns: IPattern[] | null) => void;
}

const PatternSelectorOnMap = ({ patterns, onSelectChange }: PatternSelectorOnMapProps) => {
  const [selectedPatterns, setSelectedPatterns] = useState<IPattern[]>([]);

  const patternOptions = patterns.map((p) => ({
    value: p,
    label: p.patternName,
  }));

  const handleSelectChange = (selectedOptions: any) => {
    const newSelectedPatterns = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedPatterns(selectedOptions);
    onSelectChange(newSelectedPatterns);
  };

  return (
    <div>
      <label htmlFor="pattern-select">Select Patterns:</label>
      <Select
        isMulti
        id="pattern-select"
        options={patternOptions}
        onChange={handleSelectChange}
        value={selectedPatterns}
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
