import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CityTemperatureList from './CityTemperatureList';
import WeatherSummary from './WeatherSummary';
import Navbar from './Navbar';
import NotFound from './NotFound';
import AlertForm from './AlertForm';

const App = () => {
  return (
    <Router>
      <Navbar /> {/* Ensure the Navbar appears on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/city-temperatures" element={<CityTemperatureList />} />
        <Route path="/weather-summary" element={<WeatherSummary />} />
        <Route path="/alert" element={<AlertForm />} />
        <Route path="/*" element={<NotFound />} /> 
      </Routes>
    </Router>
  );
};

export default App;
