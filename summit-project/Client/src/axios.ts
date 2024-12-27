import axios from "axios";

const baseUrl = 'http://localhost:3000';
export const axiosClient = axios.create({ 
    baseURL: baseUrl,
    withCredentials: true,
});


export const axiosLogin = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});
