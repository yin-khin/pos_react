import { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert } from "../../../utils/alert";
import "./StockAlertSetting.css";

const StockAlertSettingPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [settings, setSettings] = useState({
    stock_alert: 5,
    qty_alert: 0,
    is_alert: 0,
    low_stock_enabled: false,
    available_stock_enabled: false,
    unavailable_stock_enabled: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await request("/api/general-settings", "GET");
      if (response.success && response.data) {
        setSettings({
          stock_alert: response.data.stock_alert || 5,
          qty_alert: response.data.qty_alert || 0,
          is_alert: response.data.is_alert || 0,
          low_stock_enabled: (response.data.is_alert & 1) === 1,
          available_stock_enabled: (response.data.is_alert & 2) === 2,
          unavailable_stock_enabled: (response.data.is_alert & 4) === 4,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // If settings don't exist, use defaults
      if (error.response?.status === 404) {
        console.log("No settings found, using defaults");
      } else {
        showAlert("error", "Error loading settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Calculate is_alert bitmask
      let isAlertValue = 0;
      if (settings.low_stock_enabled) isAlertValue |= 1;
      if (settings.available_stock_enabled) isAlertValue |= 2;
      if (settings.unavailable_stock_enabled) isAlertValue |= 4;

      const payload = {
        stock_alert: parseInt(settings.stock_alert) || 5,
        qty_alert: parseInt(settings.qty_alert) || 0,
        is_alert: isAlertValue,
        remark: "Stock alert settings",
      };

      // Try to get existing settings first
      let response;
      try {
        const existing = await request("/api/general-settings", "GET");
        if (existing.success && existing.data) {
          // Update existing
          response = await request(
            `/api/general-settings/${existing.data.id}`,
            "PUT",
            payload
          );
        }
      } catch (error) {
        // If not found, create new
        if (error.response?.status === 404) {
          response = await request("/api/general-settings", "POST", payload);
        } else {
          throw error;
        }
      }

      if (response && response.success) {
        showAlert("success", "Stock alert settings saved successfully");
        fetchSettings();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showAlert("error", "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchSettings();
  };

  const handleScanNow = async () => {
    setScanning(true);
    try {
      const response = await request("/api/general-settings/scan-alerts", "POST");
      if (response && response.success) {
        showAlert("success", `Scanning ${response.data.totalProducts} products. Alerts will be sent to Telegram for low/out of stock items.`);
      }
    } catch (error) {
      console.error("Error scanning products:", error);
      showAlert("error", "Error scanning products for alerts");
    } finally {
      setScanning(false);
    }
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading) {
    return (
      <div className="stock-alert-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="stock-alert-container">
      <div className="stock-alert-card">
        <div className="stock-alert-header">
          <div className="header-icon">🔔</div>
          <h2>Stock Alert Settings</h2>
        </div>

        <div className="stock-alert-body">
          {/* Stock Alert Threshold */}
          <div className="setting-section">
            <div className="setting-label">
              <div className="label-icon">📦</div>
              <div>
                <h3>Stock Alert Threshold</h3>
                <p className="setting-description">
                  Set the minimum quantity before low stock alerts trigger
                </p>
              </div>
            </div>
            <div className="setting-input">
              <input
                type="number"
                min="0"
                value={settings.stock_alert}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    stock_alert: e.target.value,
                  }))
                }
                className="threshold-input"
              />
              <span className="input-suffix">units</span>
            </div>
          </div>

          {/* Quantity Alert Threshold */}
          <div className="setting-section">
            <div className="setting-label">
              <div className="label-icon">⚠️</div>
              <div>
                <h3>Quantity Alert Threshold</h3>
                <p className="setting-description">
                  Set additional quantity threshold for alerts
                </p>
              </div>
            </div>
            <div className="setting-input">
              <input
                type="number"
                min="0"
                value={settings.qty_alert}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    qty_alert: e.target.value,
                  }))
                }
                className="threshold-input"
              />
              <span className="input-suffix">units</span>
            </div>
          </div>

          {/* Stock Status Notifications */}
          <div className="setting-section notifications-section">
            <div className="section-title">
              <h3>Stock Status Notifications</h3>
              <p className="setting-description">
                Choose which stock status changes you want to be notified about
              </p>
            </div>

            <div className="notification-options">
              {/* Low Stock Alerts */}
              <div className="notification-item">
                <div className="notification-info">
                  <div className="notification-icon low-stock">⚡</div>
                  <div>
                    <h4>Low Stock Alerts</h4>
                    <p>Get notified when products fall below alert threshold</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.low_stock_enabled}
                    onChange={() => handleToggle("low_stock_enabled")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Available Stock Alerts */}
              <div className="notification-item">
                <div className="notification-info">
                  <div className="notification-icon available-stock">✓</div>
                  <div>
                    <h4>Available Stock Alerts</h4>
                    <p>Get notified about available stock updates</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.available_stock_enabled}
                    onChange={() => handleToggle("available_stock_enabled")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Unavailable Stock Alerts */}
              <div className="notification-item">
                <div className="notification-info">
                  <div className="notification-icon unavailable-stock">✕</div>
                  <div>
                    <h4>Unavailable Stock Alerts</h4>
                    <p>Get notified when products become out of stock</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.unavailable_stock_enabled}
                    onChange={() => handleToggle("unavailable_stock_enabled")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="stock-alert-footer">
          <button
            className="btn-scan"
            onClick={handleScanNow}
            disabled={scanning || saving}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: scanning ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: scanning ? 0.6 : 1,
              transition: "all 0.3s ease",
            }}
          >
            {scanning ? "🔍 Scanning..." : "� Scan All Products Now"}
          </button>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              ✕ Cancel
            </button>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "💾 Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlertSettingPage;
