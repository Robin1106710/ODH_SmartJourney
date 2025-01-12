import { useState, useEffect } from 'react';
import ItineraryView from '../components/itinerary-view';
import MapView from '../components/map-view';
import { DayItinerary, ItineraryItem } from '../type';  // Import the correct types

export default function ItineraryPage() {
  const [days, setDays] = useState<DayItinerary[]>([]); // Initialize with empty array

  useEffect(() => {
    const savedItinerary = localStorage.getItem('itinerary');
    if (savedItinerary) {
      try {
        const parsedItinerary = JSON.parse(savedItinerary);
        if (Array.isArray(parsedItinerary) && parsedItinerary.length > 0) {
          setDays([{itinerary: parsedItinerary }]); // Assuming the itinerary has a date, adjust as needed
        }
      } catch (e) {
        console.error("Error parsing itinerary data from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (days.length > 0) {
      console.log("Test useEffect triggered");
      localStorage.setItem('itinerary', JSON.stringify(days[0].itinerary)); // Save to localStorage when itinerary changes
    }
  }, [days]);

  // Function to generate a Google Maps link for directions
  const generateGoogleMapsLink = (locations: { lat: number; lng: number }[]) => {
    const origin = `${locations[0].lat},${locations[0].lng}`;
    const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}`;
    const waypoints = locations.slice(1, -1).map((location) => `${location.lat},${location.lng}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
  };

  // If no data is found, show a message or return early
  if (days.length === 0) {
    return <div>No itinerary data available</div>;
  }

  // Generate locations from the itinerary for Google Maps link
  const locations = days[0].itinerary.map((item: ItineraryItem) => {
    console.log("debug", item)
    return { lat: item.from.latitude, lng: item.from.longitude };
  });

  return (
    <div className="space-y-1 p-6 min-h-screen">
      <h1 className="text-3xl font-bold">Your Custom Itinerary</h1>

      {/* Google Maps Link */}
      <div className="text-end mb-4">
        <a href={generateGoogleMapsLink(locations)} target="_blank" rel="noopener noreferrer">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
            Open in Google Maps
          </button>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ItineraryView days={days} setDays={setDays} />
        <MapView days={days} />
      </div>
    </div>
  );
}
