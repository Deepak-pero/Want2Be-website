// Api/searchApi.js
import api from './api';

export const searchAPI = {
    searchUsers: (query) => api.get(`/auth/search/users?q=${encodeURIComponent(query)}`),
    getUserProfile: (userId) => api.get(`/auth/users/${userId}`)
};

export default searchAPI;