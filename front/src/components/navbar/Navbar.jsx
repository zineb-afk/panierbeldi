import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './Navbar.css'

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    React.useEffect(() => {
        const refreshCount = () => {
            const raw = localStorage.getItem('panierbeldi_cart');
            const items = raw ? JSON.parse(raw) : [];
            const total = items.reduce((sum, item) => sum + (item.qty || 0), 0);
            setCartCount(total);
        };

        refreshCount();
        window.addEventListener('cart-updated', refreshCount);
        window.addEventListener('storage', refreshCount);
        return () => {
            window.removeEventListener('cart-updated', refreshCount);
            window.removeEventListener('storage', refreshCount);
        };
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('panierbeldi_user');
        navigate('/login');
    };

    const navLinks = [
        { path: '/home', label: 'Accueil', icon: '🏠' },
        { path: '/panier', label: 'Panier', icon: '🧺', isCart: true },
        { path: '/livraisons', label: 'Livraisons', icon: '🚚' },
        { path: '/profil', label: 'Profil', icon: '👤' },
        { path: '/contact', label: 'Contact', icon: '✉️' },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/home" className="navbar-brand">
                    <img src={logo} alt="Panier Beldi" className="navbar-logo" />
                    <span className="navbar-name">Panier Beldi</span>
                </Link>

                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {navLinks.map(link => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                {link.label}
                                {link.isCart && cartCount > 0 && (
                                    <span className="cart-badge">{cartCount}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="navbar-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        Déconnexion
                    </button>
                    <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
