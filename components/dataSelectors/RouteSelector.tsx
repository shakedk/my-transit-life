import React, { useState, useEffect } from "react";
import Select from "react-select";
import { IRoute, IRouteData } from "../../src/types";
import axios from "axios";

interface RouteSelectorProps {
  networkId: string;
}

const RouteSelector = ({ networkId }: RouteSelectorProps) => {
  const [ptRoutes, setPtRoutes] = useState<IRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
  const [routeData, setRouteData] = useState<IRouteData | null>(null);

  useEffect(() => {
    const fetchRoutes = async (networkId: string) => {
      try {
        const res = await axios.get<IRoute[]>(
          `/api/dataProvider/ptRoutes?networkId=${networkId}`
        );
        setPtRoutes(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (networkId) {
      fetchRoutes(networkId);
    }
  }, [networkId]);

  const fetchRouteData = async (routeId: string) => {
    try {
      const res = await axios.get<IRouteData>(
        `/api/dataProvider/routeData?routeId=${routeId}`
      );
      debugger;
      setRouteData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRouteChange = (selectedOption: any) => {
    setSelectedRoute(selectedOption);
    if (selectedOption) {
      fetchRouteData(selectedOption.value);
    } else {
      setRouteData(null);
    }
  };

  const routeOptions = ptRoutes.map((route) => ({
    value: route.routeId,
    label: route.routeName,
  }));

  return (
    <div>
      <label htmlFor="route-select">Select a Route:</label>
      <Select
        id="route-select"
        options={routeOptions}
        onChange={handleRouteChange}
        value={selectedRoute}
        placeholder="Select"
        isClearable
        isSearchable
      />
      {routeData && (
        <div>
          <h4>Route Name: {routeData.routeName}</h4>
          <p>Route ID: {routeData.routeId}</p>
          {/* Display routePath and routeStops as needed */}
        </div>
      )}
    </div>
  );
};

export default RouteSelector;
