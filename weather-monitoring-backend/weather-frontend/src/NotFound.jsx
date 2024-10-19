import React from 'react';
import backgroundImage from './assets/weather-background.jpg';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white text-center relative">
      <div
        className="bg-cover bg-no-repeat fixed top-0 left-0 w-full h-full z-[-1]"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      ></div>
      <h1 className="text-6xl font-bold mb-4 animate-bounce">404</h1>
      <p className="text-2xl mb-6">Oops! Page not found.</p>
      <p className="mb-8">It looks like you've hit a dead end...</p>
      {/* Uncomment the image if you want to display it */}
      {/* <img
        src="https://media.giphy.com/media/xT0xeuOyqgYis3bWcA/giphy.gif" // Fun GIF or image
        alt="Lost in space"
        className="w-1/2 rounded-lg shadow-lg"
      /> */}
      <p className="mt-6 text-lg">Maybe try going back to the homepage?</p>
      <a
        href="/"
        className="mt-4 inline-block px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 transition duration-300"
      >
        Go Home
      </a>
    </div>
  );
};

export default NotFound;
