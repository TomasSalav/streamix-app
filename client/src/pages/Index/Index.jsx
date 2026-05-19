import { useState, useEffect, useMemo } from "react";
import PixelSnow from "../../components/PixelSnow/PixelSnow";
import NavBar from "../../components/NavBar/NavBar";
import VideoCard from "../../components/VideoCard/VideoCard";
import useApi from "../../services/api";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import './Index.css';

// Pantalla de inicio con presentación de videos
const Index = () => {
    const { loading, error, getVideos, getLikedVideos, getWatchLater, getMyList, getSubscriptionVideos, getCurrentUser } = useApi();
    const [videos, setVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("home");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (localStorage.getItem('token')) {
                const res = await getCurrentUser();
                if (res?.usuario) {
                    setIsAuthenticated(true);
                    return;
                }
            }
            setIsAuthenticated(false);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const loadVideos = async () => {
            let res;
            if (activeCategory === 'home') {
                res = await getVideos();
            } else if (activeCategory === 'liked') {
                res = await getLikedVideos();
            } else if (activeCategory === 'watch_later') {
                res = await getWatchLater();
            } else if (activeCategory === 'my_list') {
                res = await getMyList();
            } else if (activeCategory === 'subscriptions') {
                res = await getSubscriptionVideos();
            }
            
            if (res?.videos) {
                setVideos(res.videos);
            } else {
                setVideos([]);
            }
        };

        loadVideos();
    }, [activeCategory]);

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
            <NavBar 
                onSearch={setSearchTerm} 
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            {isAuthenticated && (
                <LeftSidebar 
                    isOpen={isSidebarOpen} 
                    activeCategory={activeCategory} 
                    onSelectCategory={(cat) => {
                        setActiveCategory(cat);
                        if (window.innerWidth <= 768) setIsSidebarOpen(false);
                    }} 
                />
            )}
            <main className={`index-content ${isAuthenticated && isSidebarOpen ? 'sidebar-open' : ''}`}>
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
