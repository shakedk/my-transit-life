import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  Label,
  Select,
} from "theme-ui";

type Primitive = string | number | boolean | undefined;

export type DesignConfig = {
  backgroundColor?: string;
  pathColor?: string;
  mapOpacity?: number;
  tileLayerName?: string;
  font?: string;
  routeTitleSize?: number;
  routeNameAndTypeSize?: number;
  stopFontSize?: number;
  stopFontColor?: string;
  stopColor?: string;
  stopCircleSize?: number;
  stopBackgroundColor?: string;
  creditFontSize?: number;
  showStopLabels?: boolean;
  [key: string]: Primitive;
};

interface DesignControlsProps {
  value: DesignConfig;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
  onChange: (next: DesignConfig) => void;
  onUndo: () => void;
  onRedo: () => void;
}

const FONT_OPTIONS = [
  "Oswald",
  "Heebo",
  "Roboto",
  "Helvetica Neue",
  "system-ui",
];

const TILE_LAYER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Default (Mapbox light)" },
  { value: "Mapbox", label: "Mapbox style" },
  { value: "StamenToner", label: "Stamen Toner" },
  { value: "StamenTonerLite", label: "Stamen Toner Lite" },
  { value: "StamenTonerLines", label: "Stamen Toner Lines" },
  { value: "StamenTonerBackground", label: "Stamen Toner Background" },
  { value: "StamenTerrainLines", label: "Stamen Terrain Lines" },
  { value: "CartoDBLiteNoLabels", label: "CartoDB Lite (no labels)" },
  { value: "AlidadeSmooth", label: "Alidade Smooth" },
];

function toNumber(value: string, fallback?: number): number | undefined {
  if (value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function DesignControls({
  value,
  canUndo,
  canRedo,
  disabled = false,
  onChange,
  onUndo,
  onRedo,
}: DesignControlsProps) {
  const handleFieldChange = (patch: Partial<DesignConfig>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 5,
        border: "1px solid",
        borderColor: "rgba(148, 163, 184, 0.4)",
        padding: [2, 3],
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: ["flex-start", "center"],
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Label
            sx={{
              fontSize: 1,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#020617",
            }}
          >
            Design controls
          </Label>
          <Box
            as="p"
            sx={{
              mt: 1,
              fontSize: 0,
              color: "#6b7280",
              maxWidth: 360,
            }}
          >
            Fine‑tune colors, typography, and map styling to match your poster.
          </Box>
        </Box>

        <Flex
          sx={{
            flexDirection: "row",
            gap: 2,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="secondary"
            onClick={onUndo}
            disabled={!canUndo || disabled}
          >
            Undo
          </Button>
          <Button
            variant="secondary"
            onClick={onRedo}
            disabled={!canRedo || disabled}
          >
            Redo
          </Button>
        </Flex>
      </Flex>

      <Box
        as="hr"
        sx={{
          border: "none",
          borderTop: "1px solid rgba(226, 232, 240, 0.9)",
          my: 2,
        }}
      />

      <Flex
        sx={{
          flexDirection: ["column", "row"],
          gap: 3,
          alignItems: ["stretch", "flex-start"],
          flexWrap: "wrap",
        }}
      >
        <Flex
          sx={{
            flexDirection: "column",
            gap: 2,
            minWidth: 220,
            flex: 1,
            p: 2,
            borderRadius: 4,
            backgroundColor: "rgba(248, 250, 252, 0.96)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
          }}
        >
          <Label sx={{ fontSize: 1, fontWeight: 600 }}>Colors</Label>
        <Flex sx={{ gap: 2, alignItems: "center" }}>
          <Label sx={{ fontSize: 0, minWidth: 80 }}>Background</Label>
          <Input
            type="color"
            value={value.backgroundColor || "#ffffff"}
            onChange={(e) =>
              handleFieldChange({ backgroundColor: e.target.value })
            }
            disabled={disabled}
            sx={{ p: 0, width: 40, height: 32 }}
          />
          <Input
            type="text"
            value={value.backgroundColor || ""}
            onChange={(e) =>
              handleFieldChange({ backgroundColor: e.target.value || undefined })
            }
            disabled={disabled}
            sx={{ flex: 1, fontSize: 0 }}
            placeholder="#ffffff"
          />
        </Flex>
        <Flex sx={{ gap: 2, alignItems: "center" }}>
          <Label sx={{ fontSize: 0, minWidth: 80 }}>Route line</Label>
          <Input
            type="color"
            value={value.pathColor || "#000000"}
            onChange={(e) => handleFieldChange({ pathColor: e.target.value })}
            disabled={disabled}
            sx={{ p: 0, width: 40, height: 32 }}
          />
          <Input
            type="text"
            value={value.pathColor || ""}
            onChange={(e) =>
              handleFieldChange({ pathColor: e.target.value || undefined })
            }
            disabled={disabled}
            sx={{ flex: 1, fontSize: 0 }}
            placeholder="#000000"
          />
        </Flex>
        <Flex sx={{ gap: 2, alignItems: "center" }}>
          <Label sx={{ fontSize: 0, minWidth: 80 }}>Stops</Label>
          <Input
            type="color"
            value={value.stopColor || "#000000"}
            onChange={(e) => handleFieldChange({ stopColor: e.target.value })}
            disabled={disabled}
            sx={{ p: 0, width: 40, height: 32 }}
          />
          <Input
            type="text"
            value={value.stopColor || ""}
            onChange={(e) =>
              handleFieldChange({ stopColor: e.target.value || undefined })
            }
            disabled={disabled}
            sx={{ flex: 1, fontSize: 0 }}
            placeholder="#000000"
          />
        </Flex>
        </Flex>

        <Flex
          sx={{
            flexDirection: "column",
            gap: 2,
            minWidth: 220,
            flex: 1,
            p: 2,
            borderRadius: 4,
            backgroundColor: "rgba(248, 250, 252, 0.96)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
          }}
        >
          <Label sx={{ fontSize: 1, fontWeight: 600 }}>Typography</Label>
        <Label sx={{ fontSize: 0 }}>
          Font family
          <Select
            value={value.font || ""}
            onChange={(e) =>
              handleFieldChange({ font: e.target.value || undefined })
            }
            disabled={disabled}
            sx={{ mt: 1, fontSize: 0 }}
          >
            <option value="">Default</option>
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </Label>
        <Flex sx={{ gap: 2 }}>
          <Label sx={{ fontSize: 0, flex: 1 }}>
            Title size
            <Input
              type="number"
              min={24}
              max={200}
              step={2}
              value={value.routeTitleSize ?? ""}
              onChange={(e) =>
                handleFieldChange({
                  routeTitleSize: toNumber(e.target.value),
                })
              }
              disabled={disabled}
              sx={{ mt: 1, fontSize: 0 }}
              placeholder="auto"
            />
          </Label>
          <Label sx={{ fontSize: 0, flex: 1 }}>
            Line name size
            <Input
              type="number"
              min={24}
              max={200}
              step={2}
              value={value.routeNameAndTypeSize ?? ""}
              onChange={(e) =>
                handleFieldChange({
                  routeNameAndTypeSize: toNumber(e.target.value),
                })
              }
              disabled={disabled}
              sx={{ mt: 1, fontSize: 0 }}
              placeholder="auto"
            />
          </Label>
        </Flex>
        <Flex sx={{ gap: 2 }}>
          <Label sx={{ fontSize: 0, flex: 1 }}>
            Stop label size
            <Input
              type="number"
              min={6}
              max={64}
              step={1}
              value={value.stopFontSize ?? ""}
              onChange={(e) =>
                handleFieldChange({
                  stopFontSize: toNumber(e.target.value),
                })
              }
              disabled={disabled}
              sx={{ mt: 1, fontSize: 0 }}
              placeholder="auto"
            />
          </Label>
          <Label sx={{ fontSize: 0, flex: 1 }}>
            Credit size
            <Input
              type="number"
              min={6}
              max={64}
              step={1}
              value={value.creditFontSize ?? ""}
              onChange={(e) =>
                handleFieldChange({
                  creditFontSize: toNumber(e.target.value),
                })
              }
              disabled={disabled}
              sx={{ mt: 1, fontSize: 0 }}
              placeholder="auto"
            />
          </Label>
        </Flex>
        </Flex>

        <Flex
          sx={{
            flexDirection: "column",
            gap: 2,
            minWidth: 260,
            flex: 1.1,
            p: 2,
            borderRadius: 4,
            backgroundColor: "rgba(248, 250, 252, 0.96)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
          }}
        >
          <Label sx={{ fontSize: 1, fontWeight: 600 }}>Map & stops</Label>
        <Label sx={{ fontSize: 0 }}>
          Tile style
          <Select
            value={value.tileLayerName || ""}
            onChange={(e) =>
              handleFieldChange({
                tileLayerName: e.target.value || undefined,
              })
            }
            disabled={disabled}
            sx={{ mt: 1, fontSize: 0 }}
          >
            {TILE_LAYER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </Label>
        <Label sx={{ fontSize: 0 }}>
          Map opacity
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={value.mapOpacity ?? ""}
            onChange={(e) =>
              handleFieldChange({
                mapOpacity: toNumber(e.target.value),
              })
            }
            disabled={disabled}
            sx={{ mt: 1, fontSize: 0 }}
            placeholder="1.0"
          />
        </Label>
        <Flex sx={{ gap: 2 }}>
          <Label sx={{ fontSize: 0, flex: 1 }}>
            Stop dot size
            <Input
              type="number"
              min={2}
              max={40}
              step={1}
              value={value.stopCircleSize ?? ""}
              onChange={(e) =>
                handleFieldChange({
                  stopCircleSize: toNumber(e.target.value),
                })
              }
              disabled={disabled}
              sx={{ mt: 1, fontSize: 0 }}
              placeholder="auto"
            />
          </Label>
          <Label sx={{ fontSize: 0, flex: 1 }}>
            Stop label color
            <Flex sx={{ gap: 2, mt: 1, alignItems: "center" }}>
              <Input
                type="color"
                value={value.stopFontColor || "#000000"}
                onChange={(e) =>
                  handleFieldChange({ stopFontColor: e.target.value })
                }
                disabled={disabled}
                sx={{ p: 0, width: 40, height: 32 }}
              />
              <Input
                type="text"
                value={value.stopFontColor || ""}
                onChange={(e) =>
                  handleFieldChange({
                    stopFontColor: e.target.value || undefined,
                  })
                }
                disabled={disabled}
                sx={{ flex: 1, fontSize: 0 }}
                placeholder="#000000"
              />
            </Flex>
          </Label>
        </Flex>
        <Flex sx={{ gap: 2 }}>
          <Label sx={{ fontSize: 0, flex: 1 }}>
            Stop label background
            <Flex sx={{ gap: 2, mt: 1, alignItems: "center" }}>
              <Input
                type="color"
                value={value.stopBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleFieldChange({ stopBackgroundColor: e.target.value })
                }
                disabled={disabled}
                sx={{ p: 0, width: 40, height: 32 }}
              />
              <Input
                type="text"
                value={value.stopBackgroundColor || ""}
                onChange={(e) =>
                  handleFieldChange({
                    stopBackgroundColor: e.target.value || undefined,
                  })
                }
                disabled={disabled}
                sx={{ flex: 1, fontSize: 0 }}
                placeholder="#ffffff"
              />
            </Flex>
          </Label>
          <Label
            sx={{
              fontSize: 0,
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 3,
            }}
          >
            <Checkbox
              checked={Boolean(value.showStopLabels)}
              onChange={(e) =>
                handleFieldChange({ showStopLabels: e.target.checked })
              }
              disabled={disabled}
            />
            Show stop labels
          </Label>
        </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

