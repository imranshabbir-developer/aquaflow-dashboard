import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Sign in — P3 Care Communications' },
      { name: 'description', content: 'Secure access to the P3 Care patient communications workspace.' },
      { property: 'og:title', content: 'P3 Care Communications' },
      { property: 'og:description', content: 'Secure patient messaging workspace.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300&display=swap' },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Enter an email and password to continue.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem('p3care-demo', 'yes');
      nav({ to: '/sms' });
    }, 450);
  };

  return (
    <main className="ring-login">
      <div className="glow-rings">
        <i />
        <i />
        <i />
        <form className="login" onSubmit={submit}>
          <h2>Login</h2>
          <div className="inputBx">
            <input
              type="text"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="inputBx">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="ring-login-error">{error}</p>}
          <div className="inputBx">
            <input type="submit" value={loading ? 'Opening workspace…' : 'Sign in'} disabled={loading} />
          </div>
        </form>
      </div>
    </main>
  );
}
