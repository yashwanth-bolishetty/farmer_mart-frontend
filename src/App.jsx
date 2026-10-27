import { Leaf } from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Auth from './pages/Auth.jsx';
import Cart from './pages/Cart.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Orders from './pages/Orders.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Products from './pages/Products.jsx';

function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="loading-state">A moment while we get things ready<span className="loader" /></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={user.role === 'farmer' ? '/dashboard' : '/products'} replace />;
  return children;
}

function NotFound() {
  return <main className="page-shell"><div className="wrap empty-state"><Leaf size={30} /><h1>This path wandered off.</h1><p>Let's get you back to something good.</p><Link className="button button-dark" to="/">Back home</Link></div></main>;
}

export default function App() {
  return <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<ProtectedRoute role="customer"><Orders /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute role="farmer"><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
  </>;
}
