import dynamic from "next/dynamic";
import React from "react";
import { Badge, Image } from "theme-ui";

export default function Page() {
  const Map = React.useMemo(
    () =>
      dynamic(
        () => import("../components/map"), // replace '@components/map' with your component's location
        {
          loading: () => <p>A map is loading</p>,
          ssr: false, // This line is important. It's what prevents server-side render
        }
      ),
    [
      /* list variables which should trigger a re-render here */
    ]
  );
  return (
    <>
      <Badge
        sx={{
          zIndex: 100,
          position: "absolute",
          width: 100,
          height: 100,
          // overflow: 'hidden',
          top: 100,
          left: 100,
          fontSize: 200,
          fontFamily: "Gill",
        }}
        p={4}
        color="white"
        bg="transparent"
      >
        60
      </Badge>
      <Image
        src={"./metropoline.svg"}
        sx={{
          zIndex: 100,
          position: "absolute",
          width: 200,
          height: 200,
          // overflow: 'hidden',
          top: 300,
          left: 140,
        }}
      ></Image>
      <Map/>
    </>
  );
}
