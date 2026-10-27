import { ArrowRight, Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: searchParams.get('role') === 'farmer' ? 'farmer' : 'customer', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = isRegister ? await register(form) : await login({ email: form.email, password: form.password });
      navigate(location.state?.from || (user.role === 'farmer' ? '/dashboard' : '/products'), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="auth-page"><div className="auth-art"><img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85" alt="Sunlight over green farm fields" /><Link className="brand auth-brand" to="/"><span className="brand-mark"><Leaf size={19} /></span>farmstead<span className="brand-dot">.</span></Link><div className="auth-quote"><span className="eyebrow">A MARKET WITH MEANING</span><p>“When you know your farmer, every meal tastes a little better.”</p><span>GOOD FOOD STARTS CLOSE TO HOME.</span></div></div>
    <div className="auth-panel"><Link to="/" className="auth-back">← Back to the market</Link><div className="auth-form-wrap"><span className="eyebrow">{isRegister ? 'COME ON IN' : 'WELCOME BACK'}</span><h1>{isRegister ? 'Let’s grow.' : 'Good to see you.'}</h1><p>{isRegister ? 'Create an account and find your place at the market.' : 'Sign in to pick up where you left off.'}</p><Notice message={error} />
      <form className="form-stack" onSubmit={submit}>
        {isRegister && <><label>Your name<div className="input-icon"><UserRound size={17} /><input name="name" value={form.name} onChange={update} placeholder="How should we call you?" required minLength={2} maxLength={100} autoComplete="name" /></div></label>
          <label>I’m here as<select className="form-select" name="role" value={form.role} onChange={update}><option value="customer">A customer</option><option value="farmer">A farmer</option></select></label>
          <label>Phone number <span className="optional">(optional)</span><input className="plain-input" name="phone" value={form.phone} onChange={update} placeholder="+91 98765 43210" maxLength={15} autoComplete="tel" /></label></>}
        <label>Email address<div className="input-icon"><Mail size={17} /><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required maxLength={254} autoComplete="email" /></div></label>
        <label>Password<div className="input-icon"><LockKeyhole size={17} /><input name="password" type="password" value={form.password} onChange={update} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} required minLength={isRegister ? 8 : 1} autoComplete={isRegister ? 'new-password' : 'current-password'} /></div></label>
        <button className="button button-dark auth-submit" type="submit" disabled={submitting}>{submitting ? 'One moment…' : isRegister ? 'Create your account' : 'Sign in'} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch">{isRegister ? 'Already part of the market?' : 'New around here?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
      {isRegister && <p className="auth-disclaimer">By joining, you agree to grow and shop with kindness.</p>}
    </div></div>
  </main>;
}
