import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface ItineraryItem {
  from: string;
  time_at_location: string;
  to: string;
  transport_mode: string; // Transport mode, e.g., 'Car', 'Walking'
  travel_time: string; // Travel time, e.g., '30 mins'
}

interface DayItinerary {
  date: string;
  itinerary: ItineraryItem[];
}

interface ItineraryViewProps {
  days: DayItinerary[];
  setDays: React.Dispatch<React.SetStateAction<DayItinerary[]>>;
}

export default function ItineraryView({ days, setDays }: ItineraryViewProps) {
  const [currentDay, setCurrentDay] = useState(0); // Track the current day (0 is day 1)
  const [confirmDelete, setConfirmDelete] = useState(false); // State for confirmation dialog
  const [eventToDelete, setEventToDelete] = useState<ItineraryItem | null>(null); // Event to delete

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeIndex = active.data.current?.sortable.index;
    const overIndex = over.data.current?.sortable.index;

    if (activeIndex === overIndex) return;

    const newItinerary = [...days[currentDay].itinerary];
    const [movedItem] = newItinerary.splice(activeIndex, 1);
    newItinerary.splice(overIndex, 0, movedItem);

    const updatedDays = [...days];
    updatedDays[currentDay].itinerary = newItinerary;
    setDays(updatedDays); // Update the parent state with the new itinerary
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
          <CardTitle>Your Itinerary for {days[currentDay].date}</CardTitle>
        </CardHeader>
        <CardContent>

          {/* Event Column */}
          <div className=''>
            {days[currentDay].itinerary.map((item, index) => (
              <div className="relative" key={index}>
                <DraggableItem key={index} index={index} item={item} onDelete={handleDeleteEvent} />

                <div className="flex justify-center items-center h-full space-x-2">
                  <span className="block bg-gray-300 w-1 h-20"></span>

                  <div className="absolute text-sm left-6 bottom-0 flex flex-col justify-center">
                    <span>From: {item.from}</span>
                    <span>to {item.to}</span>
                    <span>{item.transport_mode} {item.travel_time}</span>
                  </div>
                </div>
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
    console.log("debug")
    e.stopPropagation(); // Prevent dragging interaction
    onDelete(item);
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
          <p className="font-semibold">{item.from}</p>
          <p className="text-sm text-gray-500">{item.to}</p>
          <p className="text-sm text-gray-500">{item.time_at_location}</p>
        </div>
      </div>
      <button onClick={handleCancelClick} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
        <FaTimes />
      </button>
    </div>

  );
};
