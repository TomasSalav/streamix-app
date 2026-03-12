import Button from '../Button/Button';
import './NavBar.css';

const NavBar = () => {
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
                <Button>
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
