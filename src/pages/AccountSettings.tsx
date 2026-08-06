import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./AccountSettings.css";

const API_BASE = "http://localhost:3000";

interface Account {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  linkedProviders: string[];
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
