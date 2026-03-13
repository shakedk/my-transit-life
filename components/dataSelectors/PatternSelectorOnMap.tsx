import React from "react";
import Select from "react-select";
import { IPattern } from "../../src/types";

interface PatternSelectorOnMapProps {
  patterns: IPattern[];
  onSelectChange: (selectedPatterns: IPattern[]) => void;
}

const PatternSelectorOnMap = ({ patterns, onSelectChange }: PatternSelectorOnMapProps) => {

  
  const getAsOptions = (ptrns: IPattern[]) => ptrns.map((p) => ({
    value: p,
    label: p.patternName, 
  }));
  
  const selectedPatterns = patterns.filter(p => p.toDisplay);
  const handleSelectChange = (
    selectedOptions: readonly { value: IPattern; label: string }[] | null
  ) => {
    const newSelectedPatterns = selectedOptions
      ? [...selectedOptions].map((opt) => opt.value.patternId)
      : [];
    onSelectChange(
      patterns.map((p) => ({
        ...p,
        toDisplay: newSelectedPatterns.includes(p.patternId),
      }))
    );
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label
        htmlFor="pattern-select"
        style={{
          display: "block",
          marginBottom: 4,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "#6b7280",
        }}
      >
        Select patterns
      </label>
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
