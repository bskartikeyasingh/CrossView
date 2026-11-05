import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Check, Shield, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function SettingsPage() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [categories, setCategories] = useState(
    user?.preferences?.categories || ['Climate', 'Economy', 'Technology', 'World']
  );
  const [defaultView, setDefaultView] = useState(
    user?.preferences?.defaultPerspectiveView || 'consolidated'
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.preferences?.categories) setCategories(user.preferences.categories);
  }, [user]);

  const allCategories = ['Climate', 'Economy', 'Technology', 'World', 'Politics', 'Science', 'Defense'];

  const toggleCategory = (cat) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await Promise.all([
        apiService.updateProfile({ name }),
        apiService.updatePreferences({
          categories,
          defaultPerspectiveView: defaultView,
        }),
      ]);

      setUser((prev) => ({
        ...prev,
        name,
        preferences: {
          ...prev?.preferences,
          categories,
          defaultPerspectiveView: defaultView,
        },
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-navy" />
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Analyst Profile & Preferences
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          Customize your CrossView news monitoring domains, default perspective models, and account details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white p-6 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <User className="w-4 h-4 text-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Identity & Role
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-[#F7F7F5] border border-border rounded text-sm text-primary focus:outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'analyst@crossview.news'}
                className="w-full p-2 bg-gray-100 border border-border rounded text-sm text-secondary cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs text-secondary">
            <span>
              <strong>Role:</strong> {user?.role || 'USER'}
            </span>
            <span>•</span>
            <span>
              <strong>Firebase UID:</strong> {user?.firebaseUid || 'Verified'}
            </span>
          </div>
        </div>

        {/* Intelligence Topic Preferences */}
        <div className="bg-white p-6 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Layers className="w-4 h-4 text-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Priority Coverage Domains
            </h3>
          </div>
          <p className="text-xs text-secondary">
            Select the domains that CrossView highlights across your automated activity feed and alerts.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {allCategories.map((cat) => {
              const active = categories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-navy text-white shadow-xs'
                      : 'bg-[#F7F7F5] text-secondary hover:text-primary border border-border'
                  }`}
                >
                  {cat} {active ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Perspective Presentation Preference */}
        <div className="bg-white p-6 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Shield className="w-4 h-4 text-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Default Perspective Layout
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'consolidated', title: 'Consolidated AI Report', desc: 'Synthesized overview with consensus points' },
              { id: 'side-by-side', title: 'Side-by-Side Compare', desc: 'Direct publisher-by-publisher column matrix' },
              { id: 'timeline', title: 'Chronological Timeline', desc: 'Milestone progression as dispatches break' },
            ].map((view) => (
              <div
                key={view.id}
                onClick={() => setDefaultView(view.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  defaultView === view.id
                    ? 'border-navy bg-navy/5 text-primary shadow-xs'
                    : 'border-border bg-white hover:bg-[#F7F7F5] text-secondary'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-primary">{view.title}</span>
                  {defaultView === view.id && <Check className="w-4 h-4 text-navy" />}
                </div>
                <p className="text-xs text-secondary">{view.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                Preferences successfully saved!
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-md text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}

