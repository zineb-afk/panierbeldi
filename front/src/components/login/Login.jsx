import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'
import logo from '../../assets/logo.png'

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Stocker les infos utilisateur
                localStorage.setItem('panierbeldi_user', JSON.stringify(data.user));
                navigate('/home');
            } else {
                setError(data.message || "Connexion échouée. Vérifiez vos identifiants.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Impossible de se connecter au serveur. Vérifiez que le backend est démarré.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src={logo} alt="Panier Beldi Logo" className="login-logo" />
                    <h1 className="login-title">Bon retour !</h1>
                    <p className="login-subtitle">Connectez-vous à votre compte Panier Beldi</p>
                </div>

                {error && (
                    <div style={{ color: '#CC7351', textAlign: 'center', marginBottom: '16px', fontSize: '14px', fontWeight: '600', padding: '10px', background: '#FFF0E8', borderRadius: '8px' }}>
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Adresse email</label>
                        <div className="form-input-wrapper">
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="nom@exemple.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Mot de passe</label>
                        <div className="form-input-wrapper">
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            Se souvenir de moi
                        </label>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? '⏳ Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div className="login-footer">
                    Pas encore de compte ?
                    <Link to="/signup" className="signup-link"> S'inscrire</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
