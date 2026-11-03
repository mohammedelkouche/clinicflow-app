import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import { eyebrow, formControl, primaryButton } from "../styles/ui.js";

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
    <main className="grid min-h-screen lg:grid-cols-[minmax(22rem,0.9fr)_minmax(30rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-linear-to-br from-clinic-800 via-clinic-600 to-teal-500 px-[clamp(2rem,5vw,5rem)] py-12 text-white lg:block" aria-label="ClinicFlow introduction">
        <div className="relative z-10 flex min-h-[calc(100vh-6rem)] flex-col">
          <div className="inline-flex items-center gap-2.5 text-lg font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-teal-200 text-xl leading-none text-clinic-800">+</span>
            <span>ClinicFlow</span>
          </div>
          <div className="my-auto max-w-xl">
            <p className="mb-3 text-xs font-extrabold tracking-[0.12em] text-teal-200 uppercase">A calmer clinic workspace</p>
            <h1 className="mb-6 max-w-[11ch] text-5xl leading-[1.05] font-extrabold tracking-[-0.045em] xl:text-7xl">Keep every patient visit moving.</h1>
            <p className="max-w-lg text-lg leading-8 text-teal-50">
              One secure place for your team to organize patients, appointments,
              and the day ahead.
            </p>
          </div>
          <p className="text-sm text-teal-100">Private access for clinic staff only</p>
        </div>
      </section>
      <section className="grid min-h-screen place-items-center bg-white px-6 py-12 sm:px-12 lg:px-[clamp(3rem,7vw,7rem)]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className={eyebrow}>Welcome back</p>
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-ink">Sign in to your account</h2>
            <p className="leading-6 text-muted">Use the credentials provided by your clinic administrator.</p>
          </div>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="mt-1 text-sm font-bold text-ink" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@clinicflow.test"
              autoComplete="email"
              required
              className={formControl}
            />
            <label className="mt-1 text-sm font-bold text-ink" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className={formControl}
            />
            <button
              className={`${primaryButton} mt-3 w-full`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm leading-6 text-muted">
            Having trouble signing in? Contact your clinic administrator.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
