import { ArrowLeft, Leaf, MapPin, Plus, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api, getImageUrl } from '../services/api.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  useEffect(() => { api(`/products/${id}`).then(({ product: item }) => setProduct(item)).catch((err) => setError(err.message)); }, [id]);

  if (error) return <main className="page-shell"><div className="wrap"><Notice message={error} /><Link className="text-link" to="/products"><ArrowLeft size={17} /> Back to the market</Link></div></main>;
  if (!product) return <main className="page-shell"><div className="wrap loading-state">Finding this good thing<span className="loader" /></div></main>;
  const image = getImageUrl(product.image_url) || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1100&q=85';

  return <main className="page-shell"><div className="wrap">
    <Link className="back-link" to="/products"><ArrowLeft size={17} /> Back to the market</Link>
    <div className="detail-layout"><div className="detail-image"><img src={image} alt={product.product_name} /><span className="product-category">{product.category}</span></div>
      <div className="detail-copy"><span className="eyebrow"><Leaf size={14} /> GOOD THINGS, GROWN LOCALLY</span><h1>{product.product_name}</h1><p className="detail-farmer">Grown with care by <b>{product.farmer_name}</b></p><p className="detail-price">₹{Number(product.price).toFixed(2)} <span>/ kg</span></p>
        <p className="detail-description">{product.description || 'Freshly harvested and grown with care. Good food, straight from the farm to your table.'}</p>
        {product.farm_address && <p className="detail-farm-address"><MapPin size={17} aria-hidden="true" /><span><b>Farm location / pickup</b><br />{product.farm_address}</span></p>}
        <p className="available-stock">{Number(product.quantity)} kg available today</p><button className="button button-dark detail-add" onClick={() => { add(product); setAdded(true); }}><Plus size={18} /> Add to basket <ShoppingBag size={17} /></button><Notice message={added ? 'Added to your basket. Nice choice!' : ''} success />
        <div className="detail-promise"><span><Leaf size={17} /></span><p><b>Know your farmer.</b><br />Every order supports the people who grow your food.</p></div>
      </div>
    </div>
  </div></main>;
}
