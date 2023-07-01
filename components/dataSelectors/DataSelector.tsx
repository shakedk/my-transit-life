import React, { useState } from "react";
import NetworkSelect from "./NetworkSelect";
import RouteSelector from "./RouteSelector";
import { IPtNetwork } from "../../src/types";

const DataSelector = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<IPtNetwork | null>(
    null
  );

  const handleNetworkSelectChange = (selectedNetwork: IPtNetwork) => {
    setSelectedNetwork(selectedNetwork);
  };

  return (
    <div>
      <NetworkSelect onSelectChange={handleNetworkSelectChange} />
      {selectedNetwork && (
        <RouteSelector networkId={selectedNetwork.networkId} />
      )}
    </div>
  );
};

export default DataSelector;
