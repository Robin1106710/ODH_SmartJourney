import React, { useState, useEffect } from 'react';
import { ItineraryItem } from '@/type';
import image1 from '../assets/attraction_images/1.jpg';
import image2 from '../assets/attraction_images/2.jpg';
import image3 from '../assets/attraction_images/3.jpg';
import image4 from '../assets/attraction_images/4.jpg';
import image5 from '../assets/attraction_images/5.jpg';
import image6 from '../assets/attraction_images/6.jpg';
import image7 from '../assets/attraction_images/7.jpg';
import image8 from '../assets/attraction_images/8.jpg';
import image9 from '../assets/attraction_images/9.jpg';
import image10 from '../assets/attraction_images/10.jpg';
import image11 from '../assets/attraction_images/11.jpg';
import image12 from '../assets/attraction_images/12.jpg';
import image13 from '../assets/attraction_images/13.jpg';
import image14 from '../assets/attraction_images/14.jpg';
import image15 from '../assets/attraction_images/15.jpg';
import image16 from '../assets/attraction_images/16.jpg';
import image17 from '../assets/attraction_images/17.jpg';
import image18 from '../assets/attraction_images/18.jpg';
import image19 from '../assets/attraction_images/19.jpg';
import image20 from '../assets/attraction_images/20.jpg';
import image21 from '../assets/attraction_images/21.jpg';
import image22 from '../assets/attraction_images/22.jpg';
import image23 from '../assets/attraction_images/23.jpg';
import image24 from '../assets/attraction_images/24.jpg';
import image25 from '../assets/attraction_images/25.jpg';
import image26 from '../assets/attraction_images/26.jpg';
import image27 from '../assets/attraction_images/27.jpg';
import image28 from '../assets/attraction_images/28.jpg';
import image29 from '../assets/attraction_images/29.jpg';
import image30 from '../assets/attraction_images/30.jpg';
import image31 from '../assets/attraction_images/31.jpg';
import image32 from '../assets/attraction_images/32.jpg';
import image33 from '../assets/attraction_images/33.jpg';
import image34 from '../assets/attraction_images/34.jpg';
import image35 from '../assets/attraction_images/35.jpg';
import image36 from '../assets/attraction_images/36.jpg';
import image37 from '../assets/attraction_images/37.jpg';
import image38 from '../assets/attraction_images/38.jpg';
import image39 from '../assets/attraction_images/39.jpg';
import image40 from '../assets/attraction_images/40.jpg';
import image41 from '../assets/attraction_images/41.jpg';
import image42 from '../assets/attraction_images/42.jpg';
import image43 from '../assets/attraction_images/43.jpg';
import image44 from '../assets/attraction_images/44.jpg';
import image45 from '../assets/attraction_images/45.jpg';
import image46 from '../assets/attraction_images/46.jpg';
import image47 from '../assets/attraction_images/47.jpg';
import image48 from '../assets/attraction_images/48.jpg';
import image49 from '../assets/attraction_images/49.jpg';
import image50 from '../assets/attraction_images/50.jpg';
import image51 from '../assets/attraction_images/51.jpg';
import image52 from '../assets/attraction_images/52.jpg';
import image53 from '../assets/attraction_images/53.jpg';
import image54 from '../assets/attraction_images/54.jpg';
import image55 from '../assets/attraction_images/55.jpg';
import image56 from '../assets/attraction_images/56.jpg';

interface EventDetailModalProps {
  isOpen: boolean;
  event: ItineraryItem | null;  // Allow event to be either ItineraryItem or null
  onClose: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ isOpen, event, onClose }) => {
  const [locationDetails, setLocationDetails] = useState<any>(null);  // Store fetched location details
  const [loading, setLoading] = useState<boolean>(false);  // Track loading state
  const [error, setError] = useState<string | null>(null);  // Track errors

  // Image imports mapping
  const imageMap: { [key: number]: string } = {
    1: image1,
    2: image2,
    3: image3,
    4: image4,
    5: image5,
    6: image6,
    7: image7,
    8: image8,
    9: image9,
    10: image10,
    11: image11,
    12: image12,
    13: image13,
    14: image14,
    15: image15,
    16: image16,
    17: image17,
    18: image18,
    19: image19,
    20: image20,
    21: image21,
    22: image22,
    23: image23,
    24: image24,
    25: image25,
    26: image26,
    27: image27,
    28: image28,
    29: image29,
    30: image30,
    31: image31,
    32: image32,
    33: image33,
    34: image34,
    35: image35,
    36: image36,
    37: image37,
    38: image38,
    39: image39,
    40: image40,
    41: image41,
    42: image42,
    43: image43,
    44: image44,
    45: image45,
    46: image46,
    47: image47,
    48: image48,
    49: image49,
    50: image50,
    51: image51,
    52: image52,
    53: image53,
    54: image54,
    55: image55,
    56: image56,
  };

  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Dynamically set the image based on the event ID
  useEffect(() => {
    if (event && event.id) {
      setImageSrc(imageMap[event.id] || null);  // Use the mapping to select the image
    }
  }, [event]);

  // Fetch location details when modal opens
  useEffect(() => {
    const fetchLocationDetails = async (locationId: number) => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/location-details/${locationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch location details');
        }

        const data = await response.json();
        setLocationDetails(data);
      } catch (err) {
        setError('Error fetching location details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Trigger fetch when modal is opened and event is set
    if (isOpen && event) {
      fetchLocationDetails(event.id); // Assuming 'from' has an 'id' field
    } else {
      setLocationDetails(null);  // Clear the location details when modal is closed
    }
  }, [isOpen, event]);

  if (!isOpen) return null;
  if (!event) return null; // If event is null, don't render the modal

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
          <h3 className="font-semibold text-xl mb-4">Event Details</h3>
          <p><strong>From:</strong> {event.from.name}</p>
          <p><strong>To:</strong> {event.to.name}</p>
          <p><strong>Time at location:</strong> {event.time_at_location}</p>
          <p><strong>Transport Mode:</strong> {event.transport_mode}</p>
          <p><strong>Travel Time:</strong> {event.travel_time}</p>

          {/* Display location details if available */}
          {loading && <p>Loading details...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {locationDetails && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Location Information</h4>
              <p>{locationDetails.Description}</p>

              {/* Display location image */}
              {imageSrc ? (
                <img src={imageMap[event.id]} alt={`Location Image for ${event.from.name}`} />

              ) : (
                <p>No image available</p>
              )}
              <p><strong>Opening Hours:</strong> {locationDetails['Opening Hour']}</p>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">Close</button>
          </div>
        </div>
      </div>
    );
  };

  export default EventDetailModal;
