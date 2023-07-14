import { featureCollection, LineString, combine } from '@turf/turf';

const TurfComponent = (patterns: any) => {
  // Use Turf functions here
//   const buffered = buffer(someGeoJSON, 10, { units: 'kilometers' });
//   const unioned = union(featureCollection);
//   const dist = distance(point1, point2);
const lineString1 = patterns.patterns[0];
const lineString2 = patterns.patterns[1];
    console.log(combine(featureCollection(patterns.patterns)));
  return (
    <div>
      {/* Render the Turf-related content */}
    </div>
  );
};

export default TurfComponent;
