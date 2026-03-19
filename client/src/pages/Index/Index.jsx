import PixelSnow from "../../components/PixelSnow/PixelSnow";
import NavBar from "../../components/NavBar/NavBar";
import VideoCard from "../../components/VideoCard/VideoCard";
import './Index.css';

// Mocks hechos con IA para probar los videos
const MOCK_VIDEOS = [
  {
    id: 1,
    title: "Understanding React Server Components in 2024",
    thumbnail: "https://placehold.co/600x400/1a1a1a/ffffff?text=React+Server+Components",
    duration: "12:45",
    user: {
      username: "DevMaster",
      avatar: "https://placehold.co/100x100/333/fff?text=DM"
    },
    views: "1.2M",
    uploadedAt: "2 days ago"
  },
  {
    id: 2,
    title: "10 CSS Tricks You Didn't Know Existed",
    thumbnail: "https://placehold.co/600x400/1a1a1a/ffffff?text=CSS+Tricks",
    duration: "8:20",
    user: {
      username: "StyleWizard",
      avatar: "https://placehold.co/100x100/333/fff?text=SW"
    },
    views: "850K",
    uploadedAt: "1 week ago"
  },
  {
    id: 3,
    title: "The Future of AI in Software Engineering",
    thumbnail: "https://placehold.co/600x400/1a1a1a/ffffff?text=AI+Future",
    duration: "15:10",
    user: {
      username: "TechPulse",
      avatar: "https://placehold.co/100x100/333/fff?text=TP"
    },
    views: "2.5M",
    uploadedAt: "3 hours ago"
  },
  {
    id: 4,
    title: "Building a YouTube Clone with React and Tailwind",
    thumbnail: "https://placehold.co/600x400/1a1a1a/ffffff?text=YouTube+Clone",
    duration: "45:30",
    user: {
      username: "CodeWithMe",
      avatar: "https://placehold.co/100x100/333/fff?text=CM"
    },
    views: "300K",
    uploadedAt: "5 days ago"
  },
  {
    id: 5,
    title: "Cyberpunk 2077: Phantom Liberty Gameplay",
    thumbnail: "https://placehold.co/600x400/1a1a1a/ffffff?text=Cyberpunk+2077",
    duration: "22:15",
    user: {
      username: "GamerPro",
      avatar: "https://placehold.co/100x100/333/fff?text=GP"
    },
    views: "1.8M",
    uploadedAt: "1 day ago"
  },
  {
    id: 6,
    title: "Mastering TypeScript in 60 Minutes",
    thumbnail: "https://placehold.co/600x400/1a1a1a/ffffff?text=TypeScript+Masterclass",
    duration: "59:59",
    user: {
      username: "TSExpert",
      avatar: "https://placehold.co/100x100/333/fff?text=TS"
    },
    views: "1.5M",
    uploadedAt: "2 weeks ago"
  }
];

// Pantalla de inicio con presentación de videos
const Index = () => {
    return(
        <div className="index-container">
            <div className="index-background">
                <PixelSnow 
                    color="#ffffff"
                    flakeSize={0.01}
                    minFlakeSize={1.25}
                    pixelResolution={200}
                    speed={1.25}
                    density={0.3}
                    direction={125}
                    brightness={1}
                    depthFade={8}
                    farPlane={20}
                    gamma={0.4545}
                    variant="square"
                />
            </div>
            <NavBar />
            <main className="index-content">
              <div className="video-grid">
                {MOCK_VIDEOS.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </main>
        </div>
    )
}

export default Index;