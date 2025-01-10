import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface ItineraryItem {
  time: string;
  activity: string;
  duration: string;
  lat: number;
  lng: number;
}

interface DayItinerary {
  date: string;
  itinerary: ItineraryItem[];
}

interface ItineraryViewProps {
  days: DayItinerary[]; // Receive days data from parent
  setDays: React.Dispatch<React.SetStateAction<DayItinerary[]>>; // Update days in parent
}

export default function ItineraryView({ days, setDays }: ItineraryViewProps) {
  const [currentDay, setCurrentDay] = useState(0); // Track the current day (0 is day 1)

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

  const goToNextDay = () => setCurrentDay((prevDay) => (prevDay < days.length - 1 ? prevDay + 1 : prevDay)); // Max days
  const goToPreviousDay = () => setCurrentDay((prevDay) => (prevDay > 0 ? prevDay - 1 : prevDay)); // Min day

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Card>
        <CardHeader>
          <CardTitle>Your Itinerary for {days[currentDay].date}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {/* Time Column */}
          <div className="space-y-4">
            {generateTimeSlots(days[currentDay].itinerary).map((slot, index) => (
              <div
                key={index}
                className="border-r-2 border-gray-200"
                style={{ height: `${slot.height}px` }} // Dynamically set height
              >
                <p className="text-lg font-semibold">{slot.time}</p>
              </div>
            ))}
          </div>

          {/* Event Column */}
          <div className="space-y-4">
            {days[currentDay].itinerary.map((item, index) => (
              <DraggableItem key={index} index={index} item={item} />
            ))}
          </div>
        </CardContent>

        {/* Navigation Buttons */}
        <div className="flex justify-between m-4">
          <button
            onClick={goToPreviousDay}
            className="bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition-all duration-300"
          >
            <FaChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNextDay}
            className="bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition-all duration-300"
          >
            <FaChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Card>
    </DndContext>
  );
}

// Function to generate time slots from 6 AM to 11:59 PM with dynamic height
const generateTimeSlots = (itinerary: ItineraryItem[]): { time: string, height: number }[] => {
  const times = [];
  const startHour = 6;
  const endHour = 11;
  const pixelsPerHour = 30;

  // Initialize timeslots with a default height of 60px per hour
  for (let hour = startHour; hour <= endHour; hour++) {
    const formattedHour = hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
    times.push({ time: formattedHour, height: pixelsPerHour });
  }

  // Adjust heights based on the itinerary duration
  itinerary.forEach(item => {
    const eventTime = item.time.split(' ')[0]; // Get the hour of the event
    const eventDuration = parseFloat(item.duration); // Duration in hours

    const eventStartHour = parseInt(eventTime.split(':')[0]);
    const eventEndHour = eventStartHour + eventDuration;
    
    // Adjust the corresponding time slots
    for (let i = eventStartHour; i < eventEndHour; i++) {
      if (i >= startHour && i <= endHour) {
        const slot = times[i - startHour]; // Get the corresponding time slot
        slot.height += eventDuration * pixelsPerHour; // Increase the height based on the event duration
      }
    }
  });

  return times;
};

// Function to convert duration (e.g., '2 hours') to pixels
const convertDurationToHeight = (duration: string): number => {
  const hours = parseFloat(duration);
  const pixelsPerHour = 60;
  return hours * pixelsPerHour;
};

const DraggableItem = ({ item, index }: { item: ItineraryItem; index: number }) => {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `item-${index}`,
    data: { sortable: { index } },
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `droppable-${index}`,
    data: { sortable: { index } },
  });

  const draggingStyle = isDragging ? { transform: 'scale(1.05)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', opacity: 0.9 } : {};
  const itemHeight = convertDurationToHeight(item.duration);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex justify-between items-start p-4 bg-[#e1dcfb] rounded-lg shadow-sm transition-all duration-300 ease-in-out"
      style={{ ...draggingStyle, height: `${itemHeight}px` }} // Apply dynamic height based on duration
    >
      <div ref={setDroppableNodeRef}>
        <p className="font-semibold">{item.activity}</p>
      </div>
      <span className="text-sm text-gray-500">{item.duration}</span>
    </div>
  );
};
