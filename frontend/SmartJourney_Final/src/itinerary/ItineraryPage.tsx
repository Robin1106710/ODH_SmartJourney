import { useState, useEffect } from 'react';
import ItineraryView from '../components/itinerary-view';
import MapView from '../components/map-view';
import MyCalendar from '@/components/test';
export default function ItineraryPage() {
  const [days, setDays] = useState<any[]>([]); // Initialize with empty array

  useEffect(() => {
    const savedItinerary = localStorage.getItem('itinerary');
    if (savedItinerary) {
      try {
        const parsedItinerary = JSON.parse(savedItinerary);
        if (Array.isArray(parsedItinerary) && parsedItinerary.length > 0) {
          setDays([{ itinerary: parsedItinerary }]);
        }
      } catch (e) {
        console.error("Error parsing itinerary data from localStorage:", e);
      }
    }
  }, []);
  
  useEffect(() => {
    if (days.length > 0) {
      localStorage.setItem('itinerary', JSON.stringify(days[0].itinerary)); // Save to localStorage when itinerary changes
    }
  }, [days]);
  

  // If no data is found, show a message or return early
  if (days.length === 0) {
    return <div>No itinerary data available</div>;
  }

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Your Custom Itinerary</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <MyCalendar/> */}
        <ItineraryView days={days} setDays={setDays} />
        {/* <MapView days={days} /> */}
      </div>
    </div>
  );
}
