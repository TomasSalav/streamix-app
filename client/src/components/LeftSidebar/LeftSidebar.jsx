import React from 'react';
import './LeftSidebar.css';

const LeftSidebar = ({ isOpen, onSelectCategory, activeCategory }) => {
    return (
        <aside className={`left-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-section">
                <button 
                    className={`sidebar-item ${activeCategory === 'home' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('home')}
                >
                    <i className="fa-solid fa-house"></i>
                    <span>Inicio</span>
                </button>
            </div>
            
            <div className="sidebar-section">
                <h3>Mi Biblioteca</h3>
                <button 
                    className={`sidebar-item ${activeCategory === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('subscriptions')}
                >
                    <i className="fa-solid fa-users"></i>
                    <span>Suscripciones</span>
                </button>
                <button 
                    className={`sidebar-item ${activeCategory === 'watch_later' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('watch_later')}
                >
                    <i className="fa-solid fa-clock"></i>
                    <span>Ver más tarde</span>
                </button>
                <button 
                    className={`sidebar-item ${activeCategory === 'my_list' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('my_list')}
                >
                    <i className="fa-solid fa-list"></i>
                    <span>Mi Lista</span>
                </button>
                <button 
                    className={`sidebar-item ${activeCategory === 'liked' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('liked')}
                >
                    <i className="fa-solid fa-thumbs-up"></i>
                    <span>Videos que me gustan</span>
                </button>
            </div>
        </aside>
    );
};

export default LeftSidebar;
