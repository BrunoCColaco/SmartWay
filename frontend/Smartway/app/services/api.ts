// src/services/api.ts

import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.71:8000'; // Replace with your API base URL
// const API_BASE_URL = 'https://api.carrismetropolitana.pt/v1'; // Replace with your API base URL


// Define the type for the data returned by the API
export interface Stop{
  stop_id: number
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

// Fetch data from an API endpoint using Axios
// export const getNearbyStops = async (lat: number, lon: number): Promise<Stop[]> => {
//   try {
//     const response = await axios.get<Stop[]>(`${API_BASE_URL}/stops/nearby`, {
//       params: {
//         lat: lat,
//         lon: lon
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     throw error;
//   }
// };

export const getStops = async (): Promise<Stop[]> => {
  try {
    const response = await axios.get<Stop[]>(`${API_BASE_URL}/stops`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
