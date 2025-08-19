// src/utils/geolocation.js
export const GEO_DEFAULTS = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

export function getCurrentPosition(options = GEO_DEFAULTS) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function toFixed6({ latitude, longitude }) {
  return {
    latitude: Number(latitude).toFixed(6),
    longitude: Number(longitude).toFixed(6),
  };
}
