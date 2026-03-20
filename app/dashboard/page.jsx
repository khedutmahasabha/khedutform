"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const printRef = useRef(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthed(true);
      } else {
        setLoginError("Invalid email or password. Please try again.");
      }
    } catch {
      setLoginError("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/forms")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSubmissions(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authed]);

  function handlePrint() {
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Submissions Report · સબમિશન અહેવાલ</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #0f2044; }
          h1 { font-size: 1.4rem; margin-bottom: 4px; }
          .subtitle { font-size: 0.8rem; color: #888; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
          thead tr { background: #0f2044; color: white; }
          thead th { padding: 10px 12px; text-align: left; font-weight: 600; }
          tbody tr:nth-child(even) { background: #f4f2ef; }
          tbody td { padding: 9px 12px; border-bottom: 1px solid #e8e4df; }
          .no { width: 40px; }
          @media print {
            body { padding: 12px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Form Submissions · ફોર્મ સબમિશન</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })} · Total: ${filteredSubmissions.length} records</p>
        ${printContents}
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
    }, 400);
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.district?.toLowerCase().includes(q) ||
      s.taluka?.toLowerCase().includes(q) ||
      s.village?.toLowerCase().includes(q)
    );
  });

  /* ── LOGIN SCREEN ── */
  if (!authed) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginBg}>
          <div className={styles.loginCircle1} />
          <div className={styles.loginCircle2} />
        </div>

        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>
            <div className={styles.miniFlag}>
              <div style={{ flex: 1, background: "#FF9933" }} />
              <div
                style={{
                  flex: 1,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "7px",
                  color: "#000080",
                }}
              >
                ☸
              </div>
              <div style={{ flex: 1, background: "#138808" }} />
            </div>
          </div>

          <h1 className={styles.loginTitle}>Dashboard Login</h1>
          <p className={styles.loginSub}>ડેશબોર્ડ · Restricted Access</p>

          <form onSubmit={handleLogin} className={styles.loginForm} noValidate>
            <div className={styles.loginField}>
              <label className={styles.loginLabel}>Email · ઈમેઈલ</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError("");
                }}
                placeholder="admin@example.com"
                className={styles.loginInput}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.loginField}>
              <label className={styles.loginLabel}>Password · પાસવર્ડ</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError("");
                }}
                placeholder="••••••••"
                className={styles.loginInput}
                autoComplete="current-password"
                required
              />
            </div>

            {loginError && (
              <div className={styles.loginError}>
                <span>⚠</span> {loginError}
              </div>
            )}

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loginLoading}
            >
              {loginLoading ? "Logging in…" : "Login · પ્રવેશ કરો"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── DASHBOARD ── */
  return (
    <div className={styles.dashPage}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.miniFlag2}>
            <div style={{ flex: 1, background: "#FF9933" }} />
            <div
              style={{
                flex: 1,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "6px",
                color: "#000080",
              }}
            >
              ☸
            </div>
            <div style={{ flex: 1, background: "#138808" }} />
          </div>
          <div>
            <h1 className={styles.dashTitle}>Admin Dashboard · ડેશબોર્ડ</h1>
            <p className={styles.dashSub}>Form Submission Records</p>
          </div>
        </div>
        <div className={styles.topBarRight}>
          <button className={styles.printBtn} onClick={handlePrint}>
            <span className={styles.printIcon}>🖨</span>
            <span>Print PDF</span>
          </button>
          <button
            className={styles.logoutBtn}
            onClick={() => {
              setAuthed(false);
              setSubmissions([]);
              setEmail("");
              setPassword("");
            }}
          >
            Logout ↩
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{submissions.length}</span>
          <span className={styles.statLabel}>Total Submissions · કુલ</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>
            {
              [...new Set(submissions.map((s) => s.district))].filter(Boolean)
                .length
            }
          </span>
          <span className={styles.statLabel}>Districts · જિલ્લા</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>
            {
              [...new Set(submissions.map((s) => s.taluka))].filter(Boolean)
                .length
            }
          </span>
          <span className={styles.statLabel}>Talukas · તાલુકા</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>
            {submissions.length > 0
              ? new Date(submissions[0].createdAt).toLocaleDateString("en-IN")
              : "—"}
          </span>
          <span className={styles.statLabel}>Latest Entry · છેલ્લી</span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, district… · નામ, ફોન, જિલ્લો..."
            className={styles.searchInput}
          />
          {search && (
            <button
              className={styles.searchClear}
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>
        <p className={styles.resultCount}>
          {filteredSubmissions.length} of {submissions.length} records
        </p>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.tableEmpty}>
            <div className={styles.spinner} />
            <p>Loading submissions…</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className={styles.tableEmpty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>
              {search
                ? "No results found · કોઈ પરિણામ મળ્યું નથી"
                : "No submissions yet · હજુ કોઈ સબમિશન નથી"}
            </p>
          </div>
        ) : (
          <div ref={printRef}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thNo}>#</th>
                  <th>Name · નામ</th>
                  <th>Ph. No. · ફોન</th>
                  <th>State · રાજ્ય</th>
                  <th>District · જિલ્લો</th>
                  <th>Taluka · તાલુકો</th>
                  <th>Village · ગામ</th>
                  <th className={styles.thDate}>Date · તારીખ</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((s, i) => (
                  <tr key={s._id} className={styles.row}>
                    <td className={styles.tdNo}>{i + 1}</td>
                    <td className={styles.tdName}>{s.name}</td>
                    <td className={styles.tdPhone}>{s.phone}</td>
                    <td>{s.state}</td>
                    <td>{s.district}</td>
                    <td>{s.taluka}</td>
                    <td>{s.village}</td>
                    <td className={styles.tdDate}>
                      {new Date(s.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
