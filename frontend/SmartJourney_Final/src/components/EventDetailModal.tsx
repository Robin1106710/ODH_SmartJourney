import { ItineraryItem } from '@/type';
import React from 'react';

interface EventDetailModalProps {
  isOpen: boolean;
  event: ItineraryItem | null;  // Allow event to be either ItineraryItem or null
  onClose: () => void;
}


const EventDetailModal: React.FC<EventDetailModalProps> = ({ isOpen, event, onClose }) => {
  if (!isOpen) return null;
  if (!event) {
    return null; // If event is null, don't render the modal
  }
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h3 className="font-semibold text-xl mb-4">Event Details</h3>
        <p><strong>From:</strong> {event.from.name}</p>
        <p><strong>To:</strong> {event.to.name}</p>
        <p><strong>Time at location:</strong> {event.time_at_location}</p>
        <p><strong>Transport Mode:</strong> {event.transport_mode}</p>
        <p><strong>Travel Time:</strong> {event.travel_time}</p>

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
