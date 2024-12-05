import React from 'react';
import { Link } from 'react-router';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
      <h1 className="text-6xl md:text-8xl font-bold tracking-wide mb-6">DODGERS</h1>
      <p className="text-center text-lg md:text-2xl max-w-2xl mb-10">
        Welcome to <span className="font-semibold">DODGERS</span>, a project dedicated to innovation and collaboration. 
        Explore exciting possibilities, connect with the team, and bring your ideas to life. 
        Join us on this journey of creativity and excellence!
      </p>

      <div className="flex space-x-6">
        <Link to="signup">
        <button className="py-3 px-6 bg-white text-blue-500 font-medium rounded-full hover:bg-blue-100 transition duration-300">
          Signup
        </button>
        </Link>
        <Link to="login">
        <button className="py-3 px-6 bg-white text-purple-500 font-medium rounded-full hover:bg-purple-100 transition duration-300">
          Login
        </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
