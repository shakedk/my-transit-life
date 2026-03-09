import axios from "axios";
import dashify from "dashify";
import { getAuthAxios } from "../api/apiClient";
import dynamic from "next/dynamic";
import React from "react";
import { server } from "../../../config";

export const getPosterServerSideProps = async (
  context: { query: Record<string, string | string[] | undefined> },
  posterType: string
) => {
  const routeID = context.query.routeID;
  if (!routeID || Array.isArray(routeID)) {
    return { redirect: { destination: "/", permanent: false as const } };
  }
  const routeData = await fetch(`${server}/api/routeData?routeID=${routeID}`);
  const routeDesignConfig = await fetch(
    `${server}/api/routeDesignConfig${posterType.replace(/poster/i, "")}?routeID=${routeID}`
  );
  const routeDataJson = await routeData.json();
  const routeDesignConfigJson = await routeDesignConfig.json();
  return {
    props: {
      routeData: routeDataJson,
      routeDesignConfig: routeDesignConfigJson,
      isPrintMode: context.query.printMode === "true",
    },
  };
};

export const createPosterInDB = async (posterType, routeID) => {
  try {
    await getAuthAxios().post("/api/poster/", {
      posterType,
      routeID,
      slug: dashify(posterType) + "-" + dashify(routeID),
    });
  } catch (e) {
    console.log("Can't create/verify the poster-routeID exists in DB", e);
  }
};

export const getPosterIDInDB = async (posterType, routeID) => {
  const slug = dashify(posterType) + "-" + dashify(routeID);
  try {
    const res = await axios.get("/api/poster/getBySlug", { params: { slug } });
    return res.data.posterID;
  } catch (e) {
    console.log(`Can't find poster-routeID ${slug} in DB`, e);
  }
};

export const useMap = () => {
  const map = React.useMemo(
    () =>
      dynamic(
        () => import("../../../components/map"),
        {
          loading: () => <p>A map is loading</p>,
          ssr: false,
        }
      ),
    []
  );
  return map;
};
