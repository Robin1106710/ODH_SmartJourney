// Home.tsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-4xl font-bold mb-4">Welcome to Travel Planner</h2>
      <p className="text-lg mb-6 max-w-2xl">
        Plan your perfect trip by selecting your preferences and let us help you find the best destinations and activities!
      </p>
      <Link
        to="/preferences"
        className="bg-primary text-white px-6 py-2 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-all duration-200"
      >
        Start Planning
      </Link>
    </div>
  );
};

export default Home;
