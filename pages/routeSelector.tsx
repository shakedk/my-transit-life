import Link from "next/link";
import React from 'react';
import Head from "next/head";
import { server } from "../config";
import styles from "./routeSelector.module.css";

export async function getServerSideProps(context) {
  const routeList = await fetch(`${server}/api/listOfRoutes`);
  return {
    props: {
      data: await routeList.json(),
    }, // will be passed to the page component as props
  };
}

export default function routeSelector(props) {
  const routeMap = {
    nyc2: "NYC - 2 Train",
    nycF: "NYC - F Train",
    nycN: "NYC - N Train",
    tflVictoria: "London Victoria Line",
    tflCircle: "London Circle Line",
    tflNorthern: "London Northern Line",
  };

  function getButtonsForLink(link: string) {
    return (
      <div className={styles.container}>
        {routeList.map((transitRoute) => {
          return (
            <Link key={transitRoute} href={`${link}${transitRoute}`}>
              <a target="_blank">
                <button className={styles.button}>
                  {Object.keys(routeMap).includes(transitRoute)
                    ? routeMap[transitRoute]
                    : transitRoute}
                </button>
              </a>
            </Link>
          );
        })}
      </div>
    );
  }
  const routeList = props.data.routeList;
  return (
    <>
      <Head>
        <title>RouteSelector</title>
      </Head>
      <h1>Geo WITH Logo</h1>
      {getButtonsForLink("/posters/poster?posterType=PosterGeoLogo&routeID=")}
      <h1>Geo WITH Logo Horizontal</h1>
      {getButtonsForLink(
        "/posters//poster?posterType=PosterGeoLogoHorizontal&routeID="
      )}
      <h1>Geo WITHOUT Logo</h1>
      {getButtonsForLink(
        "/posters//poster?posterType=PosterGeoNoLogo&routeID="
      )}
      <h1>Full Poster + Logo</h1>
      {getButtonsForLink(
        "/posters/poster?posterType=PosterFullMapLogo&routeID="
      )}
      <h1>Big border (no logo)</h1>
      {getButtonsForLink(
        "/posters/poster?posterType=PosterBigFrameNoLogo&routeID="
      )}
    </>
  );
}
