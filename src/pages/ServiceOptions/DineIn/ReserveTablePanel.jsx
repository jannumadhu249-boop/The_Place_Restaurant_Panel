import React, { useMemo, useState } from 'react';
import { AlertCircle, CalendarCheck, Loader2, X, XCircle } from 'lucide-react';
import { URLS } from '../../../url';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const hasToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
  return {
    'Content-Type': 'application/json',
    ...(hasToken ? { Authorization: `Bearer ${token.trim()}` } : {}),
  };
};

const pad = (n) => String(n).padStart(2, '0');

const toDateInputValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Reservations are grouped into periods — one group of 30-minute slots shows at a time
const SLOT_PERIODS = [
  { id: 'lunch', label: 'Lunch', range: '11 AM – 3 PM', start: 11 * 60, end: 15 * 60 },
  { id: 'afternoon', label: 'Afternoon', range: '3 PM – 7 PM', start: 15 * 60, end: 19 * 60 },
  { id: 'dinner', label: 'Dinner', range: '7 PM – 11 PM', start: 19 * 60, end: 23 * 60 },
];

// 24h minutes → 12-hour label, e.g. 1170 → "7:30 PM"
const formatSlot12 = (totalMinutes) => {
  const mins = ((totalMinutes % 1440) + 1440) % 1440;
  const hours12 = Math.floor(mins / 60) % 12 || 12;
  return `${hours12}:${pad(mins % 60)} ${mins < 720 ? 'AM' : 'PM'}`;
};

const PERIODS = SLOT_PERIODS.map((period) => ({
  ...period,
  slots: Array.from({ length: (period.end - period.start) / 30 }, (_, i) => {
    const minutes = period.start + i * 30;
    return {
      value: `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`,
      label: formatSlot12(minutes),
    };
  }),
}));

const DURATIONS = [
  { value: 60, label: '1 hr' },
  { value: 90, label: '1.5 hr' },
  { value: 120, label: '2 hr' },
];

const formatSection = (table) => table.sectionLabel || table.section || 'Other';

const slotToMinutes = (value) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export default function ReserveTablePanel({
  table,
  reservationId = '',
  onClose,
  onConfirm,
  onCancelled,
  isDisabled = false,
}) {
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [covers, setCovers] = useState('');
  const [reserveDate, setReserveDate] = useState(() => toDateInputValue(new Date()));
  const [slot, setSlot] = useState('');
  const [duration, setDuration] = useState(60);
  const [specialRequest, setSpecialRequest] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cancel-reservation flow
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError] = useState('');
  // Open on the period that contains the current time
  const [activePeriod, setActivePeriod] = useState(() => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const current = SLOT_PERIODS.find((p) => mins >= p.start && mins < p.end);
    return current ? current.id : 'dinner';
  });
  // Captured once on mount so render stays pure
  const [todayStr] = useState(() => toDateInputValue(new Date()));
  const [nowMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // "7:30 PM – 8:30 PM" preview for the chosen slot + duration
  const slotSummary = useMemo(() => {
    if (!slot) return '';
    const startMinutes = slotToMinutes(slot);
    return `${formatSlot12(startMinutes)} – ${formatSlot12(startMinutes + duration)}`;
  }, [slot, duration]);

  if (!table) return null;

  const maxCovers = Number(table.seats) || 30;
  const currentPeriod = PERIODS.find((period) => period.id === activePeriod) || PERIODS[0];

  // A slot is unavailable if the chosen date is today and the slot already passed
  const isSlotPast = (value) =>
    reserveDate === todayStr && slotToMinutes(value) <= nowMinutes;

  const validate = () => {
    const next = {};

    if (!guestName.trim()) next.guestName = 'Guest name is required';

    const digits = phone.replace(/\D/g, '');
    if (!digits) next.phone = 'Phone number is required';
    else if (digits.length !== 10) next.phone = 'Phone number must be exactly 10 digits';

    const coverCount = Number(covers);
    if (!String(covers).trim()) next.covers = 'Covers is required';
    else if (!Number.isInteger(coverCount) || coverCount < 1) next.covers = 'Enter at least 1 guest';
    else if (coverCount > maxCovers) next.covers = `This table seats up to ${maxCovers} guests`;

    if (!reserveDate) next.date = 'Select a reservation date';
    else if (reserveDate < todayStr) next.date = 'Date cannot be in the past';

    if (!slot) next.slot = 'Select a time slot';
    else if (isSlotPast(slot)) next.slot = 'This slot has already passed';

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    setApiError('');
    if (Object.keys(nextErrors).length > 0) return;

    // Build startAt / endAt from the chosen date + slot in local time
    const [hours, minutes] = slot.split(':').map(Number);
    const startAt = new Date(`${reserveDate}T00:00:00`);
    startAt.setHours(hours, minutes, 0, 0);
    const endAt = new Date(startAt.getTime() + duration * 60000);

    const payload = {
      tableId: table.mongoId || table.id,
      customerName: guestName.trim(),
      customerPhone: phone.replace(/\D/g, ''),
      guestCount: Number(covers),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };
    if (specialRequest.trim()) payload.specialRequest = specialRequest.trim();

    setIsSubmitting(true);
    try {
      const res = await fetch(URLS.CreateTableReservation, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data.message ||
          data.error ||
          (Array.isArray(data.errors) && data.errors[0]) ||
          `Failed to create reservation (${res.status})`;
        setApiError(String(message));
        return;
      }

      onConfirm?.({
        tableId: table.id,
        mongoId: payload.tableId,
        guest: payload.customerName,
        phone: payload.customerPhone,
        covers: payload.guestCount,
        reserveDate,
        reserveTime: slot,
        startAt: payload.startAt,
        endAt: payload.endAt,
        specialRequest: payload.specialRequest || '',
        reservation: data?.reservation || data?.data || data,
      });
    } catch (err) {
      console.warn('Failed to create table reservation:', err);
      setApiError('Network error — could not reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  // ── API: CANCEL AN EXISTING RESERVATION ─────────────────────────────
  const cancelReservation = async () => {
    setCancelError('');
    const refId =
      reservationId ||
      table.reservationId ||
      table.raw?.reservationId ||
      table.raw?.reservation?._id ||
      table.raw?.currentReservation?._id ||
      '';

    if (!refId) {
      setCancelError(
        'Reservation id is not available for this table. Refresh the floor plan and try again.'
      );
      return;
    }

    setIsCancelling(true);
    try {
      const res = await fetch(URLS.CancelTableReservation, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reservationId: refId, status: 'cancelled' }),
      });

      const data = await res.json().catch(() => ({}));
      const apiError =
        data.message ||
        data.error ||
        (Array.isArray(data.errors)
          ? data.errors.map((item) => item?.message || item).join(', ')
          : '');

      if (!res.ok || data.success === false || data.status === false) {
        setCancelError(apiError || 'Failed to cancel the reservation. Please try again.');
        return;
      }

      onCancelled?.({
        tableId: table.id,
        reservationId: refId,
        reservation: data.reservation || data.data || null,
      });
    } catch (err) {
      console.warn('Failed to cancel table reservation:', err);
      setCancelError(
        'Network error while cancelling the reservation. Check your connection and retry.'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Already reserved → show the current reservation with a cancel action
  if (table.status === 'reserved') {
    return (
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Reserved — Table {table.id}</h2>
            <p className="svc-reserve-subtitle">
              {formatSection(table)} · {table.seats} seats
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={onClose}
          >
            <X size={14} /> Close
          </button>
        </div>

        <div className="svc-reserve-info">
          {table.guest && (
            <div className="svc-reserve-info-row">
              <span>Guest Name</span>
              <strong>{table.guest}</strong>
            </div>
          )}
          {table.phone && (
            <div className="svc-reserve-info-row">
              <span>Phone</span>
              <strong>{table.phone}</strong>
            </div>
          )}
          {table.covers ? (
            <div className="svc-reserve-info-row">
              <span>Covers</span>
              <strong>{table.covers} persons</strong>
            </div>
          ) : null}
          {(table.reservedFor || table.since) && (
            <div className="svc-reserve-info-row">
              <span>Reserved for</span>
              <strong>
                {table.reservedOn ? `${table.reservedOn} · ` : ''}
                {table.reservedFor || table.since}
              </strong>
            </div>
          )}
        </div>

        {cancelError && (
          <div className="svc-reserve-error" role="alert" style={{ marginBottom: 12 }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{cancelError}</span>
          </div>
        )}

        {!confirmCancel ? (
          <button
            type="button"
            className="btn btn-outline svc-reserve-danger"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setConfirmCancel(true)}
            disabled={isCancelling || isDisabled}
          >
            <XCircle size={15} /> Cancel Reservation
          </button>
        ) : (
          <div className="svc-confirm-row">
            <span className="svc-confirm-text">Release this reservation and free the table?</span>
            <div className="svc-confirm-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setConfirmCancel(false)}
                disabled={isCancelling}
              >
                Keep
              </button>
              <button
                type="button"
                className="btn svc-btn-danger"
                onClick={cancelReservation}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={14} className="svc-spin" /> Cancelling…
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Reserve Table {table.id}</h2>
          <p className="svc-reserve-subtitle">
            {formatSection(table)} · {table.seats} seats
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={onClose}
        >
          <X size={14} /> Close
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="svc-reserve-grid">
          {apiError && (
            <div className="svc-reserve-error" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{apiError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Guest name</label>
            <input
              className={`form-control${errors.guestName ? ' svc-input-invalid' : ''}`}
              placeholder="Reservation guest name"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                clearError('guestName');
              }}
            />
            {errors.guestName && <span className="svc-field-error">{errors.guestName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={`form-control${errors.phone ? ' svc-input-invalid' : ''}`}
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                clearError('phone');
              }}
            />
            {errors.phone && <span className="svc-field-error">{errors.phone}</span>}
          </div>

          <div className="svc-reserve-row">
            <div className="form-group">
              <label className="form-label">Covers</label>
              <input
                type="number"
                min={1}
                max={maxCovers}
                className={`form-control${errors.covers ? ' svc-input-invalid' : ''}`}
                placeholder={`Max ${maxCovers} guests`}
                value={covers}
                onChange={(e) => {
                  setCovers(e.target.value);
                  clearError('covers');
                }}
              />
              {errors.covers && <span className="svc-field-error">{errors.covers}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Reservation date</label>
              <input
                type="date"
                min={todayStr}
                className={`form-control${errors.date ? ' svc-input-invalid' : ''}`}
                value={reserveDate}
                onChange={(e) => {
                  setReserveDate(e.target.value);
                  clearError('date');
                  clearError('slot');
                }}
              />
              {errors.date && <span className="svc-field-error">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <div className="svc-slot-head">
              <label className="form-label">Time slot</label>
              {slotSummary && <span className="svc-slot-hint">{slotSummary}</span>}
            </div>
            <div className="svc-period-tabs" role="tablist" aria-label="Reservation period">
              {PERIODS.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  role="tab"
                  aria-selected={activePeriod === period.id}
                  className={`svc-period-tab${activePeriod === period.id ? ' active' : ''}`}
                  onClick={() => setActivePeriod(period.id)}
                >
                  <span className="svc-period-label">{period.label}</span>
                  <span className="svc-period-range">{period.range}</span>
                </button>
              ))}
            </div>
            <div className="svc-slot-grid" role="group" aria-label="Reservation time slot">
              {currentPeriod.slots.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`svc-slot${slot === value ? ' active' : ''}`}
                  disabled={isSlotPast(value)}
                  onClick={() => {
                    setSlot(value);
                    clearError('slot');
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.slot && <span className="svc-field-error">{errors.slot}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Duration</label>
            <div className="svc-duration-group">
              {DURATIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`svc-duration${duration === item.value ? ' active' : ''}`}
                  onClick={() => setDuration(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Requests</label>
            <textarea
              className="form-control"
              placeholder="Any special requests?"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary svc-reserve-submit"
            disabled={isDisabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="svc-spin" /> Reserving…
              </>
            ) : (
              <>
                <CalendarCheck size={15} /> Confirm Reservation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
