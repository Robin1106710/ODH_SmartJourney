export interface Location {
    name: string;
    latitude: number;
    longitude: number;
}

export interface ItineraryItem {
    id: number;
    from: Location;
    to: Location;
    time_at_location: string;
    transport_mode: string; // Transport mode, e.g., 'Car', 'Walking'
    travel_time: string; // Travel time, e.g., '30 mins'
}

export interface DayItinerary {
    itinerary: ItineraryItem[];
}
