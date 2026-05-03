import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import PixelSnow from '../../components/PixelSnow/PixelSnow';
import useApi from '../../services/api';
import './Watch.css';

// Página de reproducción de videos
const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, error, getVideoById, getVideos } = useApi();
    const [video, setVideo] = useState(null);
    const [suggestedVideos, setSuggestedVideos] = useState([]);

    useEffect(() => {
        // Obtenemos los detalles del video principal por su ID
        const fetchVideo = async () => {
            const res = await getVideoById(id);
            if (res?.video) {
                setVideo(res.video);
            }
        };

        // Obtenemos una lista de otros videos para la barra lateral (sugerencias)
        const fetchSuggested = async () => {
            const res = await getVideos(1, 10);
            if (res?.videos) {
                // Filtramos el video que estamos viendo actualmente de las sugerencias
                setSuggestedVideos(res.videos.filter(v => v.id.toString() !== id));
            }
        };

        fetchVideo();
        fetchSuggested();
    }, [id]);

    if (loading) {
        return (
            <div className="watch-container">
                <NavBar onSearch={(q) => { if(q) navigate('/'); }} />
                <div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Cargando video...</div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="watch-container">
                <NavBar onSearch={(q) => { if(q) navigate('/'); }} />
                <div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Error: {error || "Video no encontrado"}</div>
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
            
            <NavBar onSearch={(q) => { if(q) navigate('/'); }} />

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
                        <h1 className="watch-title">{video.title}</h1>
                        <div className="watch-metadata-info">
                            {video.user?.avatar_url ? (
                                <img src={video.user.avatar_url} alt={video.user.username} className="creator-avatar" />
                            ) : (
                                <div className="creator-avatar-placeholder">
                                  {video.user?.username ? video.user.username.charAt(0).toUpperCase() : video.title.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="creator-text">
                                <p className="creator-name">{video.user?.username || `Creador ${video.id_user}`}</p>
                                <p className="upload-date">Subido el {new Date(video.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="watch-description">
                            <p>{video.description || "Sin descripción."}</p>
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
