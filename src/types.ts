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
  /** When shape is stub (e.g. [[0,0],[0.01,0.01]]), use this so the map shows the right region instead of null island. */
  centerHint?: { longitude: number; latitude: number };
}
export interface IPtNetwork {
  networkName: string,
  networkId: string,
  lat?: number,
  lon?: number,
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
