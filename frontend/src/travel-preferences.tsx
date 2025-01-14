import { useState } from "react";

const preferences = [
  "Adventure",
  "Relaxation",
  "Culture",
  "Nature",
  "Food",
  "Nightlife",
];

const TravelPreferences: React.FC = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const togglePreference = (preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((item) => item !== preference)
        : [...prev, preference]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {preferences.map((preference) => (
        <button
          key={preference}
          onClick={() => togglePreference(preference)}
          className={`px-4 py-2 rounded-full text-white font-medium border transition-all duration-200 
          ${selectedPreferences.includes(preference)
            ? "bg-blue-500 border-blue-500"
            : "bg-gray-300 border-gray-300 hover:bg-blue-200"}`}
        >
          {preference}
        </button>
      ))}
    </div>
  );
};

export default TravelPreferences;
