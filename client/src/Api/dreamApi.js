// import api from './api';

// export const dreamAPI = {
//     createDream: (dreamData) => api.post('/dreams', dreamData),
//     getUserDreams: () => api.get('/dreams/my-dreams'),
//     likeDream: (dreamId) => api.post(`/dreams/${dreamId}/like`),
//     addComment: (dreamId, commentData) => api.post(`/dreams/${dreamId}/comment`, commentData),
//     shareDream: (dreamId) => api.post(`/dreams/${dreamId}/share`),
//     deleteDream: (dreamId) => api.delete(`/dreams/${dreamId}`),
//     updateDream: (dreamId, dreamData) => api.put(`/dreams/${dreamId}`, dreamData),
//     getDreamAnalysis: (dreamId) => api.get(`/dreams/${dreamId}`)
// };

// export default dreamAPI;





// client/src/Api/dreamApi.js
import api from './api';

export const dreamAPI = {
    // ✅ Dream CRUD
    createDream: (dreamData) => api.post('/dreams', dreamData),
    getUserDreams: () => api.get('/dreams/my-dreams'),
    getAllDreams: () => api.get('/dreams'),
    getDreamAnalysis: (dreamId) => api.get(`/dreams/${dreamId}`),

    // ✅ Interactions
    likeDream: (dreamId) => api.post(`/dreams/${dreamId}/like`),
    addComment: (dreamId, commentData) => api.post(`/dreams/${dreamId}/comment`, commentData),

    // ✅ Share
    shareDream: (dreamId, data) => api.post(`/dreams/${dreamId}/share`, data),
    getSharedDreams: () => api.get('/dreams/shared-with-me'),
    searchUsersToShare: (query) => api.get(`/dreams/users/search?query=${encodeURIComponent(query)}`),

    // ✅ Update/Delete
    updateDream: (dreamId, dreamData) => api.put(`/dreams/${dreamId}`, dreamData),
    deleteDream: (dreamId) => api.delete(`/dreams/${dreamId}`),
};

export default dreamAPI;