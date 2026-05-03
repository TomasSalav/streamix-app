const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const getToken = () => localStorage.getItem('token');

const fetchWithAuth = async (endpoint, method = 'GET', body = null) => {
    const token = getToken();
    const options = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    return { success: response.ok, status: response.status, data };
};

// Auth
export const signup = (username, email, password) => 
    fetchWithAuth('/auth/signup', 'POST', { username, email, password });

export const login = async (email, password) => {
    const result = await fetchWithAuth('/auth/login', 'POST', { email, password });
    if (result.success && result.data.token) {
        localStorage.setItem('token', result.data.token);
    }
    return result;
};

export const logout = async () => {
    const result = await fetchWithAuth('/auth/logout', 'POST');
    localStorage.removeItem('token');
    return result;
};

export const getCurrentUser = () => fetchWithAuth('/auth/me', 'GET');

// Users
export const getUsers = () => fetchWithAuth('/users', 'GET');
export const getUserById = (userId) => fetchWithAuth(`/users/${userId}`, 'GET');

// Videos
export const getVideos = (page = 1, perPage = 10) => 
    fetchWithAuth(`/videos?page=${page}&per_page=${perPage}`, 'GET');

export const getVideoById = (videoId) => fetchWithAuth(`/videos/${videoId}`, 'GET');
export const getVideosByUser = (userId) => fetchWithAuth(`/users/${userId}/videos`, 'GET');
export const createVideo = (videoData) => fetchWithAuth('/videos', 'POST', videoData);
export const updateVideo = (videoId, videoData) => fetchWithAuth(`/videos/${videoId}`, 'PUT', videoData);
export const deleteVideo = (videoId) => fetchWithAuth(`/videos/${videoId}`, 'DELETE');

// Comments
export const getComments = (videoId = null, page = 1) => {
    const endpoint = videoId 
        ? `/comments?video_id=${videoId}&page=${page}`
        : `/comments?page=${page}`;
    return fetchWithAuth(endpoint, 'GET');
};

export const getCommentById = (commentId) => fetchWithAuth(`/comments/${commentId}`, 'GET');
export const createComment = (videoId, content) => 
    fetchWithAuth(`/videos/${videoId}/comments`, 'POST', { content });
export const updateComment = (commentId, content) => 
    fetchWithAuth(`/comments/${commentId}`, 'PUT', { content });
export const deleteComment = (commentId) => fetchWithAuth(`/comments/${commentId}`, 'DELETE');

// Reactions
export const getReactions = (videoId) => fetchWithAuth(`/videos/${videoId}/reactions`, 'GET');
export const createReaction = (videoId, reactionType) => 
    fetchWithAuth(`/videos/${videoId}/reactions`, 'POST', { reaction_type: reactionType });

// Subscriptions
export const getSubscriptions = () => fetchWithAuth('/subscriptions', 'GET');
export const getSubscribers = (userId) => fetchWithAuth(`/users/${userId}/subscribers`, 'GET');
export const subscribe = (userId) => fetchWithAuth(`/users/${userId}/subscribe`, 'POST');
export const unsubscribe = (userId) => fetchWithAuth(`/users/${userId}/unsubscribe`, 'POST');
export const checkSubscription = (userId) => fetchWithAuth(`/users/${userId}/is_subscribed`, 'GET');

// Views
export const getViews = (videoId) => fetchWithAuth(`/videos/${videoId}/views`, 'GET');
export const createView = (videoId) => fetchWithAuth(`/videos/${videoId}/views`, 'POST');
export const deleteView = (videoId) => fetchWithAuth(`/videos/${videoId}/views`, 'DELETE');