# This code generates patterns - new version
import json
routes = feed.routes
# route_ids = feed.routes.route_id.tolist()
route_ids = ['34447']
for route_id in route_ids:
  geo_json = gk.routes_to_geojson(feed, [route_id])
  del geo_json['type']
  geo_json['patterns'] = geo_json['features']
  del geo_json['features']
  stops = gk.stops.get_stops(feed, route_ids=[route_id])
  geo_json['stops'] = stops[['stop_id','stop_name','stop_lon','stop_lat']].to_dict('records')
  with open('{}_{}_{}_test.json'.format(feed.agency.agency_name.iloc[0], feed.routes[routes.route_id == route_id].route_short_name.iloc[0], feed.routes[routes.route_id == route_id].route_id.iloc[0]), 'w', encoding='utf-8') as f:
    json.dump(geo_json, f, ensure_ascii=False, indent=4)



    34445
    אריה קוממיות
    34447
    מרכזית קוממיות