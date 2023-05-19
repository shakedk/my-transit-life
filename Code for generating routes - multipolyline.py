# This code generates a single multiPolyLine - old version
def longestSub(arr_of_coords):
    max_len = 0
    max_len_idx = 0
    for i in range (0, len(arr_of_coords)):
        if len(arr_of_coords[i]) > max_len:
            max_len = len(arr_of_coords[i])
            max_len_idx = i
    return arr_of_coords[max_len_idx]

import json
routes = feed.routes
# route_ids = feed.routes.route_id.tolist()
route_ids = ['17440_900']
for route_id in route_ids:
  geo_json = gk.routes_to_geojson(feed, [route_id])
  coords = longestSub(geo_json['features'][0]['geometry']['coordinates'])
  stops = gk.stops.get_stops(feed, route_ids=[route_id])
  stop_data = stops[['stop_id','stop_name','stop_lon','stop_lat']].to_dict('records')
  # stop_data = stops.iloc[[0, -1]][['stop_id','stop_name','stop_lon','stop_lat']].to_dict('records')
  json_data = {
    "multiPolyLine": [
      coords
    ],

    "stops": 
      stop_data
  }
  with open('{}_{}_{}.json'.format(feed.agency.agency_name.iloc[0], feed.routes[routes.route_id == route_id].route_short_name.iloc[0], feed.routes[routes.route_id == route_id].route_id.iloc[0]), 'w', encoding='utf-8') as f:
      json.dump(json_data, f, ensure_ascii=False, indent=4)
