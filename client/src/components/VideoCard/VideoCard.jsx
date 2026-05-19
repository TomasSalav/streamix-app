import SpotlightCard from '../SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../assets/default.jpg';
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
            <img 
              src={(user?.avatar_url && user.avatar_url !== 'null') ? user.avatar_url : defaultAvatar} 
              alt={user?.username || 'Perfil'} 
              className="video-avatar-img" 
              style={{width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover'}}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
            />
          </div>
          <div className="video-details">
            <h3 className="video-title">{title}</h3>
            <p className="video-username">{user?.username || `Creador ${video.id_user}`}</p>
            <p className="video-metadata">
              {video.views_count || 0} vistas • hace {dateStr}
            </p>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default VideoCard;