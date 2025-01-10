import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PreferenceSelector from './preference-selector'
import { Button } from './ui/button'

const Preferences = () => {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState<string[]>([])

  // Function to handle button click and generate the itinerary
  const handleGenerateItinerary = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          historial: preferences.includes('historial'),
          shopping: preferences.includes('shopping'),
          literature_art: preferences.includes('literature_art'),
          family: preferences.includes('family'),
          educational: preferences.includes('educational'),
          start_point_ID: 1,
          time_limit: 480,
        }),
      })
  
      const data = await response.json()
  
      if (data.itinerary) {
        // Log the itinerary to check if it's returned correctly
        console.log('Generated Itinerary:', data.itinerary)
  
        // If the itinerary is valid, navigate to the itinerary page with the data
        navigate('/itinerary', { state: { itinerary: data.itinerary } })
      } else {
        console.error('Error:', data.error)
        alert(data.error) // Show the error if no itinerary is returned
      }
    } catch (error) {
      console.error('Error generating itinerary:', error)
    }
  }
  

  // Handle the change in selected preferences
  const handlePreferencesChange = (selectedPreferences: string[]) => {
    setPreferences(selectedPreferences)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Title and Description */}
      <h1 className="text-4xl font-extrabold mb-6 text-center">Itinerary Generator</h1>
      <p className="text-xl mb-6 text-center max-w-2xl opacity-80">
        Select your preferences below to generate a personalized itinerary for your dream trip. Let's get started!
      </p>

      {/* PreferenceSelector Component */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-8 w-full max-w-lg">
        <PreferenceSelector onPreferencesChange={handlePreferencesChange} />
      </div>

      {/* Generate Itinerary Button */}
      <Button
        onClick={handleGenerateItinerary}
        className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-md transition-all duration-300 hover:bg-blue-700 hover:scale-105"
      >
        Generate Itinerary
      </Button>
    </div>
  )
}

export default Preferences
