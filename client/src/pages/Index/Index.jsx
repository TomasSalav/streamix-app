import PixelSnow from "../../components/PixelSnow/PixelSnow";
import NavBar from "../../components/NavBar/NavBar";
import './Index.css';

const Index = () => {
    // Página de inicio
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
        </div>
    )
}

export default Index;