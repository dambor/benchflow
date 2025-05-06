import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Make sure this file exists with your Tailwind imports
import App from './App';

// Create a root element to render your React application
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render your App component inside React's StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);