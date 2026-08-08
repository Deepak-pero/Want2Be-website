// import axios from 'axios';
// import { API_URL } from './config.js';

// // Get all stories
// export const getStories = async () => {
//     try {
//         const response = await axios.get(`${API_URL}/stories`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching stories:', error);
//         throw error;
//     }
// };

// // Upload a story
// export const uploadStory = async (formData) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.post(`${API_URL}/stories`, formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error uploading story:', error);
//         throw error;
//     }
// };

// // Like a story
// export const likeStory = async (storyId) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.post(`${API_URL}/stories/${storyId}/like`, {}, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error liking story:', error);
//         throw error;
//     }
// };

// // Comment on a story
// export const commentOnStory = async (storyId, text) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.post(`${API_URL}/stories/${storyId}/comment`, { text }, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error commenting on story:', error);
//         throw error;
//     }
// };

// // Mark story as viewed
// export const viewStory = async (storyId) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.post(`${API_URL}/stories/${storyId}/view`, {}, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error viewing story:', error);
//         throw error;
//     }
// };

// // Delete a story
// export const deleteStory = async (storyId) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.delete(`${API_URL}/stories/${storyId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error deleting story:', error);
//         throw error;
//     }
// };

// export default {
//     getStories,
//     uploadStory,
//     likeStory,
//     commentOnStory,
//     viewStory,
//     deleteStory
// };



import axios from 'axios';
import { API_URL } from './config.js';

// Get all stories
export const getStories = async () => {
    try {
        const response = await axios.get(`${API_URL}/stories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stories:', error);
        throw error;
    }
};

// Upload a story
export const uploadStory = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/stories`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading story:', error);
        throw error;
    }
};

// Like a story
export const likeStory = async (storyId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/stories/${storyId}/like`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error liking story:', error);
        throw error;
    }
};

// Comment on a story
export const commentOnStory = async (storyId, text) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/stories/${storyId}/comment`, { text }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error commenting on story:', error);
        throw error;
    }
};

// Mark story as viewed
export const viewStory = async (storyId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/stories/${storyId}/view`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error viewing story:', error);
        throw error;
    }
};

// 👇 ADD THIS MISSING FUNCTION
// Get story viewers (who viewed the story)
export const getStoryViewers = async (storyId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/stories/${storyId}/viewers`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching story viewers:', error);
        throw error;
    }
};

export const deleteStory = async (storyId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/stories/${storyId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting story:', error);
        throw error;
    }
};

export default {
    getStories,
    uploadStory,
    likeStory,
    commentOnStory,
    viewStory,
    getStoryViewers, // 👈 ADD THIS
    deleteStory
};