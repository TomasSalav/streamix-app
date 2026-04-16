import SpotlightCard from '../SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import './VideoCard.css';

// Tarjeta para la preview de los videos
const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const { 
    id,
    title, 
    thumbnail, 
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
          <img src={thumbnail} alt={title} className="video-thumbnail" />
        </div>
        <div className="video-info-container">
          <div className="video-avatar-container">
            {/* Avatar por default genérico hasta que metan el modelo user */}
            <div className="video-avatar" style={{backgroundColor: '#333', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold'}}>
              {title.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="video-details">
            <h3 className="video-title">{title}</h3>
            {/* Como ya no hay user.username en el modelo base, mostramos un estático de momento o el id_user */}
            <p className="video-username">Creador {video.id_user}</p>
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
