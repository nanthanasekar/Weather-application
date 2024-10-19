// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/weather'; // Update if needed

export const fetchWeatherData = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        console.log("RESONSE" +response)
        return response;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

export const fetchWeatherOfCities = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/weather/cities');
        if (!response.ok) {
            throw new Error('Failed to fetch city weather data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather for cities:', error);
        throw error;
    }
};

export const fetchWeatherByCity = async (city) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/weather/${city}`);
        console.log(response)
        return response.data;
    } catch (error) {
        console.error(`Error fetching weather data for ${city}:`, error);
        throw error;
    }
};
