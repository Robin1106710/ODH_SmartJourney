import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Define the shape of the data
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

// Container style for the map
const containerStyle = {
  width: "100%",
  height: "500px", // Adjusted to ensure the map is visible
};

// Center the map on Hong Kong, latitude: 22.3193, longitude: 114.1694
const hongKongCenter = { lat: 22.3193, lng: 114.1694 };

const MapView: React.FC<MapViewProps> = ({ days }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null); // Create map reference

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // This function will initialize the map and add the AdvancedMarkerElement
  const initMap = async () => {
    // Request needed libraries
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    // Initialize the map
    const map = new Map(document.getElementById('map') as HTMLElement, {
      center: hongKongCenter,
      zoom: 14,
      mapId: '4504f8b37365c3d0', // Replace with your actual map ID if necessary
    });

    // Create and place the marker using the AdvancedMarkerElement
    const marker = new AdvancedMarkerElement({
      map,
      position: hongKongCenter,
    });
  };

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initMap(); // Initialize map when it's ready
    }
  }, [mapLoaded]);

  return (
    <div style={{ width: "100%", height: "100%" }} id="map">
      {/* LoadScript to load the Google Maps API */}
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_API_KEY">
      {mapLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={hongKongCenter} // Focus on Hong Kong
            zoom={20} // Dynamically set zoom level based on the number of locations
          >
            {/* Add markers for each location */}
            {/* {locations.map((location, index) => (
              <Marker key={index} position={location} label={location.label} />
            ))} */}
              <Marker key={1} position={hongKongCenter} label={"sdf"} />

            {/* Draw a polyline for each day's itinerary with a unique color */}
            {/* {days.map((day, dayIndex) => {
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
                    strokeColor: getRandomColor(), // Generate a random color for each day
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    geodesic: true,
                  }}
                />
              );
            })} */}
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
};

export default MapView;
