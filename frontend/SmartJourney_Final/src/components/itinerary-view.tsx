import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface ItineraryItem {
  time: string;
  activity: string;
  duration: string;
}

export default function ItineraryView() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([
    { time: '9:00 AM', activity: 'Visit the Museum of Modern Art', duration: '2 hours' },
    { time: '11:30 AM', activity: 'Lunch at Central Park', duration: '1 hour' },
    { time: '1:00 PM', activity: 'Shopping at Fifth Avenue', duration: '2 hours' },
    { time: '3:30 PM', activity: 'Visit the Empire State Building', duration: '1.5 hours' },
    { time: '6:00 PM', activity: 'Dinner at a local restaurant', duration: '2 hours' },
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeIndex = active.data.current?.sortable.index;
    const overIndex = over.data.current?.sortable.index;
    

    if (activeIndex === overIndex) return;

    const newItinerary = [...itinerary];
    const [movedItem] = newItinerary.splice(activeIndex, 1);
    newItinerary.splice(overIndex, 0, movedItem);

    setItinerary(newItinerary);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Card>
        <CardHeader>
          <CardTitle>Your Itinerary</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-4'>
          {/* Time Column */}
          <div className="space-y-4">
            {generateTimeSlots().map((time, index) => (
              <div key={index} className="p-4 border-r-2 border-gray-200">
                <p className="text-lg font-semibold">{time}</p>
              </div>
            ))}
          </div>

          {/* Event Column */}
          <div className="space-y-4">
            {itinerary.map((item, index) => (
              <DraggableItem key={index} index={index} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </DndContext>
  );
}

// Function to generate time slots from 6 AM to 11:59 PM
const generateTimeSlots = (): string[] => {
  const times = [];
  const startHour = 6;
  const endHour = 11;
  const endMinutes = 59;

  // Add time slots for each hour
  for (let hour = startHour; hour <= endHour; hour++) {
    const formattedHour = hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
    times.push(formattedHour);
  }

  // Add the last time slot for 11:59 PM
  times.push('11:59 PM');

  return times;
};

// Function to convert duration (e.g., '2 hours') to pixels
const convertDurationToHeight = (duration: string): number => {
  const hours = parseFloat(duration); // Extract the number of hours
  const pixelsPerHour = 60; // Define how many pixels 1 hour corresponds to
  return hours * pixelsPerHour; // Return the height in pixels
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

  // Dynamically apply styles when dragging
  const draggingStyle = isDragging ? { transform: 'scale(1.05)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', opacity: 0.9 } : {};

  // Calculate dynamic height based on the item's duration
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
