import React from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// GeoJSON gồm 4 bang (NV, UT, CA, AZ)
const statesGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Nevada", "abbr": "NV" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-120.0, 42.0], [-114.0, 42.0], [-114.0, 35.0], [-120.0, 35.0], [-120.0, 42.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Utah", "abbr": "UT" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-114.0, 42.0], [-109.0, 42.0], [-109.0, 37.0], [-114.0, 37.0], [-114.0, 42.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "California", "abbr": "CA" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-124.5, 42.0], [-120.0, 42.0], [-120.0, 32.5], [-124.5, 32.5], [-124.5, 42.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Arizona", "abbr": "AZ" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-114.8, 37.0], [-109.0, 37.0], [-109.0, 31.3], [-114.8, 31.3], [-114.8, 37.0]
        ]]
      }
    },
  ]
};

const USStatesMap = (props) => {
  // Highlight style
  const stateStyle = {
    fillColor: "#faa28a",
    weight: 2,
    opacity: 1,
    color: "#232a37",
    fillOpacity: 0.4
  };

  // Sự kiện khi click vào state
  const onEachState = (feature, layer) => {
    layer.on({
      click: () => {
        if (props.onStateClick) props.onStateClick(feature.properties);
      }
    });
    layer.bindTooltip(feature.properties.name, { sticky: true });
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={[37, -115]}
        zoom={5}
        style={{ width: "100%", height: "100%" }} // phải là 100% ở đây!
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        {...props}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
        <GeoJSON data={statesGeoJSON} style={stateStyle} onEachFeature={onEachState} />
      </MapContainer>
    </div>
  );
};

export default USStatesMap;