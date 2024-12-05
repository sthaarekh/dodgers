import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const images = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
  ];

  const navigate = useNavigate();

  const handleImageClick = () => {
    navigate('/calls');
  };

  return (
    <div className="h-screen w-screen grid grid-cols-4 grid-rows-2 ">
      {images.map((image, index) => (
        <div
          className="flex justify-center items-center bg-gray-200 hover:bg-gray-700 transition duration-300 cursor-pointer"
          key={index}
          onClick={handleImageClick}
        >
          <div className="w-48 h-48 rounded-full overflow-hidden">
            <img
              src={image}
              alt={`placeholder ${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
