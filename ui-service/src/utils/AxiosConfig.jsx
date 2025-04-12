import axios from 'axios';

const axiosConfig = axios.create({
  baseURL: window._env_.API_URL,  // API_URL is undefined here
  // baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosConfig;
