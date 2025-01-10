import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";

interface Location {
  lat: number;
  lng: number;
  label: string;
}

interface ItineraryItem {
  time: string;
  activity: string;
  duration: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  days: { date: string; itinerary: ItineraryItem[] }[]; // Receive the itinerary data from parent
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const MapView: React.FC<MapViewProps> = ({ days }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  // Collect all itinerary items from all days into one array
  const locations: Location[] = days.flatMap(day =>
    day.itinerary.map(item => ({
      lat: item.lat,
      lng: item.lng,
      label: item.activity,
    }))
  );

  // Center the map on Hong Kong, latitude: 22.3193, longitude: 114.1694
  const hongKongCenter = { lat: 22.3193, lng: 114.1694 };

  // Adjust zoom level based on the number of locations
  const calculateZoom = () => {
    if (locations.length <= 1) return 14; // Default zoom for 1 location (closer to Hong Kong)
    return 12; // Moderate zoom for multiple locations
  };

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* LoadScript to load the Google Maps API */}
      <LoadScript googleMapsApiKey="AIzaSyBmSTB9uEckRXMvwxROTxV-lctnIOy1ZJ8">
        {/* Only render the GoogleMap component once the map is loaded */}
        {mapLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={hongKongCenter} // Focus on Hong Kong
            zoom={calculateZoom()} // Dynamically set zoom level based on the number of locations
          >
            {/* Add markers for each location */}
            {locations.map((location, index) => (
              <Marker key={index} position={location} label={location.label} />
            ))}

            {/* Draw a polyline for each day's itinerary with a unique color */}
            {days.map((day, dayIndex) => {
              const dayLocations = day.itinerary.map((item) => ({
                lat: item.lat,
                lng: item.lng,
              }));
              return (
                <Polyline
                  key={dayIndex}
                  path={dayLocations}
                  options={{
                    strokeColor: getRandomColor(), // Generate a random color for each day
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    geodesic: true,
                  }}
                />
              );
            })}
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
};

export default MapView;
