import SpotlightCard from '../SpotlightCard/SpotlightCard';
import './VideoCard.css';

// Tarjeta para la preview de los videos
const VideoCard = ({ video }) => {
  const { 
    thumbnail, 
    duration, 
    title, 
    user, 
    views, 
    uploadedAt 
  } = video;

  return (
    <SpotlightCard className="video-card" spotlightColor='rgba(246, 48, 73, 0.25)'>
      <div className="video-thumbnail-container">
        <img src={thumbnail} alt={title} className="video-thumbnail" />
        <span className="video-duration">{duration}</span>
      </div>
      <div className="video-info-container">
        <div className="video-avatar-container">
          <img src={user.avatar} alt={user.username} className="video-avatar" />
        </div>
        <div className="video-details">
          <h3 className="video-title">{title}</h3>
          <p className="video-username">{user.username}</p>
          <p className="video-metadata">
            {views} views • {uploadedAt}
          </p>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default VideoCard;
