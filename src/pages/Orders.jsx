import { ArrowRight, PackageCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import { api } from '../services/api.js';

const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/orders/mine').then(({ orders: results }) => setOrders(results)).catch((err) => setError(err.message)); }, []);

  return <main className="page-shell"><div className="wrap">
    <div className="page-intro compact-intro"><span className="eyebrow">GOOD THINGS ARE ON THEIR WAY</span><h1>Your <em>orders.</em></h1><p>A little look at the goodness coming to your door.</p></div>
    <Notice message={error} />
    {!orders.length && !error ? <div className="empty-state"><PackageCheck size={32} /><h3>No orders yet.</h3><p>Your next favourite thing is waiting at the market.</p><Link className="text-link" to="/products">Find your first good thing <ArrowRight size={16} /></Link></div>
      : <div className="order-list">{orders.map((order) => <article className="order-card" key={order.order_id}>
        <header><div><span className="eyebrow">ORDER #{order.order_id} · {new Date(order.order_date).toLocaleDateString()}</span><h3>₹{Number(order.total_amount).toFixed(2)} <span>· {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span></h3></div><span className={`status-pill status-${order.status}`}>{statusLabel(order.status)}</span></header>
        <div className="order-product-list">{order.items.map((item) => <div className="order-product" key={item.order_item_id}><span>{item.product_name} <small>× {item.quantity} kg · {item.farmer_name}</small></span><span className={`status-pill status-${item.status}`}>{statusLabel(item.status)}</span></div>)}</div>
        <p className="order-address">{order.address_line}, {order.city}, {order.state} {order.pincode}</p>
      </article>)}</div>}
  </div></main>;
}
