import { useState, useEffect, useMemo } from "react";
import PixelSnow from "../../components/PixelSnow/PixelSnow";
import NavBar from "../../components/NavBar/NavBar";
import VideoCard from "../../components/VideoCard/VideoCard";
import { mockFetchVideos } from "../../services/api";
import './Index.css';

// Pantalla de inicio con presentación de videos
const Index = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadVideos = async () => {
            try {
                const res = await mockFetchVideos();
                if (res.success) {
                    setVideos(res.data);
                }
            } catch (err) {
                console.error("Error fetching videos:", err);
            } finally {
                setLoading(false);
            }
        };

        loadVideos();
    }, []);

    const filteredVideos = useMemo(() => {
        if (!searchTerm) return videos;
        return videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [videos, searchTerm]);

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
            <NavBar onSearch={setSearchTerm} />
            <main className="index-content">
              {loading ? (
                <div style={{color: "white", textAlign: "center", marginTop: "50px"}}>Cargando videos...</div>
              ) : (
                <div className="video-grid">
                  {filteredVideos.length > 0 ? (
                      filteredVideos.map(video => (
                        <VideoCard key={video.id} video={video} />
                      ))
                  ) : (
                      <div style={{color: "white", textAlign: "center", width: "100%", marginTop: "50px"}}>
                          No se encontraron videos para "{searchTerm}"
                      </div>
                  )}
                </div>
              )}
            </main>
        </div>
    )
}

export default Index;