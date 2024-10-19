// index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});



const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


const createTableIfNotExists = async () => {
   
    const createDailyWeatherSummaryTable = `
        CREATE TABLE IF NOT EXISTS daily_weather_summary (
            id SERIAL PRIMARY KEY,
            city_name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            average_temp FLOAT NOT NULL,
            min_temp FLOAT NOT NULL,
            max_temp FLOAT NOT NULL,
            dominant_cloud_cover FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;

    const createAlertsTable = `
        CREATE TABLE IF NOT EXISTS alerts (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            temperature_threshold FLOAT NOT NULL
        );`;

    try {
        await pool.query(createDailyWeatherSummaryTable);
        console.log("Table 'daily_weather_summary' is ready.");

        // Create the alerts table if it doesn't exist
        await pool.query(createAlertsTable);
        console.log("Table 'alerts' is ready.");
    } catch (error) {
        console.error("Error creating tables:", error);
    }
};



// Function to fetch weather data
const fetchWeatherData = async (city) => {
    const apiKey = process.env.API_KEY; // Store your API key in the .env file
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }

        const data = await response.json(); // Parse the JSON data
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error; // Rethrow the error for handling in the calling function if needed
    }
};


const getCityCoordinates = async (city) => {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return { lat, lon };
        } else {
            throw new Error(`Coordinates not found for city: ${city}`);
        }
    } catch (error) {
        console.error(`Error fetching coordinates for city: ${city}`, error);
        return null;
    }
};
const fetchAggregatedWeather = async (lat, lon, month, day) => {
    // Construct the URL with the provided latitude, longitude, month, and day
    console.log("lat: " + lat + " long: " + lon);
    const url = `https://history.openweathermap.org/data/2.5/aggregated/day?lat=${lat}&lon=${lon}&month=${month}&day=${day}&appid=${process.env.API_KEY}`;
    console.log("URL: " + url);

    try {
        const response = await fetch(url);

        // Check if the response is okay (status code 200-299)
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }

        const data = await response.json(); // Parse the response as JSON

        // Check if data contains expected structure
        if (!data.daily || data.daily.length === 0) {
            throw new Error('No daily weather data found');
        }

        // Extract relevant aggregated weather data
        const averageTemp = data.daily[0].temp.day; // Daily average temperature
        const minTemp = data.daily[0].temp.min; // Daily minimum temperature
        const maxTemp = data.daily[0].temp.max; // Daily maximum temperature
        const dominantCloudCover = data.daily[0].clouds; // Daily dominant cloud cover percentage

        const aggregatedData = {
            average_temp: averageTemp,
            min_temp: minTemp,
            max_temp: maxTemp,
            dominant_cloud_cover: dominantCloudCover,
        };

        return aggregatedData;
    } catch (error) {
        console.error(`Error fetching aggregated weather data:`, error);
        return null;
    }
};


const fetchAggregatedWeatherByCity = async (city, month, day) => {
    try {
        // First, get latitude and longitude for the city
        const coordinates = await getCityCoordinates(city);

        if (!coordinates) {
            console.error(`Could not fetch coordinates for city: ${city}`);
            return null;
        }

        const { lat, lon } = coordinates;

        // Then, fetch the aggregated weather data using lat, lon
        const weatherData = await fetchAggregatedWeather(lat, lon, month, day);
        return weatherData;
    } catch (error) {
        console.error(`Error fetching aggregated weather for city: ${city}`, error);
        return null;
    }
};


const fetchAndStoreWeatherForAllCities = async () => {
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

    const today = new Date();
    const month = today.getMonth() + 1; // Current month (1-12)
    const day = today.getDate(); // Current day (1-31)

    for (const city of cities) {
        const weatherData = await fetchAggregatedWeatherByCity(city, month, day);

        if (weatherData) {
            // Store in DB
            await storeDailyWeatherSummary(city, weatherData);
        }
    }
};

// Schedule this to run every day at midnight
 // 24 hours


const storeDailyWeatherSummary = async (city, data) => {
    const { temp, pressure, humidity, wind, precipitation, clouds } = data;

    const query = `
        INSERT INTO daily_weather_summary
        (city_name, date, average_temp, min_temp, max_temp, mean_pressure, mean_humidity, mean_wind_speed, mean_precipitation, dominant_cloud_cover)
        VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values = [
        city,
        temp.mean,
        temp.record_min,
        temp.record_max,
        pressure.mean,
        humidity.mean,
        wind.mean,
        precipitation.mean,
        clouds.mean
    ];

    try {
        await pool.query(query, values);
        console.log(`Stored daily summary for ${city}`);
    } catch (error) {
        console.error(`Error storing daily summary for ${city}:`, error);
    }
};




// Function to check alert thresholds and send alerts if needed
const checkAlerts = async (city, currentTemp) => {
    // Example alert condition: If the temperature exceeds 35 degrees Celsius
    const thresholdTemp = 35; // This can be made user-configurable
    const thresholdConsecutiveUpdates = 2; // Number of consecutive updates for alert

    // Retrieve previous weather records for the city
    const result = await pool.query(
        'SELECT * FROM daily_weather_summary WHERE city = $1 ORDER BY date DESC LIMIT $1',
        [city, thresholdConsecutiveUpdates]
    );

    // Check if current temperature exceeds the threshold
    const exceedsThreshold = result.rows.every(row => row.max_temp > thresholdTemp);
    if (exceedsThreshold) {
        console.log(`ALERT: Temperature for ${city} has exceeded ${thresholdTemp} degrees Celsius for the last ${thresholdConsecutiveUpdates} updates.`);
        // Here you can trigger additional alert logic (e.g., send an email or notification)
    }
};


// Process weather data
const processWeatherData = async () => {
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
    for (let city of cities) {
        const data = await fetchWeatherData(city);
        const date = new Date().toISOString().split('T')[0];
        
        // Aggregate data
        const summary = {
            city,
            date,
            avg_temp: data.main.temp, // Currently set to the latest temp; aggregate logic will be added later
            max_temp: data.main.temp,
            min_temp: data.main.temp,
            dominant_condition: data.weather[0].main
        };

        // Store the daily summary in the database
        await storeDailySummary(summary);

        // Check for alert conditions
        await checkAlerts(city, data.main.temp);
    }
};

app.post('/api/alerts', async (req, res) => {
    const { temperature_threshold, email, city } = req.body;

    try {
        // Check if an alert already exists for the given email and city
        const existingAlert = await pool.query(
            'SELECT * FROM alerts WHERE email = $1 AND city = $2 AND temperature_threshold = $3',
            [email, city,temperature_threshold]
        );

        if (existingAlert.rows.length > 0) {
            return res.status(409).json({ error: 'Alert already exists for this city and email' });
        }

        // If no existing alert, create a new one
        const result = await pool.query(
            'INSERT INTO alerts (email, city, temperature_threshold) VALUES ($1, $2, $3) RETURNING *',
            [email, city, temperature_threshold]
        );

        res.status(201).json(result.rows[0]); // Send back the created alert
    } catch (error) {
        console.error('Error inserting alert:', error);
        res.status(500).json({ error: 'Failed to create alert' });
    }
});


const checkWeatherAgainstStoredAlerts = async () => {
    try {
        // Fetch all alerts from the database
        const alertResult = await pool.query('SELECT * FROM alerts');
        const alerts = alertResult.rows;

        // Loop through each alert
        for (const alert of alerts) {
            // Fetch current weather data for the city in the alert
            const weatherData = await fetchWeatherData(alert.city);
            const currentTemperature = weatherData.main.temp;

            // Check if the current temperature exceeds the threshold
            if (currentTemperature > alert.temperature_threshold) {
                console.log(`Alert: Temperature in ${alert.city} has exceeded ${alert.temperature_threshold}°C! Sending email to ${alert.email}`);

                // Send email notification
                const mailOptions = {
                    from: process.env.SMTP_USER, // sender address
                    to: alert.email, // email from the alert entry
                    subject: `Weather Alert for ${alert.city}`, // Subject line
                    text: `Alert: The temperature in ${alert.city} has exceeded ${alert.temperature_threshold}°C! Current temperature: ${currentTemperature}°C.`, // plain text body
                };

                // Send the email
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${alert.email}`);
            }
        }
    } catch (error) {
        console.error('Error checking alerts:', error);
    }
};





app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;

    try {
        const data = await fetchWeatherData(city);
        const weatherInfo = {
            main: data.weather[0].main, // Main weather condition
            temp: data.main.temp,       // Current temperature in Centigrade
            feels_like: data.main.feels_like, // Perceived temperature in Centigrade
            dt: data.dt                 // Time of the data update (Unix timestamp)
        };
        res.json(weatherInfo);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// API Endpoint to get daily weather summary for a specific city
app.get('/api/weather_summary/:city', async (req, res) => {
    const city = req.params.city;
    const date = new Date().toISOString().split('T')[0];

    try {
        const result = await pool.query('SELECT * FROM daily_weather WHERE city = $1 AND date = $2', [city, date]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'No data found for the specified city and date.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving weather data.' });
    }
});


// API Endpoint to get all daily weather summaries
app.get('/api/weather', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM daily_weather_summary ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving weather data.' });
    }
});

// API Endpoint to delete a specific daily weather record
app.delete('/api/weather/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query('DELETE FROM daily_weather_summary WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount > 0) {
            res.json({ message: 'Weather record deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Weather record not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting weather data.' });
    }
});

// Initialize the database and start processing weather data
const init = async () => {
    await createTableIfNotExists();
    
    // Fetch and store weather data for all cities initially
    await fetchAndStoreWeatherForAllCities();
    
    // Call fetchAndStoreWeatherForAllCities every 24 hours
    setInterval(() => {
        fetchAndStoreWeatherForAllCities().catch(error => {
            console.error('Error fetching and storing weather data:', error);
        });
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    // Check weather against stored alerts every 5 minutes
    setInterval(() => {
        checkWeatherAgainstStoredAlerts().catch(error => {
            console.error('Error checking weather against stored alerts:', error);
        });
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
};

// Start the server and initialize the database
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    init(); // Call the init function to create the table and start processing
});
