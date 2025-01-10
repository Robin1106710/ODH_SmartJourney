'use client'

import { useState } from 'react'
import { Badge } from "@/components/ui/badge"

const preferences = [
  'Museums', 'Parks', 'Restaurants', 'Shopping', 'Historical Sites',
  'Beaches', 'Nightlife', 'Family-friendly', 'Adventure', 'Relaxation'
]

export default function PreferenceSelector() {
  const [selected, setSelected] = useState<string[]>([])

  const togglePreference = (pref: string) => {
    setSelected(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
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
