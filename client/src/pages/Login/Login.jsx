import { useState, useEffect } from 'react';
import PixelSnow from '../../components/PixelSnow/PixelSnow';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import useApi from '../../services/api';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { loading, error, login } = useApi();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(email, password);
        if (result?.token) {
            navigate('/');
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
                        <label>Email</label>
                        <input 
                            type="email" 
                            placeholder="Ingrese su correo..." 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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