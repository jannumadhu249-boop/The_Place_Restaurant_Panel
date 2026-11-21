import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Compact page list with ellipsis — never wider than 7 slots
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

/**
 * Pagination footer shared by every report table.
 * The parent owns `page` + `pageSize`; this component only renders and
 * clamps the active page to the real page count when filters shrink the list.
 */
export default function ReportPagination({
  page = 1,
  pageSize = 5,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="report-pagination">
      <div className="report-pagination-info">
        {totalItems === 0 ? (
          'No entries to show'
        ) : (
          <>
            Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{totalItems}</strong> entries
          </>
        )}
      </div>

      <div className="report-pagination-controls">
        <label className="report-page-size-wrap">
          <span>Rows</span>
          <select
            className="report-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="report-page-btn is-nav"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} /> Prev
        </button>

        {getPageNumbers(currentPage, totalPages).map((entry, index) =>
          entry === '...' ? (
            <span className="report-page-dots" key={`dots-${index}`}>…</span>
          ) : (
            <button
              type="button"
              key={entry}
              className={`report-page-btn ${entry === currentPage ? 'is-active' : ''}`}
              onClick={() => onPageChange?.(entry)}
              aria-current={entry === currentPage ? 'page' : undefined}
            >
              {entry}
            </button>
          )
        )}

        <button
          type="button"
          className="report-page-btn is-nav"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
