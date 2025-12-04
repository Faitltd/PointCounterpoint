// API configuration
const runtimeOrigin = (typeof window !== 'undefined' && window.location && window.location.origin)
  ? window.location.origin
  : '';

const config = {
  // Prefer build-time env, otherwise use current origin (for Caddy proxy), fallback to localhost for local dev
  API_URL: process.env.REACT_APP_API_URL || runtimeOrigin || 'http://localhost:5001',
};

export default config;
