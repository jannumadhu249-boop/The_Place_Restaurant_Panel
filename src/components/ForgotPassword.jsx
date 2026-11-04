import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, ArrowLeft, KeyRound, ShieldCheck,
  Eye, EyeOff, CheckCircle, Lock, RefreshCw, AlertCircle
} from 'lucide-react';
import { URLS } from '../url';

const STEPS = {
  EMAIL: 1,
  OTP: 2,
  NEW_PASSWORD: 3,
  SUCCESS: 4,
};

/* ── Shared back button ── */
function StepBack({ onBack }) {
  return (
    <button type="button" className="fp-back-btn" onClick={onBack}>
      <ArrowLeft size={14} /> Back
    </button>
  );
}

/* ── Step indicator ── */
function StepDots({ currentStep }) {
  return (
    <div className="fp-step-dots">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`fp-dot ${currentStep > s ? 'fp-dot-done' : currentStep === s ? 'fp-dot-active' : ''}`}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);

  /* Resend countdown */
  useEffect(() => {
    if (step !== STEPS.OTP) return;
    setResendTimer(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  /* Focus first OTP box on step change */
  useEffect(() => {
    if (step === STEPS.OTP) setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [step]);

  /* ── Step 1: Email ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setErrors({ email: 'Email is required' });
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(URLS.ForgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();

      if (response.ok && (result.success || result.userId)) {
        const id = result.userId || (result.data && (result.data._id || result.data.userId || result.data.id));
        setUserId(id);
        setStep(STEPS.OTP);
      } else {
        setErrors({ email: result.message || 'Failed to send OTP. Please check your email.' });
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setErrors({ email: 'Unable to connect to the server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 2: OTP ── */
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return setErrors({ otp: 'Enter all 6 digits' });
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(URLS.VerifyForgotPasswordOTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: userId, emailOtp: code }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setStep(STEPS.NEW_PASSWORD);
      } else {
        setErrors({ otp: result.message || 'Invalid OTP code. Please check and try again.' });
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setErrors({ otp: 'Unable to verify OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(URLS.ForgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();

      if (response.ok && (result.success || result.userId)) {
        if (result.userId) setUserId(result.userId);
        setOtp(['', '', '', '', '', '']);
        setResendTimer(30);
        setCanResend(false);
        otpRefs.current[0]?.focus();
      } else {
        setErrors({ otp: result.message || 'Failed to resend OTP.' });
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setErrors({ otp: 'Unable to resend OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 3: New Password ── */
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const strength = getStrength(newPassword);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (newPassword.length < 6) errs.newPassword = 'Minimum 6 characters required';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(URLS.ResetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          newpassword: newPassword,
          confirmpassword: confirmPassword,
        }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(result.message || 'Your password has been reset successfully. You can now sign in with your new password.');
        setStep(STEPS.SUCCESS);
      } else {
        setErrors({ confirmPassword: result.message || 'Failed to reset password. Please try again.' });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setErrors({ confirmPassword: 'Unable to connect. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fp-card">

        {/* ──────────── STEP 1 — Email ──────────── */}
        {step === STEPS.EMAIL && (
          <div className="fp-step-panel" key="email">
            <div className="auth-header">
              <div className="auth-icon-wrap">
                <KeyRound size={28} color="var(--primary)" />
              </div>
              <h1 className="auth-title">Forgot Password</h1>
              <p className="auth-sub">We'll send a 6-digit OTP to your registered email</p>
            </div>
            <StepDots currentStep={step} />
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Registered Store Email</label>
                <div className="fp-input-wrap">
                  <Mail size={15} className="fp-input-icon" />
                  <input
                    type="email"
                    className={`form-input fp-icon-input ${errors.email ? 'fp-input-error' : ''}`}
                    placeholder="store@restaurant.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    required
                  />
                </div>
                {errors.email && <p className="fp-error-msg">{errors.email}</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading
                  ? <><span className="fp-spinner" /> Sending OTP…</>
                  : <><Mail size={16} /> Send OTP</>
                }
              </button>

              <Link to="/login" className="btn btn-outline">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </form>
          </div>
        )}

        {/* ──────────── STEP 2 — OTP ──────────── */}
        {step === STEPS.OTP && (
          <div className="fp-step-panel" key="otp">
            <div className="auth-header">
              <div className="auth-icon-wrap">
                <ShieldCheck size={28} color="var(--primary)" />
              </div>
              <h1 className="auth-title">Verify OTP</h1>
              <p className="auth-sub">
                Sent to <span className="fp-email-highlight">{email}</span>
              </p>
            </div>
            <StepDots currentStep={step} />

            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div className="fp-otp-row" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`fp-otp-box ${errors.otp ? 'fp-input-error' : ''} ${digit ? 'fp-otp-filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    />
                  ))}
                </div>
                {errors.otp && <p className="fp-error-msg" style={{ textAlign: 'center', marginTop: 8 }}>{errors.otp}</p>}
              </div>

              <div className="fp-resend-row">
                {canResend ? (
                  <button type="button" className="fp-resend-btn" onClick={handleResend}>
                    <RefreshCw size={13} /> Resend OTP
                  </button>
                ) : (
                  <span className="fp-resend-timer">
                    Resend in <b>{resendTimer}s</b>
                  </span>
                )}
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading
                  ? <><span className="fp-spinner" /> Verifying…</>
                  : <><ShieldCheck size={16} /> Verify OTP</>
                }
              </button>

              <StepBack onBack={() => setStep(STEPS.EMAIL)} />
            </form>
          </div>
        )}

        {/* ──────────── STEP 3 — New Password ──────────── */}
        {step === STEPS.NEW_PASSWORD && (
          <div className="fp-step-panel" key="password">
            <div className="auth-header">
              <div className="auth-icon-wrap">
                <Lock size={28} color="var(--primary)" />
              </div>
              <h1 className="auth-title">Set New Password</h1>
              <p className="auth-sub">Choose a strong password for your account</p>
            </div>
            <StepDots currentStep={step} />

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* New password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="fp-input-wrap">
                  <Lock size={15} className="fp-input-icon" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    className={`form-input fp-icon-input fp-pr-input ${errors.newPassword ? 'fp-input-error' : ''}`}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrors({}); }}
                    required
                  />
                  <button type="button" className="fp-eye-btn" onClick={() => setShowNew((v) => !v)}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.newPassword && <p className="fp-error-msg">{errors.newPassword}</p>}

              </div>

              {/* Confirm password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="fp-input-wrap">
                  <Lock size={15} className="fp-input-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`form-input fp-icon-input fp-pr-input ${errors.confirmPassword ? 'fp-input-error' : ''}`}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
                    required
                  />
                  <button type="button" className="fp-eye-btn" onClick={() => setShowConfirm((v) => !v)}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="fp-match-msg"><CheckCircle size={12} /> Passwords match</p>
                )}
                {errors.confirmPassword && <p className="fp-error-msg">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading
                  ? <><span className="fp-spinner" /> Updating…</>
                  : <><Lock size={16} /> Update Password</>
                }
              </button>

              <StepBack onBack={() => setStep(STEPS.OTP)} />
            </form>
          </div>
        )}

        {/* ──────────── STEP 4 — Success ──────────── */}
        {step === STEPS.SUCCESS && (
          <div className="fp-step-panel fp-success-panel" key="success">
            <div className="fp-success-icon-wrap">
              <CheckCircle size={52} color="var(--success)" />
            </div>
            <h2 className="fp-success-title">Password Updated!</h2>
            <p className="fp-success-sub">
              {successMessage || 'Your password has been reset successfully. You can now sign in with your new password.'}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center', textDecoration: 'none' }}>
              <Lock size={16} /> Sign In Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
