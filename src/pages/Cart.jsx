import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api, getImageUrl } from '../services/api.js';

export default function Cart() {
  const { items, total, setQuantity, remove, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ address_line: '', city: '', state: '', pincode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const updateAddress = (event) => setAddress({ ...address, [event.target.name]: event.target.value });

  async function placeOrder(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
          address,
        }),
      });
      clear();
      setSuccess(`Order #${order.order_id} is confirmed. Thank you for supporting local farms!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="page-shell"><div className="wrap">
    <div className="page-intro compact-intro"><span className="eyebrow">YOUR LITTLE HARVEST</span><h1>The <em>basket.</em></h1><p>Good things are on their way to your table.</p></div>
    <Notice message={success} success /><Notice message={error} />
    {!items.length ? <div className="empty-state cart-empty"><ShoppingBag size={34} /><h3>Your basket’s taking a breather.</h3><p>Fill it with something fresh from the market.</p><Link className="button button-dark" to="/products">Explore the market <ArrowRight size={17} /></Link></div>
      : <div className="cart-layout"><section className="cart-items"><Link className="back-link" to="/products"><ArrowLeft size={16} /> Keep exploring</Link>
        {items.map((item) => <article className="cart-item" key={item.product_id}><img src={getImageUrl(item.image_url) || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&q=75'} alt={item.product_name} />
          <div className="cart-item-info"><span className="eyebrow">{item.category}</span><Link to={`/products/${item.product_id}`}><h3>{item.product_name}</h3></Link><p>₹{Number(item.price).toFixed(2)} / kg · {item.farmer_name}</p><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(item.product_id, item.quantity - 1)}><Minus size={14} /></button><span>{item.quantity} kg</span><button aria-label="Increase quantity" onClick={() => setQuantity(item.product_id, item.quantity + 1)}><Plus size={14} /></button></div></div>
          <div className="cart-item-total"><b>₹{(item.price * item.quantity).toFixed(2)}</b><button className="remove-button" onClick={() => remove(item.product_id)} aria-label={`Remove ${item.product_name}`}><Trash2 size={16} /></button></div>
        </article>)}
      </section>
      <aside className="checkout-card"><span className="eyebrow">DELIVERY & TOTAL</span><h2>Make it <em>yours.</em></h2>
        {!user ? <div className="checkout-signin"><p>Sign in or create an account to finish your order.</p><Link className="button button-dark" to="/login" state={{ from: '/cart' }}>Sign in to continue <ArrowRight size={17} /></Link></div>
          : user.role !== 'customer' ? <p className="inline-error">Customer accounts are needed to place an order.</p>
            : <form onSubmit={placeOrder} className="form-stack checkout-form"><label>Street address<input className="plain-input" name="address_line" value={address.address_line} onChange={updateAddress} required maxLength={255} placeholder="House number and street" /></label><div className="address-row"><label>City<input className="plain-input" name="city" value={address.city} onChange={updateAddress} required maxLength={100} /></label><label>State<input className="plain-input" name="state" value={address.state} onChange={updateAddress} required maxLength={100} /></label></div><label>PIN code<input className="plain-input" name="pincode" value={address.pincode} onChange={updateAddress} required pattern="[0-9]{4,10}" maxLength={10} /></label>
              <div className="summary-line"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div><div className="summary-line"><span>Delivery</span><span className="free-delivery">On us</span></div><div className="summary-total"><span>Total</span><b>₹{total.toFixed(2)}</b></div><button className="button button-dark checkout-button" type="submit" disabled={submitting}>{submitting ? 'Placing your order…' : 'Place your order'} <ArrowRight size={17} /></button><p className="checkout-note">Your order supports the people who grow your food.</p>
            </form>}
      </aside></div>}
  </div></main>;
}
