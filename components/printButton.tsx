import { useRouter } from "next/router";
import React from "react";

import { Button } from "theme-ui";
import { server } from "../config";

const OpenForPrintButton = () => {
  const router = useRouter();
  const asPath = router.asPath || "/";
  const joiner = asPath.includes("?") ? "&" : "?";
  const url = `${server}${asPath}${joiner}printMode=true`;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Button>Open for Print</Button>
    </a>
  );
};
export default OpenForPrintButton;
