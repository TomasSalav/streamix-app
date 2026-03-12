import PixelSnow from '../../components/PixelSnow/PixelSnow';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './Register.css';

const Register = () => {
    // Página para crear un usuario
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="register-container">
            <div className="register-background">
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
            <SpotlightCard className='register-card' spotlightColor='rgba(246, 48, 73, 0.25)'>
                <div className="register-header">
                    <h1>Streamix</h1>
                    <p>Crea tu cuenta!</p>
                </div>
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Usuario</label>
                        <input type="text" placeholder="Cree su usuario..." required />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" placeholder="Cree su contraseña..." required />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input type="password" placeholder="Confirme su contraseña..." required />
                    </div>
                    <Button type="submit" className="register-button">
                        Registrarse
                    </Button>
                </form>
                <div className="register-footer">   
                    <p>¿Ya tienes cuenta? <a onClick={() => navigate('/login')}>Inicia Sesión</a></p>
                </div>
            </SpotlightCard>
        </div>
    )
}

export default Register;
