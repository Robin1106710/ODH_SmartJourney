'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"

// Define the preferences available for selection
const preferences = [
  'historial', 'shopping', 'literature_art', 'family', 'educational', 'nature', 'entertainment', 'romantic', 'relaxation'
]

interface PreferenceSelectorProps {
  onPreferencesChange: (preferences: string[]) => void; // Callback to send selected preferences to parent
}

export default function PreferenceSelector({ onPreferencesChange }: PreferenceSelectorProps) {
  const [selected, setSelected] = useState<string[]>([])

  // Update parent whenever the preferences change
  useEffect(() => {
    onPreferencesChange(selected); // Send the selected preferences to the parent
  }, [selected, onPreferencesChange])

  const togglePreference = (pref: string) => {
    setSelected(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)  // Remove preference if it's already selected
        : [...prev, pref]               // Add preference if it's not selected
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-black text-2xl font-semibold text-center mb-4">Select Your Preferences</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {preferences.map(pref => (
          <Badge
            key={pref}
            variant={selected.includes(pref) ? "default" : "outline"}
            className="cursor-pointer text-lg px-6 py-2 rounded-full transition-all duration-300 ease-in-out hover:bg-blue-100"
            onClick={() => togglePreference(pref)}
          >
            {pref}
          </Badge>
        ))}
      </div>
    </div>
  )
}
