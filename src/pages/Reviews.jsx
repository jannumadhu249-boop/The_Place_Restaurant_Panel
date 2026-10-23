import React, { useState } from 'react';
import { Star, MessageSquare, Trash2, Edit2, X, CheckCircle, Search, ThumbsUp } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([
    { id: 1, customer: 'Emily Clark', email: 'emily@gmail.com', order: '#ORD-8915', rating: 5, date: '2026-10-22', comment: 'The Butter Chicken was phenomenal! Arrived piping hot and fresh with soft naan.', reply: 'Thank you Emily, delighted you loved it!' },
    { id: 2, customer: 'Jason Bourne', email: 'jason@hotmail.com', order: '#ORD-8902', rating: 4, date: '2026-10-21', comment: 'Great taste and fast delivery, but please add slightly more mint chutney next time.', reply: 'Noted with thanks Jason, we will pack extra sauce next time!' },
    { id: 3, customer: 'Sophia Turner', email: 'sophia@yahoo.com', order: '#ORD-8898', rating: 5, date: '2026-10-20', comment: 'Crispiest garlic naan in town! 10/10 will order every single weekend.', reply: '' },
    { id: 4, customer: 'Michael Chang', email: 'mchang@tech.io', order: '#ORD-8875', rating: 3, date: '2026-10-19', comment: 'Food was delicious but the delivery rider took 15 mins extra to find my building.', reply: '' },
    { id: 5, customer: 'Hannah Abbott', email: 'hannah@web.com', order: '#ORD-8860', rating: 5, date: '2026-10-18', comment: 'Paneer tikka masala was rich and authentic. Definitely my favorite Indian restaurant!', reply: 'Thank you for your wonderful support Hannah!' }
  ]);

  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  const filtered = reviews.filter(r =>
    r.customer.toLowerCase().includes(search.toLowerCase()) ||
    r.order.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase())
  );

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
            <div className="stat-value">4.8 / 5.0</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <ThumbsUp size={24} />
          </div>
          <div>
            <div className="stat-label">Total Reviews</div>
            <div className="stat-value">{reviews.length} Feedbacks</div>
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Star Rating</th>
                <th>Customer Feedback</th>
                <th>Date</th>
                <th>Restaurant Reply</th>
                <th>Actions</th>
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
                        {r.customer[0]}
                      </div>
                      <div>
                        <strong>{r.customer}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.order}</span>
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
                  <td style={{ maxWidth: 220 }}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
