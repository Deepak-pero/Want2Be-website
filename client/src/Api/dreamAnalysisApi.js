// Api/dreamAnalysisApi.js
import api from './api.js';

export const dreamAnalysisAPI = {
    analyzeDream: (dreamId) => api.post('/analyze/analyze', { dreamId }),
    getAnalysisHistory: () => api.get('/analyze/history')
};

export default dreamAnalysisAPI;