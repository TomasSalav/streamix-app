import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import PixelSnow from '../../components/PixelSnow/PixelSnow';
import './Watch.css';

// Página de reproducción de videos (Mock)
const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect(() => {
    //     const fetchVideo = async () => {
    //         try {
    //             const res = await mockGetVideo(id);
    //             if (res.success) {
    //                 setVideo(res.data);
    //             }
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchVideo();
    // }, [id]);

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
                <div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Error: {error || "No encontrado"}</div>
            </div>
        );
    }

    // Configuración de la ip del CDN

    const baseUrl = (typeof process !== 'undefined' && process.env && process.env.VITE_CDN_URL) || 
                    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CDN_URL) || 
                    "https://www.youtube.com/embed/";

    const videoUrl = `${baseUrl}${video.link}`;

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

            <div className="watch-content">
                <div className="video-player-wrapper">
                    <iframe 
                        className="video-iframe"
                        src={videoUrl}
                        title={video.title}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="video-details-section">
                    <h1 className="watch-title">{video.title}</h1>
                    <div className="watch-metadata">
                        <p>Subido el {new Date(video.created_at).toLocaleDateString()}</p>
                        <p>ID del Creador: {video.id_user}</p>
                    </div>
                    <div className="watch-description">
                        <p>{video.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watch;
