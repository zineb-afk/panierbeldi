import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../navbar/Navbar'
import './Panier.css'

const initialItems = [
  { id: 1, name: 'Oeufs Beldi ×6', seller: 'Ferme El Amine', price: 36, qty: 2, emoji: '🥚', bg: '#F5EDD6' },
  { id: 2, name: 'Miel de Thym 500g', seller: 'Apiculture Benali', price: 85, qty: 1, emoji: '🍯', bg: '#FFF8E7' },
  { id: 3, name: "Huile d'Olive 1L", seller: 'Huilerie Chraibi', price: 65, qty: 1, emoji: '🫒', bg: '#E8F0D8' },
];

const PROMO_CODES = { 'BELDI1': 'free_shipping', 'BELDI10': 0.10, 'WELCOME20': 0.20 };

const Panier = () => {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem('panierbeldi_cart');
    if (!raw) return initialItems;
    const parsed = JSON.parse(raw);
    return parsed.length ? parsed : initialItems;
  });
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMsg, setPromoMsg] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    payment: 'cash',
  });

  const updateQty = (id, delta) => {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  };
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const sellers = new Set(items.map(i => i.seller)).size;

  const baseShipping = subtotal >= 200 ? 0 : 30;
  let shipping = baseShipping;
  let discount = 0;

  if (appliedPromo === 'BELDI1') shipping = 0;
  else if (typeof appliedPromo === 'number') discount = Math.round(subtotal * appliedPromo);

  const total = subtotal + shipping - discount;
  const freeShippingLeft = Math.max(0, 200 - subtotal);
  const progress = Math.min(100, Math.round((subtotal / 200) * 100));

  const suggestions = [
    { id: 91, name: 'Khobz maison', price: 12, emoji: '🥖', bg: '#F7E6C5' },
    { id: 92, name: 'Amlou artisan', price: 49, emoji: '🥜', bg: '#F3E8D2' },
    { id: 93, name: 'Thé vert premium', price: 24, emoji: '🍵', bg: '#E4F0DE' },
  ];

  React.useEffect(() => {
    localStorage.setItem('panierbeldi_cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  }, [items]);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    const val = PROMO_CODES[code];
    if (val !== undefined) {
      setAppliedPromo(val);
      setPromoMsg(code);
    } else {
      setAppliedPromo(null);
      setPromoMsg('invalid');
    }
  };

  const addSuggestion = (suggestion) => {
    const found = items.find((item) => item.name === suggestion.name);
    if (found) {
      setItems((prev) =>
        prev.map((item) =>
          item.name === suggestion.name ? { ...item, qty: item.qty + 1 } : item
        )
      );
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: suggestion.id,
        name: suggestion.name,
        seller: 'Sélection Panier Beldi',
        price: suggestion.price,
        qty: 1,
        emoji: suggestion.emoji,
        bg: suggestion.bg,
      },
    ]);
  };

  const startCheckout = () => {
    if (!items.length) return;
    setCheckoutOpen(true);
    setCheckoutStep(1);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutStep(1);
  };

  const placeOrder = async () => {
    const user = JSON.parse(localStorage.getItem('panierbeldi_user') || '{}');
    const orderData = {
      total,
      items: items.map(item => ({ ...item })),
      status: 'confirmed',
      customer: {
        fullName: checkoutData.fullName,
        phone: checkoutData.phone,
        city: checkoutData.city,
        address: checkoutData.address,
        email: user.email || '',
      },
      payment: checkoutData.payment,
    };

    try {
      // Sauvegarder dans MongoDB
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const savedOrder = await response.json();

      // Aussi dans localStorage pour les livraisons
      const newOrder = {
        id: savedOrder.orderId || savedOrder._id,
        _id: savedOrder._id,
        createdAt: savedOrder.createdAt || new Date().toISOString(),
        total,
        items: items.map(item => ({ ...item })),
        status: 'confirmed',
        customer: orderData.customer,
        payment: checkoutData.payment,
      };
      const existing = JSON.parse(localStorage.getItem('panierbeldi_orders') || '[]');
      localStorage.setItem('panierbeldi_orders', JSON.stringify([newOrder, ...existing]));
    } catch (err) {
      // Si pas de connexion, sauvegarder uniquement en localStorage
      const orderId = `#CMD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = { id: orderId, createdAt: new Date().toISOString(), total, items: items.map(i => ({...i})), status: 'confirmed', customer: orderData.customer, payment: checkoutData.payment };
      const existing = JSON.parse(localStorage.getItem('panierbeldi_orders') || '[]');
      localStorage.setItem('panierbeldi_orders', JSON.stringify([newOrder, ...existing]));
    }

    setItems([]);
    setAppliedPromo(null);
    setPromo('');
    setPromoMsg('');
    setCheckoutStep(3);
  };

  return (
    <div className="panier-page">
      <Navbar />
      <main className="panier-main">
        <div className="panier-layout">

          {/* Left – Items */}
          <div className="panier-left">
            <div className="panier-title-row">
              <h1 className="panier-title">Mon Panier 🧺</h1>
              <p className="panier-meta">{totalQty} articles de {sellers} fournisseur{sellers > 1 ? 's' : ''}</p>
            </div>

            {items.length === 0 ? (
              <div className="panier-empty">
                <span>🧺</span>
                <p>Votre panier est vide</p>
                <Link to="/home" className="empty-link">Continuer les achats</Link>
              </div>
            ) : (
              <div className="items-list">
                {items.map(item => (
                  <div key={item.id} className="item-card">
                    <div className="item-img" style={{ background: item.bg }}>
                      <span>{item.emoji}</span>
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-seller">{item.seller}</p>
                      <span className="item-price">{item.price * item.qty} MAD</span>
                    </div>
                    <div className="item-qty-row">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <button className="item-del" onClick={() => removeItem(item.id)} title="Supprimer">✕</button>
                  </div>
                ))}
              </div>
            )}

            <section className="smart-section">
              <div className="smart-head">
                <h3>Ajouts intelligents</h3>
                <span>Souvent achetés avec ton panier</span>
              </div>
              <div className="smart-grid">
                {suggestions.map((suggestion) => (
                  <div className="smart-card" key={suggestion.id}>
                    <div className="smart-emoji" style={{ background: suggestion.bg }}>
                      {suggestion.emoji}
                    </div>
                    <div className="smart-info">
                      <strong>{suggestion.name}</strong>
                      <small>{suggestion.price} MAD</small>
                    </div>
                    <button onClick={() => addSuggestion(suggestion)}>+ Ajouter</button>
                  </div>
                ))}
              </div>
            </section>

            <Link to="/home" className="continue-link">← Continuer les achats</Link>
          </div>

          {/* Right – Summary */}
          <div className="panier-right">
            <div className="summary-card">
              <h2 className="summary-title">Récapitulatif</h2>

              <div className="summary-line">
                <span>Sous-total</span>
                <span className="summary-val">{subtotal} MAD</span>
              </div>
              <div className="summary-line">
                <span>Livraison</span>
                <span className={`summary-val ${shipping === 0 ? 'free' : ''}`}>
                  {shipping === 0 ? 'GRATUIT 🎉' : `${shipping} MAD`}
                </span>
              </div>
              <div className="free-progress-wrap">
                <div className="free-progress-label">
                  {freeShippingLeft === 0
                    ? '🎉 Livraison gratuite débloquée'
                    : `Ajoute ${freeShippingLeft} MAD pour livraison gratuite`}
                </div>
                <div className="free-progress">
                  <div className="free-progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
              {discount > 0 && (
                <div className="summary-line discount">
                  <span>Réduction</span>
                  <span className="summary-val">−{discount} MAD</span>
                </div>
              )}

              {/* Promo applied */}
              {appliedPromo !== null && promoMsg !== 'invalid' && (
                <div className="promo-applied">
                  🎁 Code <strong>{promoMsg}</strong> appliqué —{' '}
                  {appliedPromo === 'free_shipping' ? 'Livraison offerte !' : `−${Math.round((appliedPromo)*100)}%`}
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <span className="total-amount">{total} MAD</span>
              </div>

              {/* Promo input */}
              {appliedPromo === null && (
                <div className="promo-section">
                  <div className="promo-row">
                    <input
                      type="text"
                      className="promo-input"
                      placeholder="Code promo (ex: BELDI1)"
                      value={promo}
                      onChange={e => setPromo(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    />
                    <button className="promo-btn" onClick={applyPromo}>Appliquer</button>
                  </div>
                  {promoMsg === 'invalid' && (
                    <p className="promo-err">❌ Code invalide</p>
                  )}
                </div>
              )}

              {appliedPromo !== null && (
                <button className="promo-remove" onClick={() => { setAppliedPromo(null); setPromoMsg(''); setPromo(''); }}>
                  Retirer le code
                </button>
              )}

              <button className="checkout-btn" onClick={startCheckout} disabled={!items.length}>
                ✓ Commander maintenant
              </button>
              <p className="secure-note">🔒 Paiement sécurisé · Livraison 48h</p>
            </div>
          </div>

        </div>
      </main>
      {checkoutOpen && (
        <div className="checkout-modal-backdrop" onClick={closeCheckout}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-steps">
              <span className={checkoutStep >= 1 ? 'active' : ''}>1. Livraison</span>
              <span className={checkoutStep >= 2 ? 'active' : ''}>2. Paiement</span>
              <span className={checkoutStep >= 3 ? 'active' : ''}>3. Confirmation</span>
            </div>

            {checkoutStep === 1 && (
              <div className="checkout-content">
                <h3>Informations de livraison</h3>
                <input
                  className="checkout-input"
                  placeholder="Nom complet"
                  value={checkoutData.fullName}
                  onChange={(e) => setCheckoutData((prev) => ({ ...prev, fullName: e.target.value }))}
                />
                <input
                  className="checkout-input"
                  placeholder="Téléphone"
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <input
                  className="checkout-input"
                  placeholder="Ville"
                  value={checkoutData.city}
                  onChange={(e) => setCheckoutData((prev) => ({ ...prev, city: e.target.value }))}
                />
                <textarea
                  className="checkout-input"
                  placeholder="Adresse complète"
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData((prev) => ({ ...prev, address: e.target.value }))}
                />
                <button
                  className="checkout-next"
                  disabled={!checkoutData.fullName || !checkoutData.phone || !checkoutData.city || !checkoutData.address}
                  onClick={() => setCheckoutStep(2)}
                >
                  Continuer
                </button>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="checkout-content">
                <h3>Méthode de paiement</h3>
                <label className="pay-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={checkoutData.payment === 'cash'}
                    onChange={() => setCheckoutData((prev) => ({ ...prev, payment: 'cash' }))}
                  />
                  Paiement à la livraison
                </label>
                <label className="pay-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={checkoutData.payment === 'card'}
                    onChange={() => setCheckoutData((prev) => ({ ...prev, payment: 'card' }))}
                  />
                  Carte bancaire
                </label>
                <div className="checkout-actions">
                  <button className="checkout-back" onClick={() => setCheckoutStep(1)}>Retour</button>
                  <button className="checkout-next" onClick={placeOrder}>
                    Confirmer {total} MAD
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="checkout-content checkout-success">
                <h3>Commande confirmée 🎉</h3>
                <p>Merci {checkoutData.fullName || 'cher client'}, votre commande est en cours de préparation.</p>
                <p>Livraison estimée: 24h - 48h</p>
                <p>Code de suivi disponible dans Livraisons.</p>
                <button className="checkout-next" onClick={closeCheckout}>Fermer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Panier;