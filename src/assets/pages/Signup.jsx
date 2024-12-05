import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import imageCompression from "browser-image-compression";
const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    image:'',
  });
const convertToBase64 = async (e) => {
  if (!e.target.files[0]) {
    console.error('No file selected');
    return null;
  }

  const file = e.target.files[0];
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true, // Optional: can improve performance
    initialQuality: 0.7 // Adjust compression quality
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // Additional file validation
    if (!compressedFile) {
      console.error('Compression failed');
      return null;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result);
          formData.image = reader.result;
        } else {
          reject(new Error('reader.result is null or undefined'));
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error during image compression:", error);
    throw error;
  }
};
  const handleChange = (e) => {
    console.log('changing');
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleImageUpload = async(e) => {
      
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData.image)
    const data = {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      image: formData.image,
    };
    try {
      const response = await fetch("http://localhost:9010/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
       // Assuming result contains a userId or token
       const { userId } = result;

       // Store the userId or token for future use
       localStorage.setItem('userId', userId);

       navigate(`/home/${userId}`);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <label className="block text-sm font-medium text-gray-700">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          className="mt-1 mb-4 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <label className="block text-sm font-medium text-gray-700">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className="mt-1 mb-4 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <label className="block text-sm font-medium text-gray-700">
          Password:
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className="mt-1 mb-4 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <label className="block text-sm font-medium text-gray-700">
          Upload Image:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={convertToBase64}
          className="mt-1 mb-6 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleSubmit}
          >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
