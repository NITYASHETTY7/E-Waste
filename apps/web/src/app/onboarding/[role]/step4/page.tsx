"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function OnboardingStep4() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();
  const { currentUser, pendingOnboardingRole, completeOnboarding } = useApp();
  const effectiveRole = role || pendingOnboardingRole || currentUser?.role || "client";

  const [emailOTP] = useState(generateOTP);
  const [phoneOTP] = useState(generateOTP);

  const [emailInput, setEmailInput] = useState(["", "", "", "", "", ""]);
  const [phoneInput, setPhoneInput] = useState(["", "", "", "", "", ""]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const emailRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleOTPChange = (
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
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (
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
    refs.current[nextIdx]?.focus();
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace") {
      if (!arr[idx] && idx > 0) {
        refs.current[idx - 1]?.focus();
        setArr(prev => {
          const next = [...prev];
          next[idx - 1] = "";
          return next;
        });
      } else {
        setArr(prev => {
          const next = [...prev];
          next[idx] = "";
          return next;
        });
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const verifyEmail = async () => {
    const entered = emailInput.join("");
    if (entered.length !== 6) { setEmailError("Enter all 6 digits"); return; }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 800));
    if (entered === emailOTP) {
      setEmailVerified(true);
      setEmailError("");
    } else {
      setEmailError("Incorrect OTP. Try again.");
    }
    setVerifying(false);
  };

  const verifyPhone = async () => {
    const entered = phoneInput.join("");
    if (entered.length !== 6) { setPhoneError("Enter all 6 digits"); return; }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 800));
    if (entered === phoneOTP) {
      setPhoneVerified(true);
      setPhoneError("");
    } else {
      setPhoneError("Incorrect OTP. Try again.");
    }
    setVerifying(false);
  };

  const skipVerification = () => {
    setEmailVerified(true);
    setPhoneVerified(true);
  };

  const handleComplete = async () => {
    if (!emailVerified || !phoneVerified) return;
    setCompleted(true);
    await new Promise(r => setTimeout(r, 1500));
    completeOnboarding();
    router.push(effectiveRole === "vendor" ? "/vendor/dashboard" : "/client/dashboard");
  };

  const OTPBox = ({
    arr, setArr, refs, verified, error, otpCode, label, icon, onVerify
  }: {
    arr: string[];
    setArr: React.Dispatch<React.SetStateAction<string[]>>;
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    verified: boolean; error: string; otpCode: string; label: string; icon: string;
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
                {verified ? "Successfully verified" : "6-digit OTP sent"}
              </p>
            </div>
          </div>
          {verified && <span className="pill pill-success">Verified</span>}
        </div>

        {!verified && (
          <>
            <div className="bg-[color:var(--color-surface-container)] rounded-lg p-3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[color:var(--color-on-surface-variant)]">info</span>
              <p className="text-xs text-[color:var(--color-on-surface-variant)]">
                Demo OTP: <span className="font-black font-mono text-[color:var(--color-on-surface)] tracking-widest">{otpCode}</span>
              </p>
            </div>

            <div className="flex gap-2 justify-center mb-4">
              {arr.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { refs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onPaste={(e) => handlePaste(e, setArr, refs)}
                  onChange={(e) => handleOTPChange(idx, e.target.value, setArr, refs)}
                  onKeyDown={(e) => handleKeyDown(idx, e, arr, setArr, refs)}
                  onFocus={e => e.target.select()}
                  className={`w-12 h-14 text-center text-xl font-black font-mono rounded-xl border-2 outline-none transition-all bg-[color:var(--color-surface-container-low)] ${
                    digit ? "border-[color:var(--color-primary)] text-[color:var(--color-on-surface)]" :
                    error ? "border-red-400" : "border-[color:var(--color-outline-variant)]"
                  } focus:border-[color:var(--color-tertiary)] focus:bg-white`}
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
      </div>

      <div className="flex justify-end mb-4">
        <button type="button" onClick={skipVerification}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Skip Verification (Demo)
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <OTPBox
          arr={emailInput} setArr={setEmailInput} refs={emailRefs}
          verified={emailVerified} error={emailError} otpCode={emailOTP}
          label="Email OTP" icon="mail" onVerify={verifyEmail}
        />
        <OTPBox
          arr={phoneInput} setArr={setPhoneInput} refs={phoneRefs}
          verified={phoneVerified} error={phoneError} otpCode={phoneOTP}
          label="Phone OTP" icon="phone_android" onVerify={verifyPhone}
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-[color:var(--color-on-surface-variant)]">Didn't receive OTPs?</p>
        {resendTimer > 0 ? (
          <span className="text-xs font-bold text-[color:var(--color-on-surface-variant)]">Resend in {resendTimer}s</span>
        ) : (
          <button onClick={() => setResendTimer(60)} className="text-xs font-bold text-[color:var(--color-primary)] hover:underline">
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
          disabled={!emailVerified || !phoneVerified}
          className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
            emailVerified && phoneVerified
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
