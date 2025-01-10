import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

const MapView: React.FC = () => {
  const position: LatLngExpression = [51.505, -0.09];
  const markerPosition: LatLngExpression = [51.5, -0.09];

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100vh', width: '100%' }}>
      {/* Single child component inside MapContainer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={markerPosition}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
