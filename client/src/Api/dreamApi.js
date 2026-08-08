import api from './api';

export const dreamAPI = {
    createDream: (dreamData) => api.post('/dreams', dreamData),
    getUserDreams: () => api.get('/dreams/my-dreams'),
    likeDream: (dreamId) => api.post(`/dreams/${dreamId}/like`),
    addComment: (dreamId, commentData) => api.post(`/dreams/${dreamId}/comment`, commentData),
    shareDream: (dreamId) => api.post(`/dreams/${dreamId}/share`),
    deleteDream: (dreamId) => api.delete(`/dreams/${dreamId}`),
    updateDream: (dreamId, dreamData) => api.put(`/dreams/${dreamId}`, dreamData),
    getDreamAnalysis: (dreamId) => api.get(`/dreams/${dreamId}`)
};

export default dreamAPI;