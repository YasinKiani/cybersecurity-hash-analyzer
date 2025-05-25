// This file manages configuration settings for the frontend application

// The backend port - update this value if your backend server is using a different port
const BACKEND_PORT = 5000; // Changed from 5000 to 5005 as the backend server is running on port 5005

// Function to determine the API base URL
const determineApiBaseUrl = () => {
  // Use the configured port
  return `http://localhost:${BACKEND_PORT}`;
};

// Export the API base URL
export const API_BASE_URL = determineApiBaseUrl();

// Additional configuration settings
export const DEFAULT_HASH_ALGORITHM = "md5";
export const APP_NAME = "Hash Visualization";
export const AUTHOR = "Yasin Kiani";
