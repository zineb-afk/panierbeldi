import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../navbar/Navbar'
import './Home.css'

const API = 'http://localhost:5000/api';

const categories = [
  { id: 1, emoji: '🥚', name: 'Oeufs',   bg: '#8B4513', textColor: '#fff' },
  { id: 2, emoji: '🍯', name: 'Miel',    bg: '#FFF3CC', textColor: '#7B3F10' },
  { id: 3, emoji: '🫒', name: 'Huile',   bg: '#E8F0D8', textColor: '#3D6635' },
  { id: 4, emoji: '🧈', name: 'Zbda',    bg: '#FFF8E1', textColor: '#7B3F10' },
  { id: 5, emoji: '🍊', name: 'Fruits',  bg: '#FFE8D6', textColor: '#CC7351' },
  { id: 6, emoji: '🌿', name: 'Herbes',  bg: '#E8F5E9', textColor: '#3D6635' },
  { id: 7, emoji: '🧄', name: 'Épices',  bg: '#F9E4D4', textColor: '#CC7351' },
  { id: 8, emoji: '🥛', name: 'Laitier', bg: '#F0F4FF', textColor: '#4A6FA5' },
];

const saisons = [
  { key: null,        label: 'Tous',      icon: '🌍' },
  { key: 'Printemps', label: 'Printemps', icon: '🌸' },
  { key: 'Été',       label: 'Été',       icon: '☀️' },
  { key: 'Automne',   label: 'Automne',   icon: '🍂' },
  { key: 'Hiver',     label: 'Hiver',     icon: '❄️' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const raw = localStorage.getItem('panierbeldi_favorites');
    return raw ? JSON.parse(raw) : [];
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSaison, setActiveSaison] = useState(null);
  const [cartToast, setCartToast] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.log('Erreur fetch:', err);
        setLoading(false);
      });
  }, []);

  const parsePrice = (p) => typeof p === 'number' ? p : Number(String(p).replace(' MAD','').trim()) || 0;

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const addToCart = (product) => {
    const key = 'panierbeldi_cart';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const priceValue = parsePrice(product.price);
    const found = existing.find(i => i.name === product.name);
    const next = found
      ? existing.map(i => i.name === product.name ? { ...i, qty: i.qty + 1 } : i)
      : [...existing, {
          id: product._id || product.id,
          name: product.name,
          seller: product.seller || 'Panier Beldi',
          price: priceValue,
          qty: 1,
          emoji: product.emoji,
          bg: product.bg,
          image: product.image,
        }];
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event('cart-updated'));
    setCartToast(`${product.name} ajouté au panier`);
    setTimeout(() => setCartToast(''), 1800);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchSaison = activeSaison === null || p.saison === activeSaison;
    return matchSearch && matchSaison;
  });

  const topRatedProduct    = useMemo(() => [...products].sort((a,b) => b.rating - a.rating)[0], [products]);
  const lowestRatedProduct = useMemo(() => [...products].sort((a,b) => a.rating - b.rating)[0], [products]);

  useEffect(() => {
    localStorage.setItem('panierbeldi_favorites', JSON.stringify(favorites));
  }, [favorites]);

  return (
    <div className="home-page">
      <Navbar />
      <main className="home-main">

        <section className="hero-banner">
          <div className="hero-text">
            <span className="hero-chip">🌿 Produits 100% Naturels & Beldi</span>
            <h1 className="hero-title">Le meilleur du Maroc,<br /><span>livré chez vous</span></h1>
            <p className="hero-sub">Découvrez nos produits traditionnels marocains sélectionnés auprès des meilleurs artisans et producteurs locaux.</p>
            <div className="hero-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Rechercher un produit beldi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="clear-btn" onClick={() => setSearch('')}>✕</button>}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-circle"><span>🧺</span></div>
            <div className="float-tag t1">🫒 Huile d'Argan</div>
            <div className="float-tag t2">🍯 Miel Bio</div>
            <div className="float-tag t3">⭐ 4.9/5</div>
          </div>
        </section>

        <div className="content-wrapper">

          <section className="section">
            <div className="section-head">
              <h2 className="sec-title">Catégories</h2>
              <button className="see-all-btn">Voir tout →</button>
            </div>
            <div className="categories-row">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`cat-card ${activeCategory === cat.id ? 'cat-active' : ''}`}
                  style={{ '--cat-bg': cat.bg, '--cat-text': cat.textColor }}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                >
                  <div className="cat-icon-wrap"><span className="cat-emoji">{cat.emoji}</span></div>
                  <span className="cat-name">{cat.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="promo-banner">
            <div className="promo-left">
              <span className="promo-chip">LIVRAISON GRATUITE</span>
              <h2 className="promo-title">Première commande offerte 🎉</h2>
              <p className="promo-sub">Utilisez le code ci-dessous lors de votre premier achat</p>
              <div className="promo-code-box">Code : <strong>BELDI1</strong></div>
            </div>
            <div className="promo-right">
              <span className="promo-emoji">🧺</span>
              <div className="promo-stats">
                <div className="pstat"><span className="pstat-num">{products.length}+</span><span className="pstat-lbl">Produits</span></div>
                <div className="pstat"><span className="pstat-num">2k+</span><span className="pstat-lbl">Clients</span></div>
                <div className="pstat"><span className="pstat-num">48h</span><span className="pstat-lbl">Livraison</span></div>
              </div>
            </div>
          </section>

          {topRatedProduct && (
            <section className="quick-insights">
              <div className="insight-card">
                <span>⭐ Note la plus haute</span>
                <strong>{topRatedProduct.name} ({topRatedProduct.rating}/5)</strong>
              </div>
              <div className="insight-card">
                <span>📉 Note la plus basse</span>
                <strong>{lowestRatedProduct?.name} ({lowestRatedProduct?.rating}/5)</strong>
              </div>
              <div className="insight-card">
                <span>🚀 Livraison express</span>
                <strong>24-48h au Maroc</strong>
              </div>
            </section>
          )}

          <section className="section">
            <div className="section-head">
              <h2 className="sec-title">
                {search ? `Résultats pour "${search}"` : 'Nos coups de cœur'}
              </h2>
              {!search && <button className="see-all-btn">Voir tout →</button>}
            </div>

            {!search && (
              <div className="saison-filters">
                {saisons.map(s => (
                  <button
                    key={String(s.key)}
                    className={`saison-btn ${activeSaison === s.key ? 'saison-active' : ''}`}
                    onClick={() => setActiveSaison(s.key)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="products-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="product-card skeleton-card">
                    <div className="skeleton-img"></div>
                    <div className="skeleton-info">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="no-result">😔 Aucun produit disponible</div>
            ) : filtered.length === 0 ? (
              <div className="no-result">😔 Aucun produit trouvé pour "{search}"</div>
            ) : (
              <div className="products-grid">
                {filtered.map(product => (
                  <div
                    key={product._id || product.id}
                    className="product-card"
                    onMouseEnter={() => setHoveredId(product._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className="prod-img"
                      style={{
                        background: product.image ? 'transparent' : product.bg,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <span className="prod-badge">{product.badge}</span>
                      <button
                        className={`fav-btn ${favorites.includes(product._id) ? 'fav-on' : ''}`}
                        onClick={() => toggleFav(product._id)}
                      >
                        {favorites.includes(product._id) ? '❤️' : '🤍'}
                      </button>

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 'inherit',
                            transform: hoveredId === product._id ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      ) : (
                        <span
                          className="prod-emoji"
                          style={{
                            transform: hoveredId === product._id ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.4s ease',
                            display: 'inline-block',
                          }}
                        >
                          {product.emoji}
                        </span>
                      )}

                      {hoveredId === product._id && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
                          height: '50%',
                          borderRadius: 'inherit',
                          transition: 'opacity 0.3s ease',
                        }} />
                      )}
                    </div>

                    <div className="prod-info">
                      <h3 className="prod-name">{product.name}</h3>
                      <p className="prod-seller">{product.seller}</p>
                      <div className="prod-footer">
                        <span className="prod-rating">⭐ {product.rating}</span>
                        <div className="prod-actions">
                          <span className="prod-price">{product.price} MAD</span>
                          <button
                            className="add-btn"
                            onClick={() => addToCart(product)}
                            style={{
                              transform: hoveredId === product._id ? 'scale(1.05)' : 'scale(1)',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            + Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
      {cartToast && <div className="cart-toast">✅ {cartToast}</div>}
    </div>
  );
};

export default Home;