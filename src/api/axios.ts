import axios from "axios";

export const api = axios.create({
    baseURL: "https://api.defesacivilam.com.br"
})
