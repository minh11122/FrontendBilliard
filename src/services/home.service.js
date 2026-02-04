import api from "../lib/axios";

// Lấy danh sách cửa hàng gần vị trí (lat, lng) nhất đinh (3000m)
// export const getNearbyShops = (lat, lng) => {
//     return api.get("home/nearby", { params: { lat, lng } });
// };
// export const getPopularShops = () => {
//     return api.get("home/popular");
// }

export const getNearbyShops = (lat, lng) => {
  const token = localStorage.getItem("token");
  return api.get("home/nearby", {
    params: { lat, lng },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const getPopularShops = () => {
  const token = localStorage.getItem("token");
  return api.get("home/popular", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};


export const getShopsByType = (type, lat, lng) => {
    return api.get("home/filter", { params: { type, lat, lng } });
}

export const getShopById = (shopId) => {
    return api.get(`home/shop/${shopId}`);
}

// home.service.js
export const searchShopsAndFoods = (searchParams) => {
  return api.get("home/search-all", { params: searchParams });
};

export const searchHome = (q, lat, lng, options) => {
    const params = { q, ...options };
    if (lat && lng) params.lat = lat;
    if (lat && lng) params.lng = lng;
    return api.get("home/search", { params });
}
export const getShopWithFoods = (id) => {
    return api.get(`home/shop/${id}/foods`);
};

export const getRandomShops = () => {
    return api.get("home/detail/random");
};

export const getFavoriteShops = () => {
    return api.get("home/favorite");
};

export const addFavoriteShop = (shopId) => {
    return api.post(`home/favorite/${shopId}`);
};

export const removeFavoriteShop = (shopId) => {
    return api.delete(`home/favorite/${shopId}`);
};
