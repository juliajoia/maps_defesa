import axios from "axios";

export const api = axios.create({
    baseURL: "http://34.95.190.166:3000"
})