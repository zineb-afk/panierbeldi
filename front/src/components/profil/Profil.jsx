import React, { useState } from 'react'
import Navbar from '../navbar/Navbar'
import './Profil.css'

const Profil = () => {
  const storedUser = JSON.parse(localStorage.getItem('panierbeldi_user') || '{}');

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: storedUser.firstName || '',
    lastName: storedUser.lastName || '',
    email: storedUser.email || '',
    phone: storedUser.phone || '',
    address: storedUser.address || '',
    dob: storedUser.dob ? storedUser.dob.split('T')[0] : '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Mettre à jour le localStorage
    const updatedUser = { ...storedUser, ...form };
    localStorage.setItem('panierbeldi_user', JSON.stringify(updatedUser));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const statusColor = (status) => {
    if (status === 'Livré') return '#748E63';
    if (status === 'En cours') return '#CC7351';
    return '#9CA3AF';
  };

  const storedOrders = (() => {
    const raw = localStorage.getItem('panierbeldi_orders');
    return raw ? JSON.parse(raw) : [];
  })();

  const favorites = (() => {
    const raw = localStorage.getItem('panierbeldi_favorites');
    return raw ? JSON.parse(raw) : [];
  })();

  const orderHistory = storedOrders.length
    ? storedOrders.map((order) => {
        const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
        const status = elapsed >= 8 ? 'Livré' : 'En cours';
        return {
          id: order.id,
          date: new Date(order.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
          }),
          total: `${order.total} MAD`,
          status,
          items: order.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0,
        };
      })
    : [
        { id: '#PB-1042', date: '18 Avr 2026', total: '240 MAD', status: 'Livré', items: 3 },
        { id: '#PB-0981', date: '05 Avr 2026', total: '155 MAD', status: 'En cours', items: 2 },
      ];

  const displayName = form.firstName || 'Utilisateur';
  const initials = (form.firstName?.[0] || '?') + (form.lastName?.[0] || '');

  return (
    <div className="profil-page">
      <Navbar />
      <main className="profil-main">
        <div className="profil-header">
          <div className="profil-avatar">
            <span className="avatar-initials">{initials}</span>
          </div>
          <div className="profil-header-info">
            <h1 className="profil-name">{form.firstName} {form.lastName}</h1>
            <p className="profil-email">{form.email}</p>
            <span className="profil-badge">🌿 Client Beldi</span>
          </div>
        </div>

        {saved && (
          <div className="save-toast">✅ Profil mis à jour avec succès !</div>
        )}

        <div className="profil-content">
          {/* Info Card */}
          <div className="profil-card">
            <div className="card-head">
              <h2 className="card-title">Informations personnelles</h2>
              <button className="edit-btn" onClick={() => setEditing(!editing)}>
                {editing ? '✕ Annuler' : '✏️ Modifier'}
              </button>
            </div>

            <form className="profil-form" onSubmit={handleSave}>
              <div className="form-grid">
                <div className="pf-group">
                  <label htmlFor="firstName">Prénom</label>
                  <input id="firstName" type="text" value={form.firstName} onChange={handleChange} disabled={!editing} className={editing ? 'active' : ''} />
                </div>
                <div className="pf-group">
                  <label htmlFor="lastName">Nom</label>
                  <input id="lastName" type="text" value={form.lastName} onChange={handleChange} disabled={!editing} className={editing ? 'active' : ''} />
                </div>
                <div className="pf-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} onChange={handleChange} disabled={!editing} className={editing ? 'active' : ''} />
                </div>
                <div className="pf-group">
                  <label htmlFor="phone">Téléphone</label>
                  <input id="phone" type="tel" value={form.phone} onChange={handleChange} disabled={!editing} className={editing ? 'active' : ''} placeholder="+212 6 XX XX XX XX" />
                </div>
                <div className="pf-group pf-full">
                  <label htmlFor="address">Adresse</label>
                  <input id="address" type="text" value={form.address} onChange={handleChange} disabled={!editing} className={editing ? 'active' : ''} placeholder="Votre adresse complète" />
                </div>
                <div className="pf-group">
                  <label htmlFor="dob">Date de naissance</label>
                  <input id="dob" type="date" value={form.dob} onChange={handleChange} disabled={!editing} className={editing ? 'active' : ''} />
                </div>
              </div>

              {editing && (
                <button type="submit" className="save-btn">
                  💾 Enregistrer les modifications
                </button>
              )}
            </form>
          </div>

          {/* Stats */}
          <div className="profil-stats">
            <div className="pstat-card">
              <span className="pstat-icon">📦</span>
              <span className="pstat-value">{orderHistory.length}</span>
              <span className="pstat-label">Commandes</span>
            </div>
            <div className="pstat-card">
              <span className="pstat-icon">💚</span>
              <span className="pstat-value">{favorites.length}</span>
              <span className="pstat-label">Favoris</span>
            </div>
            <div className="pstat-card">
              <span className="pstat-icon">⭐</span>
              <span className="pstat-value">4.8</span>
              <span className="pstat-label">Note moyenne</span>
            </div>
          </div>

          {/* Order History */}
          <div className="profil-card orders-card">
            <div className="card-head">
              <h2 className="card-title">Historique des commandes</h2>
            </div>
            {orderHistory.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>Aucune commande pour l'instant.</p>
            ) : (
              <div className="orders-list">
                {orderHistory.map(order => (
                  <div key={order.id} className="order-row">
                    <div className="order-main">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">{order.date}</span>
                    </div>
                    <div className="order-secondary">
                      <span className="order-items">{order.items} articles</span>
                      <span className="order-total">{order.total}</span>
                      <span className="order-status" style={{ color: statusColor(order.status), background: statusColor(order.status) + '20' }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profil
