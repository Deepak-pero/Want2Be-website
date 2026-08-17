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

// // 👇 ADD THIS MISSING FUNCTION
// // Get story viewers (who viewed the story)
// export const getStoryViewers = async (storyId) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${API_URL}/stories/${storyId}/viewers`, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching story viewers:', error);
//         throw error;
//     }
// };

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
//     getStoryViewers, // 👈 ADD THIS
//     deleteStory
// };




// client/src/Api/storyApi.js
import axios from 'axios';
import { API_URL } from './config.js';

// Get authentication token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// ✅ GET ALL STORIES (PUBLIC) - ADD THIS
// ============================================
export const getStories = async () => {
    try {
        const response = await axios.get(`${API_URL}/stories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stories:', error);
        throw error;
    }
};

// ✅ Get all users with story status
export const getAllUsersWithStories = async () => {
    try {
        const response = await axios.get(`${API_URL}/stories/users`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users with stories:', error);
        throw error;
    }
};

// ✅ Get stories for a specific user
export const getUserStories = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/stories/user/${userId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user stories:', error);
        throw error;
    }
};

// ✅ Upload a story
export const uploadStory = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User is not logged in. Authentication token missing.');
        }

        const response = await axios.post(`${API_URL}/stories`, formData, {
            headers: {
                ...getAuthHeaders(),
            },
            timeout: 60000,
        });

        return response.data;
    } catch (error) {
        console.error('Story upload failed:', error);
        throw error;
    }
};

// ✅ Like a story
export const likeStory = async (storyId) => {
    try {
        const response = await axios.post(
            `${API_URL}/stories/${storyId}/like`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error liking story:', error);
        throw error;
    }
};

// ✅ Comment on a story
export const commentOnStory = async (storyId, text) => {
    try {
        const response = await axios.post(
            `${API_URL}/stories/${storyId}/comment`,
            { text },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error commenting on story:', error);
        throw error;
    }
};

// ✅ Mark story as viewed
export const viewStory = async (storyId) => {
    try {
        const response = await axios.post(
            `${API_URL}/stories/${storyId}/view`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error viewing story:', error);
        throw error;
    }
};

// ✅ Get story viewers
export const getStoryViewers = async (storyId) => {
    try {
        const response = await axios.get(
            `${API_URL}/stories/${storyId}/viewers`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching story viewers:', error);
        throw error;
    }
};

// ✅ Delete story
export const deleteStory = async (storyId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/stories/${storyId}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting story:', error);
        throw error;
    }
};

export default {
    getStories,
    getAllUsersWithStories,
    getUserStories,
    uploadStory,
    likeStory,
    commentOnStory,
    viewStory,
    getStoryViewers,
    deleteStory,
};