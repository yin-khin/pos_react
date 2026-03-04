import { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import "../../feature/category/category.css";

const emptyForm = {
  setting_code: "",
  setting_type: "",
  dec: "",
  status: "active",
};

const SettingPage = () => {
  const [settings, setSettings] = useState([]);
  const [filteredSettings, setFilteredSettings] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredSettings(
        settings.filter(
          (s) =>
            s.setting_code.toLowerCase().includes(kw) ||
            (s.setting_type && s.setting_type.toLowerCase().includes(kw)) ||
            (s.dec && s.dec.toLowerCase().includes(kw))
        )
      );
    } else {
      setFilteredSettings(settings);
    }
    setCurrentPage(1);
  }, [searchKeyword, settings]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await request("/api/settings", "GET");
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      showAlert("error", "Error fetching settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingCode(null);
    setShowForm(true);
  };

  const handleEdit = (setting) => {
    setFormData({
      setting_code: setting.setting_code,
      setting_type: setting.setting_type || "",
      dec: setting.dec || "",
      status: setting.status || "active",
    });
    setEditingCode(setting.setting_code);
    setShowForm(true);
  };

  const handleDelete = async (code) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete setting "${code}"?`,
      "Yes, delete it!"
    );
    if (result.isConfirmed) {
      try {
        const response = await request(`/api/settings/${code}`, "DELETE");
        if (response.success) {
          showAlert("success", "Setting deleted successfully");
          fetchSettings();
        }
      } catch (error) {
        console.error("Error deleting setting:", error);
        showAlert("error", "Error deleting setting");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.setting_code.trim()) {
      showAlert("warning", "Setting code is required");
      return;
    }

    try {
      let response;
      if (editingCode) {
        response = await request(`/api/settings/${editingCode}`, "PUT", {
          setting_type: formData.setting_type,
          dec: formData.dec,
          status: formData.status,
        });
      } else {
        response = await request("/api/settings", "POST", formData);
      }

      if (response.success) {
        showAlert(
          "success",
          editingCode
            ? "Setting updated successfully"
            : "Setting created successfully"
        );
        setShowForm(false);
        fetchSettings();
      }
    } catch (error) {
      console.error("Error saving setting:", error);
      showAlert("error", "Error saving setting");
    }
  };

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSettings = filteredSettings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title">Settings Management</h1>
        <button className="btn-add-category" onClick={handleAdd}>
          + Add Setting
        </button>
      </div>

      <div className="category-controls">
        <div className="items-per-page">
          <label>Show</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>settings per page</span>
        </div>
        <div className="search-box">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by code, type, or description..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <table className="category-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSettings.length > 0 ? (
                paginatedSettings.map((setting) => (
                  <tr key={setting.setting_code}>
                    <td>{setting.setting_code}</td>
                    <td>{setting.setting_type || "-"}</td>
                    <td>{setting.dec || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${setting.status === "active" ? "status-available" : "status-unavailable"}`}
                      >
                        {setting.status || "active"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(setting)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(setting.setting_code)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No settings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredSettings.length)} of{" "}
            {filteredSettings.length} settings
          </div>

          <div className="pagination-controls">
            <button
              className="btn-pagination"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="btn-pagination"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCode ? "Edit Setting" : "Add Setting"}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>
                  Setting Code <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.setting_code}
                  onChange={set("setting_code")}
                  disabled={!!editingCode}
                  placeholder="e.g. TAX_RATE, CURRENCY"
                  required
                />
              </div>
              <div className="form-group">
                <label>Setting Type</label>
                <input
                  type="text"
                  value={formData.setting_type}
                  onChange={set("setting_type")}
                  placeholder="e.g. number, string, boolean"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.dec}
                  onChange={set("dec")}
                  placeholder="Enter description..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={formData.status}
                      label="Status"
                      onChange={set("status")}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingCode ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingPage;
