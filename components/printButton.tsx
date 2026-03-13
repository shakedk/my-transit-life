import React from "react";
import { useRouter } from "next/router";
import { Button } from "theme-ui";
import { server } from "../config";

const OpenForPrintButton = () => {
  const router = useRouter();
  const asPath = router.asPath || "/";
  const joiner = asPath.includes("?") ? "&" : "?";
  const url = `${server}${asPath}${joiner}printMode=true`;

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Button
        sx={{
          px: 3,
          py: 2,
          borderRadius: 999,
          fontSize: 0,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontWeight: 600,
          bg: "background",
          color: "#0f172a",
          border: "1px solid rgba(148, 163, 184, 0.9)",
          boxShadow: "0 10px 25px rgba(148, 163, 184, 0.35)",
          "&:hover": {
            bg: "rgba(248, 250, 252, 0.96)",
          },
        }}
      >
        Open for print
      </Button>
    </a>
  );
};

export default OpenForPrintButton;
