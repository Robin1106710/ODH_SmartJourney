import { useNavigate } from 'react-router-dom';
import PreferenceSelector from "./preference-selector"; // Assuming you have this component
import { Button } from "./ui/button"; // Assuming you have this button component

const Preferences = () => {
  const navigate = useNavigate();  // Initialize the navigate function

  // Function to handle button click and navigate to a new page
  const handleGenerateItinerary = () => {
    navigate("/itinerary");  // Redirect to the "/itinerary" route
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Title and Description */}
      <h1 className="text-4xl font-extrabold mb-6 text-center">Itinerary Generator</h1>
      <p className="text-xl mb-6 text-center max-w-2xl opacity-80">
        Select your preferences below to generate a personalized itinerary for your dream trip. Let's get started!
      </p>

      {/* PreferenceSelector Component */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-8 w-full max-w-lg">
        <PreferenceSelector />
      </div>

      {/* Generate Itinerary Button */}
      <Button
        onClick={handleGenerateItinerary}
        className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-md transition-all duration-300 hover:bg-blue-700 hover:scale-105"
      >
        Generate Itinerary
      </Button>
    </div>
  );
};

export default Preferences;
