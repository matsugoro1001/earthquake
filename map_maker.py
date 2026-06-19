import urllib.request
import json

url = "https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

# SVG coords: 0 to 500
# Japan bounding box: 
# min_lon = 129 (Kyushu), max_lon = 146 (Hokkaido)
# min_lat = 31 (Kyushu), max_lat = 46 (Hokkaido)

min_lon, max_lon = 129, 146
min_lat, max_lat = 30, 46

def proj(lon, lat):
    x = (lon - min_lon) / (max_lon - min_lon) * 450 + 25
    y = 475 - (lat - min_lat) / (max_lat - min_lat) * 450
    return x, y

paths = []
for feature in data['features']:
    geom = feature['geometry']
    coords = geom['coordinates']
    if geom['type'] == 'Polygon':
        coords = [coords]
    for poly in coords:
        for ring in poly:
            if len(ring) < 10: continue # skip small islands
            path = "M " + " L ".join([f"{proj(lon, lat)[0]:.1f},{proj(lon, lat)[1]:.1f}" for lon, lat in ring]) + " Z"
            paths.append(path)

print(f'<path class="japan-land" d="{" ".join(paths)}" fill="#4ade80" stroke="#166534" stroke-width="1"/>')
