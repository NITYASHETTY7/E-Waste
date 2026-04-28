"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";

export default function OnboardingStep4() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();
  const { currentUser, pendingOnboardingRole, pendingOnboardingEmail, completeOnboarding } = useApp();
  const effectiveRole = role || pendingOnboardingRole || currentUser?.role || "client";
  const userEmail = pendingOnboardingEmail || currentUser?.email || "";

  const [emailInput, setEmailInput] = useState(["", "", "", "", "", ""]);
  const [phoneInput, setPhoneInput] = useState(["", "", "", "", "", ""]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState<{ email?: string; phone?: string } | null>(null);

  const emailRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);
  const sentRef = useRef(false);

  // Send OTP only once userEmail is resolved
  useEffect(() => {
    if (userEmail && !sentRef.current) {
      sentRef.current = true;
      sendOTP();
    }
  }, [userEmail]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const userPhone = currentUser?.phone || currentUser?.onboardingProfile?.phone || "";

  const sendOTP = async () => {
    if (!userEmail) return;
    sentRef.current = true;
    setSendingOtp(true);
    try {
      const res = await api.post('/auth/send-otp', { email: userEmail, phone: userPhone || undefined });
      setOtpSent(true);
      // Surface dev OTP codes when AWS delivery is unavailable
      if (res.data?.devEmailOtp || res.data?.devPhoneOtp) {
        setDevOtp({ email: res.data.devEmailOtp, phone: res.data.devPhoneOtp });
      }
    } catch (e) {
      console.error('Failed to send OTP via API', e);
      setOtpSent(true);
    } finally {
      setSendingOtp(false);
      setResendTimer(60);
    }
  };

  const handleOTPChange = useCallback((
    idx: number,
    value: string,
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setArr(prev => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });

    if (digit && idx < 5) {
      // Use requestAnimationFrame to prevent focus stealing
      requestAnimationFrame(() => {
        refs.current[idx + 1]?.focus();
      });
    }
  }, []);

  const handlePaste = useCallback((
    e: React.ClipboardEvent,
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newArr = ["", "", "", "", "", ""];
    pastedData.split("").forEach((char, i) => {
      newArr[i] = char;
    });
    setArr(newArr);
    
    const nextIdx = Math.min(pastedData.length, 5);
    requestAnimationFrame(() => {
      refs.current[nextIdx]?.focus();
    });
  }, []);

  const handleKeyDown = useCallback((
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (!arr[idx] && idx > 0) {
        setArr(prev => {
          const next = [...prev];
          next[idx - 1] = "";
          return next;
        });
        requestAnimationFrame(() => {
          refs.current[idx - 1]?.focus();
        });
      } else {
        setArr(prev => {
          const next = [...prev];
          next[idx] = "";
          return next;
        });
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      e.preventDefault();
      refs.current[idx + 1]?.focus();
    }
  }, []);

  const verifyEmail = async () => {
    const entered = emailInput.join("");
    if (entered.length !== 6) { setEmailError("Enter all 6 digits"); return; }
    setVerifying(true);
    setEmailError("");
    try {
      const res = await api.post('/auth/verify-otp', { email: userEmail, code: entered, type: 'email' });
      if (res.data?.verified) {
        setEmailVerified(true);
      } else {
        setEmailError("Incorrect OTP. Please try again.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Verification failed. Please try again.";
      setEmailError(msg);
    }
    setVerifying(false);
  };

  const verifyPhone = async () => {
    const entered = phoneInput.join("");
    if (entered.length !== 6) { setPhoneError("Enter all 6 digits"); return; }
    setVerifying(true);
    setPhoneError("");
    try {
      const res = await api.post('/auth/verify-otp', { email: userEmail, code: entered, type: 'phone' });
      if (res.data?.verified) {
        setPhoneVerified(true);
      } else {
        setPhoneError("Incorrect OTP. Please try again.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Verification failed. Please try again.";
      setPhoneError(msg);
    }
    setVerifying(false);
  };

  const handleComplete = async () => {
    if (!emailVerified || (userPhone && !phoneVerified)) return;
    setCompleted(true);
    await new Promise(r => setTimeout(r, 1500));
    await completeOnboarding();
    router.push(effectiveRole === "vendor" ? "/vendor/dashboard" : effectiveRole === "consumer" ? "/consumer/dashboard" : "/client/dashboard");
  };

  const renderOTPBox = ({
    arr, setArr, refs, verified, error, label, icon, onVerify
  }: {
    arr: string[];
    setArr: React.Dispatch<React.SetStateAction<string[]>>;
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    verified: boolean; error: string; label: string; icon: string;
    onVerify: () => void;
  }) => {
    return (
      <div className={`card p-6 transition-all ${verified ? "border-2 border-[color:var(--color-primary)]" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              verified ? "bg-[color:var(--color-primary-fixed)]" : "bg-[color:var(--color-secondary-container)]"
            }`}>
              <span className={`material-symbols-outlined ${verified ? "text-[color:var(--color-on-primary-fixed)]" : "text-[color:var(--color-primary)]"}`}
                style={verified ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {verified ? "verified" : icon}
              </span>
            </div>
            <div>
              <p className="font-bold text-[color:var(--color-on-surface)] text-sm">{label}</p>
              <p className="text-xs text-[color:var(--color-on-surface-variant)]">
                {verified ? "Successfully verified" : "Enter the 6-digit code sent to you"}
              </p>
            </div>
          </div>
          {verified && <span className="pill pill-success">Verified</span>}
        </div>

        {!verified && (
          <>
            <div className="flex gap-2 justify-center mb-4">
              {arr.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { refs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onPaste={(e) => handlePaste(e, setArr, refs)}
                  onChange={(e) => handleOTPChange(idx, e.target.value, setArr, refs)}
                  onKeyDown={(e) => handleKeyDown(idx, e, arr, setArr, refs)}
                  className={`w-12 h-14 text-center text-xl font-black font-mono rounded-xl border-2 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                    digit ? "border-[color:var(--color-primary)]" :
                    error ? "border-red-400" : "border-slate-300 dark:border-slate-700"
                  } focus:border-[color:var(--color-tertiary)] focus:ring-2 focus:ring-[color:var(--color-tertiary)]/20`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

            <button onClick={onVerify} disabled={verifying}
              className="btn-primary w-full py-3 rounded-xl text-sm font-bold disabled:opacity-60">
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  Verifying...
                </span>
              ) : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    );
  };

  if (completed) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto rounded-full bg-[color:var(--color-primary-fixed)] flex items-center justify-center mb-6 animate-bounce">
          <span className="material-symbols-outlined text-5xl text-[color:var(--color-on-primary-fixed)]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="text-3xl font-headline font-extrabold text-[color:var(--color-on-surface)] mb-3">
          {effectiveRole === "vendor" ? "Application Submitted!" : "Welcome to WeConnect!"}
        </h2>
        <p className="text-[color:var(--color-on-surface-variant)]">
          {effectiveRole === "vendor"
            ? "Your application is under review. We'll notify you within 2–3 business days."
            : "Your account is set up. Redirecting to your dashboard..."}
        </p>
        <div className="mt-6 flex justify-center">
          <span className="material-symbols-outlined text-3xl text-[color:var(--color-primary)] animate-spin">progress_activity</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 bg-[color:var(--color-secondary-container)] text-[color:var(--color-on-secondary-container)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm">shield_lock</span>
          Step 4 — OTP Verification
        </span>
        <h1 className="text-3xl font-headline font-extrabold text-[color:var(--color-on-surface)] tracking-tight">
          Verify Your Identity
        </h1>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">
          We've sent 6-digit verification codes to your email and phone. Please verify both.
        </p>
        {sendingOtp && (
          <p className="text-xs text-[color:var(--color-primary)] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            Sending OTP...
          </p>
        )}
      </div>

      {devOtp && (
        <div className="mb-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono space-y-1">
          <p className="font-black uppercase tracking-widest text-amber-400 mb-2">⚠ Dev Fallback — AWS sandbox active</p>
          {devOtp.email && <p>📧 Email OTP: <span className="font-black text-white text-base tracking-widest">{devOtp.email}</span></p>}
          {devOtp.phone && <p>📱 Phone OTP: <span className="font-black text-white text-base tracking-widest">{devOtp.phone}</span></p>}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {renderOTPBox({
          arr: emailInput, setArr: setEmailInput, refs: emailRefs,
          verified: emailVerified, error: emailError,
          label: "Email OTP", icon: "mail", onVerify: verifyEmail
        })}
        {userPhone && renderOTPBox({
          arr: phoneInput, setArr: setPhoneInput, refs: phoneRefs,
          verified: phoneVerified, error: phoneError,
          label: "Phone OTP", icon: "phone_android", onVerify: verifyPhone
        })}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-[color:var(--color-on-surface-variant)]">Didn't receive OTPs?</p>
        {resendTimer > 0 ? (
          <span className="text-xs font-bold text-[color:var(--color-on-surface-variant)]">Resend in {resendTimer}s</span>
        ) : (
          <button onClick={sendOTP} disabled={sendingOtp} className="text-xs font-bold text-[color:var(--color-primary)] hover:underline">
            Resend OTPs
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={() => router.back()}
          className="btn-outline flex-[0.4] py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={!emailVerified || (!!userPhone && !phoneVerified)}
          className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
            emailVerified && (!userPhone || phoneVerified)
              ? "btn-tertiary"
              : "bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface-variant)] cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined">
            {effectiveRole === "vendor" ? "send" : "rocket_launch"}
          </span>
          {effectiveRole === "vendor" ? "Submit Application" : "Enter Dashboard"}
        </button>
      </div>
    </div>
  );
}
