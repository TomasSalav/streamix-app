import Button from '../Button/Button';
import { useNavigate } from "react-router-dom";
import './NavBar.css';

const NavBar = ({ onSearch }) => {
    // Componente de barra de navegación

    const navigate = useNavigate();

    return (
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
                <Button onClick={() => navigate('/login')}>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <p>Log Out</p>                    
                </Button>
                <div className="profile-picture">
                </div>
            </div>
        </nav>
    )
}

export default NavBar;
