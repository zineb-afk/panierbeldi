import React, { useState } from 'react'
import Navbar from '../navbar/Navbar'
import './Contact.css'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (response.ok) {
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } else {
      alert(data.message || 'Erreur envoi');
    }
  } catch (err) {
    alert('Serveur indisponible');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="contact-page">
      <Navbar />
      <main className="contact-main">
        <div className="contact-header">
          <h1 className="contact-title">Contactez-nous ✉️</h1>
          <p className="contact-subtitle">Nous sommes là pour vous aider. Écrivez-nous et nous vous répondrons rapidement.</p>
        </div>

        <div className="contact-content">
          {/* Contact Info */}
          <div className="contact-info">
            <div className="info-card">
              <span className="info-card-icon">📞</span>
              <h3>Téléphone</h3>
              <p>+212 5 22 XX XX XX</p>
              <span className="info-hours">Lun – Sam: 9h – 18h</span>
            </div>
            <div className="info-card">
              <span className="info-card-icon">📧</span>
              <h3>Email</h3>
              <p>contact@panierbeldi.ma</p>
              <span className="info-hours">Réponse sous 24h</span>
            </div>
            <div className="info-card">
              <span className="info-card-icon">📍</span>
              <h3>Adresse</h3>
              <p>12 Rue des Artisans,<br />Marrakech, Maroc</p>
            </div>
            <div className="info-card">
              <span className="info-card-icon">💬</span>
              <h3>WhatsApp</h3>
              <p>+212 6 XX XX XX XX</p>
              <span className="info-hours">Réponse rapide</span>
            </div>

            <div className="social-section">
              <h3 className="social-title">Suivez-nous</h3>
              <div className="social-links">
                <a href="https://instagram.com" className="social-link" style={{'--sc': '#E1306C'}}>📸 Instagram</a>
                <a href="https://facebook.com" className="social-link" style={{'--sc': '#1877F2'}}>👍 Facebook</a>
                <a href="https://wa.me" className="social-link" style={{'--sc': '#25D366'}}>💬 WhatsApp</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            {sent ? (
              <div className="success-msg">
                <span className="success-icon">✅</span>
                <h2>Message envoyé !</h2>
                <p>Merci de nous avoir contactés. Nous vous répondrons dans les meilleurs délais.</p>
                <button className="new-msg-btn" onClick={() => setSent(false)}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h2 className="form-card-title">Envoyez-nous un message</h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="cf-row">
                    <div className="cf-group">
                      <label htmlFor="name">Nom complet</label>
                      <input
                        id="name" type="text" required
                        placeholder="Votre nom"
                        value={form.name} onChange={handleChange}
                      />
                    </div>
                    <div className="cf-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email" type="email" required
                        placeholder="votre@email.com"
                        value={form.email} onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="cf-group">
                    <label htmlFor="subject">Sujet</label>
                    <select id="subject" value={form.subject} onChange={handleChange} required>
                      <option value="">Choisir un sujet...</option>
                      <option value="commande">Ma commande</option>
                      <option value="livraison">Livraison</option>
                      <option value="retour">Retour / Remboursement</option>
                      <option value="produit">Question sur un produit</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="cf-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message" rows="5" required
                      placeholder="Décrivez votre demande en détail..."
                      value={form.message} onChange={handleChange}
                    ></textarea>
                  </div>
                  <button type="submit" className="send-btn" disabled={loading}>
                    {loading ? '⏳ Envoi en cours...' : '📨 Envoyer le message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <h2 className="faq-title">Questions fréquentes</h2>
          <div className="faq-grid">
            {[
              { q: 'Quels sont vos délais de livraison ?', a: 'Entre 24h et 72h selon votre ville. Casablanca et Rabat sont livrés en 24h.' },
              { q: 'Comment retourner un produit ?', a: 'Vous avez 7 jours pour nous contacter. Le retour est gratuit si le produit est défectueux.' },
              { q: 'Vos produits sont-ils certifiés bio ?', a: 'La plupart de nos produits sont certifiés biologiques ou naturels. La mention est indiquée sur chaque fiche produit.' },
              { q: 'Acceptez-vous les paiements à la livraison ?', a: 'Oui ! Nous acceptons le paiement en espèces à la livraison sur tout le territoire marocain.' },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <h4 className="faq-q">❓ {faq.q}</h4>
                <p className="faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Contact