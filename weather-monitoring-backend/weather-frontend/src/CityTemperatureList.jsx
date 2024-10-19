import React, { useEffect, useState } from 'react';
import backgroundImage from './assets/weather-background.jpg';

const CityTemperatureList = () => {
    const [cityTemperatures, setCityTemperatures] = useState([]);
    const [updateInterval, setUpdateInterval] = useState(5); // Default interval in seconds
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
    const API_KEY = process.env.API_KEY; // Add your OpenWeatherMap API key here

    // Function to fetch weather data for a city
    const fetchWeatherTemp = async (city) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
            if (response.ok) {
                const data = await response.json();
                return { city, temp: data.main.temp }; // Return city and temperature
            } else {
                throw new Error(`Error fetching weather for ${city}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(error);
            return { city, temp: 'N/A' }; // Handle errors by returning N/A for temperature
        }
    };

    // Function to fetch temperatures of all cities
    const fetchCityTemperatures = async () => {
        try {
            const weatherPromises = cities.map(city => fetchWeatherTemp(city)); // Fetch all cities concurrently
            const weatherData = await Promise.all(weatherPromises); // Wait for all promises to resolve
            setCityTemperatures(weatherData); // Set the fetched data to state
        } catch (error) {
            console.error('Error fetching city temperatures:', error);
        }
    };

    // Function to determine emoji based on temperature
    const getTemperatureEmoji = (temp) => {
        if (temp === 'N/A') return '❓'; // Default emoji if temperature is unavailable
        return temp >= 30 ? '🌡️' : '❄️'; // Hot emoji for temps >= 30°C, cold emoji otherwise
    };

    // useEffect to fetch data initially and then every selected seconds
    useEffect(() => {
        fetchCityTemperatures();  // Fetch initial data

        const interval = setInterval(fetchCityTemperatures, updateInterval * 1000); // Fetch every selected seconds
        return () => clearInterval(interval); // Clean up on component unmount
    }, [updateInterval]); // Add updateInterval as a dependency

    return (
        <div className="city-temperature-list relative min-h-screen flex items-center justify-center">
            {/* Background image */}
            <div className="bg-cover bg-no-repeat fixed top-0 left-0 w-full h-full z-[-1] opacity-70"
                style={{ 
                    backgroundImage: `url(${backgroundImage})`, 
                }}
            ></div>

            {/* Content container */}
            <div className="text-center p-4 backdrop-blur-sm bg-black bg-opacity-40 rounded-lg shadow-lg max-w-md">
                {/* Title */}
                <h2 className="text-3xl font-extrabold text-white mb-4 tracking-wide drop-shadow-md">
                    City Temperatures
                </h2>

                {/* Dropdown for update interval */}
                <div className="mb-6">
                    <label htmlFor="update-interval" className="text-white mr-2">Update Interval:</label>
                    <select
                        id="update-interval"
                        value={updateInterval}
                        onChange={(e) => setUpdateInterval(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg p-2 text-black"
                    >
                        <option value={5}>5 seconds</option>
                        <option value={10}>10 seconds</option>
                        <option value={20}>20 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                    </select>
                </div>

                {/* Temperature list */}
                <ul className="space-y-2">
                    {cityTemperatures.map(({ city, temp }) => (
                        <li key={city} className="text-md font-medium text-gray-100 bg-gray-800 bg-opacity-70 rounded-lg py-2 px-4 shadow-md flex justify-between items-center">
                            <span>{city}</span>
                            <span className="flex items-center space-x-2">
                                <span>{getTemperatureEmoji(temp)}</span>
                                <span>{temp} °C</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CityTemperatureList;
