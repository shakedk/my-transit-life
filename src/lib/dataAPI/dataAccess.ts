import { IPtNetwork, IRoute } from "../../types";

export interface IDataAccess {
  initialized: boolean;
  BASE_URL: string;
  getAvailableNetworks: () => Promise<IPtNetwork[]>;
  getRoutesbyNetworkId: (networkId: string) => Promise<
    {
      routeName: string;
      routeId: string;
    }[]
  >;
  getRouteDataByRouteId: (routeId: string) => Promise<IRoute>;
}