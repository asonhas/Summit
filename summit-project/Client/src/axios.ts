import axios from "axios";

export const baseUrl = 'http://192.168.1.10:3000';
export const axiosClient = axios.create({ 
    baseURL: baseUrl,
    withCredentials: true,
});


export const axiosLogin = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});
