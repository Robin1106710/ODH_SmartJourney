// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Preferences from './components/Preferences';
import ItineraryPage from './itinerary/ItineraryPage';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Top Bar */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo / Company Name */}
          <div className="text-3xl font-semibold text-blue-600">
            Travel Planner
          </div>
          {/* Navigation Links */}
          <ul className="flex space-x-8 text-lg font-medium">
            <li>
              <Link
                to="/"
                className="px-4 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-200 transition duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/preferences"
                className="px-4 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-200 transition duration-300"
              >
                Preferences
              </Link>
            </li>
            <li>
              <Link
                to="/itinerary"
                className="px-4 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-200 transition duration-300"
              >
                Itinerary
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="min-h-screen px-8 py-8 bg-gradient-to-r from-[#e3dbfc] to-[#cfe2f3]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
