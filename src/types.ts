export interface IStop {
  stopName: string;
  stopId: string;
  location: [number, number];
}
export interface IRoute {
  routeName: string;
  routeId: string;
  stops: IStop[];
  shape: [number, number][];
}
export interface IPtNetwork {
  networkName: string,
  networkId: string
}
export interface IPattern {
  patternId: string,
  patternName: string,
  toDisplay: boolean
}

export interface IRouteData {
  routeName: string;
  routeId: string;
  routePath?: [number, number][];
  routeStops?: IStop[];
  multiPolyLine?: [number, number][][];
  stops?: IStop[];
  patterns?: unknown[];
}
