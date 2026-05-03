import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import PixelSnow from '../../components/PixelSnow/PixelSnow';
import useApi from '../../services/api';
import Button from '../../components/Button/Button';
import defaultAvatar from '../../assets/default.jpg';
import './Watch.css';
import { useRef } from 'react';

// Página de reproducción de videos
const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        loading, error, getVideoById, getVideos,
        getCurrentUser, createView, createReaction, getReactions,
        getComments, createComment, deleteComment, deleteVideo
    } = useApi();

    const [video, setVideo] = useState(null);
    const [suggestedVideos, setSuggestedVideos] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Estados de interacción
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const [userReaction, setUserReaction] = useState(null);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const hasViewed = useRef(false);

    useEffect(() => {
        // Obtenemos el usuario actual para validar si puede comentar/reaccionar
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await getCurrentUser();
                if (res?.usuario) {
                    setCurrentUser(res.usuario);
                    return res.usuario;
                }
            }
            return null;
        };

        // Obtenemos los detalles del video principal por su ID
        const fetchVideoData = async () => {
            const res = await getVideoById(id);
            if (res?.video) {
                setVideo(res.video);
                setLikes(res.video.likes_count || 0);
                setDislikes(res.video.dislikes_count || 0);
                // Registramos la vista solo una vez por montado (evita el doble mount de StrictMode)
                if (localStorage.getItem('token') && !hasViewed.current) {
                    hasViewed.current = true;
                    await createView(id);
                }
            }
        };

        // Obtenemos una lista de otros videos para la barra lateral (sugerencias)
        const fetchSuggested = async () => {
            const res = await getVideos(1, 10);
            if (res?.videos) {
                setSuggestedVideos(res.videos.filter(v => v.id.toString() !== id));
            }
        };

        // Obtenemos comentarios
        const fetchCommentsData = async () => {
            const res = await getComments(id);
            if (res?.comentarios) {
                setComments(res.comentarios);
            }
        };

        // Obtenemos reacciones y filtramos la del usuario
        const fetchReactionsData = async (userId) => {
            const res = await getReactions(id);
            if (res?.reacciones && userId) {
                const myReaction = res.reacciones.find(r => r.id_user === userId);
                if (myReaction) setUserReaction(myReaction.reaction_type);
            }
        };

        fetchUser().then(user => {
            fetchReactionsData(user?.id);
        });
        fetchVideoData();
        fetchSuggested();
        fetchCommentsData();
    }, [id]);

    const handleReaction = async (type, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!currentUser) {
            alert('Debes iniciar sesión para reaccionar.');
            return;
        }

        // Optimistic UI update
        const previousReaction = userReaction;
        let newLikes = video.likes_count;
        let newDislikes = video.dislikes_count;

        if (previousReaction === type) {
            // Eliminar reacción (el backend la quita o la cambia)
            setUserReaction(null);
            if (type === 'like') setLikes(prev => prev - 1);
            if (type === 'dislike') setDislikes(prev => prev - 1);
        } else {
            setUserReaction(type);
            if (type === 'like') {
                setLikes(prev => prev + 1);
                if (previousReaction === 'dislike') setDislikes(prev => prev - 1);
            } else {
                setDislikes(prev => prev + 1);
                if (previousReaction === 'like') setLikes(prev => prev - 1);
            }
        }

        await createReaction(id, type);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setSubmittingComment(true);
        const res = await createComment(id, newComment);
        if (res?.comentario) {
            setComments([res.comentario, ...comments]);
            setNewComment('');
        }
        setSubmittingComment(false);
    };

    const handleDeleteVideo = async (e) => {
        if (e) e.preventDefault();
        if (window.confirm("¿Estás seguro de que quieres borrar este video? Esta acción no se puede deshacer.")) {
            await deleteVideo(id);
            navigate('/');
        }
    };

    const handleDeleteComment = async (commentId, e) => {
        if (e) e.preventDefault();
        if (window.confirm("¿Borrar comentario?")) {
            await deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    if (loading && !video) {
        return (
            <div className="watch-container">
                <NavBar onSearch={(q) => { if (q) navigate('/'); }} />
                <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Cargando video...</div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="watch-container">
                <NavBar onSearch={(q) => { if (q) navigate('/'); }} />
                <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Error: {error || "Video no encontrado"}</div>
            </div>
        );
    }

    return (
        <div className="watch-container">
            <div className="watch-background">
                <PixelSnow
                    color="#ffffff"
                    flakeSize={0.01}
                    minFlakeSize={1.25}
                    pixelResolution={200}
                    speed={1.0}
                    density={0.2}
                    direction={125}
                    brightness={1}
                    depthFade={8}
                    farPlane={20}
                    gamma={0.4545}
                    variant="square"
                />
            </div>

            <NavBar onSearch={(q) => { if (q) navigate('/'); }} />

            <div className="watch-layout">
                <div className="watch-main-content">
                    <div className="video-player-wrapper">
                        <video
                            className="video-player-element"
                            src={video.url}
                            controls
                            autoPlay
                            poster={video.thumbnail_url}
                        >
                            Tu navegador no soporta la reproducción de videos.
                        </video>
                    </div>
                    <div className="video-details-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h1 className="watch-title">{video.title}</h1>
                            {currentUser && currentUser.id === video.id_user && (
                                <button onClick={handleDeleteVideo} className="delete-btn" style={{ background: 'transparent', border: '1px solid var(--light-red)', color: 'var(--light-red)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                    <i className="fa-solid fa-trash"></i> Borrar Video
                                </button>
                            )}
                        </div>
                        <div className="watch-metadata-info">
                            <div className="metadata-left">
                                <img
                                    src={(video.user?.avatar_url && video.user.avatar_url !== 'null') ? video.user.avatar_url : defaultAvatar}
                                    alt={video.user?.username || 'Creador'}
                                    className="creator-avatar"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                />
                                <div className="creator-text">
                                    <p className="creator-name">{video.user?.username || `Creador ${video.id_user}`}</p>
                                    <p className="upload-date">
                                        {video.views_count || 0} vistas • hace {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="metadata-right">
                                <div className="reaction-buttons" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        className={`reaction-btn ${userReaction === 'like' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleReaction('like');
                                        }}
                                    >
                                        <i className="fa-solid fa-thumbs-up"></i> {likes}
                                    </button>
                                    <button
                                        type="button"
                                        className={`reaction-btn ${userReaction === 'dislike' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleReaction('dislike');
                                        }}
                                    >
                                        <i className="fa-solid fa-thumbs-down"></i> {dislikes}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="watch-description">
                            <p>{video.description || "Sin descripción."}</p>
                        </div>

                        {/* Comments Section */}
                        <div className="comments-section">
                            <h3 className="comments-title">{comments.length} Comentarios</h3>

                            {currentUser ? (
                                <form className="comment-form" onSubmit={handleCommentSubmit}>
                                    <img
                                        src={(currentUser.avatar_url && currentUser.avatar_url !== 'null' && currentUser.avatar_url.length > 5) ? currentUser.avatar_url : defaultAvatar}
                                        alt="Tú"
                                        className="comment-avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                    />
                                    <div className="comment-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Agrega un comentario..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        {newComment && (
                                            <Button type="submit" disabled={submittingComment} style={{ padding: '0 1rem', height: '2.5rem', marginTop: '8px' }}>
                                                {submittingComment ? 'Publicando...' : 'Comentar'}
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="comment-login-prompt">
                                    <p>Debes iniciar sesión para comentar.</p>
                                </div>
                            )}

                            <div className="comments-list">
                                {comments.map(c => (
                                    <div key={c.id} className="comment-item">
                                        <img
                                            src={(c.user?.avatar_url && c.user.avatar_url !== 'null') ? c.user.avatar_url : defaultAvatar}
                                            alt={c.user?.username || 'Usuario'}
                                            className="comment-avatar"
                                            onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                        />
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span className="comment-author">{c.user?.username || `Usuario ${c.id_user}`}</span>
                                                <span className="comment-date">{new Date(c.created_at).toLocaleDateString()}</span>
                                                {currentUser && currentUser.id === c.id_user && (
                                                    <button onClick={() => handleDeleteComment(c.id)} className="delete-comment-btn" style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', marginLeft: 'auto', fontSize: '0.9rem' }} title="Borrar comentario">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="comment-text">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="watch-sidebar">
                    <h2 className="sidebar-title">Más videos</h2>
                    <div className="suggested-list">
                        {suggestedVideos.map(v => (
                            <Link to={`/watch/${v.id}`} key={v.id} className="suggested-item">
                                <div className="suggested-thumb">
                                    <img src={v.thumbnail_url} alt={v.title} />
                                </div>
                                <div className="suggested-info">
                                    <h3 className="suggested-title">{v.title}</h3>
                                    <p className="suggested-creator">{v.user?.username || 'Usuario'}</p>
                                    <p className="suggested-date">{new Date(v.created_at).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watch;
