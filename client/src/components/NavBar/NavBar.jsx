import Button from '../Button/Button';
import { useNavigate } from "react-router-dom";
import './NavBar.css';

const NavBar = () => {
    // Componente de barra de navegación

    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <h1>Streamix</h1>
            </div>
            <div className="navbar-links">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder='¿Qué quieres ver hoy?'/>
            </div>
            <div className="profile">
                <Button onClick={() => navigate('/login')}>
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    <p>Log Out</p>                    
                </Button>
                <div className="profile-picture">
                </div>
            </div>
        </nav>
    )
}

export default NavBar;
