import React, { useEffect, useState } from 'react';
import { fetchWeatherData, fetchWeatherByCity } from './api';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import backgroundImage from './assets/weather-background.jpg';
import Navbar from './Navbar';

const App1 = () => {
    const [city, setCity] = useState('');
    const [cityWeather, setCityWeather] = useState(null);
    const [showWeather, setShowWeather] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchWeatherData();
                setWeatherData(data);
                const alertMessages = data
                    .filter(summary => summary.max_temp > 35)
                    .map(summary => `Alert: Temperature in ${summary.city} exceeded 35°C!`);
                setAlerts(alertMessages);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCityChange = (e) => {
        setCity(e.target.value);
    };

    const validateCity = async (cityName) => {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=403672c4901b864740a7450e9bf77334`);
            return response.data; // Return city data if valid
        } catch (error) {
            return null; // Return null if city is not valid
        }
    };

    const handleFetchCityWeather = async () => {
        const validCity = await validateCity(city);
        if (!validCity) {
            toast.error('Invalid city name. Please enter a valid city.'); // Show toast for invalid city
            setCityWeather(null); // Reset city weather if the city is invalid
            return;
        }

        try {
            const data = await fetchWeatherByCity(city);
            if (data) {
                setCityWeather({
                    main: data.main,
                    temp: data.temp,
                    feels_like: data.feels_like,
                    dt: data.dt,
                });
                setShowWeather(true); // Trigger animation when data is set
            } else {
                throw new Error('No data returned from API');
            }
        } catch (error) {
            console.error('Error fetching city weather data:', error);
            setCityWeather(null);
            toast.error('Failed to fetch weather data.'); // Show toast for fetch failure
        }
    };

    return (
        <div className="app">
            <div className="bg-cover bg-no-repeat fixed top-0 left-0 w-full h-full z-[-1]"
                style={{ 
                    backgroundImage: `url(${backgroundImage})`, 
                }}
            ></div>

            <Navbar />

            {/* Main content */}
            <div className="flex flex-col items-center justify-start h-full text-white relative z-0 mt-20 px-4">
                <h1 className="text-4xl font-bold mb-6">Weather Monitoring System</h1>

                {/* City input section */}
                <div className="flex mb-4">
                    <input
                        type="text"
                        value={city}
                        onChange={handleCityChange}
                        placeholder="Enter city name"
                        className="border border-gray-300 rounded-lg py-2 px-4 mr-2 text-black"
                    />
                    <button onClick={handleFetchCityWeather} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Get Weather
                    </button>
                </div>

                {/* City weather display */}
                {cityWeather && showWeather && (
                    <div className={`bg-white text-black rounded-lg p-4 mb-6 shadow-md max-w-md w-full transition-all duration-700 transform ${showWeather ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                        <h2 className="text-2xl font-semibold mb-4">Current Weather in {city}</h2>
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-500 text-white">
                                    <th className="border px-4 py-2">Condition</th>
                                    <th className="border px-4 py-2">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="border px-4 py-2 font-medium">Main Condition</td>
                                    <td className="border px-4 py-2">{cityWeather.main}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="border px-4 py-2 font-medium">Temperature</td>
                                    <td className="border px-4 py-2">{cityWeather.temp} °C</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="border px-4 py-2 font-medium">Feels Like</td>
                                    <td className="border px-4 py-2">{cityWeather.feels_like} °C</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="border px-4 py-2 font-medium">Last Updated</td>
                                    <td className="border px-4 py-2">{new Date(cityWeather.dt * 1000).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <ToastContainer /> 
        </div>
    );
};

export default App1;
