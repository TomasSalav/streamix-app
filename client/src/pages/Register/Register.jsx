import { useState } from 'react';
import PixelSnow from '../../components/PixelSnow/PixelSnow';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import useApi from '../../services/api';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { loading, error, signup } = useApi();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return;
        }

        const result = await signup(username, email, password);
        if (result?.token) {
            navigate('/login');
        }
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
                    {(error || password !== confirmPassword) && <div style={{color: '#f63049', marginBottom: '10px', textAlign: 'center'}}>{error || 'Las contraseñas no coinciden'}</div>}
                    <div className="form-group">
                        <label>Usuario</label>
                        <input 
                            type="text" 
                            placeholder="Cree su usuario..." 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
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
                            placeholder="Cree su contraseña..." 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Confirme su contraseña..." 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <Button type="submit" className="register-button" disabled={loading}>
                        {loading ? 'Cargando...' : 'Registrarse'}
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
