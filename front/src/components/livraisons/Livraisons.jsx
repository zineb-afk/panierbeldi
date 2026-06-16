import React, { useState, useEffect, useCallback } from 'react'
import Navbar from '../navbar/Navbar'
import './Livraisons.css'

const API = 'http://localhost:5000/api';

// ── Statuts réels depuis la DB ────────────────────────────────────────────────
const STATUS_CONFIG = {
  confirmed: {
    label: 'Commande confirmée',
    step: 0,
    progress: 20,
    icon: '✓',
    color: '#3B82F6',
  },
  preparing: {
    label: 'En préparation',
    step: 1,
    progress: 45,
    icon: '⚙️',
    color: '#F59E0B',
  },
  on_road: {
    label: 'En route vers vous',
    step: 2,
    progress: 75,
    icon: '🚴',
    color: '#CC7351',
  },
  delivered: {
    label: 'Livré chez vous',
    step: 3,
    progress: 100,
    icon: '🏠',
    color: '#748E63',
  },
  cancelled: {
    label: 'Annulée',
    step: -1,
    progress: 0,
    icon: '✕',
    color: '#DC2626',
  },
};

const STEPS = ['confirmed', 'preparing', 'on_road', 'delivered'];

const getTrackingState = (order) => {
  if (!order) return null;

  // Utilise le vrai statut de la DB si disponible
  const phase = order.status && STATUS_CONFIG[order.status]
    ? order.status
    : 'confirmed';

  if (phase === 'cancelled') {
    return {
      phase,
      progress: 0,
      steps: STEPS.map((s, idx) => ({
        icon: STATUS_CONFIG[s].icon,
        label: STATUS_CONFIG[s].label,
        status: 'pending',
        time: '—',
      })),
    };
  }

  const currentStep = STATUS_CONFIG[phase].step;
  const progress = STATUS_CONFIG[phase].progress;

  const steps = STEPS.map((s, idx) => {
    let status = 'pending';
    if (idx < currentStep) status = 'done';
    else if (idx === currentStep) status = 'active';

    let time = '—';
    if (s === 'confirmed') {
      time = order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '—';
    } else if (s === 'preparing') {
      time = status === 'done' || status === 'active' ? '5-10 min' : 'En attente';
    } else if (s === 'on_road') {
      time = status === 'active' ? 'ETA ~15 min' : status === 'done' ? 'En cours' : 'En attente';
    } else if (s === 'delivered') {
      time = status === 'done' ? 'Terminé ✓' : 'En attente';
    }

    return {
      icon: STATUS_CONFIG[s].icon,
      label: STATUS_CONFIG[s].label,
      status,
      time,
      color: STATUS_CONFIG[s].color,
    };
  });

  return { steps, progress, phase };
};

const zones = [
  { city: 'Fès Centre-ville',    delay: '1-2h',  price: 'Gratuite dès 200 MAD' },
  { city: 'Fès El Bali (Médina)', delay: '1-2h', price: 'Gratuite dès 200 MAD' },
  { city: 'Fès El Jadid',        delay: '1-2h',  price: 'Gratuite dès 200 MAD' },
  { city: 'Agdal',               delay: '1-3h',  price: '15 MAD' },
  { city: 'Saiss',               delay: '1-3h',  price: '15 MAD' },
  { city: "Route d'Imouzzer",    delay: '2-3h',  price: '20 MAD' },
  { city: 'Aïn Chkef',          delay: '2-3h',  price: '20 MAD' },
];

const Livraisons = () => {
  const [trackCode, setTrackCode]     = useState('');
  const [tracking, setTracking]       = useState(false);
  const [motoPos, setMotoPos]         = useState(30);
  const [orders, setOrders]           = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [notFound, setNotFound]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  // ── Charger les commandes : API + localStorage ──────────────────────────────
  const loadOrders = useCallback(async () => {
    // 1. Local d'abord pour affichage immédiat
    const local = JSON.parse(localStorage.getItem('panierbeldi_orders') || '[]');

    // 2. Fetch API pour avoir les vrais statuts
    try {
      const res = await fetch(`${API}/orders`);
      const apiOrders = await res.json();
      if (Array.isArray(apiOrders) && apiOrders.length) {
        // Normaliser les IDs
        const normalized = apiOrders.map(o => ({
          ...o,
          id: o.orderId || o._id,
        }));

        // Fusionner : préférer les données API (statut réel)
        const localIds = local.map(o => o.id);
        const apiIds   = normalized.map(o => o.id);

        // Commandes API mises à jour + commandes locales non encore en DB
        const merged = [
          ...normalized,
          ...local.filter(o => !apiIds.includes(o.id) && !apiIds.includes(o._id)),
        ];

        setOrders(merged);

        // Mettre à jour le localStorage avec les vrais statuts
        localStorage.setItem('panierbeldi_orders', JSON.stringify(merged));

        return merged;
      }
    } catch (err) {
      console.warn('API non disponible, utilisation du localStorage');
    }

    setOrders(local);
    return local;
  }, []);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const loaded = await loadOrders();
      setLoading(false);

      if (loaded.length) {
        const first = loaded[0];
        setActiveOrder(first);
        setTrackCode(first.id || first.orderId || '');
        setTracking(true);
      }
    };
    init();
  }, [loadOrders]);

  // ── Auto-refresh toutes les 30s pour mettre à jour le statut ───────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!activeOrder) return;
      setRefreshing(true);
      const loaded = await loadOrders();

      // Mettre à jour l'ordre actif avec le nouveau statut
      const updated = loaded.find(
        o => o.id === activeOrder.id || o._id === activeOrder._id || o.orderId === activeOrder.id
      );
      if (updated) setActiveOrder(updated);
      setRefreshing(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeOrder, loadOrders]);

  // ── Animation moto ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tracking) return;
    const interval = setInterval(() => {
      setMotoPos(prev => (prev >= 72 ? 28 : prev + 0.25));
    }, 50);
    return () => clearInterval(interval);
  }, [tracking]);

  const trackingState = getTrackingState(activeOrder);

  // ── Recherche commande ──────────────────────────────────────────────────────
  const handleTrack = async (e) => {
    e.preventDefault();
    const code = trackCode.trim().toLowerCase();
    if (!code) return;

    setLoading(true);
    setNotFound(false);

    // Chercher d'abord dans les ordres chargés
    let found = orders.find(
      o => (o.id || '').toLowerCase() === code ||
           (o.orderId || '').toLowerCase() === code ||
           (o._id || '').toLowerCase() === code
    );

    // Si pas trouvé localement, essayer l'API directement
    if (!found) {
      try {
        const res = await fetch(`${API}/orders`);
        const all = await res.json();
        if (Array.isArray(all)) {
          found = all.find(
            o => (o.orderId || '').toLowerCase() === code ||
                 (o._id || '').toLowerCase() === code
          );
          if (found) found = { ...found, id: found.orderId || found._id };
        }
      } catch (err) {}
    }

    setLoading(false);

    if (found) {
      setActiveOrder(found);
      setTracking(true);
      setNotFound(false);
      setMotoPos(30);
    } else {
      setNotFound(true);
      setTracking(false);
      setActiveOrder(null);
    }
  };

  // ── Refresh manuel ──────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!activeOrder) return;
    setRefreshing(true);
    const loaded = await loadOrders();
    const updated = loaded.find(
      o => o.id === activeOrder.id || o._id === activeOrder._id || o.orderId === activeOrder.id
    );
    if (updated) setActiveOrder(updated);
    setRefreshing(false);
  };

  return (
    <div className="livraisons-page">
      <Navbar />
      <main className="livraisons-main">
        <div className="liv-layout">

          {/* ── Colonne gauche ─────────────────────────────────────────────── */}
          <div className="liv-left">

            {/* Formulaire de suivi */}
            <div className="liv-card">
              <h1 className="liv-page-title">Suivi de livraison 🚚</h1>
              <p className="liv-page-sub">Entrez votre numéro de commande pour suivre votre livraison en temps réel</p>

              <form className="track-form" onSubmit={handleTrack}>
                <input
                  type="text"
                  className="track-input"
                  placeholder="ex: #CMD-1047"
                  value={trackCode}
                  onChange={e => { setTrackCode(e.target.value); setTracking(false); setNotFound(false); }}
                />
                <button type="submit" className="track-btn" disabled={loading}>
                  {loading ? '⏳' : 'Suivre →'}
                </button>
              </form>

              {notFound && (
                <p className="track-notfound">
                  ❌ Commande introuvable. Vérifiez le numéro ou passez une nouvelle commande.
                </p>
              )}

              {orders.length > 0 && (
                <div className="recent-orders">
                  <span>Commandes récentes :</span>
                  <div className="recent-orders-row">
                    {orders.slice(0, 4).map((order, i) => (
                      <button
                        key={order.id || i}
                        className={`recent-order-btn ${activeOrder?.id === order.id ? 'active' : ''}`}
                        onClick={() => {
                          setTrackCode(order.id || order.orderId || '');
                          setActiveOrder(order);
                          setTracking(true);
                          setNotFound(false);
                          setMotoPos(30);
                        }}
                      >
                        {order.id || order.orderId}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suivi actif */}
            {tracking && activeOrder && trackingState && (
              <div className="tracking-layout">

                {/* Carte carte map */}
                <div className="map-card">
                  <div className="map-header">
                    <div>
                      <h2 className="map-order">
                        Commande {activeOrder.id || activeOrder.orderId}
                      </h2>
                      <p className="map-meta">
                        {activeOrder.total} MAD ·{' '}
                        {activeOrder.createdAt
                          ? new Date(activeOrder.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                          : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={handleRefresh}
                        style={{
                          background: 'none', border: '1.5px solid #E5E7EB', borderRadius: '8px',
                          padding: '4px 10px', cursor: 'pointer', fontSize: '13px',
                          color: '#6B7280', fontFamily: 'inherit',
                        }}
                        title="Actualiser le statut"
                      >
                        {refreshing ? '⏳' : '🔄'}
                      </button>
                      <span className={`map-badge ${trackingState.phase === 'delivered' ? 'delivered' : 'live'}`}>
                        {trackingState.phase === 'delivered'
                          ? '✓ LIVRÉE'
                          : trackingState.phase === 'cancelled'
                          ? '✕ ANNULÉE'
                          : '● EN COURS'}
                      </span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
                      <span>Progression</span>
                      <span style={{ fontWeight: 700, color: STATUS_CONFIG[trackingState.phase]?.color || '#748E63' }}>
                        {trackingState.progress}%
                      </span>
                    </div>
                    <div style={{ background: '#F3F4F6', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${trackingState.progress}%`,
                        background: `linear-gradient(90deg, #748E63, ${STATUS_CONFIG[trackingState.phase]?.color || '#748E63'})`,
                        borderRadius: '8px',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>

                  {/* Map animée */}
                  {trackingState.phase !== 'delivered' && trackingState.phase !== 'cancelled' && (
                    <div className="map-visual">
                      <div className="map-grid">
                        <div className="map-oval"></div>
                        <div
                          className="map-moto"
                          style={{
                            left: `${Math.min(82, Math.max(15, motoPos + (trackingState.progress - 50) * 0.4))}%`,
                          }}
                        >
                          🏍️
                        </div>
                      </div>
                    </div>
                  )}

                  {trackingState.phase === 'delivered' && (
                    <div style={{
                      margin: '0 16px 16px',
                      background: 'rgba(116,142,99,0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '36px', marginBottom: '6px' }}>🏠</div>
                      <div style={{ fontWeight: 700, color: '#3D6635', fontSize: '15px' }}>Commande livrée avec succès !</div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Merci d'avoir choisi Panier Beldi 🧺</div>
                    </div>
                  )}

                  {/* Articles commandés */}
                  {activeOrder.items && activeOrder.items.length > 0 && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' }}>
                        Articles commandés
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {activeOrder.items.map((item, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', background: '#F9F9F6',
                            borderRadius: '10px', borderLeft: '3px solid #748E63',
                          }}>
                            <span style={{ fontSize: '20px' }}>{item.emoji || '📦'}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: '11px', color: '#6B7280' }}>Qté : {item.qty || 1}</div>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#CC7351' }}>
                              {((item.price || 0) * (item.qty || 1))} MAD
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 800, fontSize: '15px', borderTop: '1px solid #F3F4F6', marginTop: '8px' }}>
                        <span>Total</span>
                        <span>{activeOrder.total} MAD</span>
                      </div>
                    </div>
                  )}

                  {/* Livreur */}
                  {trackingState.phase !== 'cancelled' && (
                    <div className="driver-banner">
                      <div className="driver-avatar">👨</div>
                      <div className="driver-info">
                        <span className="driver-label">Votre livreur</span>
                        <span className="driver-name">Youssef A.</span>
                        <span className="driver-dist">
                          {trackingState.phase === 'delivered'
                            ? '✓ Commande livrée'
                            : trackingState.phase === 'on_road'
                            ? '📍 À 2.3 km — ~15 min'
                            : '📍 En préparation au dépôt'}
                        </span>
                      </div>
                      <button className="driver-call">📞</button>
                    </div>
                  )}
                </div>

                {/* Étapes */}
                <div className="steps-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className="steps-title" style={{ margin: 0 }}>Étapes de livraison</h2>
                    {refreshing && <span style={{ fontSize: '12px', color: '#6B7280' }}>Mise à jour...</span>}
                  </div>
                  <div className="steps-list">
                    {trackingState.steps.map((step, idx) => (
                      <div key={idx} className={`step-item ${step.status}`}>
                        <div className="step-left">
                          <div
                            className="step-dot"
                            style={step.status === 'active' ? { background: step.color, color: '#fff', borderColor: step.color } : {}}
                          >
                            {step.icon}
                          </div>
                          {idx < trackingState.steps.length - 1 && (
                            <div className={`step-line ${step.status === 'done' ? 'done' : ''}`} />
                          )}
                        </div>
                        <div className="step-right">
                          <span className="step-label">{step.label}</span>
                          <span className="step-time">{step.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Infos client */}
                  {activeOrder.customer && (
                    <div style={{
                      marginTop: '20px', padding: '14px', background: '#F9F9F6',
                      borderRadius: '12px', fontSize: '13px',
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: '8px', color: '#2D3E2F' }}>📦 Informations de livraison</div>
                      <div style={{ color: '#6B7280', lineHeight: 1.8 }}>
                        <div>👤 {activeOrder.customer.fullName}</div>
                        {activeOrder.customer.phone && <div>📞 {activeOrder.customer.phone}</div>}
                        <div>📍 {activeOrder.customer.city}{activeOrder.customer.address ? `, ${activeOrder.customer.address}` : ''}</div>
                        <div>💳 {activeOrder.payment === 'cash' ? 'Paiement à la livraison' : 'Carte bancaire'}</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Cards info */}
            <div className="liv-info-grid">
              {[
                { icon: '🕐', title: 'Délais',     text: 'Livraison en 1 à 3h selon votre ville.' },
                { icon: '💚', title: 'Gratuite',   text: 'Offerte dès 200 MAD de commande.' },
                { icon: '🔄', title: 'Retours',    text: '7 jours pour retourner sans frais.' },
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

          {/* ── Colonne droite : zones ──────────────────────────────────────── */}
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
