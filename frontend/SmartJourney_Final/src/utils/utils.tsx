export const fetchGoogleDirections = async (origin: string, destination: string) => {
    try {
      // Call the backend endpoint instead of Google Directions API
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
  
      // Handle the response from your backend
      if (data.travel_time && data.transport_mode) {
        return {
          travel_time: data.travel_time,
          transport_mode: data.transport_mode,
        };
      } else {
        throw new Error('Error fetching directions from backend');
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      return { travel_time: 'Unknown', transport_mode: 'Unknown' };
    }
  };
  