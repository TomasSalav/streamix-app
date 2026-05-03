import useFetch from '../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Hook centralizado para manejar todas las llamadas al API del backend
const useApi = () => {
    const { data, loading, error, request } = useFetch(API_URL);

    // --- Autenticación ---
    const signup = (username, email, password) =>
        request('/auth/signup', 'POST', { username, email, password });

    const login = async (email, password) => {
        const result = await request('/auth/login', 'POST', { email, password });
        // Si el login es exitoso, guardamos el token para futuras peticiones
        if (result?.token) {
            localStorage.setItem('token', result.token);
        }
        return result;
    };

    const logout = async () => {
        const result = await request('/auth/logout', 'POST');
        localStorage.removeItem('token');
        return result;
    };

    const getCurrentUser = () => request('/auth/me', 'GET');

    // --- Gestión de Usuarios ---
    const getUsers = () => request('/users', 'GET');
    const getUserById = (userId) => request(`/users/${userId}`, 'GET');
    const updateUser = (userId, userData) => request(`/users/${userId}`, 'PUT', userData);

    // Permite subir la foto de perfil usando FormData
    const uploadAvatar = (userId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return request(`/users/${userId}/avatar`, 'POST', formData);
    };

    // --- Gestión de Videos ---
    const getVideos = (page = 1, perPage = 10) =>
        request(`/videos?page=${page}&per_page=${perPage}`, 'GET');

    const getVideoById = (videoId) => request(`/videos/${videoId}`, 'GET');
    const getVideosByUser = (userId) => request(`/users/${userId}/videos`, 'GET');

    // Envía el FormData con video, miniatura y metadatos al backend
    const createVideo = (videoData) => request('/videos', 'POST', videoData);
    const updateVideo = (videoId, videoData) => request(`/videos/${videoId}`, 'PUT', videoData);
    const deleteVideo = (videoId) => request(`/videos/${videoId}`, 'DELETE');

    // Comments
    const getComments = (videoId = null, page = 1) => {
        const endpoint = videoId
            ? `/comments?video_id=${videoId}&page=${page}`
            : `/comments?page=${page}`;
        return request(endpoint, 'GET');
    };

    const getCommentById = (commentId) => request(`/comments/${commentId}`, 'GET');
    const createComment = (videoId, content) =>
        request(`/videos/${videoId}/comments`, 'POST', { content });
    const updateComment = (commentId, content) =>
        request(`/comments/${commentId}`, 'PUT', { content });
    const deleteComment = (commentId) => request(`/comments/${commentId}`, 'DELETE');

    // Reactions
    const getReactions = (videoId) => request(`/videos/${videoId}/reactions`, 'GET');
    const createReaction = (videoId, reactionType) =>
        request(`/videos/${videoId}/reactions`, 'POST', { reaction_type: reactionType });

    // Subscriptions
    const getSubscriptions = () => request('/subscriptions', 'GET');
    const getSubscribers = (userId) => request(`/users/${userId}/subscribers`, 'GET');
    const subscribe = (userId) => request(`/users/${userId}/subscribe`, 'POST');
    const unsubscribe = (userId) => request(`/users/${userId}/unsubscribe`, 'POST');
    const checkSubscription = (userId) => request(`/users/${userId}/is_subscribed`, 'GET');

    // Views
    const getViews = (videoId) => request(`/videos/${videoId}/views`, 'GET');
    const createView = (videoId) => request(`/videos/${videoId}/views`, 'POST');
    const deleteView = (videoId) => request(`/videos/${videoId}/views`, 'DELETE');

    return {
        data,
        loading,
        error,
        signup,
        login,
        logout,
        getCurrentUser,
        getUsers,
        getUserById,
        updateUser,
        uploadAvatar,
        getVideos,
        getVideoById,
        getVideosByUser,
        createVideo,
        updateVideo,
        deleteVideo,
        getComments,
        getCommentById,
        createComment,
        updateComment,
        deleteComment,
        getReactions,
        createReaction,
        getSubscriptions,
        getSubscribers,
        subscribe,
        unsubscribe,
        checkSubscription,
        getViews,
        createView,
        deleteView
    };
};

export default useApi;