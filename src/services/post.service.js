import axios from "axios";

const API_URL = "http://localhost:9999/posts"; 

export const postService = {

  // Lấy danh sách bài đã duyệt
  getApprovedPosts: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  // (optional) lấy chi tiết
  getPostById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },
  
  getMyPosts: async () => {
    const res = await axios.get(`${API}/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return res.data;
  },

  createPost: async (data) => {
    const res = await axios.post(API, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return res.data;
  },

  updatePost: async (id, data) => {
    const res = await axios.put(`${API}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return res.data;
  },

  deletePost: async (id) => {
    const res = await axios.delete(`${API}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return res.data;
  }

};