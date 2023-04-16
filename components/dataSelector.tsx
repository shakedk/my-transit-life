import { Select, Box } from "theme-ui";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { IPtNetwork } from "../src/types";

const DataSelector = () => {
  const [ptNetworks, setPtNetowrks] = useState<IPtNetwork[]>();
  useEffect(() => {
    async function getData() {
      try {
        const res = await axios.get<IPtNetwork[]>(
          `/api/dataProvider/ptNetworks`
        );
        setPtNetowrks(res.data);
      } catch (e) {
        console.log(e);
      }
    }
    getData();
  }, []);
  return (
    ptNetworks && (
      <Select
        arrow={
          <Box
            as="svg"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentcolor"
            sx={{
              ml: -28,
              alignSelf: "center",
              pointerEvents: "none",
            }}
          >
            <path d="M7.41 7.84l4.59 4.58 4.59-4.58 1.41 1.41-6 6-6-6z" />
          </Box>
        }
        defaultValue="Hello"
      >
        {ptNetworks
          .sort((a, b) => {
            return a.networkName.localeCompare(b.networkName);
          })
          .map((network) => {
            return (
              <option key={network.networkId}>{network.networkName}</option>
            );
          })}
      </Select>
    )
  );
};
export default DataSelector;
