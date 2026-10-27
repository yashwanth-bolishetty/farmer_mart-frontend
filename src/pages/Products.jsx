import { Search, SlidersHorizontal, Sprout } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

const categories = ['All produce', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Other'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const category = searchParams.get('category') || 'All produce';
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'All produce') params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    api(`/products?${params}`).then(({ products: result }) => { setProducts(result); setError(''); })
      .catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [search, category, sort]);

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || (key === 'category' && value === 'All produce') || (key === 'sort' && value === 'newest')) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <main className="page-shell">
      <div className="wrap">
        <div className="page-intro"><span className="eyebrow">THE FARMSTEAD MARKET</span><h1>Fresh picks, <em>good people.</em></h1><p>Meet the season's best, straight from the hands that grew it.</p></div>
        <div className="catalog-toolbar">
          <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => update('q', event.target.value)} placeholder="Find something lovely..." aria-label="Search products" /></label>
          <label className="sort-select"><SlidersHorizontal size={16} /><span>Sort</span><select value={sort} onChange={(event) => update('sort', event.target.value)} aria-label="Sort products"><option value="newest">Newest first</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="name_asc">Name A–Z</option></select></label>
        </div>
        <div className="catalog-layout">
          <aside className="category-filter"><span className="filter-title">CATEGORIES</span>{categories.map((item) => <button className={category === item ? 'filter-active' : ''} key={item} onClick={() => update('category', item)}>{item}<span>{category === item ? '↗' : ''}</span></button>)}</aside>
          <section className="catalog-results">
            <div className="result-count">{loading ? 'Finding the freshest picks…' : <>{products.length} {products.length === 1 ? 'good thing' : 'good things'} to discover</>}</div>
            {error && <div className="notice notice-error">{error}</div>}
            {loading ? <div className="loading-state">Gathering the harvest<span className="loader" /></div>
              : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.product_id} product={product} />)}</div>
                : <div className="empty-state"><Sprout size={30} /><h3>No produce found just yet.</h3><p>Try another search or category — the market is always changing.</p><button className="text-link" onClick={() => setSearchParams({})}>Clear filters</button></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
