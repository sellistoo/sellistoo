import Constants from "expo-constants";

const { apiUrl } = Constants.expoConfig?.extra || {};

if (!apiUrl) {
  throw new Error("API_URL is not defined in app.config.js or .env");
}

const config = {
  apiUrl,
};

export default config;
