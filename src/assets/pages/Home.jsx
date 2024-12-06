import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [userData, setUserData] = useState({ name: '', image: '' });
  const { userId } = useParams();
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://192.168.1.7:9010/api/auth/${userId}`);
        setUserData(response.data);
        const { data } = await axios.get(`http://192.168.1.7:9010/api/auth/users/${userId}/contacts`);
        if (data.contacts) {
          setContacts(data.contacts);
        }
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
  const jsonData = {
    roomId: '12345',
    userName: 'John Doe',
  };

  // Open the new URL in a popup window
  const callWindow = window.open(
    'https://192.168.1.7:3000',  // Update the URL here
    'VideoCall',
    'width=1200,height=800,resizable=yes,scrollbars=yes'
  );

  if (callWindow) {
    callWindow.focus();

    // Send the JSON data to the popup window after it loads
    callWindow.onload = () => {
      callWindow.postMessage(jsonData, 'https://192.168.1.7:3000'); // Match the origin here
    };
  } else {
    alert('Popup blocked! Please allow popups for this site.');
  }
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
      <div className="grid grid-cols-4 grid-rows-2 gap-4 p-4">
        {contacts.map((contact, index) => (
          <div
            className="flex justify-center items-center hover:bg-gray-400 rounded-lg transition duration-300 cursor-pointer"
            key={index}
            onClick={() => handleImageClick(contact)}
          >
            <div className="w-48 h-48 rounded-full overflow-hidden">
              <img
                src={contact.image || 'default-avatar.png'}
                alt={contact.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* <div className="text-center mt-2">
              <p className="font-semibold">{contact.name}</p>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;