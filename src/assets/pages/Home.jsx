import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [userData, setUserData] = useState({ name: '', image: '' });
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:9010/api/auth/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

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

  const handleImageClick = () => {
    navigate('/calls');
  };

  return (
    <div className="h-screen w-screen">
      <div className="p-4 bg-blue-500 text-white flex items-center">
        <img 
          src={userData.image || 'default-avatar.png'} 
          alt="User Avatar" 
          className="w-12 h-12 rounded-full mr-4"
        />
        <h1 className="text-xl font-bold">Welcome, {userData.name}</h1>
      </div>
      <div className="grid grid-cols-4 grid-rows-2">
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
    </div>
  );
};

export default Home;