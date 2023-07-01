import { IPtNetwork, IRoute } from "../../types";
import { IDataAccess } from "./dataAccess";
import db from "../db";

export class TransitDataAccess implements IDataAccess {
  initialized: boolean = false;
  API_KEY: string;
  BASE_URL: string;

  constructor() {
    this.BASE_URL = "https://external.transitapp.com/v3/public";
    if (!this.initialized) {
      if (process.env.NODE_ENV === "development") {
        this.API_KEY = require("./transitApiKey.json");
      } else {
        this.API_KEY = process.env.TRANSIT_API_KEY;
      }
      this.initialized = true;
    }
  }

  async getAvailableNetworks(): Promise<IPtNetwork[]> {
    const dbNetworks = await db.collection("ptNetworks").doc("networks").get();
    if (dbNetworks.exists) {
      const data = dbNetworks.data();
      const now = new Date();
      const date = new Date(data.updated);
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours > 72) {
        await db.collection("ptNetworks").doc("networks").delete();
      } else {
        const netowkrData = data.networks as IPtNetwork[];
        return netowkrData;
      }
    }
    const url = `${this.BASE_URL}/available_networks`;
    const req = {
      method: "GET",
      headers: new Headers({
        apiKey: this.API_KEY,
      }),
    };
    const response = await fetch(url, req);
    const responseData = await response.json();
    const networkData = responseData.networks.map((network) => ({
      networkName: network.network_name,
      networkId: network.network_id,
    }));
    const networkDataDeduped = networkData.filter(
      (v, i, a) =>
        a.findIndex((v2) => ["networkId"].every((k) => v2[k] === v[k])) === i
    );

    await db.collection("ptNetworks").doc("networks").set(
      {
        networks: networkDataDeduped,
        updated: new Date().toISOString(),
      },
      { merge: true }
    );
    return networkData;
  }

  async getRoutesbyNetworkId(
    networkId: string
  ): Promise<{ routeName: string; routeId: string }[]> {
    const url = `${this.BASE_URL}/routes_for_network?network_id=${networkId}`;
    const req = {
      method: "GET",
      headers: new Headers({
        apiKey: this.API_KEY,
      }),
    };
    const response = await fetch(url, req);
    const { routes } = await response.json();
    return routes.map((route) => ({
      routeName: `${route.route_short_name} - ${route.route_long_name}`,
      routeId: route.global_route_id,
    }));
  }

  async getRouteDataByRouteId(routeId: string): Promise<IRoute> {
    const response = await fetch(
      `https://api.example.com/routes/${routeId}/data`
    );
    const routeData = await response.json();
    return routeData;
  }
}
