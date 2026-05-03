import { useState, useEffect } from 'react';
import Button from '../Button/Button';
import { useNavigate } from "react-router-dom";
import useApi from '../../services/api';
import ProfileModal from '../ProfileModal/ProfileModal';
import UploadVideoModal from '../UploadVideoModal/UploadVideoModal';
import defaultAvatar from '../../assets/default.jpg';
import './NavBar.css';

const NavBar = ({ onSearch }) => {
    const navigate = useNavigate();
    const { getCurrentUser, logout } = useApi();
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Carga los datos del usuario actual si hay un token válido en el navegador
    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await getCurrentUser();
                if (res?.usuario) {
                    setUser(res.usuario);
                } else {
                    // Si el token no es válido o expiró, lo limpiamos
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Error cargando usuario:", error);
            }
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Proceso de cierre de sesión: limpia el estado y redirige al inicio
    const handleLogout = async () => {
        await logout();
        setUser(null);
        navigate('/');
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-logo">
                    <h1 onClick={() => navigate('/')} style={{cursor: 'pointer'}}>Streamix</h1>
                </div>
                <div className="navbar-links">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                        type="text" 
                        placeholder='¿Qué quieres ver hoy?'
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </div>
                <div className="profile">
                    {user ? (
                        <>
                            <Button onClick={() => setIsUploadModalOpen(true)} style={{ backgroundColor: 'transparent', border: '1px solid var(--light-red)' }} className="nav-btn">
                                <i className="fa-solid fa-plus"></i>
                                <p className="hide-on-mobile">Subir Video</p>
                            </Button>
                            <Button onClick={handleLogout} className="nav-btn">
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                <p className="hide-on-mobile">Cerrar Sesión</p>                    
                            </Button>
                            <div className="profile-picture" onClick={() => setIsModalOpen(true)}>
                                <img src={user.avatar_url || defaultAvatar} alt="Perfil" />
                            </div>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => navigate('/login')} style={{ backgroundColor: 'transparent', border: '1px solid var(--light-red)' }} className="nav-btn">
                                <span className="hide-on-mobile">Iniciar Sesión</span>
                                <i className="fa-solid fa-user show-on-mobile"></i>
                            </Button>
                            <Button onClick={() => navigate('/register')} className="nav-btn hide-on-mobile">
                                Registrarse
                            </Button>
                        </>
                    )}
                </div>
            </nav>
            {isModalOpen && (
                <ProfileModal 
                    user={user} 
                    onClose={() => setIsModalOpen(false)} 
                    onUpdate={loadUser}
                />
            )}
            {isUploadModalOpen && (
                <UploadVideoModal
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadSuccess={() => {
                        if (window.location.pathname === '/') {
                            window.location.reload();
                        } else {
                            navigate('/');
                        }
                    }}
                />
            )}
        </>
    )
}

export default NavBar;
