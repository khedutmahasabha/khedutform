"use client";

import { useState, useMemo, useRef } from "react";
import gujaratData from "../data/gujarat.json";
import styles from "./page.module.css";

const FIELDS = {
  name: { en: "Full Name", gu: "પૂરું નામ" },
  phone: { en: "Phone Number", gu: "ફોન નંબર" },
  state: { en: "State", gu: "રાજ્ય" },
  district: { en: "District", gu: "જિલ્લો" },
  taluka: { en: "Taluka", gu: "તાલુકો" },
  village: { en: "Village", gu: "ગામ" },
  email: { en: "Email", gu: "ઈમેઈલ" },
};

const initialForm = {
  name: "",
  phone: "",
  state: "Gujarat",
  district: "",
  taluka: "",
  village: "",
  email: "",
  surveyNumber: "",
  totalLand: "",
  townPlanning: "",
  pipeline: "",
  affectedArea: "",
  compensation: "",
  farmDamage: "",
  problem: "",
};

function Label({ field, required = true }) {
  return (
    <label className={styles.label}>
      <span className={styles.labelEn}>{FIELDS[field].en}</span>
      <span className={styles.labelSep}> / </span>
      <span className={styles.labelGu}>{FIELDS[field].gu}</span>
      {required && <span className={styles.req}>*</span>}
    </label>
  );
}

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [touched, setTouched] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const districts = gujaratData.districts;
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);
  const talukas = useMemo(() => {
    if (!form.district) return [];
    const found = districts.find((d) => d.name === form.district);
    return found?.talukas || [];
  }, [form.district]);

  const villages = useMemo(() => {
    if (!form.taluka) return [];
    const found = talukas.find((t) => t.name === form.taluka);
    return found?.villages || [];
  }, [form.taluka, talukas]);

  function validate(data) {
    const errs = {};
    if (!data.name.trim()) errs.name = "નામ જરૂરી છે / Name is required";
    if (form.phone.trim() !== "" && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      errs.phone = "માન્ય ૧૦-અંકનો નંบर / Valid 10-digit number required";
    }
    if (!data.email.trim()) {
      errs.email = "ઈમેઈલ જરૂરી છે / Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = "માન્ય ઈમેઈલ / Valid email required";
    }
    if (!data.district) errs.district = "જિલ્લો પસંદ કરો / Select district";
    if (!data.taluka) errs.taluka = "તાલુકો પસંદ કરો / Select taluka";
    if (!data.village) errs.village = "ગામ પસંદ કરો / Select village";

    if (!data.surveyNumber.trim()) errs.surveyNumber = "સર્વે નંબર જરૂરી છે";
    if (!data.totalLand) errs.totalLand = "જમીન વિસ્તાર જરૂરી છે";
    if (!data.townPlanning) errs.townPlanning = "Town Planning પસંદ કરો";
    if (!data.pipeline) errs.pipeline = "Pipeline પ્રકાર પસંદ કરો";
    if (!data.compensation) errs.compensation = "વળતર વિગત પસંદ કરો";
    if (!data.farmDamage) errs.farmDamage = "નુકસાન વિગત પસંદ કરો";
    return errs;
  }

  async function handleSendOtp() {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setOtpError("પ્રથમ માન્ય ઈમેઈલ દાખલ કરો / Enter a valid email first");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpTimer(300);
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setOtpError(data.message);
      }
    } catch {
      setOtpError("OTP મોકલવામાં ભૂલ / Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpInput || otpInput.length !== 6) {
      setOtpError("6 અંકનો OTP દાખલ કરો / Enter 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otpInput }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError(data.message);
      }
    } catch {
      setOtpError("OTP ચકાસવામાં ભૂલ / Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    let update = { [name]: value };

    if (name === "district")
      update = { district: value, taluka: "", village: "" };
    if (name === "taluka") update = { taluka: value, village: "" };

    setForm((prev) => ({ ...prev, ...update }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const newForm = { ...form, ...update };
    const newErrors = validate(newForm);
    setErrors((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.keys(update).map((k) => [k, newErrors[k] || ""]),
      ),
    }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(FIELDS).map((k) => [k, true]),
    );
    setTouched(allTouched);

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k])) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          state: form.state,
          district: form.district,
          taluka: form.taluka,
          village: form.village,
          email: form.email,
          surveyNumber: form.surveyNumber,
          totalLand: form.totalLand,
          townPlanning: form.townPlanning,
          pipeline: form.pipeline,
          affectedArea: form.affectedArea,
          compensation: form.compensation,
          farmDamage: form.farmDamage,
          problem: form.problem,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setForm(initialForm);
        setTouched({});
        setErrors({});
      } else {
        setStatus("error");
        setErrorMessage(data.message || "");
      }
    } catch {
      setStatus("error");
    }
  }

  const showErr = (field) => touched[field] && errors[field];

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <svg
          className={styles.bgPattern}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <main className={styles.main}>
        {/* Header */}
        <header
          className={styles.header}
          style={{ flexDirection: "column", display: "flex" }}
        >
          <span>Welcome to Khedut Mahasabha</span>
          <span>ખેડૂત મહાસભામાં આપનું હાર્દિક સ્વાગત છે</span>
        </header>

        {/* Form Card */}
        <div className={styles.card}>
          {status === "success" && (
            <div className={styles.successBanner}>
              <span className={styles.successIcon}>✓</span>
              <div>
                <strong>સફળતાપૂર્વક સબમિટ! / Successfully Submitted!</strong>
                <p>
                  Your information has been recorded. · તમારી માહિતી નોંધવામાં
                  આવી છે.
                </p>
              </div>
              <button
                className={styles.successClose}
                onClick={() => setStatus(null)}
              >
                ✕
              </button>
            </div>
          )}

          {status === "error" && (
            <div className={styles.errorBanner}>
              <span>⚠</span>
              <div>
                <strong>Error / ભૂલ</strong>
                <p>
                  {errorMessage ||
                    "Something went wrong. Please try again. · કૃપા કરી ફરી પ્રયાસ કરો."}
                </p>
              </div>
              <button
                className={styles.successClose}
                onClick={() => {
                  setStatus(null);
                  setErrorMessage("");
                }}
              >
                ✕
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            noValidate
          >
            {/* Form Heading Field */}

            {/* Dynamic title display */}
            {form.heading && (
              <div className={styles.dynamicTitle}>
                <div className={styles.dynamicTitleBar} />
                <h2 className={styles.dynamicTitleText}>{form.heading}</h2>
                <div className={styles.dynamicTitleBar} />
              </div>
            )}

            <div className={styles.divider} />

            {/* Two column grid for name & phone */}
            <div className={styles.row}>
              {/* Name */}
              <div className={styles.field}>
                <Label field="name" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ramesh Patel · રમેશ પટેલ"
                  className={`${styles.input} ${showErr("name") ? styles.inputError : ""}`}
                  autoComplete="name"
                />
                {showErr("name") && (
                  <p className={styles.errMsg}>{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className={styles.field}>
                <Label field="phone" required={false} />
                <div className={styles.phoneWrapper}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`${styles.input} ${styles.phoneInput} ${showErr("phone") ? styles.inputError : ""}`}
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
                {showErr("phone") && (
                  <p className={styles.errMsg}>{errors.phone}</p>
                )}
              </div>

              <div className={styles.field}>
                <Label field="email" />
                <div className={styles.inputWrapper}>
                  {" "}
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="ramesh@example.com"
                    className={`${styles.input} ${showErr("email") ? styles.inputError : ""}`}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                {showErr("email") && (
                  <p className={styles.errMsg}>{errors.email}</p>
                )}
              </div>
            </div>

            <div className={styles.locationSection}>
              <h3 className={styles.sectionLabel}>
                <span className={styles.sectionLabelIcon}>📍</span>
                Land Details · સ્થાન વિગત
              </h3>

              <div className={styles.locationGrid}>
                {/* State */}
                <div className={styles.field}>
                  <Label field="state" />
                  <select
                    name="state"
                    value={form.state}
                    disabled
                    className={`${styles.select} ${styles.selectDisabled}`}
                  >
                    <option value="Gujarat">Gujarat · ગુજરાત</option>
                  </select>
                  <span className={styles.lockIcon}>🔒</span>
                </div>

                {/* District */}
                <div className={styles.field}>
                  <Label field="district" />
                  <div className={styles.selectWrapper}>
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.select} ${showErr("district") ? styles.inputError : ""}`}
                    >
                      <option value="">
                        — જિલ્લો પસંદ કરો / Select District —
                      </option>
                      {districts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <span className={styles.selectArrow}>▾</span>
                  </div>
                  {showErr("district") && (
                    <p className={styles.errMsg}>{errors.district}</p>
                  )}
                </div>

                {/* Taluka */}
                <div className={styles.field}>
                  <Label field="taluka" />
                  <div className={styles.selectWrapper}>
                    <select
                      name="taluka"
                      value={form.taluka}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!form.district}
                      className={`${styles.select} ${!form.district ? styles.selectDisabled : ""} ${showErr("taluka") ? styles.inputError : ""}`}
                    >
                      <option value="">
                        {!form.district
                          ? "— પ્રથમ જિલ્લો પસંદ કરો / Select District First —"
                          : "— તાલુકો પસંદ કરો / Select Taluka —"}
                      </option>
                      {talukas.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <span
                      className={`${styles.selectArrow} ${!form.district ? styles.arrowDisabled : ""}`}
                    >
                      {!form.district ? "🔒" : "▾"}
                    </span>
                  </div>
                  {showErr("taluka") && (
                    <p className={styles.errMsg}>{errors.taluka}</p>
                  )}
                </div>

                {/* Village */}
                <div className={styles.field}>
                  <Label field="village" />
                  <div className={styles.selectWrapper}>
                    <select
                      name="village"
                      value={form.village}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!form.taluka}
                      className={`${styles.select} ${!form.taluka ? styles.selectDisabled : ""} ${showErr("village") ? styles.inputError : ""}`}
                    >
                      <option value="">
                        {!form.taluka
                          ? "— પ્રથમ તાલુકો પસંદ કરો / Select Taluka First —"
                          : "— ગામ પસંદ કરો / Select Village —"}
                      </option>
                      {villages.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <span
                      className={`${styles.selectArrow} ${!form.taluka ? styles.arrowDisabled : ""}`}
                    >
                      {!form.taluka ? "🔒" : "▾"}
                    </span>
                  </div>
                  {showErr("village") && (
                    <p className={styles.errMsg}>{errors.village}</p>
                  )}
                </div>
              </div>
              {/* ── Extra Fields ── */}
            </div>
            <div className={styles.extraSection}>
              {/* Survey Number - સર્વે નંબર */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>સર્વે નંબર</span>
                  <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="surveyNumber"
                  value={form.surveyNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 101/1/2"
                  className={`${styles.input} ${showErr("surveyNumber") ? styles.inputError : ""}`}
                />
                {showErr("surveyNumber") && (
                  <p className={styles.errMsg}>{errors.surveyNumber}</p>
                )}
              </div>

              {/* Total Land - કુલ જમીન વિસ્તાર */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>કુલ જમીન વિસ્તાર (એકર)</span>
                  <span className={styles.req}>*</span>
                </label>
                <input
                  type="number"
                  name="totalLand"
                  value={form.totalLand}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 12"
                  min="0"
                  step="0.01"
                  className={`${styles.input} ${showErr("totalLand") ? styles.inputError : ""}`}
                />
                {showErr("totalLand") && (
                  <p className={styles.errMsg}>{errors.totalLand}</p>
                )}
              </div>

              {/* Town Planning - હેઠળ આવે છે? */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>
                    Town Planning હેઠળ આવે છે?
                  </span>
                  <span className={styles.req}>*</span>
                </label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="townPlanning"
                      value="yes"
                      checked={form.townPlanning === "yes"}
                      onChange={handleChange}
                      className={styles.radio}
                    />
                    હા/YES
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="townPlanning"
                      value="no"
                      checked={form.townPlanning === "no"}
                      onChange={handleChange}
                      className={styles.radio}
                    />
                    નાં/NO
                  </label>
                </div>
                {showErr("townPlanning") && (
                  <p className={styles.errMsg}>{errors.townPlanning}</p>
                )}
              </div>

              {/* ONGC Pipeline */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>
                    ONGC / ગેસ લાઇન Pipeline પસાર થાય છે
                  </span>
                  <span className={styles.req}>*</span>
                </label>
                <div className={styles.radioGroup}>
                  {[
                    "ONGC",
                    "GSPL ગેસ લાઇન/GSPL GAS LINE",
                    "સાબરમતી ગેસ લાઇન/SABARMATI GAS LINE",
                    "OTHER",
                  ].map((opt) => (
                    <label key={opt} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="pipeline"
                        value={opt}
                        checked={form.pipeline === opt}
                        onChange={handleChange}
                        className={styles.radio}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {showErr("pipeline") && (
                  <p className={styles.errMsg}>{errors.pipeline}</p>
                )}
              </div>

              {/* Affected Area - અસરગ્રસ્ત વિસ્તાર (optional) */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>
                    અસરગ્રસ્ત વિસ્તાર કેટલો? મીટર માં,
                  </span>
                </label>
                <input
                  type="number"
                  name="affectedArea"
                  value={form.affectedArea}
                  onChange={handleChange}
                  placeholder="Your answer"
                  min="0"
                  className={styles.input}
                />
              </div>

              {/* Compensation - વળતર મળ્યું છે? */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>વળતર મળ્યું છે?</span>
                  <span className={styles.req}>*</span>
                </label>
                <div className={styles.radioGroup}>
                  {[
                    { val: "yes", label: "YES/હા" },
                    { val: "no", label: "NO/નાં" },
                    { val: "partially", label: "PARTIALLY/થોડું ઘણું" },
                  ].map((opt) => (
                    <label key={opt.val} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="compensation"
                        value={opt.val}
                        checked={form.compensation === opt.val}
                        onChange={handleChange}
                        className={styles.radio}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {showErr("compensation") && (
                  <p className={styles.errMsg}>{errors.compensation}</p>
                )}
              </div>

              {/* Farm Damage - ખેતીમાં નુકસાન */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>
                    ખેતીમાં અથવા તમારી જગ્યા નું નુકસાન થાય છે?
                  </span>
                  <span className={styles.req}>*</span>
                </label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="farmDamage"
                      value="yes"
                      checked={form.farmDamage === "yes"}
                      onChange={handleChange}
                      className={styles.radio}
                    />
                    હા
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="farmDamage"
                      value="no"
                      checked={form.farmDamage === "no"}
                      onChange={handleChange}
                      className={styles.radio}
                    />
                    નાં
                  </label>
                </div>
                {showErr("farmDamage") && (
                  <p className={styles.errMsg}>{errors.farmDamage}</p>
                )}
              </div>

              {/* Problem Description - તમારી સમસ્યા (optional) */}
              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.labelGu}>
                    Provide your issue / તમારી સમસ્યા લખો
                  </span>
                </label>
                <textarea
                  name="problem"
                  value={form.problem}
                  onChange={handleChange}
                  placeholder="Your answer"
                  rows={3}
                  className={`${styles.input} ${styles.textarea}`}
                />
              </div>
            </div>

            <div ref={recaptchaRef} />

            {/* OTP Section */}
            <div className={styles.otpSection}>
              {!otpVerified ? (
                <>
                  <div className={styles.otpRow}>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || otpTimer > 0}
                      className={styles.otpSendBtn}
                    >
                      {otpLoading && !otpSent
                        ? "મોકલી રહ્યા છીએ..."
                        : otpTimer > 0
                          ? `Resend in ${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, "0")}`
                          : otpSent
                            ? "OTP ફરી મોકલો / Resend OTP (email)"
                            : "OTP મોકલો / Send OTP (email)"}
                    </button>

                    {otpSent && (
                      <div className={styles.otpInputRow}>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(e) => {
                            setOtpInput(e.target.value.replace(/\D/g, ""));
                            setOtpError("");
                          }}
                          placeholder="6-digit OTP"
                          maxLength={6}
                          inputMode="numeric"
                          className={`${styles.input} ${styles.otpInput} ${otpError ? styles.inputError : ""}`}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading}
                          className={styles.otpVerifyBtn}
                        >
                          {otpLoading ? "..." : "ચકાસો / Verify"}
                        </button>
                      </div>
                    )}
                  </div>

                  {otpError && <p className={styles.errMsg}>{otpError}</p>}
                </>
              ) : (
                <div className={styles.otpSuccess}>
                  <span>✓</span> ઇમેઇલ ચકાસાઈ ગયો / Email verified
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={status === "loading" || !otpVerified}
            >
              {status === "loading" ? (
                <span className={styles.loadingDots}>
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <>
                  <span>સબમિટ કરો</span>
                  <span className={styles.submitSep}>·</span>
                  <span>Submit Form</span>
                  <span className={styles.submitArrow}>→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
