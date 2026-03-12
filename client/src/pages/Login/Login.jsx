import PixelSnow from '../../components/PixelSnow/PixelSnow';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './Login.css';

const Login = () => {
    // Pagina para ingresar su usuario
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="login-container">
            <div className="login-background">
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
            <SpotlightCard className='login-card' spotlightColor='rgba(246, 48, 73, 0.25)'>
                <div className="login-header">
                    <h1>Streamix</h1>
                    <p>Bienvenido de nuevo!</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Usuario</label>
                        <input type="text" placeholder="Ingrese su usuario..." required />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" placeholder="Ingrese su contraseña..." required />
                    </div>

                    <Button type="submit" className="login-button">
                        Iniciar Sesión
                    </Button>
                </form>
                <div className="login-footer">
                    <p>¿No tienes cuenta? <a onClick={() => navigate('/register')}>Regístrate</a></p>
                </div>
            </SpotlightCard>
        </div>
    )
}

export default Login;