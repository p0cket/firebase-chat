import { useState, useEffect } from 'react';
import { SignUp } from './SignUp';
import { SignIn } from './SignIn';

export const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  // Check system preference on mount
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleRegistration = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-end mb-4">
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        {isRegistering ? (
          <SignUp darkMode={darkMode} onSwitch={toggleRegistration} />
        ) : (
          <SignIn darkMode={darkMode} onSwitch={toggleRegistration} />
        )}
      </div>
    </div>
  );
};
