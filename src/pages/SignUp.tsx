import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import OAuthButtons from "../components/OAuthButtons";
import "./SignUp.css";
import { API_BASE } from "../config";

type Mode = "email" | "phone";

export default function SignUp() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSignUp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error("Couldn't create your account.");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Couldn't send the code. Check the number.");
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, name }),
      });
      if (!res.ok) throw new Error("That code didn't work.");
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
      title="Create your account"
      subtitle="Join filtrix to compare and save your favorites"
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <OAuthButtons onGoogle={handleGoogle} onApple={handleApple} />

      <div className="signup__tabs">
        <button
          type="button"
          className={`signup__tab${mode === "email" ? " signup__tab--active" : ""}`}
          onClick={() => {
            setMode("email");
            setError(null);
          }}
        >
          Email
        </button>
        <button
          type="button"
          className={`signup__tab${mode === "phone" ? " signup__tab--active" : ""}`}
          onClick={() => {
            setMode("phone");
            setError(null);
          }}
        >
          Phone
        </button>
      </div>

      {error && <p className="signup__error">{error}</p>}

      {mode === "email" && (
        <form className="signup__form" onSubmit={handleEmailSignUp}>
          <label className="signup__field">
            <span>Full name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </label>

          <label className="signup__field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="signup__field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>

          <label className="signup__field">
            <span>Confirm password</span>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="signup__submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}

      {mode === "phone" && !otpSent && (
        <div className="signup__form">
          <label className="signup__field">
            <span>Full name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </label>

          <label className="signup__field">
            <span>Phone number</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5xx xxx xx xx"
            />
          </label>

          <button
            type="button"
            className="signup__submit"
            disabled={loading || !phone || !name}
            onClick={handleSendOtp}
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </div>
      )}

      {mode === "phone" && otpSent && (
        <form className="signup__form" onSubmit={handleVerifyOtp}>
          <p className="signup__otp-hint">
            Enter the code sent to <strong>{phone}</strong>
          </p>

          <label className="signup__field">
            <span>Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
            />
          </label>

          <button type="submit" className="signup__submit" disabled={loading}>
            {loading ? "Verifying…" : "Verify & create account"}
          </button>

          <button
            type="button"
            className="signup__resend"
            onClick={handleSendOtp}
            disabled={loading}
          >
            Resend code
          </button>
        </form>
      )}

      <p className="signup__terms">
        By continuing, you agree to filtrix's Terms of Service and Privacy
        Policy.
      </p>
    </AuthLayout>
  );
}
