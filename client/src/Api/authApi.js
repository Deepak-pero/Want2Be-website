import api from './api.js';

export const authAPI = {
    requestOTP: (data) => api.post('/auth/request-otp', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (formData) => {
        console.log('🔄 authAPI.updateProfile called');
        console.log('📦 FormData received in authAPI:');

        // Log FormData contents
        if (formData instanceof FormData) {
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  - ${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`  - ${key}: ${value}`);
                }
            }
        } else {
            console.log('❌ FormData is not an instance of FormData:', typeof formData);
        }

        console.log('🔄 Making API call to /auth/profile...');

        return api.put('/auth/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log('✅ API call successful:', response.data);
                return response;
            })
            .catch(error => {
                console.error('❌ API call failed:', error);
                console.error('❌ Error response:', error.response);
                throw error;
            });
    }
};

export default authAPI;