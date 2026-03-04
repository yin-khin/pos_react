import { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert } from "../../../utils/alert";
import "../../feature/category/category.css";

const emptyForm = {
  store_name: "",
  email: "",
  website: "",
  logo: "",
};

const StoreInfoPage = () => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    setLoading(true);
    try {
      const response = await request("/api/store-info", "GET");
      if (response.success && response.data) {
        setStoreInfo(response.data);
        setFormData({
          store_name: response.data.store_name || "",
          email: response.data.email || "",
          website: response.data.website || "",
          logo: response.data.logo || "",
        });
        setLogoPreview(response.data.logo || "");
      }
    } catch (error) {
      console.error("Error fetching store info:", error);
      // Store info might not exist yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.store_name.trim()) {
      showAlert("warning", "Store name is required");
      return;
    }

    try {
      let logoData = formData.logo;
      if (logoFile) {
        const reader = new FileReader();
        logoData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoFile);
        });
      }

      const data = {
        store_name: formData.store_name,
        email: formData.email || null,
        website: formData.website || null,
        logo: logoData || null,
      };

      let response;
      if (storeInfo && storeInfo.id) {
        // Update existing
        response = await request(`/api/store-info/${storeInfo.id}`, "PUT", data);
      } else {
        // Create new
        response = await request("/api/store-info", "POST", data);
      }

      if (response.success) {
        showAlert("success", "Store information saved successfully");
        setEditing(false);
        fetchStoreInfo();
      }
    } catch (error) {
      console.error("Error saving store info:", error);
      showAlert("error", "Error saving store information");
    }
  };

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  if (loading) {
    return (
      <div className="category-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title">Store Information</h1>
        {!editing && storeInfo && (
          <button className="btn-add-category" onClick={() => setEditing(true)}>
            ✎ Edit Information
          </button>
        )}
      </div>

      {!editing && storeInfo ? (
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div>
              {storeInfo.logo ? (
                <img
                  src={storeInfo.logo}
                  alt="Store Logo"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    background: "#f0f0f0",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  No Logo
                </div>
              )}
            </div>
            <div>
              <h2 style={{ margin: "0 0 20px", color: "#1a3a52" }}>
                {storeInfo.store_name}
              </h2>
              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#666" }}>Email:</strong>
                <p style={{ margin: "5px 0 0", fontSize: "16px" }}>
                  {storeInfo.email || "-"}
                </p>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#666" }}>Website:</strong>
                <p style={{ margin: "5px 0 0", fontSize: "16px" }}>
                  {storeInfo.website ? (
                    <a
                      href={storeInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#28a745" }}
                    >
                      {storeInfo.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>
                Store Name <span style={{ color: "#dc3545" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.store_name}
                onChange={set("store_name")}
                placeholder="Enter store name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={set("email")}
                placeholder="store@example.com"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={set("website")}
                placeholder="https://www.example.com"
              />
            </div>
            <div className="form-group">
              <label>Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
              {logoPreview && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      objectFit: "contain",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      padding: 4,
                    }}
                  />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                💾 Save Information
              </button>
              {storeInfo && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      store_name: storeInfo.store_name || "",
                      email: storeInfo.email || "",
                      website: storeInfo.website || "",
                      logo: storeInfo.logo || "",
                    });
                    setLogoPreview(storeInfo.logo || "");
                    setLogoFile(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StoreInfoPage;
