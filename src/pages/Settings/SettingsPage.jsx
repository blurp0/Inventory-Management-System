/**
 * SettingsPage.jsx
 * Phase 3 — User Settings: Profile, Preferences, Security tabs.
 */
import { useState, useRef } from 'react';
import {
  User,
  Shield,
  Settings2,
  Camera,
  Key,
  LogOut,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Warehouse,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { warehouseService } from '../../services';
import toast from 'react-hot-toast';
import './SettingsPage.css';

const TABS = [
  { id: 'profile',     label: 'Profile',      icon: User },
  { id: 'preferences', label: 'Preferences',  icon: Settings2 },
  { id: 'security',    label: 'Security',     icon: Shield },
  { id: 'warehouses',  label: 'Warehouses',   icon: Warehouse, adminOnly: true },
];

export default function SettingsPage() {
  const { user, role, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // ── Profile state ───────────────────────────────────────────
  const [displayName, setDisplayName]   = useState(user?.user_metadata?.full_name ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user?.user_metadata?.avatar_url ?? '');
  const [avatarFile, setAvatarFile]     = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInputRef = useRef(null);

  // ── Preferences state ───────────────────────────────────────
  const [defaultPage, setDefaultPage]             = useState(
    localStorage.getItem('pref_default_page') ?? '/dashboard'
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    parseInt(localStorage.getItem('pref_low_stock_threshold') ?? '10', 10)
  );
  const [savingPrefs, setSavingPrefs]             = useState(false);

  // ── Warehouse state (admin only) ────────────────────────────
  const [warehouses, setWarehouses]           = useState([]);
  const [warehousesLoaded, setWarehousesLoaded] = useState(false);
  const [newWarehouse, setNewWarehouse]       = useState({ name: '', location: '', description: '' });
  const [savingWarehouse, setSavingWarehouse] = useState(false);

  const loadWarehouses = async () => {
    try {
      const data = await warehouseService.getAll();
      setWarehouses(data);
      setWarehousesLoaded(true);
    } catch (err) {
      toast.error('Failed to load warehouses.');
    }
  };

  const handleAddWarehouse = async () => {
    if (!newWarehouse.name.trim()) { toast.error('Warehouse name is required.'); return; }
    setSavingWarehouse(true);
    try {
      const created = await warehouseService.create(newWarehouse);
      setWarehouses((prev) => [...prev, created]);
      setNewWarehouse({ name: '', location: '', description: '' });
      toast.success(`Warehouse "${created.name}" added!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add warehouse.');
    } finally {
      setSavingWarehouse(false);
    }
  };

  const handleDeleteWarehouse = async (id, name) => {
    try {
      await warehouseService.delete(id);
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
      toast.success(`Warehouse "${name}" deleted.`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete warehouse.');
    }
  };

  // Load warehouses when that tab opens
  const handleTabChange = (id) => {
    setActiveTab(id);
    if (id === 'warehouses' && !warehousesLoaded) {
      loadWarehouses();
    }
  };

  // ── Security state ──────────────────────────────────────────
  const [currentPwd, setCurrentPwd]   = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [savingPwd, setSavingPwd]     = useState(false);

  // ── Handlers ─────────────────────────────────────────────────

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Avatar must be under 2MB.'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      let avatarUrl = user.user_metadata?.avatar_url ?? '';

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = data.publicUrl;
      }

      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim(), avatar_url: avatarUrl },
      });
      if (error) throw error;

      toast.success('Profile updated successfully!');
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.message ?? 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = () => {
    setSavingPrefs(true);
    try {
      localStorage.setItem('pref_default_page', defaultPage);
      localStorage.setItem('pref_low_stock_threshold', String(lowStockThreshold));
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPwd || !confirmPwd) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPwd.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSavingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      toast.error(err.message ?? 'Failed to update password.');
    } finally {
      setSavingPwd(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Too short', color: 'var(--color-danger)', width: '20%' };
    if (pwd.length < 8) return { label: 'Weak', color: 'var(--color-warning)', width: '40%' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum   = /[0-9]/.test(pwd);
    const hasSym   = /[!@#$%^&*]/.test(pwd);
    const score    = [hasUpper, hasNum, hasSym].filter(Boolean).length;
    if (score === 3) return { label: 'Strong', color: 'var(--color-success)', width: '100%' };
    if (score === 2) return { label: 'Good', color: 'var(--color-accent)', width: '75%' };
    return { label: 'Fair', color: 'var(--color-warning)', width: '55%' };
  };

  const pwdStrength = getPasswordStrength(newPwd);
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="settings-page__header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account profile, preferences, and security.</p>
        </div>
      </div>

      <div className="settings-page__layout">
        {/* Sidebar Nav */}
        <nav className="settings-nav">
          {TABS.filter(tab => !tab.adminOnly || isAdmin).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-nav__item${activeTab === id ? ' active' : ''}`}
              onClick={() => handleTabChange(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}

          <div className="settings-nav__divider" />

          <div className="settings-nav__user-info">
            <div className="settings-nav__avatar">
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" />
                : <span>{initials}</span>
              }
            </div>
            <div className="settings-nav__user-meta">
              <strong>{displayName || 'User'}</strong>
              <span className="settings-nav__role-badge" data-role={role}>{role ?? 'viewer'}</span>
            </div>
          </div>

          <button className="settings-nav__logout" onClick={signOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </nav>

        {/* Tab Content */}
        <div className="settings-content">

          {/* ── Profile Tab ──────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="settings-card">
              <div className="settings-card__header">
                <User size={20} />
                <h2>Profile</h2>
              </div>

              <div className="settings-profile">
                {/* Avatar upload */}
                <div className="settings-avatar-section">
                  <div
                    className="settings-avatar"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Click to change avatar"
                  >
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Avatar" />
                      : <span className="settings-avatar__initials">{initials}</span>
                    }
                    <div className="settings-avatar__overlay">
                      <Camera size={20} />
                    </div>
                  </div>
                  <div className="settings-avatar-info">
                    <strong>Profile Photo</strong>
                    <p>PNG, JPG, WEBP up to 2MB. Square crop recommended.</p>
                    <button
                      className="settings-btn-link"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      Change Photo
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="settings-form-row">
                  <div className="settings-field">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your full name"
                      className="settings-input"
                    />
                  </div>
                  <div className="settings-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="settings-input settings-input--disabled"
                    />
                    <span className="settings-field__hint">Email is managed by your auth provider.</span>
                  </div>
                  <div className="settings-field">
                    <label>Role</label>
                    <input
                      type="text"
                      value={role ?? 'viewer'}
                      disabled
                      className="settings-input settings-input--disabled"
                    />
                    {isAdmin && <span className="settings-field__hint">As admin, you can assign roles via the Supabase dashboard.</span>}
                  </div>
                </div>

                <div className="settings-card__actions">
                  <button
                    className="settings-btn settings-btn--primary"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : <><Save size={16} /> Save Profile</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Preferences Tab ──────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="settings-card">
              <div className="settings-card__header">
                <Settings2 size={20} />
                <h2>Preferences</h2>
              </div>

              <div className="settings-prefs">
                <div className="settings-pref-group">
                  <h3>Appearance</h3>
                  <div className="settings-pref-row">
                    <div>
                      <strong>Theme</strong>
                      <p>Switch between dark and light mode.</p>
                    </div>
                    <button
                      className={`settings-toggle${theme === 'dark' ? ' active' : ''}`}
                      onClick={toggleTheme}
                      aria-label="Toggle theme"
                    >
                      <span className="settings-toggle__knob" />
                    </button>
                  </div>
                  <div className="settings-pref-row settings-pref-row--info">
                    <span>Current Theme: <strong>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</strong></span>
                  </div>
                </div>

                <div className="settings-pref-group">
                  <h3>Navigation</h3>
                  <div className="settings-field">
                    <label>Default Landing Page</label>
                    <select
                      className="settings-input"
                      value={defaultPage}
                      onChange={(e) => setDefaultPage(e.target.value)}
                    >
                      <option value="/dashboard">Dashboard</option>
                      <option value="/products">Products</option>
                      <option value="/transactions">Transactions</option>
                      <option value="/reports">Reports</option>
                    </select>
                    <span className="settings-field__hint">Where you go after signing in. (Requires re-login to apply.)</span>
                  </div>
                </div>

                <div className="settings-pref-group">
                  <h3>Inventory Alerts</h3>
                  <div className="settings-field">
                    <label>Default Reorder Alert Level</label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      className="settings-input"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10))}
                    />
                    <span className="settings-field__hint">Products with stock ≤ this value show a low-stock warning. Default: 10.</span>
                  </div>
                </div>

                <div className="settings-card__actions">
                  <button
                    className="settings-btn settings-btn--primary"
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                  >
                    {savingPrefs ? 'Saving...' : <><CheckCircle2 size={16} /> Save Preferences</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Security Tab ─────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="settings-card">
              <div className="settings-card__header">
                <Shield size={20} />
                <h2>Security</h2>
              </div>

              <div className="settings-security">
                <div className="settings-pref-group">
                  <h3>Change Password</h3>
                  <p className="settings-security__hint">
                    Applies to email/password accounts only. OAuth users manage passwords via their provider.
                  </p>
                  <div className="settings-form-row">
                    <div className="settings-field">
                      <label>New Password</label>
                      <div className="settings-password-wrapper">
                        <input
                          type={showPwd ? 'text' : 'password'}
                          className="settings-input"
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="settings-eye-btn"
                          onClick={() => setShowPwd(!showPwd)}
                          aria-label={showPwd ? 'Hide password' : 'Show password'}
                        >
                          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {pwdStrength && (
                        <div className="settings-pwd-strength">
                          <div className="settings-pwd-bar">
                            <div
                              className="settings-pwd-fill"
                              style={{ width: pwdStrength.width, background: pwdStrength.color }}
                            />
                          </div>
                          <span style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="settings-field">
                      <label>Confirm New Password</label>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        className="settings-input"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                      {confirmPwd && newPwd !== confirmPwd && (
                        <span className="settings-field__error">Passwords do not match.</span>
                      )}
                    </div>
                  </div>
                  <div className="settings-card__actions">
                    <button
                      className="settings-btn settings-btn--primary"
                      onClick={handleChangePassword}
                      disabled={savingPwd || !newPwd || !confirmPwd}
                    >
                      {savingPwd ? 'Updating...' : <><Key size={16} /> Update Password</>}
                    </button>
                  </div>
                </div>

                <div className="settings-pref-group">
                  <h3>Auth Provider</h3>
                  <div className="settings-provider-info">
                    <div className="settings-provider-badge">
                      <span>✉</span>
                      <div>
                        <strong>{user?.email}</strong>
                        <p>Signed in via {user?.app_metadata?.provider ?? 'email'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Warehouses Tab (Admin Only) ───────────────────── */}
          {activeTab === 'warehouses' && isAdmin && (
            <div className="settings-card">
              <div className="settings-card__header">
                <Warehouse size={20} />
                <h2>Warehouses</h2>
              </div>

              <div className="settings-prefs">
                <div className="settings-pref-group">
                  <h3>Add New Warehouse</h3>
                  <div className="settings-form-row">
                    <div className="settings-field">
                      <label>Name *</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="e.g., Main Warehouse"
                        value={newWarehouse.name}
                        onChange={(e) => setNewWarehouse((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Location</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="e.g., Building A, Floor 2"
                        value={newWarehouse.location}
                        onChange={(e) => setNewWarehouse((p) => ({ ...p, location: e.target.value }))}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Description</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="Optional notes"
                        value={newWarehouse.description}
                        onChange={(e) => setNewWarehouse((p) => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="settings-card__actions">
                    <button
                      className="settings-btn settings-btn--primary"
                      onClick={handleAddWarehouse}
                      disabled={savingWarehouse}
                    >
                      {savingWarehouse ? 'Adding...' : <><Plus size={16} /> Add Warehouse</>}
                    </button>
                  </div>
                </div>

                <div className="settings-pref-group">
                  <h3>Existing Warehouses ({warehouses.length})</h3>
                  {warehouses.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      No warehouses configured yet.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {warehouses.map((wh) => (
                        <div key={wh.id} className="settings-provider-badge" style={{ justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <Warehouse size={20} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                            <div>
                              <strong>{wh.name}</strong>
                              <p>{wh.location || 'No location specified'}</p>
                            </div>
                          </div>
                          <button
                            className="settings-btn"
                            style={{ background: 'var(--color-danger-dim)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '6px 12px' }}
                            onClick={() => handleDeleteWarehouse(wh.id, wh.name)}
                            title="Delete warehouse"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
