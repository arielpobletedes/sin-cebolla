import axios from "axios";
import { Platform } from "react-native";

const API_HOST = Platform.select({
  android: "10.0.2.2",
  default: "localhost", // Web e iOS Simulator use localhost
});

const BASE_URL = `http://${API_HOST}:3000/api`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// export const api = axios.create({
//   baseURL: process.env.EXPO_PUBLIC_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
