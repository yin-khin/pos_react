/**
 * Generate Receipt Image for Telegram
 * Converts receipt data to a canvas image that can be sent as a photo
 */

export const generateReceiptImage = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Receipt dimensions (thermal printer style - 80mm width)
      const width = 600;
      const padding = 30;
      const contentWidth = width - (padding * 2);
      
      // Calculate height based on content
      let height = 200; // header (increased)
      height += data.items.length * 90; // items (increased spacing)
      height += 250; // totals (increased)
      height += (data.paymentMethod === 'CASH' ? 80 : 40); // cash details or payment method
      height += 120; // footer (increased)
      
      canvas.width = width;
      canvas.height = height;
      
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      let y = 40;
      
      // ===== STORE HEADER =====
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.storeInfo?.store_name || 'MY STORE', width / 2, y);
      y += 40;
      
      if (data.storeInfo?.email) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(data.storeInfo.email, width / 2, y);
        y += 25;
      }
      
      if (data.storeInfo?.website) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(data.storeInfo.website, width / 2, y);
        y += 25;
      }
      
      // Invoice label
      ctx.font = '18px Arial';
      ctx.fillStyle = '#888888';
      ctx.fillText('Invoice / Receipt', width / 2, y);
      y += 30;
      
      // Dashed line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#cccccc';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 30;
      
      // ===== INVOICE DETAILS =====
      ctx.font = '20px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText(data.invoiceId, width / 2, y);
      y += 30;
      
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(data.saleDate, width / 2, y);
      y += 25;
      
      ctx.fillStyle = '#000000';
      const customerName = data.customer?.customer_name || 'Guest / Walk-in';
      ctx.fillText(`Customer: ${customerName}`, width / 2, y);
      y += 30;
      
      // Dashed line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#cccccc';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 25;
      
      // ===== COLUMN HEADERS =====
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'left';
      ctx.fillText('Item', padding, y);
      ctx.textAlign = 'center';
      ctx.fillText('Qty', padding + 280, y);
      ctx.fillText('Price', padding + 380, y);
      ctx.textAlign = 'right';
      ctx.fillText('Total', width - padding, y);
      y += 10;
      
      // Solid line
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      y += 25;
      
      // ===== ITEMS =====
      ctx.textAlign = 'left';
      for (const item of data.items) {
        const unitCost = parseFloat(item.unit_cost || item.price || 0);
        const lineTotal = (item.qty * unitCost).toFixed(2);
        
        // Product name
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#000000';
        const productName = item.prd_name.length > 30 
          ? item.prd_name.substring(0, 30) + '...' 
          : item.prd_name;
        ctx.fillText(productName, padding, y);
        y += 25;
        
        // Product details
        ctx.font = '16px Arial';
        ctx.fillStyle = '#888888';
        ctx.fillText(item.prd_id, padding, y);
        
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(`x${item.qty}`, padding + 280, y);
        ctx.fillText(`$${unitCost.toFixed(2)}`, padding + 380, y);
        
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`$${lineTotal}`, width - padding, y);
        y += 20;
        
        // Dashed line
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#cccccc';
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        ctx.setLineDash([]);
        y += 25;
        
        ctx.textAlign = 'left';
      }
      
      // ===== TOTALS =====
      y += 10;
      ctx.font = '18px Arial';
      ctx.fillStyle = '#000000';
      
      // Subtotal
      ctx.textAlign = 'left';
      ctx.fillText('Subtotal', padding, y);
      ctx.textAlign = 'right';
      ctx.fillText(`$${data.subtotal.toFixed(2)}`, width - padding, y);
      y += 30;
      
      // Tax
      ctx.textAlign = 'left';
      ctx.fillText('Tax (0%)', padding, y);
      ctx.textAlign = 'right';
      ctx.fillText(`$${data.tax.toFixed(2)}`, width - padding, y);
      y += 30;
      
      // Discount
      ctx.textAlign = 'left';
      ctx.fillText('Discount', padding, y);
      ctx.textAlign = 'right';
      ctx.fillText(`-$${data.discount.toFixed(2)}`, width - padding, y);
      y += 30;
      
      // Solid line
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      y += 35;
      
      // ===== GRAND TOTAL =====
      // Background box
      ctx.fillStyle = '#fff8e6';
      ctx.fillRect(padding, y - 25, contentWidth, 50);
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, y - 25, contentWidth, 50);
      ctx.lineWidth = 1;
      
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'left';
      ctx.fillText('TOTAL', padding + 15, y + 5);
      ctx.textAlign = 'right';
      ctx.fillText(`$${data.grandTotal.toFixed(2)}`, width - padding - 15, y + 5);
      y += 50;
      
      // Dashed line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#cccccc';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 35;
      
      // ===== PAYMENT INFO =====
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.fillText('Payment Method', padding, y);
      
      ctx.font = '18px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(data.paymentMethod, width - padding, y);
      y += 35;
      
      if (data.paymentMethod === 'CASH') {
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Cash Received', padding, y);
        ctx.textAlign = 'right';
        ctx.fillText(`$${parseFloat(data.cashReceived || 0).toFixed(2)}`, width - padding, y);
        y += 35;
        
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#16a34a';
        ctx.textAlign = 'left';
        ctx.fillText('Change', padding, y);
        ctx.textAlign = 'right';
        ctx.fillText(`$${parseFloat(data.change || 0).toFixed(2)}`, width - padding, y);
        y += 35;
      }
      
      // Dashed line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#cccccc';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 35;
      
      // ===== FOOTER =====
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText('Thank you for your purchase!', width / 2, y);
      y += 35;
      
      ctx.font = '18px Arial';
      ctx.fillText('Please come again', width / 2, y);
      y += 30;
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      }, 'image/png');
      
    } catch (error) {
      reject(error);
    }
  });
};

export default generateReceiptImage;
