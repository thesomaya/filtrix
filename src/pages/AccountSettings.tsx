import { useEffect, useState, type FormEvent } from "react";
import "./AccountSettings.css";

const API_BASE = "https://filtrix-3y8ynhfah-filtrixd.vercel.app/";

interface Account {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  linkedProviders: string[]; // e.g. ["google", "apple"]
}

export default function AccountSettings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/account/me`, {
          credentials: "include",
        });
        const data: Account = await res.json();
        if (!cancelled) {
          setAccount(data);
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone ?? "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAccount();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setProfileStatus(null);
    try {
      const res = await fetch(`${API_BASE}/account/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) throw new Error();
      setProfileStatus("Saved.");
    } catch {
      setProfileStatus("Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus("New passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/account/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error();
      setPasswordStatus("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordStatus("Couldn't update password. Check your current password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlink(provider: string) {
    if (!account) return;
    try {
      await fetch(`${API_BASE}/account/link/${provider}`, {
        method: "DELETE",
        credentials: "include",
      });
      setAccount({
        ...account,
        linkedProviders: account.linkedProviders.filter((p) => p !== provider),
      });
    } catch {
      // no-op — leave state as-is on failure
    }
  }

  function handleLink(provider: "google" | "apple") {
    window.location.href = `${API_BASE}/auth/${provider}?link=true`;
  }

  if (loading) {
    return (
      <div className="account-settings">
        <p className="account-settings__loading">Loading account…</p>
      </div>
    );
  }

  const linked = account?.linkedProviders ?? [];

  return (
    <div className="account-settings">
      <h1 className="account-settings__title">Account settings</h1>
      <p className="account-settings__subtitle">
        Manage your profile, sign-in methods, and password
      </p>

      <div className="account-settings__grid">
        <section className="account-settings__card">
          <h2 className="account-settings__card-title">Profile</h2>
          <form className="account-settings__form" onSubmit={handleProfileSave}>
            <label className="account-settings__field">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="account-settings__field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="account-settings__field">
              <span>Phone number</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
              />
            </label>

            {profileStatus && (
              <p className="account-settings__status">{profileStatus}</p>
            )}

            <button
              type="submit"
              className="account-settings__save"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>

        <section className="account-settings__card">
          <h2 className="account-settings__card-title">Connected accounts</h2>
          <p className="account-settings__card-hint">
            Use Google or Apple to sign in without a password.
          </p>

          <div className="account-settings__provider">
            <div className="account-settings__provider-info">
              <span className="account-settings__provider-icon">G</span>
              <div>
                <p className="account-settings__provider-name">Google</p>
                <p className="account-settings__provider-status">
                  {linked.includes("google") ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {linked.includes("google") ? (
              <button
                type="button"
                className="account-settings__provider-btn account-settings__provider-btn--unlink"
                onClick={() => handleUnlink("google")}
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                className="account-settings__provider-btn"
                onClick={() => handleLink("google")}
              >
                Connect
              </button>
            )}
          </div>

          <div className="account-settings__provider">
            <div className="account-settings__provider-info">
              <span className="account-settings__provider-icon account-settings__provider-icon--apple">
                <svg viewBox="0 0 384 512" width="16" height="16" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </span>
              <div>
                <p className="account-settings__provider-name">Apple</p>
                <p className="account-settings__provider-status">
                  {linked.includes("apple") ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {linked.includes("apple") ? (
              <button
                type="button"
                className="account-settings__provider-btn account-settings__provider-btn--unlink"
                onClick={() => handleUnlink("apple")}
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                className="account-settings__provider-btn"
                onClick={() => handleLink("apple")}
              >
                Connect
              </button>
            )}
          </div>
        </section>

        <section className="account-settings__card">
          <h2 className="account-settings__card-title">Password</h2>
          <form
            className="account-settings__form"
            onSubmit={handlePasswordSave}
          >
            <label className="account-settings__field">
              <span>Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <label className="account-settings__field">
              <span>New password</span>
              <input
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </label>

            <label className="account-settings__field">
              <span>Confirm new password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {passwordStatus && (
              <p className="account-settings__status">{passwordStatus}</p>
            )}

            <button
              type="submit"
              className="account-settings__save"
              disabled={saving}
            >
              {saving ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
