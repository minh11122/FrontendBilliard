import api from "../lib/axios";

/**
 * Fetch list of provinces from backend
 */
export const getProvinces = async () => {
  try {
    const response = await api.get("/locations/provinces");
    return response.data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
};

/**
 * Fetch list of districts/wards by province code
 */
export const getDistrictsByProvince = async (provinceCode) => {
  try {
    const response = await api.get(`/locations/provinces/${provinceCode}/districts`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching districts for province ${provinceCode}:`, error);
    throw error;
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in km
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Get user's current position
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

/**
 * Format distance for display
 * @param {number} km Distance in km
 * @returns {string} Formatted string
 */
export const formatDistance = (km) => {
  if (km === null || km === undefined) return "N/A";
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

/**
 * Normalizes a string for comparison (lowercase, remove accents)
 */
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

/**
 * Matches a name against a list of administrative units (Provinces or Districts)
 * @param {string} searchName Name from Goong Maps
 * @param {Array} units List of units from DB
 * @returns {Object|null} The matched unit
 */
export const matchAdministrativeUnit = (searchName, units) => {
  if (!searchName || !units || units.length === 0) return null;

  const normalizedSearch = normalizeString(searchName);

  // Helper to remove prefixes like "Tinh", "Thanh pho", "Quan", "Huyen"
  const cleanType = (str) => {
    return normalizeString(str)
      .replace(/^(tinh|thanh pho|tp\.|tp|quan|huyen|q\.|h\.|thi xa|phuong|xa|p\.|x\.)\s+/i, "")
      .trim();
  };

  const searchCleaned = cleanType(normalizedSearch);

  // 1. Try exact match on name or name_with_type
  let match = units.find(
    (u) => normalizeString(u.name) === normalizedSearch || 
           normalizeString(u.name_with_type) === normalizedSearch ||
           cleanType(u.name) === searchCleaned
  );

  if (match) return match;

  // 2. Try partial match: Is the search name contained in the unit name or vice versa?
  match = units.find((u) => {
    const unitName = normalizeString(u.name);
    const unitCleaned = cleanType(u.name);
    return normalizedSearch.includes(unitName) || 
           unitName.includes(normalizedSearch) ||
           searchCleaned.includes(unitCleaned) ||
           unitCleaned.includes(searchCleaned);
  });

  return match || null;
};
