// client/src/Api/reelApi.js
import api from './api';

export const reelAPI = {
    // ✅ Create reel
    createReel: (formData) => api.post('/reels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // ✅ Get feed
    getFeed: (page = 1, limit = 10, userId = null) => {
        let url = `/reels/feed?page=${page}&limit=${limit}`;
        if (userId) url += `&userId=${userId}`;
        return api.get(url);
    },

    // ✅ Get single reel
    getReelById: (reelId) => api.get(`/reels/${reelId}`),

    // ✅ Like reel
    likeReel: (reelId) => api.post(`/reels/${reelId}/like`),

    // ✅ Comment
    commentOnReel: (reelId, content) => 
        api.post(`/reels/${reelId}/comment`, { content }),

    // ✅ Increment view
    incrementView: (reelId) => api.post(`/reels/${reelId}/view`),

    // ✅ Delete reel
    deleteReel: (reelId) => api.delete(`/reels/${reelId}`),
};

export default reelAPI;