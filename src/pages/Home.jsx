import { ArrowDownRight, ArrowRight, BadgeCheck, Sprout, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

const categories = [
  { title: 'Vegetables', detail: 'Picked fresh, every morning', image: 'photo-1540420773420-3366772f4999' },
  { title: 'Fruits', detail: 'Naturally sweet & seasonal', image: 'photo-1610832958506-aa56368176cf' },
  { title: 'Grains', detail: 'Goodness from the fields', image: 'photo-1574323347407-f5e1ad6d020b' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/products?limit=4').then(({ products: result }) => setProducts(result.slice(0, 4))).catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> STRAIGHT FROM THE SOURCE</span>
            <h1>Closer to the<br />farm. <em>Better</em><br />by nature.</h1>
            <p>Fresh, seasonal produce from the people who grow it. No middlemen, just honest food and good neighbours.</p>
            <div className="hero-actions"><Link className="button button-dark" to="/products">Explore the market <ArrowRight size={17} /></Link><Link className="text-link" to="/register">Meet our farmers <ArrowDownRight size={17} /></Link></div>
            <div className="hero-proof"><div className="proof-avatars"><span>R</span><span>A</span><span>M</span><span>+</span></div><span><b>Local farmers,</b> growing with care</span></div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85" alt="Freshly harvested vegetables at a local market" />
            <div className="hero-sticker"><Sprout size={20} /><span>Good food<br /><b>grows here.</b></span></div>
            <div className="hero-caption"><span>01 — THE HARVEST</span><span>Grown with intention</span></div>
          </div>
        </div>
      </section>
      <section className="benefits wrap">
        <div><span className="benefit-icon"><Sprout size={19} /></span><span><b>Farm fresh, always</b><small>Harvested close to your order</small></span></div>
        <div><span className="benefit-icon"><BadgeCheck size={19} /></span><span><b>Fair for everyone</b><small>Better prices, directly from farms</small></span></div>
        <div><span className="benefit-icon"><Truck size={19} /></span><span><b>Delivered with care</b><small>From our farms to your home</small></span></div>
      </section>
      <section className="section wrap">
        <div className="section-heading"><div><span className="eyebrow">A LITTLE OF EVERYTHING</span><h2>Shop by <em>nature.</em></h2></div><Link to="/products" className="text-link">All categories <ArrowRight size={17} /></Link></div>
        <div className="category-grid">{categories.map((category, index) => <Link to={`/products?category=${category.title}`} className={`category-card category-${index + 1}`} key={category.title}>
          <img src={`https://images.unsplash.com/${category.image}?auto=format&fit=crop&w=900&q=80`} alt="" />
          <div><span className="category-kicker">0{index + 1} / THE MARKET</span><h3>{category.title}</h3><p>{category.detail}</p></div><span className="category-arrow"><ArrowRight size={19} /></span>
        </Link>)}</div>
      </section>
      <section className="section section-tint">
        <div className="wrap">
          <div className="section-heading"><div><span className="eyebrow">IN SEASON, RIGHT NOW</span><h2>Good things, <em>growing.</em></h2></div><Link to="/products" className="text-link">Shop all produce <ArrowRight size={17} /></Link></div>
          {error ? <p className="inline-error">{error}</p> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.product_id} product={product} />)}</div> : <div className="empty-products"><Sprout size={24} /><p>The harvest is just getting started. Check back soon.</p></div>}
        </div>
      </section>
      <section className="farmer-callout wrap"><div><span className="eyebrow">GROWING SOMETHING GOOD?</span><h2>Your farm belongs<br />in <em>good company.</em></h2><p>Meet a community that believes in better food and fairer futures. Bring your harvest to the market.</p><Link to="/register?role=farmer" className="button button-light">Sell with Farmstead <ArrowRight size={17} /></Link></div><div className="callout-image"><img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80" alt="Farmer tending crops" /><span>GOOD FOOD STARTS WITH GOOD PEOPLE.</span></div></section>
    </>
  );
}
