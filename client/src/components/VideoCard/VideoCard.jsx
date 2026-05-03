import SpotlightCard from '../SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import './VideoCard.css';

// Tarjeta para la preview de los videos
const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const { 
    id,
    title, 
    thumbnail_url, 
    created_at, 
    user // Si después tienes un obj user cruzado, pero de base no
  } = video;

  // Formatear fecha simple
  const dateStr = new Date(created_at).toLocaleDateString();

  return (
    <SpotlightCard className="video-card" spotlightColor='rgba(246, 48, 73, 0.25)'>
      <div 
        className="video-content-clickable" 
        onClick={() => navigate(`/watch/${id}`)}
        style={{cursor: 'pointer'}}
      >
        <div className="video-thumbnail-container">
          <img src={thumbnail_url} alt={title} className="video-thumbnail" />
        </div>
        <div className="video-info-container">
          <div className="video-avatar-container">
            {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="video-avatar-img" style={{width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover'}} />
            ) : (
                <div className="video-avatar" style={{backgroundColor: '#333', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold'}}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : title.charAt(0).toUpperCase()}
                </div>
            )}
          </div>
          <div className="video-details">
            <h3 className="video-title">{title}</h3>
            <p className="video-username">{user?.username || `Creador ${video.id_user}`}</p>
            <p className="video-metadata">
              Subido el {dateStr}
            </p>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default VideoCard;
