import { ArrowRight, Bell, Box, CirclePlus, PackageCheck, Pencil, Plus, Sprout, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import { api, getImageUrl } from '../services/api.js';

const emptyProduct = { product_name: '', category: 'Vegetables', price: '', quantity: '', description: '', farm_address: '', image_url: '' };
const statusOptions = ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const imageInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(getImageUrl(form.image_url));
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [form.image_url, selectedImage]);

  const load = useCallback(async () => {
    const [productResult, orderResult] = await Promise.all([api('/products/mine'), api('/orders/farmer')]);
    setProducts(productResult.products);
    setOrders(orderResult.orders);
  }, []);

  useEffect(() => { load().catch((err) => setError(err.message)); }, [load]);
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      api('/orders/farmer')
        .then(({ orders: updatedOrders }) => setOrders(updatedOrders))
        .catch((err) => setError(err.message));
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (location.hash !== '#received-orders') return undefined;
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('received-orders')?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash]);

  async function addProduct(event) {
    event.preventDefault();
    setError('');
    setFormError('');
    setSuccess('');
    setSaving(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (selectedImage) body.append('image', selectedImage);
      await api(editingId ? `/products/${editingId}` : '/products', {
        method: editingId ? 'PUT' : 'POST',
        body,
      });
      setForm(emptyProduct);
      setEditingId(null);
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      setSuccess(editingId ? 'Your product listing has been updated.' : 'Your harvest is now listed in the market.');
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editProduct(product) {
    setError('');
    setFormError('');
    setSuccess('');
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setEditingId(product.product_id);
    setForm({
      product_name: product.product_name,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      description: product.description || '',
      farm_address: product.farm_address || '',
      image_url: product.image_url || '',
    });
    document.querySelector('.add-product-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError('');
    setForm(emptyProduct);
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Choose a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setFormError('');
    setSelectedImage(file);
  }

  function removePhoto() {
    setSelectedImage(null);
    setForm({ ...form, image_url: '' });
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  async function deleteProduct(id) {
    setError('');
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((product) => product.product_id !== id));
      setSuccess('Product listing removed.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(orderId, status) {
    setError('');
    try {
      await api(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setSuccess(`Order #${orderId} updated.`);
      await load();
    } catch (err) {
      setError(err.message);
      await load().catch(() => {});
    }
  }

  const listedStock = products.reduce((sum, product) => sum + Number(product.quantity), 0);
  const pendingOrders = orders.filter((order) => order.items.some((item) => item.status === 'pending')).length;
  const inboxOrders = [...orders].sort((left, right) => {
    const leftPending = left.items.some((item) => item.status === 'pending');
    const rightPending = right.items.some((item) => item.status === 'pending');
    return Number(rightPending) - Number(leftPending);
  });
  const delivered = orders.filter((order) => order.items.some((item) => item.status === 'delivered')).length;
  const sales = orders.reduce((sum, order) => sum + order.items.filter((item) => item.status === 'delivered').reduce((subtotal, item) => subtotal + Number(item.price_at_purchase) * Number(item.quantity), 0), 0);

  return <main className="page-shell"><div className="wrap dashboard-wrap">
    <div className="dashboard-heading"><div><span className="eyebrow">YOUR FARM, YOUR MARKET</span><h1>Farm <em>dashboard.</em></h1><p>A little overview of the good things you’re growing.</p></div><Link className="text-link" to="/products">View your market <ArrowRight size={16} /></Link></div>
    <Notice message={error} /><Notice message={success} success />
    <section className="stats-grid"><article className="stat-card"><span className="stat-icon"><Sprout size={19} /></span><span className="stat-label">LISTED PRODUCTS</span><b>{products.length}</b><small>good things growing</small></article><article className="stat-card"><span className="stat-icon"><Box size={19} /></span><span className="stat-label">AVAILABLE STOCK</span><b>{listedStock} <small>kg</small></b><small>across your listings</small></article><article className="stat-card"><span className="stat-icon"><CirclePlus size={19} /></span><span className="stat-label">NEEDS YOUR CARE</span><b>{pendingOrders}</b><small>orders to confirm</small></article><article className="stat-card"><span className="stat-icon"><PackageCheck size={19} /></span><span className="stat-label">DELIVERED SALES</span><b>₹{sales.toFixed(0)}</b><small>{delivered} fulfilled orders</small></article></section>
    <div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">FRESH FROM YOUR FARM</span><h2>Your listings</h2></div><span>{products.length} listed</span></div>
      {products.length ? <div className="farmer-products">{products.map((product) => <article key={product.product_id} className="farmer-product"><img src={getImageUrl(product.image_url) || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=220&q=75'} alt="" /><div><b>{product.product_name}</b><small>{product.category} · ₹{Number(product.price).toFixed(2)}/kg</small><small>{Number(product.quantity)} kg in stock</small></div><div className="listing-actions"><button className="remove-button" onClick={() => editProduct(product)} aria-label={`Edit ${product.product_name}`}><Pencil size={15} /></button><button className="remove-button" onClick={() => deleteProduct(product.product_id)} aria-label={`Remove ${product.product_name}`}><Trash2 size={16} /></button></div></article>)}</div> : <div className="dashboard-empty">Your market stall is waiting for its first harvest.</div>}
    </section>
    <section className="dashboard-panel add-product-panel"><div className="panel-heading"><div><span className="eyebrow">{editingId ? 'TEND YOUR LISTING' : 'SHARE THE HARVEST'}</span><h2>{editingId ? 'Edit listing' : 'Add a listing'}</h2></div><span className="stat-icon"><Plus size={18} /></span></div>
      <form className="form-stack product-form" onSubmit={addProduct}>
        <label>Product name<input className="plain-input" name="product_name" value={form.product_name} onChange={(event) => setForm({ ...form, product_name: event.target.value })} required maxLength={100} placeholder="e.g. Heirloom tomatoes" /></label>
        <div className="address-row">
          <label>Category<select className="form-select" name="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Dairy</option><option>Other</option></select></label>
          <label>Price / kg<input className="plain-input" type="number" name="price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} min="0.01" step="0.01" required placeholder="0.00" /></label>
        </div>
        <label>Quantity available (kg)<input className="plain-input" type="number" name="quantity" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} min={editingId ? '0' : '0.01'} step="0.001" required placeholder="0" /></label>
        <label>Tell us a little about it<textarea className="plain-input" name="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={2000} rows="3" placeholder="How is it grown? What makes this harvest special?" /></label>
        <label>Farm location or pickup address <span className="optional">(shown to customers)</span><textarea className="plain-input" name="farm_address" value={form.farm_address} onChange={(event) => setForm({ ...form, farm_address: event.target.value })} maxLength={255} rows="2" placeholder="Area, town, or pickup location" /></label>
        <label>Upload a photo from your device<input ref={imageInputRef} className="plain-input image-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} /><span className="optional">JPG, PNG, or WebP · up to 5 MB · resized to a square automatically</span></label>
        {imagePreview && <div className="product-image-preview"><img src={imagePreview} alt="Product image preview" /><span>Square preview · 800 × 800</span></div>}
        <label>Or use an image URL <span className="optional">(optional)</span><input className="plain-input" type="text" inputMode="url" name="image_url" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} maxLength={500} placeholder="https://…" /></label>
        {imagePreview && <button type="button" className="cancel-edit" onClick={removePhoto}><X size={15} /> Remove photo</button>}
        {formError && <Notice message={formError} />}
        {editingId && <button type="button" className="cancel-edit" onClick={cancelEdit}><X size={15} /> Cancel editing</button>}
        <button className="button button-dark" disabled={saving}>{saving ? 'Saving your listing…' : editingId ? 'Save listing changes' : 'List this good thing'} <ArrowRight size={16} /></button>
      </form>
    </section></div>
    <section className="dashboard-panel farmer-orders" id="received-orders">
      <div className="panel-heading">
        <div><span className="eyebrow"><Bell size={14} /> ORDER NOTIFICATIONS</span><h2>Received orders</h2></div>
        <span className={`order-inbox-count${pendingOrders ? ' has-new-orders' : ''}`} aria-live="polite">
          {pendingOrders ? `${pendingOrders} new` : `${orders.length} total`}
        </span>
      </div>
      {inboxOrders.length ? <div className="farmer-order-list">{inboxOrders.map((order) => {
        const hasNewOrder = order.items.some((item) => item.status === 'pending');
        const itemTotal = order.items.reduce((sum, item) => sum + Number(item.price_at_purchase) * Number(item.quantity), 0);
        return <article className={`farmer-order${hasNewOrder ? ' farmer-order-new' : ''}`} key={order.order_id}>
          <div className="farmer-order-main">
            <span className="eyebrow">ORDER #{order.order_id} · {new Date(order.order_date).toLocaleDateString()}</span>
            <b>{order.customer_name} <small>· {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</small></b>
            <p>{order.items.map((item) => `${item.product_name} × ${item.quantity} kg`).join(' · ')}</p>
            <small>{order.address_line}, {order.city}, {order.state} {order.pincode}</small>
            <div className="farmer-order-total">Your items: ₹{itemTotal.toFixed(2)}</div>
          </div>
          <div className="farmer-order-action">
            {hasNewOrder && <span className="new-order-label">New order</span>}
            <span className={`status-pill status-${order.status}`}>{order.status}</span>
            <select aria-label={`Update order ${order.order_id}`} value={order.status} onChange={(event) => updateStatus(order.order_id, event.target.value)} disabled={order.status === 'delivered' || order.status === 'cancelled'}>{order.status === 'pending' && <option value="pending">Pending</option>}{statusOptions.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select>
          </div>
        </article>;
      })}</div> : <div className="dashboard-empty">No orders yet. New customer orders will appear here.</div>}
    </section>
  </div></main>;
}
