import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import OAuthButtons from "../components/OAuthButtons";
import "./Login.css";
import { API_BASE } from "../config";

//const API_BASE = "https://filtrix-3y8ynhfah-filtrixd.vercel.app/";

type Mode = "email" | "phone";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("email");

  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [phonePassword, setPhonePassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: emailPassword }),
      });
      if (!res.ok) throw new Error("Invalid email or password.");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: phonePassword }),
      });
      if (!res.ok) throw new Error("Invalid phone number or password.");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    window.location.href = `${API_BASE}/auth/google`;
  }

  function handleApple() {
    window.location.href = `${API_BASE}/auth/apple`;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue comparing devices"
      footer={
        <>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </>
      }
    >
      <OAuthButtons onGoogle={handleGoogle} onApple={handleApple} />

      <div className="login__tabs">
        <button
          type="button"
          className={`login__tab${mode === "email" ? " login__tab--active" : ""}`}
          onClick={() => {
            setMode("email");
            setError(null);
          }}
        >
          Email
        </button>
        <button
          type="button"
          className={`login__tab${mode === "phone" ? " login__tab--active" : ""}`}
          onClick={() => {
            setMode("phone");
            setError(null);
          }}
        >
          Phone
        </button>
      </div>

      {error && <p className="login__error">{error}</p>}

      {mode === "email" && (
        <form className="login__form" onSubmit={handleEmailLogin}>
          <label className="login__field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="login__field">
            <span>Password</span>
            <input
              type="password"
              required
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <Link to="/forgot-password" className="login__forgot">
            Forgot password?
          </Link>

          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      )}

      {mode === "phone" && (
        <form className="login__form" onSubmit={handlePhoneLogin}>
          <label className="login__field">
            <span>Phone number</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5xx xxx xx xx"
            />
          </label>

          <label className="login__field">
            <span>Password</span>
            <input
              type="password"
              required
              value={phonePassword}
              onChange={(e) => setPhonePassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <Link to="/forgot-password" className="login__forgot">
            Forgot password?
          </Link>

          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
