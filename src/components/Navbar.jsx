import { ArrowDown, Bell, Leaf, LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const close = () => setOpen(false);
  const closeProfile = () => setProfileOpen(false);

  useEffect(() => {
    if (user?.role !== 'farmer') {
      setPendingOrders(0);
      return undefined;
    }

    let active = true;
    const refreshPendingOrders = async () => {
      try {
        const { orders } = await api('/orders/farmer');
        if (active) {
          setPendingOrders(orders.filter((order) => order.items.some((item) => item.status === 'pending')).length);
        }
      } catch (error) {
        if (active) console.error('Could not refresh farmer order notifications.', error);
      }
    };

    refreshPendingOrders();
    const intervalId = window.setInterval(refreshPendingOrders, 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) closeProfile();
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeProfile();
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileOpen]);

  return (
    <header className="site-header">
      <div className="top-note">GOOD FOOD, GOOD MOOD <span>·</span> FRESH FROM YOUR NEIGHBOURHOOD</div>
      <nav className="navbar wrap">
        <Link className="brand" to="/" onClick={close}><span className="brand-mark"><Leaf size={19} /></span>farmstead<span className="brand-dot">.</span></Link>
        <button className="mobile-menu icon-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
        <div className={`nav-content ${open ? 'nav-open' : ''}`}>
          <div className="nav-links">
            <NavLink to="/products" onClick={close}>Shop all</NavLink>
            {user?.role === 'farmer' && <NavLink to="/dashboard" onClick={close}>Farm dashboard</NavLink>}
            {user?.role === 'customer' && <NavLink to="/orders" onClick={close}>My orders</NavLink>}
          </div>
          <div className="nav-actions">
            {user?.role === 'farmer'
              ? <Link className="cart-link" to="/dashboard#received-orders" onClick={close}><Bell size={19} /><span>Received orders</span>{pendingOrders > 0 && <b className="cart-count" aria-label={`${pendingOrders} new orders`}>{pendingOrders}</b>}</Link>
              : <Link className="cart-link" to="/cart" onClick={close}><ShoppingBag size={19} /><span>Cart</span>{count > 0 && <b className="cart-count">{count}</b>}</Link>}
            {user ? (
              <div className="profile-menu" ref={profileRef}>
                <button className="nav-user" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen} aria-haspopup="menu">
                  <span className="avatar">{user.name.charAt(0).toUpperCase()}</span><span>{user.name.split(' ')[0]}</span><ArrowDown size={14} />
                </button>
                {profileOpen && <div className="profile-dropdown" role="menu">
                  <div className="profile-summary">
                    <b>{user.name}</b>
                    <span>{user.email}</span>
                    <small>{user.role === 'farmer' ? 'Farmer account' : 'Customer account'}</small>
                  </div>
                  <NavLink
                    className="profile-menu-link"
                    to={user.role === 'farmer' ? '/dashboard' : '/orders'}
                    role="menuitem"
                    onClick={() => { closeProfile(); close(); }}
                  >
                    {user.role === 'farmer' ? 'Farm dashboard' : 'My orders'}
                  </NavLink>
                  <button className="profile-signout" role="menuitem" onClick={() => { logout(); closeProfile(); close(); }}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>}
              </div>
            ) : <Link className="nav-signin" to="/login" onClick={close}><UserRound size={17} /> Sign in</Link>}
          </div>
        </div>
      </nav>
    </header>
  );
}
