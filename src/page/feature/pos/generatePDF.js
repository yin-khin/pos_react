/**
 * Clean PDF Invoice Generator
 * Generates a properly formatted invoice PDF without encoding issues
 */

const loadJsPDF = () =>
  new Promise((resolve) => {
    if (window.jspdf?.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(script);
  });

export const generateInvoicePDF = async (data) => {
  const JsPDF = await loadJsPDF();

  // Page dimensions
  const pageWidth = 80; // mm
  const marginLeft = 6;
  const marginRight = 6;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Calculate page height based on content
  let pageHeight = 100; // minimum height
  pageHeight += data.items.length * 15; // add space for each item
  if (data.paymentMethod === "CASH") pageHeight += 10;
  if (data.storeInfo?.email) pageHeight += 4;
  if (data.storeInfo?.website) pageHeight += 4;

  const doc = new JsPDF({
    unit: "mm",
    format: [pageWidth, Math.max(pageHeight, 100)],
    orientation: "portrait",
  });

  // Set default font
  doc.setFont("helvetica");

  let yPos = 10;

  // ===== STORE HEADER =====
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.storeInfo?.store_name || "MY STORE", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 6;

  // Store email
  if (data.storeInfo?.email) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(data.storeInfo.email, pageWidth / 2, yPos, { align: "center" });
    yPos += 4;
  }

  // Store website
  if (data.storeInfo?.website) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(data.storeInfo.website, pageWidth / 2, yPos, { align: "center" });
    yPos += 4;
  }

  // Invoice label
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Invoice / Receipt", pageWidth / 2, yPos, { align: "center" });
  yPos += 4;

  // Dashed line
  doc.setDrawColor(160);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 5;

  // ===== INVOICE DETAILS =====
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(data.invoiceId, pageWidth / 2, yPos, { align: "center" });
  yPos += 4;

  doc.setTextColor(90, 90, 90);
  doc.text(data.saleDate, pageWidth / 2, yPos, { align: "center" });
  yPos += 4;

  doc.setTextColor(0, 0, 0);
  const customerName = data.customer?.customer_name || "Guest / Walk-in";
  doc.text(`Customer: ${customerName}`, pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 5;

  // Dashed line
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 4;

  // ===== COLUMN HEADERS =====
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Item", marginLeft, yPos);
  doc.text("Qty", marginLeft + 34, yPos, { align: "center" });
  doc.text("Price", marginLeft + 50, yPos, { align: "center" });
  doc.text("Total", pageWidth - marginRight, yPos, { align: "right" });
  yPos += 2;

  // Solid line
  doc.setDrawColor(0);
  doc.setLineDashPattern([], 0);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 4;

  // ===== ITEMS =====
  doc.setTextColor(0, 0, 0);
  for (const item of data.items) {
    const unitCost = parseFloat(item.unit_cost || item.price || 0);
    const lineTotal = (item.qty * unitCost).toFixed(2);

    // Product name
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    const productName =
      item.prd_name.length > 24
        ? item.prd_name.substring(0, 24) + "..."
        : item.prd_name;
    doc.text(productName, marginLeft, yPos);
    yPos += 5;

    // Product details
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    doc.text(item.prd_id, marginLeft, yPos);

    doc.setTextColor(0, 0, 0);
    doc.text(`x${item.qty}`, marginLeft + 34, yPos, { align: "center" });
    doc.text(`$${unitCost.toFixed(2)}`, marginLeft + 50, yPos, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.text(`$${lineTotal}`, pageWidth - marginRight, yPos, {
      align: "right",
    });
    yPos += 4;

    // Dashed line
    doc.setDrawColor(160);
    doc.setLineDashPattern([1.2, 1.2], 0);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 4;
  }

  // ===== TOTALS =====
  yPos += 1;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Subtotal
  doc.text("Subtotal", marginLeft, yPos);
  doc.text(`$${data.subtotal.toFixed(2)}`, pageWidth - marginRight, yPos, {
    align: "right",
  });
  yPos += 5;

  // Tax
  doc.text("Tax (0%)", marginLeft, yPos);
  doc.text(`$${data.tax.toFixed(2)}`, pageWidth - marginRight, yPos, {
    align: "right",
  });
  yPos += 5;

  // Discount
  doc.text("Discount", marginLeft, yPos);
  doc.text(`-$${data.discount.toFixed(2)}`, pageWidth - marginRight, yPos, {
    align: "right",
  });
  yPos += 5;

  // Solid line
  doc.setDrawColor(0);
  doc.setLineDashPattern([], 0);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 5;

  // ===== GRAND TOTAL =====
  doc.setFillColor(255, 248, 230);
  doc.roundedRect(marginLeft, yPos - 4, contentWidth, 9, 2, 2, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 100, 0);
  doc.text("TOTAL", marginLeft, yPos + 2);
  doc.text(`$${data.grandTotal.toFixed(2)}`, pageWidth - marginRight, yPos + 2, {
    align: "right",
  });
  yPos += 10;

  // Dashed line
  doc.setDrawColor(160);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 5;

  // ===== PAYMENT INFO =====
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Payment Method", marginLeft, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(data.paymentMethod, pageWidth - marginRight, yPos, {
    align: "right",
  });
  yPos += 5;

  if (data.paymentMethod === "CASH") {
    doc.setFont("helvetica", "normal");
    doc.text("Cash Received", marginLeft, yPos);
    doc.text(
      `$${parseFloat(data.cashReceived || 0).toFixed(2)}`,
      pageWidth - marginRight,
      yPos,
      { align: "right" }
    );
    yPos += 5;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text("Change", marginLeft, yPos);
    doc.text(
      `$${parseFloat(data.change || 0).toFixed(2)}`,
      pageWidth - marginRight,
      yPos,
      { align: "right" }
    );
    yPos += 5;
  }

  // Dashed line
  doc.setDrawColor(160);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 5;

  // ===== FOOTER =====
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Thank you for your purchase!", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Please come again", pageWidth / 2, yPos, { align: "center" });
  yPos += 5;

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(data.invoiceId, pageWidth / 2, yPos, { align: "center" });

  // Save PDF
  doc.save(`${data.invoiceId}.pdf`);
};

export default generateInvoicePDF;
