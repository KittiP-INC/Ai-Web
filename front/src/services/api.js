const API_URL = "http://127.0.0.1:8000";

const api = {
  search: async (query) => {
    const response = await fetch(`${API_URL}/search?query=${query}`);
    return response.json();
  },
};

export default api;
