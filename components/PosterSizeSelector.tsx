import React from "react";
import { Label, Select } from "theme-ui";

export type PosterSizeOption = "fit" | "50" | "75" | "100";

interface PosterSizeSelectorProps {
  value: PosterSizeOption;
  onChange: (value: PosterSizeOption) => void;
  disabled?: boolean;
}

const OPTIONS: { value: PosterSizeOption; label: string }[] = [
  { value: "fit", label: "Fit to screen" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "100%" },
];

export default function PosterSizeSelector({
  value,
  onChange,
  disabled = false,
}: PosterSizeSelectorProps) {
  return (
    <Label sx={{ alignItems: "center", gap: 2, display: "flex" }}>
      <span>Preview:</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as PosterSizeOption)}
        disabled={disabled}
        sx={{ width: "auto", minWidth: 120 }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </Label>
  );
}
