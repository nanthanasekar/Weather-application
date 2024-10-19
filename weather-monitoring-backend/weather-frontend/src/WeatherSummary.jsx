import React, { useEffect, useState } from 'react'; // Ensure useEffect and useState are imported
import { fetchWeatherData } from './api';
import Navbar from './Navbar'; // Import Navbar if not already imported
import backgroundImage from './assets/weather-background.jpg';

const WeatherSummary = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchWeatherData();
                console.log(data); // Check what data you're getting
                if (Array.isArray(data) && data.length > 0) {
                    setWeatherData(data); // Set data if it's an array and has items
                } else {
                    setWeatherData([]); // Clear the weatherData if the response is empty
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
                setError('Failed to fetch weather data.'); // Set error state
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000); // Optional: refresh every 5 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="weather-summary">
            <div className="bg-cover bg-no-repeat fixed top-0 left-0 w-full h-full z-[-1]"
                style={{ 
                    backgroundImage: `url(${backgroundImage})`, 
                }}
            ></div>
            <Navbar />
            <h2 className="text-4xl font-bold text-white mb-4 mt-20"> {/* Updated styles for header */}
                Daily Weather Summary
            </h2>
            {error && <p className="text-red-500">{error}</p>} {/* Display error message if any */}
            {weatherData.length > 0 ? (
                <ul className="list-disc pl-5">
                    {weatherData.map((summary) => (
                        <li key={summary.id} className="mb-3">
                            <strong>City:</strong> {summary.city} <br />
                            <strong>Date:</strong> {summary.date} <br />
                            <strong>Average Temp:</strong> {summary.avg_temp} °C <br />
                            <strong>Max Temp:</strong> {summary.max_temp} °C <br />
                            <strong>Min Temp:</strong> {summary.min_temp} °C <br />
                            <strong>Dominant Condition:</strong> {summary.dominant_condition}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">🌧️ Weather Summary Data Not Available! 🌤️</strong>
                    <span className="block sm:inline"> Please wait for at least 24 hours to get some data. ⏳</span>
                    <svg className="absolute top-0 bottom-0 right-0 w-6 h-6 text-blue-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4h4v1h-4zm0 2h4v1h-4zm0 2h4v1h-4zm0 2h4v1h-4zm0 2h4v1h-4zm0 2h4v1h-4zm-3.5 2.5h11l-1.5 1.5H8l-1.5-1.5z"></path></svg>
                </div>
            )}
        </div>
    );
};

export default WeatherSummary;
