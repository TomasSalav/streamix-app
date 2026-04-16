import { useState } from 'react';
import PixelSnow from '../../components/PixelSnow/PixelSnow';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { mockLogin } from '../../services/api';
import './Login.css';

const Login = () => {
    // Pagina para ingresar su usuario
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await mockLogin(username, password);
            if (res.success) {
                // Ir a index exitosamente
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                    {error && <div style={{color: '#f63049', marginBottom: '10px', textAlign: 'center'}}>{error}</div>}
                    <div className="form-group">
                        <label>Usuario</label>
                        <input 
                            type="text" 
                            placeholder="Ingrese su usuario..." 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Ingrese su contraseña..." 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <Button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Cargando...' : 'Iniciar Sesión'}
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