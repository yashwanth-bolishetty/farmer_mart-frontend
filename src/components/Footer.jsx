import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div><Link className="brand footer-brand" to="/"><span className="brand-mark"><Leaf size={19} /></span>farmstead<span className="brand-dot">.</span></Link><p>Good things grow closer to home.</p></div>
        <div className="footer-links"><Link to="/products">Shop produce</Link><Link to="/register">Sell with us</Link><a href="mailto:hello@farmstead.local">Get in touch</a></div>
        <span className="copyright">© 2026 Farmstead Market</span>
      </div>
    </footer>
  );
}
