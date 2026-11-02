import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Welcome back to ClinicFlow.");
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ??
          "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="ClinicFlow introduction">
        <div className="login-story__content">
          <div className="brand brand--light">
            <span className="brand__mark">+</span>
            <span>ClinicFlow</span>
          </div>
          <div className="story-message">
            <p className="eyebrow">A calmer clinic workspace</p>
            <h1>Keep every patient visit moving.</h1>
            <p>
              One secure place for your team to organize patients, appointments,
              and the day ahead.
            </p>
          </div>
          <p className="story-footnote">Private access for clinic staff only</p>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__heading">
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in to your account</h2>
            <p>Use the credentials provided by your clinic administrator.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@clinicflow.test"
              autoComplete="email"
              required
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              className="button button--primary button--wide"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="login-help">
            Having trouble signing in? Contact your clinic administrator.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
