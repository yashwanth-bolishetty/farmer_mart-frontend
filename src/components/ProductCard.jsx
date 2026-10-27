import { ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { getImageUrl } from '../services/api.js';

const fallbackImages = {
  Vegetables: 'photo-1540420773420-3366772f4999',
  Fruits: 'photo-1610832958506-aa56368176cf',
  Grains: 'photo-1574323347407-f5e1ad6d020b',
  Dairy: 'photo-1550583724-b2692b85b150',
};

export default function ProductCard({ product }) {
  const { add } = useCart();
  const image = getImageUrl(product.image_url) || `https://images.unsplash.com/${fallbackImages[product.category] || fallbackImages.Vegetables}?auto=format&fit=crop&w=700&q=80`;

  return (
    <article className="product-card">
      <Link to={`/products/${product.product_id}`} className="product-image">
        <img src={image} alt={product.product_name} loading="lazy" />
        <span className="product-category">{product.category || 'Farm fresh'}</span>
        <span className="product-quick-view"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="product-info">
        <div className="product-heading">
          <div><Link to={`/products/${product.product_id}`} className="product-name">{product.product_name}</Link><p className="product-farmer">Grown by {product.farmer_name}</p></div>
          <button className="add-button" onClick={() => add(product)} aria-label={`Add ${product.product_name} to cart`}><Plus size={18} /></button>
        </div>
        <div className="product-price"><strong>₹{Number(product.price).toFixed(0)}</strong><span> / kg</span><span className="stock-note">{Number(product.quantity)} kg left</span></div>
      </div>
    </article>
  );
}
