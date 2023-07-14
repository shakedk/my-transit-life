import React, { useState } from "react";
import NetworkSelect from "./NetworkSelect";
import RouteSelector from "./RouteSelector";
import { IPattern, IPtNetwork } from "../../src/types";
import PatternSelectorOnMap from "./PatternSelectorOnMap";

interface IDataSelector {
  routeData?: any;
  onPatternChange?: () => IPattern[];
}
const DataSelector = ({ routeData, onPatternChange }: IDataSelector) => {
  const [selectedNetwork, setSelectedNetwork] = useState<IPtNetwork | null>(
    null
  );

  const handleNetworkSelectChange = (selectedNetwork: IPtNetwork) => {
    setSelectedNetwork(selectedNetwork);
  };

  return routeData ? (
    <div>
      <PatternSelectorOnMap
        patterns={routeData.patterns.map((p: any) => {
          return {
            patternId: p.properties.route_id,
            patternName: p.properties.route_long_name,
          };
        })}
        onSelectChange={function (selectedPatterns: IPattern[]): void {
          console.log(selectedPatterns);
        }}
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
