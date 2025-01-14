import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferenceSelector from './preference-selector';
import { Button } from './ui/button';

const Preferences = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<string>('medium'); // State for intensity of schedules
  const [step, setStep] = useState(1); // Track the current step (1: preferences, 2: intensity)

  // Function to handle button click and generate the itinerary
  const handleGenerateItinerary = async () => {
    try {
      let timeLimit = 480; // Default to 8 hours for medium intensity
  
      // Set the time limit based on the selected intensity
      if (intensity === 'low') {
        timeLimit = 360;  // 5 hours for low intensity
      } else if (intensity === 'high') {
        timeLimit = 720;  // 12 hours for high intensity
      }
  
      const response = await fetch('http://localhost:5000/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          historial: preferences.includes('historial'),
          shopping: preferences.includes('shopping'),
          literature_art: preferences.includes('literature art'),
          family: preferences.includes('family'),
          educational: preferences.includes('educational'),
          nature: preferences.includes('nature'),
          entertainment: preferences.includes('entertainment'),
          romantic: preferences.includes('romantic'),
          relaxation: preferences.includes('relaxation'),
          start_point_ID: 1,
          time_limit: timeLimit, // Use the dynamically set time limit
        }),
      });
  
      const data = await response.json();
  
      if (data.itinerary) {
        console.log('Generated Itinerary:', data.itinerary);
        localStorage.setItem("itinerary", JSON.stringify(data.itinerary));
        navigate('/itinerary', { state: { itinerary: data.itinerary } });
      } else {
        console.error('Error:', data.error);
        alert(data.error); // Show the error if no itinerary is returned
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
    }
  };  

  // Handle the change in selected preferences
  const handlePreferencesChange = (selectedPreferences: string[]) => {
    setPreferences(selectedPreferences);
  };

  // Handle the change in intensity level
  const handleIntensityChange = (selectedIntensity: string) => {
    setIntensity(selectedIntensity);
  };

  // Show the second step (intensity level) after preferences are selected
  const handleNextStep = () => {
    setStep(2);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Title and Description */}
      <h1 className="text-4xl font-extrabold mb-6 text-center">Itinerary Generator</h1>
      <p className="text-xl mb-6 text-center max-w-2xl opacity-80">
        Select your preferences below to generate a personalized itinerary for your dream trip. Let's get started!
      </p>

      {/* Step 1: PreferenceSelector Component */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 w-full max-w-lg">
          <PreferenceSelector onPreferencesChange={handlePreferencesChange} />
        </div>
      )}

      {/* Step 2: Intensity Selector */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 w-full max-w-lg">
          <h3 className="text-xl font-semibold mb-4">How intense would you like your schedule to be?</h3>
          <div className="flex justify-around mb-6">
            <Button
              onClick={() => handleIntensityChange('low')}
              className={`px-4 py-2 ${intensity === 'low' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              Low
            </Button>
            <Button
              onClick={() => handleIntensityChange('medium')}
              className={`px-4 py-2 ${intensity === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              Medium
            </Button>
            <Button
              onClick={() => handleIntensityChange('high')}
              className={`px-4 py-2 ${intensity === 'high' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              High
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between m-4">
        {step === 1 && (
          <Button
            onClick={handleNextStep}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 transition-all duration-300"
          >
            Next Step
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={handleGenerateItinerary}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 hover:scale-105"
          >
            Generate Itinerary
          </Button>
        )}
      </div>
    </div>
  );
};

export default Preferences;
