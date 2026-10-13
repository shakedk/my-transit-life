import React from "react";
import { Label, Select } from "theme-ui";

/** Discrete poster preview zoom levels in the editor (percent of full size, except `fit` = scale to preview width). */
const ZOOM_PERCENTAGES = [25, 33, 50, 66, 75, 100, 125, 150, 200] as const;

export type PosterZoomPercent = `${(typeof ZOOM_PERCENTAGES)[number]}`;
export type PosterSizeOption = "fit" | PosterZoomPercent;

interface PosterSizeSelectorProps {
  value: PosterSizeOption;
  onChange: (value: PosterSizeOption) => void;
  disabled?: boolean;
}

const OPTIONS: { value: PosterSizeOption; label: string }[] = [
  { value: "fit", label: "Fit to width" },
  ...ZOOM_PERCENTAGES.map((n) => ({
    value: String(n) as PosterZoomPercent,
    label: `${n}%`,
  })),
];

export default function PosterSizeSelector({
  value,
  onChange,
  disabled = false,
}: PosterSizeSelectorProps) {
  return (
    <Label
      sx={{
        alignItems: "center",
        gap: 2,
        display: "flex",
        fontSize: 0,
        color: "#4b5563",
      }}
    >
      <span style={{ fontWeight: 500 }}>Zoom</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as PosterSizeOption)}
        disabled={disabled}
        sx={{
          width: "auto",
          minWidth: 140,
          borderRadius: 999,
          fontSize: 0,
          borderColor: "rgba(148, 163, 184, 0.8)",
          bg: "rgba(248, 250, 252, 0.96)",
        }}
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
