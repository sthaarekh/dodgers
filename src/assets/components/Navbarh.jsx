import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="bg-blue-500 p-2">
      <div className="flex justify-between items-center container">
        <Link to="/">
        <button className="text-3xl text-white font-bold">DODGERS</button>
        </Link>
        <Link
          to="/add"
          className="text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          Profile
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
