

// import axios from 'axios';

// // 1. Set the base URL for your API
// const baseURL = "http://localhost:3000";

// /**
//  * Standardized request helper
//  * @param {string} path - API endpoint path (e.g., "/api/user/login")
//  * @param {string} method - HTTP method (GET, POST, etc.)
//  * @param {object} data - Request body or params
//  */
// const request = async (path = "", method = "GET", data = {}) => {
//     try {
//         // Create the configuration object for axios
//         const config = {
//             method: method.toUpperCase(),
//             url: baseURL + path,
//             headers: {
//                 'Content-Type': 'application/json',
//                 // Attach token if it exists in localStorage
//                 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
//             }
//         };

//         // For GET requests, use 'params'; for others, use 'data'
//         if (config.method === 'GET') {
//             config.params = data;
//         } else {
//             config.data = data;
//         }

//         // Call axios with the config object
//         const response = await axios(config);
        
//         // Return the data from the response
//         return response.data;
//     } catch (error) {
//         // Log the error for debugging
//         console.error("API Request Error:", error.response?.data || error.message);
        
//         // Handle specific errors (like 401 Unauthorized)
//         if (error.response?.status === 401) {
//             // localStorage.removeItem('token');
//             // window.location.href = '/login';
//         }
        
//         // Re-throw the error so the calling component can handle it
//         throw error;
//     }
// };

// export default request;

import axios from 'axios';

// 1. Set the base URL for your API
const baseURL = "http://localhost:3000";

/**
 * Standardized request helper
 * @param {string} path - API endpoint path (e.g., "/api/user/login")
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request body or params
 */
const request = async (path = "", method = "GET", data = {}) => {
    // Safety check: ensure method is a string to prevent .toUpperCase() errors
    const safeMethod = (typeof method === 'string' ? method : 'GET').toUpperCase();
    
    try {
        const config = {
            method: safeMethod,
            url: baseURL + path,
            headers: {
                'Content-Type': 'application/json',
                // Attach token if it exists in localStorage
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        };

        // For GET requests, use 'params'; for others, use 'data'
        if (safeMethod === 'GET') {
            config.params = data;
        } else {
            config.data = data;
        }

        // Call axios with the config object
        const response = await axios(config);
        
        // Return the data directly
        return response.data;
    } catch (error) {
        // Log the error for debugging
        console.error("API Request Error:", error.response?.data || error.message);
        
        // Re-throw the error so the calling component can handle it
        throw error;
    }
};

export default request;
