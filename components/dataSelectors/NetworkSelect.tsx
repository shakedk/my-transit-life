import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { IPtNetwork } from "../../src/types";

interface NetworkSelectProps {
  onSelectChange: (selectedNetwork: IPtNetwork) => void;
}

const NetworkSelect = ({ onSelectChange }: NetworkSelectProps) => {
  const [ptNetworks, setPtNetworks] = useState<IPtNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<IPtNetwork | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get<IPtNetwork[]>("/api/dataProvider/ptNetworks");
        setPtNetworks(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSelectChange = (selectedOption: any) => {
    const selectedNetworkId = selectedOption.value;
    const selectedNetwork = ptNetworks.find(
      (network) => network.networkId === selectedNetworkId
    );
    setSelectedNetwork(selectedOption || null);
    onSelectChange(selectedNetwork || null);
  };

  const options = ptNetworks.map((network) => ({
    value: network.networkId,
    label: network.networkName,
  }));

  return (
    <Select
      options={options}
      onChange={handleSelectChange}
      value={selectedNetwork}
      placeholder={isLoading ? "Loading..." : "Select a Network"}
      isSearchable
      isDisabled={isLoading}
    />
  );
};

export default NetworkSelect;
