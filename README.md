Weather Monitoring System


![image](https://github.com/user-attachments/assets/88c944f8-ba86-4b29-aab1-5041de26345f)


![image](https://github.com/user-attachments/assets/5572fb99-74aa-4c25-8da5-aea626d541b3)


![image](https://github.com/user-attachments/assets/9ac20a1d-f91a-444d-a20d-8d924f885fd2)

Email alerts 

<img width="609" alt="image" src="https://github.com/user-attachments/assets/aca91b73-5e60-4d69-b474-88f1057922c6">




A React-based web application that displays real-time weather information for different cities, alerts when temperatures exceed certain thresholds, and allows users to search for weather data by city. The application uses the OpenWeather API for weather data and features toast notifications for invalid city searches and API errors.

Features
Real-time Weather Data: Automatically fetches weather data for multiple cities every 5 minutes.
City Search: Allows users to input a city name to retrieve its current weather.
Temperature Alerts: Displays alerts when the temperature in any city exceeds 35°C.
Toast Notifications: Provides user feedback via toast notifications for invalid city searches or failed API requests.
Responsive Design: The app is styled using Tailwind CSS and adjusts to different screen sizes.
Technologies Used
Frontend: React
Styling: Tailwind CSS
API Requests: Axios
Weather Data: OpenWeather API
Toast Notifications: React Toastify
Prerequisites
Before you can run this project, ensure you have the following installed:

Node.js (v14+)
npm (comes with Node.js)



Project setup : 

First setup the DB locally using Docker or using pgadmin application 
i] using docker 
docker run --name postgres-admin-db -e POSTGRES_DB=admin -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -p 5432:5432 -d postgres


 cd .\weather-monitoring-backend\
 npm i express axios cors pg nodemailer 
 node .\server.js ## This will start the backend 

 cd .\weather-frontend\
 npm i
 npm run dev ##This will start the frontend 
