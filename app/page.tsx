import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>My Transit Life</h1>
      <p>
        Design high-quality transit posters from real network and route data.
      </p>
      <ul>
        <li>
          <Link href="/routeSelector">Browse predefined routes</Link>
        </li>
        <li>
          <Link href="/posters/poster?posterType=PosterGeoLogo&routeID=nyc2">
            Open sample poster
          </Link>
        </li>
      </ul>
    </main>
  );
}

