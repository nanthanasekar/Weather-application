import React from 'react';
import { Link } from 'react-router-dom'; // Import Link to create links for routes

const Navbar = () => {
    return (
        <nav className="bg-white w-full py-4 shadow-md fixed top-0 left-0 z-50">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo or App Name as a Link with similar button styling */}
                <Link 
                    to="/" 
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-600"
                >
                    Home
                </Link>

                <ul className="flex space-x-6">
                    <li>
                        <Link 
                            to="/weather-summary" 
                            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-600"
                        >
                            Weather Summary
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/alert" 
                            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-600"
                        >
                            Create alert
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/city-temperatures" 
                            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-600"
                        >
                            City Temperature List
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
