// Environment configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api',
    API_TIMEOUT: 10000,
    LOG_LEVEL: 'warn',
    ENABLE_DEV_TOOLS: true,
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    API_TIMEOUT: 15000,
    LOG_LEVEL: 'error',
    ENABLE_DEV_TOOLS: false,
  },
  staging: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://staging-api.example.com/api',
    API_TIMEOUT: 12000,
    LOG_LEVEL: 'warn',
    ENABLE_DEV_TOOLS: true,
  },
};

const environment = import.meta.env.MODE || 'development';

export default config[environment];
