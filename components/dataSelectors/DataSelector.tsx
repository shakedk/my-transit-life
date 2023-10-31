import React, { useState } from "react";
import NetworkSelect from "./NetworkSelect";
import RouteSelector from "./RouteSelector";
import { IPattern, IPtNetwork } from "../../src/types";
import PatternSelectorOnMap from "./PatternSelectorOnMap";

interface IDataSelector {
  routeData?: any;
  setPatternsForSelection: React.Dispatch<React.SetStateAction<IPattern[]>>;
  patternsForSelection: IPattern[];
}
const DataSelector = ({ routeData, patternsForSelection, setPatternsForSelection }: IDataSelector) => {
  const [selectedNetwork, setSelectedNetwork] = useState<IPtNetwork | null>(
    null
  );

  const handleNetworkSelectChange = (selectedNetwork: IPtNetwork) => {
    setSelectedNetwork(selectedNetwork);
  };
  
  return routeData ? (
    <div>
      <PatternSelectorOnMap
        patterns={patternsForSelection}
        onSelectChange={setPatternsForSelection}
      ></PatternSelectorOnMap>
    </div>
  ) : (
    <div>
      <NetworkSelect onSelectChange={handleNetworkSelectChange} />
      {selectedNetwork && (
        <RouteSelector networkId={selectedNetwork.networkId} />
      )}
      {/* <PatternSelectorOnMap
        patterns={[
          { patternId: "1", patternName: "p1" },
          { patternId: "2", patternName: "p2" },
        ]}
        onSelectChange={function (selectedPattern: IPattern): void {
          console.log(selectedPattern);
        }}
      ></PatternSelectorOnMap> */}
    </div>
  );
};

export default DataSelector;
