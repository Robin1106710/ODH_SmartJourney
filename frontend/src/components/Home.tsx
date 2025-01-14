// src/components/Home.tsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      {/* Welcome Section */}
      <h1 className="text-5xl font-extrabold mb-6 text-center tracking-tight md:text-6xl">
        Welcome to Travel Planner
      </h1>
      <p className="text-lg max-w-3xl text-center mb-8 opacity-90 md:text-xl">
        Plan your perfect trip by selecting your preferences, and we’ll help you find the best destinations and activities.
      </p>

      {/* Call to Action Button */}
      <Link
        to="/preferences"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xl font-medium shadow-xl transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Start Planning
      </Link>

    </div>
  );
};

export default Home;
