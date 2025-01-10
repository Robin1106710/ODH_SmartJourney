// src/pages/ItineraryPage.tsx
import ItineraryView from '../components/itinerary-view';
import MapView from '../components/map-view';

export default function ItineraryPage() {
  return (
    <div className=" space-y-6 p-6"> {/* Added min-h-screen here */}
      <h1 className="text-3xl font-bold mb-4">Your Custom Itinerary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ItineraryView />
        <MapView />
      </div>
    </div>
  );
}
