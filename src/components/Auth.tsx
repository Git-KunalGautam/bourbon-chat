import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { motion } from 'motion/react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|co|co\.in|org|net|edu|gov|dev)$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!validateEmail(email)) {
        const msg =
          "Please enter a valid email address (example: mail@gmail.com, yahoo.in, domain.co.in)";
        setError(msg);
        toast.error(msg);
        return;
      }

      if (isLogin) {
        // Sign In
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          const errMsg = result.error === "CredentialsSignin" ? "Invalid email or password" : result.error;
          setError(errMsg);
          toast.error(errMsg);
        } else {
          toast.success("Welcome back!");
          window.location.reload();
        }
      } else {
        // Sign Up
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (response.ok) {
          // Automatic login after signup
          const signinResult = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });

          if (signinResult?.error) {
            const warningMsg = "Account created, but automatic sign-in failed. Please sign in manually.";
            setError(warningMsg);
            toast.warning(warningMsg);
            setIsLogin(true);
          } else {
            toast.success("Account created successfully!");
            window.location.reload();
          }
        } else {
          const errMsg = data.message || 'Something went wrong during signup';
          setError(errMsg);
          toast.error(errMsg);
        }
      }
    } catch (err) {
      const errMsg = 'An unexpected error occurred. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-effect p-8 rounded-2xl shadow-2xl bg-[var(--bg-card)] text-[var(--text-main)]"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[var(--primary)] rounded-huge flex items-center justify-center mx-auto mb-6 rotate-12 shadow-2xl shadow-[var(--primary-light)]">
            <span className="text-white text-3xl font-black -rotate-12">B</span>
          </div>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">Bourbon</h1>
          <p className="text-[var(--text-muted)] font-bold mt-2">Premium Real-time Chat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-shake text-center">
              {error}
            </div>
          )}

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-xs font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                required={!isLogin}
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-[var(--accent-bg)] border border-[var(--border)] outline-none focus:ring-2 ring-[var(--primary-light)] transition-all text-[var(--text-main)] font-bold disabled:opacity-50 placeholder:text-[var(--text-muted)]"
                placeholder="John Doe"
              />
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[var(--accent-bg)] border border-[var(--border)] outline-none focus:ring-2 ring-[var(--primary-light)] transition-all text-[var(--text-main)] font-bold disabled:opacity-50 placeholder:text-[var(--text-muted)]"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">Password</label>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-[var(--accent-bg)] border border-[var(--border)] outline-none focus:ring-2 ring-[var(--primary-light)] transition-all text-[var(--text-main)] font-bold disabled:opacity-50 placeholder:text-[var(--text-muted)]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white font-black shadow-2xl shadow-[var(--primary-light)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--bg-app)] px-4 text-[var(--text-muted)] font-black">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => signIn('google')}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-[var(--accent-bg)] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
