import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import backgroundImage from './assets/weather-background.jpg';
import 'react-toastify/dist/ReactToastify.css';

const AlertForm = () => {
    const [temperature, setTemperature] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');

    // Function to validate the city name
    const validateCity = async (cityName) => {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=403672c4901b864740a7450e9bf77334`);
            return response.data; // Return city data if valid
        } catch (error) {
            return null; // Return null if city is not valid
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate the city before creating an alert
        const cityData = await validateCity(city);
        if (!cityData) {
            toast.error('City does not exist'); // Show error toast if city is not valid
            return; // Exit the function if the city is not valid
        }

        const alertData = {
            temperature_threshold: temperature,
            email: email,
            city: city,
        };

        try {
            await axios.post('http://localhost:5000/api/alerts', alertData);
            toast.success('Alert created successfully!'); // Show success toast
            // Clear the form fields
            setTemperature('');
            setEmail('');
            setCity('');
        } catch (error) {
            console.error('Error creating alert:', error);
            if (error.response && error.response.status === 409) {
                // Handle the case where the alert already exists
                toast.error(error.response.data.error); // Show conflict error message
            } else {
                toast.error('Failed to create alert. Please try again.'); // Show general error toast
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-cover bg-no-repeat fixed top-0 left-0 w-full h-full z-[-1]"
                style={{ 
                    backgroundImage: `url(${backgroundImage})`, 
                }}
            ></div>
            <ToastContainer /> {/* Include ToastContainer for displaying toasts */}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-11/12 max-w-lg mx-auto mt-16">
                <h2 className="text-xl font-semibold mb-4">Create Weather Alert</h2>
                <div className="mb-4">
                    <label htmlFor="temperature" className="block text-gray-700 text-sm font-bold mb-2">Temperature Threshold (°C):</label>
                    <input
                        type="number"
                        id="temperature"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">City:</label>
                    <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button 
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Create Alert
                </button>
            </form>
        </div>
    );
};

export default AlertForm;
