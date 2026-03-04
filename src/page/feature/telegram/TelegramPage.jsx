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
  tel_id: "",
  token: "",
  group: "",
  status: "active",
  is_alert: true,
};

const TelegramPage = () => {
  const [telegrams, setTelegrams] = useState([]);
  const [filteredTelegrams, setFilteredTelegrams] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchTelegrams();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredTelegrams(
        telegrams.filter(
          (t) =>
            t.tel_id.toLowerCase().includes(kw) ||
            (t.group && t.group.toLowerCase().includes(kw))
        )
      );
    } else {
      setFilteredTelegrams(telegrams);
    }
    setCurrentPage(1);
  }, [searchKeyword, telegrams]);

  const fetchTelegrams = async () => {
    setLoading(true);
    try {
      const response = await request("/api/telegrams", "GET");
      if (response.success && response.data) {
        setTelegrams(response.data);
      }
    } catch (error) {
      console.error("Error fetching telegrams:", error);
      showAlert("error", "Error fetching telegram configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (telegram) => {
    setFormData({
      tel_id: telegram.tel_id,
      token: telegram.token || "",
      group: telegram.group || "",
      status: telegram.status || "active",
      is_alert: telegram.is_alert ?? true,
    });
    setEditingId(telegram.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete this telegram configuration?`,
      "Yes, delete it!"
    );
    if (result.isConfirmed) {
      try {
        const response = await request(`/api/telegrams/${id}`, "DELETE");
        if (response.success) {
          showAlert("success", "Telegram configuration deleted successfully");
          fetchTelegrams();
        }
      } catch (error) {
        console.error("Error deleting telegram:", error);
        showAlert("error", "Error deleting telegram configuration");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tel_id.trim()) {
      showAlert("warning", "Telegram ID is required");
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await request(`/api/telegrams/${editingId}`, "PUT", {
          token: formData.token,
          group: formData.group,
          status: formData.status,
          is_alert: formData.is_alert,
        });
      } else {
        response = await request("/api/telegrams", "POST", formData);
      }

      if (response.success) {
        showAlert(
          "success",
          editingId
            ? "Telegram configuration updated successfully"
            : "Telegram configuration created successfully"
        );
        setShowForm(false);
        fetchTelegrams();
      }
    } catch (error) {
      console.error("Error saving telegram:", error);
      showAlert("error", "Error saving telegram configuration");
    }
  };

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const totalPages = Math.ceil(filteredTelegrams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTelegrams = filteredTelegrams.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title">Telegram Configuration</h1>
        <button className="btn-add-category" onClick={handleAdd}>
          + Add Configuration
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
          <span>configs per page</span>
        </div>
        <div className="search-box">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by ID or group..."
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
                <th>Telegram ID</th>
                <th>Group</th>
                <th>Status</th>
                <th>Alert Enabled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTelegrams.length > 0 ? (
                paginatedTelegrams.map((telegram) => (
                  <tr key={telegram.id}>
                    <td>{telegram.tel_id}</td>
                    <td>{telegram.group || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${telegram.status === "active" ? "status-available" : "status-unavailable"}`}
                      >
                        {telegram.status || "active"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${telegram.is_alert ? "status-available" : "status-unavailable"}`}
                      >
                        {telegram.is_alert ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(telegram)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(telegram.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No telegram configurations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredTelegrams.length)} of{" "}
            {filteredTelegrams.length} configurations
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
              <h2>
                {editingId
                  ? "Edit Telegram Configuration"
                  : "Add Telegram Configuration"}
              </h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>
                  Telegram ID <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.tel_id}
                  onChange={set("tel_id")}
                  disabled={!!editingId}
                  placeholder="Enter telegram ID"
                  required
                />
              </div>
              <div className="form-group">
                <label>Bot Token</label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={set("token")}
                  placeholder="Enter bot token"
                />
              </div>
              <div className="form-group">
                <label>Group</label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={set("group")}
                  placeholder="Enter group name or ID"
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
              <div className="form-group">
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="alert-label">Alert Enabled</InputLabel>
                    <Select
                      labelId="alert-label"
                      value={formData.is_alert}
                      label="Alert Enabled"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_alert: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? "Update" : "Create"}
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

export default TelegramPage;
