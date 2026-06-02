import React, { useState, useEffect } from 'react'
import Navbar from '../navbar/Navbar'
import './Livraisons.css'

const getTrackingState = (order) => {
  if (!order) return null;
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  let phase = 'confirmed';
  if (elapsed >= 8) phase = 'delivered';
  else if (elapsed >= 5) phase = 'on_road';
  else if (elapsed >= 2) phase = 'preparing';

  const steps = [
    {
      icon: '✓',
      label: 'Commande confirmée',
      time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: ['confirmed', 'preparing', 'on_road', 'delivered'].includes(phase) ? 'done' : 'pending',
    },
    {
      icon: '✓',
      label: 'En préparation',
      time: '5-10 min',
      status: ['preparing', 'on_road', 'delivered'].includes(phase) ? 'done' : phase === 'confirmed' ? 'active' : 'pending',
    },
    {
      icon: '🚴',
      label: 'En route vers vous',
      time: phase === 'on_road' ? 'ETA ~15 min' : 'Bientôt',
      status: phase === 'on_road' || phase === 'delivered' ? 'done' : 'pending',
    },
    {
      icon: '🏠',
      label: 'Livré chez vous',
      time: phase === 'delivered' ? 'Terminé' : 'En attente',
      status: phase === 'delivered' ? 'done' : 'pending',
    },
  ];

  const progress = phase === 'confirmed' ? 20 : phase === 'preparing' ? 45 : phase === 'on_road' ? 70 : 100;
  return { steps, progress, phase };
};

const zones = [
  { city: 'Fès Centre-ville', delay: '1-2h', price: 'Gratuite dès 200 MAD' },
  { city: 'Fès El Bali (Médina)', delay: '1-2h', price: 'Gratuite dès 200 MAD' },
  { city: 'Fès El Jadid', delay: '1-2h', price: 'Gratuite dès 200 MAD' },
  { city: 'Agdal', delay: '1-3h', price: '15 MAD' },
  { city: 'Saiss', delay: '1-3h', price: '15 MAD' },
  { city: 'Route d\'Imouzzer', delay: '2-3h', price: '20 MAD' },
  { city: 'Aïn Chkef', delay: '2-3h', price: '20 MAD' },
];

const Livraisons = () => {
  const [trackCode, setTrackCode] = useState('');
  const [tracking, setTracking] = useState(false);
  const [motoPos, setMotoPos] = useState(50); // animated position
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('panierbeldi_orders');
    const parsed = raw ? JSON.parse(raw) : [];
    setOrders(parsed);
    if (parsed.length) {
      setActiveOrder(parsed[0]);
      setTrackCode(parsed[0].id);
      setTracking(true);
    }
  }, []);

  useEffect(() => {
    if (!tracking) return;
    const interval = setInterval(() => {
      setMotoPos(prev => (prev >= 70 ? 30 : prev + 0.3));
    }, 50);
    return () => clearInterval(interval);
  }, [tracking]);

  const trackingState = getTrackingState(activeOrder);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;
    const found = orders.find((order) => order.id.toLowerCase() === trackCode.trim().toLowerCase());
    if (found) {
      setActiveOrder(found);
      setTracking(true);
      setNotFound(false);
      setMotoPos(50);
      return;
    }
    setNotFound(true);
    setTracking(false);
  };

  return (
    <div className="livraisons-page">
      <Navbar />
      <main className="livraisons-main">

        <div className="liv-layout">

          {/* Left column */}
          <div className="liv-left">

            {/* Track form */}
            <div className="liv-card">
              <h1 className="liv-page-title">Suivi de livraison 🚚</h1>
              <p className="liv-page-sub">Entrez votre numéro de commande pour suivre votre livraison en temps réel</p>
              <form className="track-form" onSubmit={handleTrack}>
                <input
                  type="text"
                  className="track-input"
                  placeholder="ex: #CMD-1047"
                  value={trackCode}
                  onChange={e => { setTrackCode(e.target.value); setTracking(false); }}
                />
                <button type="submit" className="track-btn">Suivre →</button>
              </form>
              {notFound && <p className="track-notfound">Commande introuvable. Vérifie le code ou passe une nouvelle commande.</p>}
              {!!orders.length && (
                <div className="recent-orders">
                  <span>Commandes récentes:</span>
                  <div className="recent-orders-row">
                    {orders.slice(0, 3).map((order) => (
                      <button
                        key={order.id}
                        className="recent-order-btn"
                        onClick={() => {
                          setTrackCode(order.id);
                          setActiveOrder(order);
                          setTracking(true);
                          setNotFound(false);
                        }}
                      >
                        {order.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map + Steps */}
            {tracking && activeOrder && trackingState && (
              <div className="tracking-layout">

                {/* Map */}
                <div className="map-card">
                  <div className="map-header">
                    <div>
                      <h2 className="map-order">Suivi de livraison</h2>
                      <p className="map-meta">Commande {activeOrder.id} · {activeOrder.total} MAD</p>
                    </div>
                    <span className="map-badge live">
                      {trackingState.phase === 'delivered' ? '● LIVRÉE' : '● EN DIRECT'}
                    </span>
                  </div>

                  <div className="map-visual">
                    <div className="map-grid">
                      <div className="map-oval"></div>
                      <div
                        className="map-moto"
                        style={{ left: `${Math.min(85, Math.max(15, motoPos + (trackingState.progress - 50)))}%` }}
                      >🏍️</div>
                    </div>
                  </div>

                  {/* Deliveryman */}
                  <div className="driver-banner">
                    <div className="driver-avatar">👨</div>
                    <div className="driver-info">
                      <span className="driver-label">Votre livreur</span>
                      <span className="driver-name">Youssef A.</span>
                      <span className="driver-dist">
                        📍 {trackingState.phase === 'delivered' ? 'Commande livrée' : 'À 2.3 km — ~15 min'}
                      </span>
                    </div>
                    <button className="driver-call">📞</button>
                  </div>
                </div>

                {/* Steps */}
                <div className="steps-card">
                  <h2 className="steps-title">Étapes de livraison</h2>
                  <div className="steps-list">
                    {trackingState.steps.map((step, idx) => (
                      <div key={idx} className={`step-item ${step.status}`}>
                        <div className="step-left">
                          <div className="step-dot">{step.icon}</div>
                          {idx < trackingState.steps.length - 1 && (
                            <div className={`step-line ${trackingState.steps[idx + 1].status !== 'pending' ? 'done' : ''}`} />
                          )}
                        </div>
                        <div className="step-right">
                          <span className="step-label">{step.label}</span>
                          <span className="step-time">{step.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Info cards */}
            <div className="liv-info-grid">
              {[
                { icon: '🕐', title: 'Délais', text: 'Livraison en 24 à 72h selon votre ville.' },
                { icon: '💚', title: 'Gratuite', text: 'Offerte dès 200 MAD de commande.' },
                { icon: '🔄', title: 'Retours', text: '7 jours pour retourner sans frais.' },
                { icon: '📫', title: 'À domicile', text: 'SMS de confirmation à chaque étape.' },
              ].map((c, i) => (
                <div key={i} className="info-mini-card">
                  <span className="info-mini-icon">{c.icon}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column – zones */}
          <div className="liv-right">
            <div className="zones-card">
              <h2 className="zones-title">Zones de livraison</h2>
              <div className="zones-head-row">
                <span>Ville</span><span>Délai</span><span>Tarif</span>
              </div>
              {zones.map((z, i) => (
                <div key={i} className="zones-data-row">
                  <span>📍 {z.city}</span>
                  <span>⏱ {z.delay}</span>
                  <span className="zone-price">{z.price}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Livraisons;