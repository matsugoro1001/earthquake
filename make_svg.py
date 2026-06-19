import json
with open("japan.geojson") as f:
    data = json.load(f)

min_lon, max_lon = 129, 146
min_lat, max_lat = 30, 46

def proj(lon, lat):
    x = (lon - min_lon) / (max_lon - min_lon) * 500
    y = 500 - (lat - min_lat) / (max_lat - min_lat) * 500
    return x, y

paths = []
for feature in data['features']:
    geom = feature['geometry']
    coords = geom['coordinates']
    if geom['type'] == 'Polygon':
        coords = [coords]
    for poly in coords:
        for ring in poly:
            if len(ring) < 200: continue # Skip small islands VERY aggressively
            simplified_ring = ring[::10]
            if len(simplified_ring) < 3: continue
            path = "M " + " L ".join([f"{proj(lon, lat)[0]:.1f},{proj(lon, lat)[1]:.1f}" for lon, lat in simplified_ring]) + " Z"
            paths.append(path)

with open("japan_path.txt", "w") as f:
    f.write(f'<path class="japan-land" d="{" ".join(paths)}" fill="#4ade80" stroke="#166534" stroke-width="1"/>')
