import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import Home from "./components/home/Home";
import Panier from "./components/panier/Panier";
import Profil from "./components/profil/Profil";
import Livraisons from "./components/livraisons/Livraisons";
import Contact from "./components/contact/Contact";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";

// Composant de protection des routes
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('panierbeldi_user');
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <div key={location.pathname} className="route-enter">
        <Routes location={location}>
          {/* Routes publiques */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Routes protégées */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/panier" element={<PrivateRoute><Panier /></PrivateRoute>} />
          <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
          <Route path="/livraisons" element={<PrivateRoute><Livraisons /></PrivateRoute>} />
          <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />

          {/* 404 redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
