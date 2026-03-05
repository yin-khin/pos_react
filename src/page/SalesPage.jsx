/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import request from "../utils/request";
import { showAlert, showConfirm } from "../utils/alert";
import "./feature/category/category.css";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [newSaleData, setNewSaleData] = useState({
    invoice_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    pay_method: 'Cash',
    qr_code: '',
    items: [],
    sub_total: 0,
    tax: 0,
    total: 0
  });
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredSales(
        sales.filter(
          (s) =>
            s.sale_id.toLowerCase().includes(kw) ||
            (s.invoice_id && s.invoice_id.toLowerCase().includes(kw)) ||
            (s.pay_method && s.pay_method.toLowerCase().includes(kw))
        )
      );
    } else {
      setFilteredSales(sales);
    }
    setCurrentPage(1);
  }, [searchKeyword, sales]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await request("/api/sales?limit=100", "GET");
      if (response.success && response.data) {
        setSales(response.data);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      showAlert("error", "Error fetching sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await request("/api/products?limit=100", "GET");
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) return;

    const existingItem = cart.find(item => item.prd_id === selectedProduct.prd_id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.prd_id === selectedProduct.prd_id
          ? { ...item, qty: item.qty + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        prd_id: selectedProduct.prd_id,
        name: selectedProduct.name,
        price: parseFloat(selectedProduct.price),
        qty: quantity
      }]);
    }
    setSelectedProduct(null);
    setQuantity(1);
    calculateTotals();
  };

  const removeFromCart = (prd_id) => {
    setCart(cart.filter(item => item.prd_id !== prd_id));
    calculateTotals();
  };

  const updateQuantity = (prd_id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(prd_id);
      return;
    }
    setCart(cart.map(item =>
      item.prd_id === prd_id ? { ...item, qty: newQty } : item
    ));
    calculateTotals();
  };

  const calculateTotals = () => {
    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subTotal * 0.1; // 10% tax
    const total = subTotal + tax;

    setNewSaleData(prev => ({
      ...prev,
      sub_total: subTotal,
      tax: tax,
      total: total,
      items: cart.map(item => ({
        prd_id: item.prd_id,
        qty: item.qty,
        price: item.price
      }))
    }));
  };

  const handleViewDetails = async (saleId) => {
    try {
      const response = await request(`/api/sales/${saleId}`, "GET");
      if (response.success && response.data) {
        setSelectedSale(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
      showAlert("error", "Error fetching sale details");
    }
  };

  const handleDelete = async (saleId) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete sale "${saleId}"? This action cannot be undone.`,
      "Yes, delete it!"
    );
    if (result.isConfirmed) {
      try {
        const response = await request(`/api/sales/${saleId}`, "DELETE");
        if (response.success) {
          showAlert("success", "Sale deleted successfully");
          fetchSales();
        }
      } catch (error) {
        console.error("Error deleting sale:", error);
        showAlert("error", "Error deleting sale");
      }
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!newSaleData.invoice_id || cart.length === 0) {
      showAlert("error", "Please fill invoice ID and add items to cart");
      return;
    }
    if (newSaleData.pay_method === 'KHQR' && !newSaleData.qr_code) {
      showAlert("error", "Please scan KHQR code for payment");
      return;
    }

    try {
      const response = await request("/api/sales", "POST", {
        invoice_id: newSaleData.invoice_id,
        sale_date: newSaleData.sale_date,
        amount: newSaleData.total,
        sub_total: newSaleData.sub_total,
        tax: newSaleData.tax,
        pay_method: newSaleData.pay_method,
        qr_code: newSaleData.qr_code,
        create_by: "admin", // Should get from auth context
        items: newSaleData.items
      });
      if (response.success) {
        showAlert("success", "Sale created successfully");
        setShowNewSaleModal(false);
        resetSaleForm();
        fetchSales();
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      showAlert("error", "Error creating sale");
    }
  };

  const resetSaleForm = () => {
    setNewSaleData({
      invoice_id: '',
      sale_date: new Date().toISOString().split('T')[0],
      pay_method: 'Cash',
      qr_code: '',
      items: [],
      sub_total: 0,
      tax: 0,
      total: 0
    });
    setCart([]);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const startScanning = async () => {
    setScanning(true);
    try {
      const QrScanner = (await import('qr-scanner')).default;
      const video = document.getElementById('qr-video');
      const qrScanner = new QrScanner(video, result => {
        setNewSaleData({...newSaleData, qr_code: result.data});
        setScanning(false);
        qrScanner.stop();
        qrScanner.destroy();
      });
      await qrScanner.start();
    } catch (error) {
      console.error("Error scanning QR:", error);
      setScanning(false);
    }
  };

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title">Sales Management</h1>
        <button
          className="btn-add"
          onClick={() => setShowNewSaleModal(true)}
        >
          + New Sale
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
          <span>sales per page</span>
        </div>
        <div className="search-box">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by sale ID, invoice, or payment method..."
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
                <th>Sale ID</th>
                <th>Invoice ID</th>
                <th>Sale Date</th>
                <th>Sub Total</th>
                <th>Tax</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.length > 0 ? (
                paginatedSales.map((sale) => (
                  <tr key={sale.sale_id}>
                    <td>{sale.sale_id}</td>
                    <td>{sale.invoice_id || "-"}</td>
                    <td>
                      {sale.sale_date
                        ? new Date(sale.sale_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ color: "blue" }}>
                      ${sale.sub_total != null ? parseFloat(sale.sub_total).toFixed(2) : "0.00"}
                    </td>
                    <td style={{ color: "orange" }}>
                      ${sale.tax != null ? parseFloat(sale.tax).toFixed(2) : "0.00"}
                    </td>
                    <td style={{ color: "green", fontWeight: "bold" }}>
                      ${sale.amount != null ? parseFloat(sale.amount).toFixed(2) : "0.00"}
                    </td>
                    <td>{sale.pay_method || "-"}</td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleViewDetails(sale.sale_id)}
                      >
                        👁 View
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(sale.sale_id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredSales.length)} of{" "}
            {filteredSales.length} sales
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

      {/* Sale Details Modal */}
      {showDetails && selectedSale && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px" }}
          >
            <div className="modal-header">
              <h2>Sale Details - {selectedSale.sale_id}</h2>
              <button
                className="btn-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <strong>Invoice ID:</strong>
                  <p>{selectedSale.invoice_id || "-"}</p>
                </div>
                <div>
                  <strong>Sale Date:</strong>
                  <p>
                    {selectedSale.sale_date
                      ? new Date(selectedSale.sale_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <strong>Payment Method:</strong>
                  <p>{selectedSale.pay_method || "-"}</p>
                </div>
                <div>
                  <strong>Created By:</strong>
                  <p>{selectedSale.create_by || "-"}</p>
                </div>
              </div>

              <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
                Sale Items
              </h3>
              {selectedSale.SaleItemsDetails &&
              selectedSale.SaleItemsDetails.length > 0 ? (
                <table className="category-table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.SaleItemsDetails.map((item) => (
                      <tr key={item.std_id}>
                        <td>{item.prd_id}</td>
                        <td>{item.qty}</td>
                        <td>${item.price != null ? parseFloat(item.price).toFixed(2) : "0.00"}</td>
                        <td style={{ color: "green" }}>
                          $
                          {item.qty && item.price
                            ? (parseFloat(item.qty) * parseFloat(item.price)).toFixed(2)
                            : "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No items found</p>
              )}

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <strong>Sub Total:</strong>
                  <span style={{ color: "blue" }}>
                    $
                    {selectedSale.sub_total != null
                      ? parseFloat(selectedSale.sub_total).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <strong>Tax:</strong>
                  <span style={{ color: "orange" }}>
                    $
                    {selectedSale.tax != null
                      ? parseFloat(selectedSale.tax).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    fontWeight: "bold",
                    paddingTop: "10px",
                    borderTop: "2px solid #ddd",
                  }}
                >
                  <strong>Total Amount:</strong>
                  <span style={{ color: "green" }}>
                    $
                    {selectedSale.amount != null
                      ? parseFloat(selectedSale.amount).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal" style={{width: '98%', maxWidth: '1900px', height: '85%'}}>
            <div className="modal-header">
              <h2>Create New Sale</h2>
              <button
                className="modal-close"
                onClick={() => setShowNewSaleModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="pos-container" style={{display: 'flex', height: '100%', gap: '0'}}>
                {/* Product Selection Panel - Hide when KHQR is selected */}
                <div className="pos-products" style={{flex: newSaleData.pay_method === 'KHQR' ? '0' : '1', padding: '20px', borderRight: '1px solid #ddd', overflow: 'hidden', display: newSaleData.pay_method === 'KHQR' ? 'none' : 'block'}}>
                  <h3>Products</h3>
                  <div className="product-search" style={{marginBottom: '20px'}}>
                    <select
                      value={selectedProduct?.prd_id || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.prd_id === e.target.value);
                        setSelectedProduct(product);
                      }}
                      style={{width: '100%', padding: '8px'}}
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.prd_id} value={product.prd_id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="quantity-input" style={{marginBottom: '20px'}}>
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      style={{width: '60px', marginLeft: '10px'}}
                    />
                    <button
                      onClick={addToCart}
                      disabled={!selectedProduct}
                      style={{marginLeft: '10px', padding: '5px 10px'}}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Cart Panel */}
                <div className="pos-cart" style={{flex: 1, padding: '20px', borderRight: '1px solid #ddd'}}>
                  <h3>Cart</h3>
                  <div className="cart-items" style={{height: '300px', overflowY: 'auto', marginBottom: '20px'}}>
                    {cart.length === 0 ? (
                      <p>No items in cart</p>
                    ) : (
                      cart.map(item => (
                        <div key={item.prd_id} className="cart-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', marginBottom: '5px'}}>
                          <div>
                            <strong>{item.name}</strong>
                            <br />
                            ${item.price} x {item.qty} = ${(item.price * item.qty).toFixed(2)}
                          </div>
                          <div>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateQuantity(item.prd_id, parseInt(e.target.value))}
                              style={{width: '50px', marginRight: '10px'}}
                            />
                            <button onClick={() => removeFromCart(item.prd_id)} style={{color: 'red'}}>×</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="cart-totals">
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <span>Subtotal:</span>
                      <span>${newSaleData.sub_total.toFixed(2)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <span>Tax (10%):</span>
                      <span>${newSaleData.tax.toFixed(2)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px'}}>
                      <span>Total:</span>
                      <span>${newSaleData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Panel */}
                <div className="pos-payment" style={{flex: 1, padding: '20px'}}>
                  <h3>Payment</h3>
                  <form onSubmit={handleCreateSale}>
                    <div className="form-group" style={{marginBottom: '15px'}}>
                      <label>Invoice ID</label>
                      <input
                        type="text"
                        value={newSaleData.invoice_id}
                        onChange={(e) => setNewSaleData({...newSaleData, invoice_id: e.target.value})}
                        required
                        style={{width: '100%', padding: '8px'}}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '15px'}}>
                      <label>Sale Date</label>
                      <input
                        type="date"
                        value={newSaleData.sale_date}
                        onChange={(e) => setNewSaleData({...newSaleData, sale_date: e.target.value})}
                        required
                        style={{width: '100%', padding: '8px'}}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '20px'}}>
                      <label>Payment Method</label>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                        <button
                          type="button"
                          onClick={() => setNewSaleData({...newSaleData, pay_method: 'Cash', qr_code: ''})}
                          style={{
                            padding: '10px',
                            background: newSaleData.pay_method === 'Cash' ? '#28a745' : '#e9ecef',
                            color: newSaleData.pay_method === 'Cash' ? 'white' : '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          💵 Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSaleData({...newSaleData, pay_method: 'Card', qr_code: ''})}
                          style={{
                            padding: '10px',
                            background: newSaleData.pay_method === 'Card' ? '#0056b3' : '#e9ecef',
                            color: newSaleData.pay_method === 'Card' ? 'white' : '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          💳 Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSaleData({...newSaleData, pay_method: 'KHQR', qr_code: ''})}
                          style={{
                            padding: '10px',
                            background: newSaleData.pay_method === 'KHQR' ? '#dc3545' : '#e9ecef',
                            color: newSaleData.pay_method === 'KHQR' ? 'white' : '#000',
                            border: '2px solid #dc3545',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            gridColumn: '1 / -1'
                          }}
                        >
                          📱 KHQR QR Code Payment
                        </button>
                      </div>
                    </div>
                    <div className="form-actions" style={{marginTop: '20px'}}>
                      <button type="submit" className="btn-submit" style={{width: '100%', padding: '10px'}}>Complete Sale</button>
                      <button type="button" onClick={() => setShowNewSaleModal(false)} style={{width: '100%', padding: '10px', marginTop: '10px'}}>Cancel</button>
                    </div>
                  </form>
                </div>

                {/* KHQR Sidebar */}
                {newSaleData.pay_method === 'KHQR' && (
                  <div className="pos-khqr-sidebar" style={{flex: '1.3', minWidth: '400px', padding: '20px', borderLeft: '3px solid #dc3545', background: '#fff5f5', overflowY: 'auto'}}>
                    <h3>KHQR Payment</h3>
                    <div className="khqr-amount" style={{marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '8px'}}>
                      <strong>Amount to Pay:</strong>
                      <div style={{fontSize: '24px', color: '#007bff', marginTop: '10px'}}>
                        ${newSaleData.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="qr-scanner-section">
                      <button
                        type="button"
                        onClick={startScanning}
                        disabled={scanning}
                        style={{width: '100%', padding: '10px', marginBottom: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px'}}
                      >
                        {scanning ? '🔄 Scanning...' : '📱 Scan Customer KHQR'}
                      </button>
                      <div id="qr-video-container" style={{marginBottom: '10px'}}>
                        <video id="qr-video" style={{width: '100%', maxWidth: '280px', border: '1px solid #ccc', borderRadius: '4px'}}></video>
                      </div>
                      <textarea
                        value={newSaleData.qr_code}
                        onChange={(e) => setNewSaleData({...newSaleData, qr_code: e.target.value})}
                        placeholder="KHQR code will be scanned here"
                        rows="4"
                        style={{width: '100%', marginBottom: '10px'}}
                        required
                      />
                      {newSaleData.qr_code && (
                        <div className="qr-result" style={{padding: '10px', background: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb'}}>
                          <strong>✅ KHQR Scanned Successfully</strong>
                          <p style={{fontSize: '12px', wordBreak: 'break-all', marginTop: '5px'}}>
                            {newSaleData.qr_code.substring(0, 50)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
