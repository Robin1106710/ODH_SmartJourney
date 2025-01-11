import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";

interface Location {
  lat: number;
  lng: number;
  label: string;
}

interface ItineraryItem {
  from: string;
  to: string;
  from_latlng: string;
  to_latlng: string;
  time_at_location: string;
  transport_mode: string; // Transport mode, e.g., 'Car', 'Walking'
  travel_time: string; // Travel time, e.g., '30 mins'
}

interface MapViewProps {
  days: { date: string; itinerary: ItineraryItem[] }[]; // Receive the itinerary data from parent
}

const containerStyle = {
  width: "100%",
  height: "100%", // Adjusted to ensure the map is visible
};

const MapView123: React.FC<MapViewProps> = ({ days }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  // Collect all itinerary items from all days into one array
  const locations: Location[] = days.flatMap(day =>
    day.itinerary.map(item => {
      const [lat, lng] = item.from_latlng.split(",").map(Number); // Parse lat, lng from the from_latlng field
      return {
        lat: lat,
        lng: lng,
        label: `${item.from} to ${item.to}`, // Create label with both locations
      };
    })
  );

  // Log the location data for debugging
  console.log("locations", locations);

  // Set the center of the map based on the first location, or default to Hong Kong if no locations
  const initialCenter = locations.length > 0 ? locations[0] : { lat: 22.3193, lng: 114.1694 };

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
            center={initialCenter} // Center map on the first location
            zoom={calculateZoom()} // Dynamically set zoom level
          >
            {/* Add markers for each location */}
            {locations.map((location, index) => (
              <Marker
                key={index} // Use the index to uniquely identify each marker
                position={{ lat: location.lat, lng: location.lng }}
                label={location.label}
              />
            ))}

            {/* Draw a polyline connecting the markers */}
            {locations.length > 1 && (
              <Polyline
                path={locations.map(location => ({
                  lat: location.lat,
                  lng: location.lng,
                }))}
                options={{
                  strokeColor: "#FF5733", // Example color for the line
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                  geodesic: true,
                }}
              />
            )}

            {/* Draw a polyline for each day's itinerary with a unique color */}
            {days.map((day, dayIndex) => {
              const dayLocations = day.itinerary.map((item) => {
                const [lat, lng] = item.from_latlng.split(",").map(Number); // Parse lat, lng
                return {
                  lat,
                  lng,
                };
              });

              return (
                <Polyline
                  key={dayIndex}
                  path={dayLocations}
                  options={{
                    strokeColor: "#FF5733", // Example color, replace with random color if needed
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

export default MapView123;
