import React from "react";

export default function NGOSettings({ settings, setSettings }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Settings</h2>

      <div className="bg-white p-4 rounded shadow border space-y-3">
        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Notifications</div>
            <div className="text-sm text-gray-600">
              Receive updates for case requests and appointments.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) =>
              setSettings((s) => ({ ...s, notifications: e.target.checked }))
            }
            className="w-5 h-5"
          />
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Dark Mode (preview)</div>
            <div className="text-sm text-gray-600">
              Toggle UI dark mode (local preview).
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, darkMode: e.target.checked }))
            }
            className="w-5 h-5"
          />
        </div>

        {/* Case Acceptance */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">
              Auto-accept case requests
            </div>
            <div className="text-sm text-gray-600">
              Automatically accept case requests matching your NGO type.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoAccept}
            onChange={(e) =>
              setSettings((s) => ({ ...s, autoAccept: e.target.checked }))
            }
            className="w-5 h-5"
          />
        </div>

        <div className="pt-3">
          <button
            onClick={() => alert("Settings saved (local).")}
            className="bg-purple-700 text-white px-4 py-2 rounded"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

