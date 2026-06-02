import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css'
import logo from '../../assets/logo.png'

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    dob: formData.dob
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setError(data.message || "Inscription échouée. Réessayez.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("Impossible de se connecter au serveur. Vérifiez que le backend est démarré.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <img src={logo} alt="Panier Beldi Logo" className="signup-logo" />
                    <h1 className="signup-title">Créer un compte</h1>
                    <p className="signup-subtitle">Rejoignez Panier Beldi pour des produits traditionnels marocains</p>
                </div>

                {error && (
                    <div style={{ color: '#CC7351', textAlign: 'center', marginBottom: '16px', fontSize: '14px', fontWeight: '600', padding: '10px', background: '#FFF0E8', borderRadius: '8px' }}>
                        {error}
                    </div>
                )}

                <form className="signup-form" onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="firstName">Prénom</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    id="firstName"
                                    className="form-input"
                                    placeholder="Prénom"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="lastName">Nom</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    id="lastName"
                                    className="form-input"
                                    placeholder="Nom"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="dob">Date de naissance</label>
                        <div className="form-input-wrapper">
                            <input
                                type="date"
                                id="dob"
                                className="form-input"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="••••••••  (6 caractères minimum)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <div className="form-input-wrapper">
                            <input
                                type="password"
                                id="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? '⏳ Création...' : "Créer mon compte"}
                    </button>
                </form>

                <div className="signup-footer">
                    Déjà un compte ?
                    <Link to="/login" className="login-link"> Se connecter</Link>
                </div>
            </div>
        </div>
    )
}

export default Signup
