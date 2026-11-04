import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Edit2, X, CheckCircle, Search, ThumbsUp, Loader } from 'lucide-react';
import { URLS } from '../url';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  // Fetch restaurant profile to get restaurantId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await fetch(URLS.GetProfile, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success && data.data?._id) {
          setRestaurantId(data.data._id);
        } else {
          setError('Failed to fetch restaurant profile');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load restaurant profile');
      }
    };

    fetchProfile();
  }, []);

  // Fetch reviews once restaurantId is available
  useEffect(() => {
    if (!restaurantId) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`${URLS.GetReviews}${restaurantId}/reviews`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          // Transform API data to match component structure
          const transformedReviews = data.data.map(review => ({
            id: review._id,
            customer: review.customer?.name || 'Anonymous',
            email: review.customer?.email || 'N/A',
            phone: review.customer?.phone || '',
            // API may place orderUniqueId on the review, nested order/booking, or customer
            orderUniqueId:
              review.orderUniqueId ||
              review.orderUniqurId ||
              review.order?.orderUniqueId ||
              review.booking?.orderUniqueId ||
              review.customer?.orderUniqueId ||
              review.orderId ||
              'N/A',
            rating: review.rating,
            date: new Date(review.createdAt).toISOString().split('T')[0],
            comment: review.comment,
            reply: ''
          }));

          setReviews(transformedReviews);
          setTotalReviews(data.totalReviews || transformedReviews.length);
        } else {
          setError(data.message || 'Failed to fetch reviews');
        }
      } catch (err) {
        console.error('Reviews fetch error:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId]);

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    return (
      r.customer.toLowerCase().includes(q) ||
      (r.orderUniqueId && String(r.orderUniqueId).toLowerCase().includes(q)) ||
      (r.comment && r.comment.toLowerCase().includes(q))
    );
  });

  const openReplyModal = (r) => {
    setSelectedReview(r);
    setReplyInput(r.reply || '');
  };

  const handleSaveReply = (e) => {
    e.preventDefault();
    if (selectedReview) {
      setReviews(reviews.map(r => r.id === selectedReview.id ? { ...r, reply: replyInput } : r));
      setSelectedReview(null);
      setReplyInput('');
    }
  };

  const deleteReview = (id) => {
    if (window.confirm('Delete this customer review record?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader size={32} className="spin" style={{ color: 'var(--primary)' }} />
        <span style={{ marginLeft: 12, fontSize: 14, color: 'var(--text-muted)' }}>Loading reviews...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ color: '#dc2626', marginBottom: 8, fontSize: 16, fontWeight: 600 }}>⚠️ Error</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Star size={22} color="var(--primary)" /> Customer Reviews & Ratings</h1>
          <p className="page-desc">Monitor verified customer feedback, food ratings, and publish merchant replies</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Star size={24} fill="#f59e0b" />
          </div>
          <div>
            <div className="stat-label">Average Rating</div>
            <div className="stat-value">{calculateAverageRating()} / 5.0</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <ThumbsUp size={24} />
          </div>
          <div>
            <div className="stat-label">Total Reviews</div>
            <div className="stat-value">{totalReviews} Feedbacks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="stat-label">Replied by Store</div>
            <div className="stat-value">{reviews.filter(r => r.reply).length} Replied</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by customer, order, or review text..."
              className="form-input"
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Reviews Data Table */}
        <div className="table-container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Star size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {search ? 'No reviews found matching your search' : 'No reviews yet'}
              </div>
              <div style={{ fontSize: 14 }}>
                {search ? 'Try adjusting your search terms' : 'Customer reviews will appear here once they rate your restaurant'}
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Star Rating</th>
                  <th>Customer Feedback</th>
                  <th>Date</th>
                  {/* <th>Restaurant Reply</th>
                  <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f97316, #db2777)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 13,
                          display: 'grid',
                          placeItems: 'center'
                        }}>
                          {r.customer[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{r.customer}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {r.orderUniqueId || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < r.rating ? '#f59e0b' : 'none'}
                              color="#f59e0b"
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2 }}>{r.rating}.0</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4 }}>
                        "{r.comment}"
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.date}</td>
                    {/* <td style={{ maxWidth: 220 }}>
                      {r.reply ? (
                        <div style={{ fontSize: 12.5, color: '#047857', background: '#ecfdf5', padding: '6px 10px', borderRadius: 6, border: '1px solid #a7f3d0' }}>
                          <strong>Reply:</strong> {r.reply}
                        </div>
                      ) : (
                        <span className="badge badge-warning">Awaiting Reply</span>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-btn"
                          title={r.reply ? 'Edit Reply' : 'Reply to Customer'}
                          onClick={() => openReplyModal(r)}
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete Review"
                          onClick={() => deleteReview(r.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} color="var(--primary)" /> Reply to {selectedReview.customer}
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReply}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Customer Feedback:</div>
                  <div style={{ fontSize: 13.5, fontStyle: 'italic' }}>"{selectedReview.comment}"</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Official Response</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Thank the customer or address their suggestions politely..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReview(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
