import axios from "axios";
import dashify from "dashify";
import dynamic from "next/dynamic";
import React from "react";
export const createPosterInDB = async (posterType, routeID) => {
  try {
    await axios.post("/api/poster/", {
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
        () => import("../../../components/map"), // replace '@components/map' with your component's location
        {
          loading: () => <p>A map is loading</p>,
          ssr: false, // This line is important. It's what prevents server-side render
        }
      ),
    [
      /* list variables which should trigger a re-render here */
    ]
  );
  return map;
}