import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, FileText, ExternalLink, Download, AlertCircle } from 'lucide-react';
import { URLS } from '../../../url';

export default function TakeawayBillModal({
  isOpen,
  onClose,
  order,
  invoiceData = null,
  isLoadingInvoice = false,
}) {
  const [blobPdfUrl, setBlobPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const inv = invoiceData || {};

  // Resolve backend invoice PDF / file path
  const rawInvoicePath =
    inv.invoicePdfPath ||
    order?.invoicePdfPath ||
    inv.invoicePath ||
    order?.invoicePath ||
    inv.invoice ||
    order?.invoice ||
    null;

  const rawDownloadUrl =
    inv.invoicePdfDownloadUrl ||
    order?.invoicePdfDownloadUrl ||
    null;

  const getFullInvoiceUrl = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const clean = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = URLS.Base || 'http://40.192.68.118:3000/';
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${clean}`;
  };

  const invoiceStaticUrl = getFullInvoiceUrl(rawInvoicePath);
  const invoiceDownloadEndpoint = getFullInvoiceUrl(rawDownloadUrl);

  // Preferred endpoint to fetch the PDF binary: try static path or download API endpoint
  const targetPdfEndpoint = invoiceStaticUrl || invoiceDownloadEndpoint;

  // Order ID / Invoice Number
  const orderId =
    inv.invoiceNumber ||
    order?.invoiceNumber ||
    inv.orderUniqueId ||
    order?.orderUniqueId ||
    inv.orderNumber ||
    inv.orderId ||
    order?.id ||
    (order?._id ? `TKW-${order._id.slice(-4).toUpperCase()}` : 'TKW-—');

  // Fetch the PDF using authenticated fetch so the browser receives raw PDF bytes
  // All hooks (useState, useEffect) MUST run unconditionally at top-level
  useEffect(() => {
    let active = true;
    let createdBlobUrl = null;

    if (!isOpen || !order || !targetPdfEndpoint) {
      setBlobPdfUrl(null);
      setPdfError('');
      setPdfLoading(false);
      return;
    }

    const fetchPdfBlob = async () => {
      setPdfLoading(true);
      setPdfError('');
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token.trim()}` } : {};

        // Fetch with auth token
        const response = await fetch(targetPdfEndpoint, { headers });

        if (!response.ok) {
          throw new Error(`Failed to load invoice (Status: ${response.status})`);
        }

        const contentType = response.headers.get('content-type') || '';

        // If backend returned JSON (e.g. auth error or message) instead of PDF
        if (contentType.includes('application/json')) {
          const json = await response.json();
          throw new Error(json.message || 'Server did not return a PDF document.');
        }

        const blob = await response.blob();
        if (active) {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          createdBlobUrl = window.URL.createObjectURL(pdfBlob);
          setBlobPdfUrl(createdBlobUrl);
        }
      } catch (err) {
        if (active) {
          console.error('Error loading backend PDF invoice:', err);
          // If authenticated fetch failed on static path, try the fallback download endpoint if different
          if (invoiceDownloadEndpoint && targetPdfEndpoint !== invoiceDownloadEndpoint) {
            try {
              const token = localStorage.getItem('token');
              const res2 = await fetch(invoiceDownloadEndpoint, {
                headers: token ? { Authorization: `Bearer ${token.trim()}` } : {},
              });
              if (res2.ok) {
                const blob2 = await res2.blob();
                const pdfBlob2 = new Blob([blob2], { type: 'application/pdf' });
                createdBlobUrl = window.URL.createObjectURL(pdfBlob2);
                setBlobPdfUrl(createdBlobUrl);
                setPdfLoading(false);
                return;
              }
            } catch (fallbackErr) {
              console.warn('Fallback invoice endpoint failed:', fallbackErr);
            }
          }
          setPdfError(err.message || 'Could not display the invoice PDF.');
        }
      } finally {
        if (active) {
          setPdfLoading(false);
        }
      }
    };

    fetchPdfBlob();

    return () => {
      active = false;
      if (createdBlobUrl) {
        window.URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [isOpen, order, targetPdfEndpoint, invoiceDownloadEndpoint]);

  // Early return AFTER all hooks have executed unconditionally
  if (!isOpen || !order) return null;

  const handleDownload = () => {
    if (blobPdfUrl) {
      const link = document.createElement('a');
      link.href = blobPdfUrl;
      link.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (invoiceDownloadEndpoint || invoiceStaticUrl) {
      window.open(invoiceDownloadEndpoint || invoiceStaticUrl, '_blank');
    }
  };

  const hasInvoice = Boolean(rawInvoicePath || rawDownloadUrl);

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal-card extra-wide" onClick={(e) => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} color="var(--primary)" />
            <span>Invoice — {orderId}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* {blobPdfUrl && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownload}
                style={{ fontSize: 12, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <Download size={13} /> Download PDF
              </button>
            )} */}
            <button type="button" className="svc-modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="svc-modal-body" style={{ padding: 18 }}>
          {isLoadingInvoice || pdfLoading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={26} className="spin" style={{ marginBottom: 12, color: 'var(--primary)' }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Loading backend invoice PDF…</div>
            </div>
          ) : !hasInvoice ? (
            <div style={{ padding: 50, textAlign: 'center', color: '#64748b' }}>
              <AlertCircle size={40} style={{ color: '#f59e0b', marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                No Invoice Generated Yet
              </div>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
                The invoice has not been generated for this order ({orderId}) yet.
              </p>
            </div>
          ) : pdfError ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#b91c1c', marginBottom: 6 }}>
                Failed to Render Invoice PDF
              </div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{pdfError}</p>
              {(invoiceDownloadEndpoint || invoiceStaticUrl) && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleDownload}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Download size={14} /> Try Direct Download
                </button>
              )}
            </div>
          ) : blobPdfUrl ? (
            /* RENDER ONLY THE BACKEND GENERATED INVOICE PDF */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}>
                <span style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <CheckCircle2 size={16} color="#16a34a" /> Generated Invoice ({orderId})
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={blobPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 12, padding: '5px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <ExternalLink size={13} /> Open in New Tab
                  </a>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleDownload}
                    style={{ fontSize: 12, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <Download size={13} /> Download
                  </button>
                </div>
              </div> */}

              {/* Embedded PDF object/iframe using authenticated Blob URL */}
              <iframe
                src={blobPdfUrl}
                title={`Backend-Invoice-${orderId}`}
                style={{
                  width: '100%',
                  height: '620px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 10,
                  backgroundColor: '#ffffff',
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="svc-modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {blobPdfUrl && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={15} /> Download PDF Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
