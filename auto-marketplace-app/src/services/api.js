import axios from "axios";

const api = axios.create({
  // Replace the URL below with your active ngrok URL
  // You can get it by running: npx ngrok http 5000
  baseURL: "https://glottologic-petrifiedly-luanna.ngrok-free.dev",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
