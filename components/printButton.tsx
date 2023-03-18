import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import { Button } from "theme-ui";
import { server } from "../config";

const OpenForPrintButton = () => {
  const router = useRouter();
  const url = `${server}${router.asPath}&printMode=true`;
  return (
    <Link href={url}>
      <a target="_blank">
        <Button>Open for Print</Button>
      </a>
    </Link>
  );
};
export default OpenForPrintButton;
