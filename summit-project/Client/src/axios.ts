import axios from "axios";

export const baseUrl = 'https://localhost:3000';
export const axiosClient = axios.create({ 
    baseURL: baseUrl,
    withCredentials: true,
});


export const axiosLogin = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});
