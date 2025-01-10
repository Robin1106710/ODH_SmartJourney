import { useState } from 'react';
import ItineraryView from '../components/itinerary-view';
import MapView from '../components/map-view';

export default function ItineraryPage() {
  const [days, setDays] = useState([
    {
      date: "2025-01-11",
      itinerary: [
        { time: '9:00 AM', activity: 'Visit the Victoria Peak', duration: '2 hours', lat: 22.2769, lng: 114.1509 }, // Victoria Peak
        { time: '11:30 AM', activity: 'Lunch at Tsim Sha Tsui', duration: '1 hour', lat: 22.2960, lng: 114.1735 }, // Tsim Sha Tsui
        { time: '1:00 PM', activity: 'Shopping at Causeway Bay', duration: '2 hours', lat: 22.2791, lng: 114.1850 }, // Causeway Bay
        { time: '3:30 PM', activity: 'Visit the Star Ferry', duration: '1.5 hours', lat: 22.2855, lng: 114.1580 }, // Star Ferry
        { time: '6:00 PM', activity: 'Dinner at a local restaurant', duration: '2 hours', lat: 22.2848, lng: 114.1560 }, // Local Restaurant
      ],
    },
    {
      date: "2025-01-12",
      itinerary: [
        { time: '8:00 AM', activity: 'Morning Walk at Kowloon Park', duration: '1 hour', lat: 22.3190, lng: 114.1703 }, // Kowloon Park
        { time: '10:00 AM', activity: 'Brunch at Central', duration: '1.5 hours', lat: 22.2810, lng: 114.1583 }, // Central
        { time: '12:00 PM', activity: 'Explore Mong Kok', duration: '3 hours', lat: 22.3193, lng: 114.1694 }, // Mong Kok
        { time: '4:00 PM', activity: 'Visit Hong Kong Museum of History', duration: '2 hours', lat: 22.3034, lng: 114.1834 }, // Museum of History
        { time: '7:00 PM', activity: 'Dinner at the IFC Mall', duration: '2 hours', lat: 22.2833, lng: 114.1581 }, // IFC Mall
      ],
    },
  ]);

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Your Custom Itinerary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ItineraryView days={days} setDays={setDays} />
        <MapView days={days} />
      </div>
    </div>
  );
}
