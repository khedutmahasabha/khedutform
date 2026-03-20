"use client";

import { useState } from "react";
import gujaratData from "../data/gujarat.json";
import styles from "./page.module.css";

const FIELDS = {
  name: { en: "Full Name", gu: "પૂરું નામ" },
  phone: { en: "Phone Number", gu: "ફોન નંબર" },
  state: { en: "State", gu: "રાજ્ય" },
  district: { en: "District", gu: "જિલ્લો" },
  taluka: { en: "Taluka", gu: "તાલુકો" },
  village: { en: "Village", gu: "ગામ" },
};

const initialForm = {
  name: "",
  phone: "",
  state: "Gujarat",
  district: "",
  taluka: "",
  village: "",
};

function Label({ field }) {
  return (
    <label className={styles.label}>
      <span className={styles.labelEn}>{FIELDS[field].en}</span>
      <span className={styles.labelSep}> / </span>
      <span className={styles.labelGu}>{FIELDS[field].gu}</span>
      <span className={styles.req}>*</span>
    </label>
  );
}

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [touched, setTouched] = useState({});

  const districts = gujaratData.districts;
  const selectedDistrict = districts.find((d) => d.name === form.district);
  const talukas = selectedDistrict?.talukas || [];
  const selectedTaluka = talukas.find((t) => t.name === form.taluka);
  const villages = selectedTaluka?.villages || [];

  function validate(data) {
    const errs = {};
    if (!data.name.trim()) errs.name = "નામ જરૂરી છે / Name is required";
    if (!data.phone.trim())
      errs.phone = "ફોન નંબર જરૂરી છે / Phone is required";
    else if (!/^[6-9]\d{9}$/.test(data.phone.trim()))
      errs.phone = "માન્ય ૧૦-અંકનો નંબર / Valid 10-digit number required";
    if (!data.district) errs.district = "જિલ્લો પસંદ કરો / Select district";
    if (!data.taluka) errs.taluka = "તાલુકો પસંદ કરો / Select taluka";
    if (!data.village) errs.village = "ગામ પસંદ કરો / Select village";
    return errs;
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
        <header className={styles.header}>Welcome</header>

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
                  Something went wrong. Please try again. · કૃપા કરી ફરી પ્રયાસ
                  કરો.
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
                <Label field="phone" />
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
            </div>

            <div className={styles.locationSection}>
              <h3 className={styles.sectionLabel}>
                <span className={styles.sectionLabelIcon}>📍</span>
                Location Details · સ્થાન વિગત
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={status === "loading"}
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
