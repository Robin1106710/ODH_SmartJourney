export const fetchGoogleDirections = async (origin: string, destination: string) => {
  try {
    // Call the backend endpoint instead of directly calling Google Directions API
    const response = await fetch('http://localhost:5000/get-directions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin,
        destination,
      }),
    });

    const data = await response.json();

    // Handle the response from the backend
    if (data.travel_time && data.transport_mode) {
      return {
        travel_time: data.travel_time,
        transport_mode: data.transport_mode,
        distance: data.distance,  // Added distance
        start_address: data.start_address,  // Added start address
        end_address: data.end_address,  // Added end address
        steps: data.steps,  // Added steps with instructions
      };
    } else {
      throw new Error('Error fetching directions from backend');
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
    return { 
      travel_time: 'Unknown',
      transport_mode: 'Unknown',
      distance: 'Unknown',
      start_address: 'Unknown',
      end_address: 'Unknown',
      steps: [] 
    };  // Return default values for failure
  }
};

  