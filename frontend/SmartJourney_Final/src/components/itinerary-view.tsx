import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { fetchGoogleDirections } from '../utils/utils'; // Assuming you have a fetchGoogleDirections function
import EventDetailModal from './EventDetailModal';  // Import the modal component
import { DayItinerary, ItineraryItem } from '@/type';

interface ItineraryViewProps {
  days: DayItinerary[];
  setDays: React.Dispatch<React.SetStateAction<DayItinerary[]>>;
}

export default function ItineraryView({ days, setDays }: ItineraryViewProps) {
  const [currentDay, setCurrentDay] = useState(0); // Track the current day (0 is day 1)
  const [confirmDelete, setConfirmDelete] = useState(false); // State for confirmation dialog
  const [eventToDelete, setEventToDelete] = useState<ItineraryItem | null>(null); // Event to delete
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [selectedEvent, setSelectedEvent] = useState<ItineraryItem | null>(null); // Store selected event for modal

  // Function to update travel details (calculate transport mode and travel time)
  const updateTravelDetails = async (updatedItinerary: ItineraryItem[]) => {
    let totalTime = 0;
    for (let i = 0; i < updatedItinerary.length - 1; i++) {  // Exclude the last event
      const currentItem = updatedItinerary[i];
      const nextItem = updatedItinerary[i + 1];

      console.log("Update Travel details", "From " + currentItem.from.name + " - To " + nextItem.from.name);

      // Fetch travel details between two consecutive locations
      const { travel_time, transport_mode } = await fetchGoogleDirections(`${currentItem.from.latitude},${currentItem.from.longitude}`, `${nextItem.from.latitude},${nextItem.from.longitude}`);

      // Update travel time and transport mode
      updatedItinerary[i].travel_time = travel_time;
      updatedItinerary[i].transport_mode = transport_mode;

      // Update total time (time_at_location + travel_time between events)
      totalTime += parseInt(currentItem.time_at_location) + parseInt(travel_time.split(' ')[0]);
    }

    // For the last event, no travel time is calculated
    const lastEvent = updatedItinerary[updatedItinerary.length - 1];
    lastEvent.travel_time = '';  // No transport details for the last event
    lastEvent.transport_mode = '';

    setDays(prevDays => {
      const updatedDays = [...prevDays];
      updatedDays[currentDay].itinerary = updatedItinerary;
      return updatedDays;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeIndex = active.data.current?.sortable.index;
    const overIndex = over.data.current?.sortable.index;

    if (activeIndex === overIndex) return;

    const newItinerary = [...days[currentDay].itinerary];
    const [movedItem] = newItinerary.splice(activeIndex, 1);
    newItinerary.splice(overIndex, 0, movedItem);

    // Recalculate travel details for the updated itinerary
    await updateTravelDetails(newItinerary);
  };

  const handleOpenModal = (event: ItineraryItem) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const goToNextDay = () => setCurrentDay(prevDay => (prevDay < days.length - 1 ? prevDay + 1 : prevDay));
  const goToPreviousDay = () => setCurrentDay(prevDay => (prevDay > 0 ? prevDay - 1 : prevDay));

  const handleDeleteEvent = (item: ItineraryItem) => {
    setEventToDelete(item);
    setConfirmDelete(true); // Show confirmation dialog
  };

  const confirmDeleteHandler = (confirm: boolean) => {
    if (confirm && eventToDelete) {
      const updatedItinerary = days[currentDay].itinerary.filter(event => event !== eventToDelete);
      const updatedDays = [...days];
      updatedDays[currentDay].itinerary = updatedItinerary;
      setDays(updatedDays);
    }
    setConfirmDelete(false);
    setEventToDelete(null);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Card>
        <CardHeader>
          <CardTitle>Your Itinerary for</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Event Column */}
          <div className=''>
            {days[currentDay].itinerary.map((item, index) => (
              <div className="relative" key={index}>
                <DraggableItem key={index} index={index} item={item} onDelete={handleDeleteEvent} />

                <div className="flex justify-center items-center h-full space-x-2">
                  <span className="block bg-gray-300 w-1 h-20"></span>

                  <div className="absolute text-sm left-6 flex flex-col justify-center">
                    {/* Conditionally render transport details for non-last events */}
                    {index < days[currentDay].itinerary.length - 1 && (
                      <span>{item.transport_mode} {item.travel_time}</span>
                    )}
                  </div>
                </div>
                {/* Button to open the event details modal */}
                <button
                  onClick={() => handleOpenModal(item)}
                  className="absolute top-3 right-12 text-blue-500 hover:text-blue-700"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Navigation Buttons */}
        <div className="flex justify-between m-4">
          <button onClick={goToPreviousDay} className="bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition-all duration-300">
            <FaChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={goToNextDay} className="bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition-all duration-300">
            <FaChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      {confirmDelete && eventToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-xl mb-4">Are you sure you want to delete this event?</h3>
            <div className="flex justify-between">
              <button onClick={() => confirmDeleteHandler(true)} className="bg-red-600 text-white px-4 py-2 rounded">
                Yes, Delete
              </button>
              <button onClick={() => confirmDeleteHandler(false)} className="bg-gray-300 text-black px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={handleCloseModal}
      />
    </DndContext>
  );
}

// Function to convert duration (e.g., '2 hours') to pixels
const convertDurationToHeight = (duration: string): number => {
  const hours = parseFloat(duration);
  const pixelsPerHour = 60;
  return hours * pixelsPerHour;
};

const DraggableItem = ({ item, index, onDelete }: { item: ItineraryItem; index: number; onDelete: (item: ItineraryItem) => void }) => {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `item-${index}`,
    data: { sortable: { index } },
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `droppable-${index}`,
    data: { sortable: { index } },
  });

  const draggingStyle = isDragging ? { transform: 'scale(1.05)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', opacity: 0.9 } : {};

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dragging interaction
    onDelete(item);
  };

  // Function to convert minutes to hours and minutes
  const formatTime = (timeInMinutes: number): string => {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;

    // Return formatted string
    let formattedTime = '';
    if (hours > 0) {
      formattedTime += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      if (formattedTime) formattedTime += ' ';
      formattedTime += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return formattedTime || '0 minutes';
  };

  return (
    <div className='relative'>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="flex justify-between items-start p-4 bg-[#e1dcfb] rounded-lg shadow-sm transition-all duration-300 ease-in-out"
        style={{ ...draggingStyle }}
      >
        <div ref={setDroppableNodeRef}>
          <p className="font-semibold">{item.from.name}</p>
          {/* <p className="text-sm text-gray-500">{item.to.name}</p> */}
          <p className="text-sm text-gray-500">Recommended time: {formatTime(parseInt(item.time_at_location))}</p>
        </div>
      </div>
      <button onClick={handleCancelClick} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
        <FaTimes />
      </button>
    </div>
  );
};
