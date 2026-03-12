import React, { useCallback } from "react";
import { useRouter } from "next/router";
import { Button, Flex } from "theme-ui";

const PrintExportButtons: React.FC = () => {
  const router = useRouter();
  const { routeID, printMode, posterType } = router.query;

  const isPrintMode = printMode === "true";

  const handleExport = useCallback(
    (format: "png" | "pdf") => {
      if (!routeID) return;
      const pathname = router.pathname; // e.g. "/posters/posterGeoLogo" or "/posters/poster"
      const lastSegment =
        pathname.split("/").filter(Boolean).pop() ?? "posterGeoLogo";

      let posterPath = lastSegment;
      // For generic editor route, derive concrete poster path from posterType
      if (lastSegment === "poster" && posterType) {
        const normalized = String(posterType);
        posterPath = normalized.replace(/^Poster/, "poster");
      }

      const url = `/api/posterExport?routeID=${encodeURIComponent(
        String(routeID)
      )}&posterPath=${encodeURIComponent(posterPath)}&format=${format}${
        posterType && lastSegment === "poster"
          ? `&posterType=${encodeURIComponent(String(posterType))}`
          : ""
      }`;

      window.open(url, "_blank");
    },
    [posterType, routeID, router.pathname, printMode]
  );

  if (!isPrintMode) return null;

  return (
    <Flex
      sx={{
        mt: 3,
        gap: 2,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <Button onClick={() => handleExport("png")}>Download PNG</Button>
      <Button onClick={() => handleExport("pdf")}>Download PDF</Button>
    </Flex>
  );
};

export default PrintExportButtons;

