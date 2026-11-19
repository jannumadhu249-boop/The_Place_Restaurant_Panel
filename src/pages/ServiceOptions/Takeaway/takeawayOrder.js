// Shared mapping for GET /takeaway orders — the pickup queue and the Recent
// Completions card both render these, so the shape must stay identical.
export const mapTakeawayOrder = (o, idx) => {
  const statusRaw = String(o.status || 'queued').toLowerCase();
  let displayStatus = 'Queued';
  if (statusRaw === 'preparing') displayStatus = 'Preparing';
  else if (statusRaw === 'ready') displayStatus = 'Ready';
  else if (statusRaw === 'picked_up' || statusRaw === 'completed') displayStatus = 'Picked up';
  else if (statusRaw === 'cancelled') displayStatus = 'Cancelled';

  const itemsCount = Array.isArray(o.items)
    ? o.items.reduce((sum, it) => sum + Number(it.quantity || it.qty || 1), 0)
    : Number(o.itemsCount || o.items || 1);

  const itemsList = Array.isArray(o.items)
    ? o.items.map((it) => {
      const pName = typeof it.productId === 'object' && it.productId !== null
        ? (it.productId.dishName || it.productId.name)
        : it.productName || it.name || it.dishName || 'Dish';
      const pPrice = typeof it.productId === 'object' && it.productId !== null
        ? (it.productId.offerPrice ?? it.productId.regularPrice ?? it.productId.price ?? 0)
        : it.unitPrice || it.price || 0;
      const q = Number(it.quantity || it.qty || 1);
      const sub = Number(it.totalPrice || it.subtotal || pPrice * q);
      return {
        name: pName,
        dishName: pName,
        productId: typeof it.productId === 'object' && it.productId !== null ? it.productId._id : it.productId,
        qty: q,
        quantity: q,
        unitPrice: Number(pPrice),
        price: Number(pPrice),
        totalPrice: sub,
        subtotal: sub,
      };
    })
    : [];

  const payMethodStr = o.paymentMethod
    ? (String(o.paymentMethod).toLowerCase() === 'upi'
      ? 'UPI'
      : o.paymentMethod.charAt(0).toUpperCase() + o.paymentMethod.slice(1))
    : 'Cash';

  const payStatusStr = o.paymentStatus
    ? (String(o.paymentStatus).toLowerCase() === 'paid' ? 'Paid' : 'Unpaid')
    : 'Unpaid';

  const rawDate = o.createdAt || o.logCreatedDate || o.orderDate || o.created_at || o.date || o.updatedAt || o.logDate;
  let formattedTime = 'Just now';
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } else if (o._id && String(o._id).length >= 8) {
    try {
      const ts = parseInt(String(o._id).substring(0, 8), 16) * 1000;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      formattedTime = 'Just now';
    }
  }

  return {
    id: o.orderUniqueId || o.orderNumber || (o._id ? `TKW-${o._id.slice(-4).toUpperCase()}` : `TKW-0${idx + 1}`),
    orderUniqueId: o.orderUniqueId || null,
    mongoId: o._id,
    _id: o._id,
    invoice: o.invoicePdfPath || o.invoicePdfDownloadUrl || o.invoice || o.invoiceUrl || o.invoicePath || null,
    invoicePdfPath: o.invoicePdfPath || null,
    invoicePdfDownloadUrl: o.invoicePdfDownloadUrl || null,
    invoiceNumber: o.invoiceNumber || null,
    invoiceGenerated: Boolean(o.invoiceGenerated || o.invoicePdfPath || o.invoicePdfDownloadUrl),
    guest: o.customerName || 'Guest',
    phone: o.customerPhone || '',
    slot: o.pickupSlot || 'Immediate',
    status: displayStatus,
    statusRaw: statusRaw,
    items: itemsCount,
    itemsList,
    subtotal: Number(o.subtotal || o.totalAmount || 0),
    discount: Number(o.discountAmount || 0),
    coupon: o.couponCode || null,
    packingFee: Number(o.packingCharge ?? o.packagingCharges ?? 20),
    total: Number(o.totalAmount || o.grandTotal || o.total || 0),
    payment: payMethodStr,
    paymentStatus: payStatusStr,
    time: formattedTime,
    eta: o.estimatedPreparationMinutes || o.etaMinutes || 20,
    raw: o,
  };
};

// Order status → shared badge class
export const takeawayStatusBadge = (status) => {
  if (status === 'Ready' || status === 'Picked up') return 'badge-success';
  if (status === 'Cancelled') return 'badge-danger';
  if (status === 'Preparing') return 'badge-warning';
  return 'badge-info';
};
