import { useState, useEffect } from "react";

const ROLES = {
  student: {
    label: "Student",
    accent: "#38bdf8",
    accentDim: "rgba(56, 189, 248, 0.14)",
    idLabel: "Student ID or email",
    cta: "Sign in as Student",
    helper: "Use your student ID or institutional email.",
    desc: "Access virtual physics labs, calculations, and quizzes.",
    demoId: "s.patil@thekinetix.edu"
  },
  faculty: {
    label: "Faculty",
    accent: "#f6ad55",
    accentDim: "rgba(246, 173, 85, 0.14)",
    idLabel: "Faculty ID or email",
    cta: "Sign in as Faculty",
    helper: "Use your staff ID or institutional email.",
    desc: "Manage lab experiments, telemetry, and student analytics.",
    demoId: "t.patil@thekinetix.edu"
  },
};

function Pendulum({ activeRole }) {
  return (
    <div className="kx-pendulum-wrap" aria-hidden="true">
      <svg width="120" height="58" viewBox="0 0 120 58">
        <line x1="10" y1="4" x2="110" y2="4" stroke="#384860" strokeWidth="2" strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 16 + i * 22;
          const isLeft = i === 0;
          const isRight = i === 4;
          const edge = isLeft || isRight;
          let offset = 0;
          if (isLeft && activeRole === "student") offset = -32;
          if (isRight && activeRole === "faculty") offset = 32;
          const ballFill = isLeft ? "#38bdf8" : isRight ? "#f6ad55" : "#1c2a40";
          return (
            <g
              key={i}
              style={{ transform: `rotate(${offset}deg)`, transformOrigin: `${x}px 4px`, transition: "transform var(--transition)" }}
            >
              <g className={edge ? "kx-bob-idle" : ""} style={{ transformOrigin: `${x}px 4px` }}>
                <line x1={x} y1="4" x2={x} y2="40" stroke="#384860" strokeWidth="1.4" />
                <circle cx={x} cy="46" r="7" fill={ballFill} />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function TheKinetixLogin({ onLoginSuccess, onBack, initialStep = "select" }) {
  const [step, setStep] = useState(initialStep); // "select" | "form" | "signup"
  const [role, setRole] = useState(null);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(null);

  // Signup fields
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpRole, setSignUpRole] = useState("student");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const active = role ? ROLES[role] : null;

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const chooseRole = (r) => {
    setRole(r);
    setId(ROLES[r].demoId);
    setPassword("password123");
    setSubmitted(null);
    setStep("form");
  };

  const fillDemoCredentials = () => {
    if (active) {
      setId(active.demoId);
      setPassword("physics2026");
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setSubmitted({ role, id });
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({ role, id });
      }
    }, 1000);
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setSignUpSuccess(true);
  };

  return (
    <div className="kx-root">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

        * { box-sizing: border-box; }

        .kx-root {
          --bg: #080f1e;
          --surface: rgba(13, 22, 40, 0.78);
          --surface2: rgba(20, 32, 54, 0.68);
          --surface3: rgba(26, 42, 68, 0.78);
          --border: rgba(56, 189, 248, 0.22);
          --border2: rgba(56, 189, 248, 0.42);
          --accent: #38bdf8;
          --accent2: #4fd1c5;
          --accent3: #f6ad55;
          --text: #dde6f0;
          --text-muted: #6b7f99;
          --text-dim: #384860;
          --danger: #fc8181;
          --success: #68d391;
          --gold: #f6e05e;
          --radius: 14px;
          --shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
          --transition: 0.32s cubic-bezier(0.4, 0, 0.2, 1);

          min-height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          font-family: 'Inter', sans-serif;
          color: var(--text);
          position: relative;
          overflow: hidden;
          background: transparent;
        }

        .kx-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
          pointer-events: none;
        }

        .kx-orbit {
          position: absolute;
          border: 1px solid var(--border);
          border-radius: 50%;
          pointer-events: none;
        }
        .kx-orbit.o1 { width: 640px; height: 640px; top: -240px; left: -180px; }
        .kx-orbit.o2 { width: 440px; height: 440px; bottom: -190px; right: -130px; }

        .kx-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
          background: var(--surface);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius);
          padding: 40px 36px 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55), 0 0 30px rgba(56, 189, 248, 0.12);
          transition: max-width var(--transition), padding var(--transition);
        }
        .kx-card.is-form { max-width: 420px; }

        .kx-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: var(--text-muted);
          text-align: center;
          margin: 0 0 18px;
        }

        /* --- Pendulum mark --- */
        .kx-pendulum-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }
        .kx-bob-idle {
          animation: kx-idle 2.6s ease-in-out infinite;
        }
        @keyframes kx-idle {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }

        .kx-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 28px;
          text-align: center;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
          color: var(--text);
        }

        /* --- Letter-by-letter reveal --- */
        .kx-animated-headline { display: block; }
        .kx-letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(10px);
          animation: kx-letter-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes kx-letter-in {
          to { opacity: 1; transform: translateY(0); }
        }

        .kx-sub {
          text-align: center;
          color: var(--text-muted);
          font-size: 14.5px;
          margin: 0 0 30px;
          line-height: 1.5;
        }

        /* --- Action buttons (Landing) --- */
        .kx-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 10px;
        }

        .kx-btn {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--surface2);
          color: var(--text);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s ease, transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .kx-btn:hover {
          background: var(--surface3);
          border-color: var(--accent);
          box-shadow: 0 0 15px rgba(99, 179, 237, 0.15);
          transform: translateY(-1px);
        }
        .kx-btn.primary {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #06121f;
          border: none;
        }
        .kx-btn.primary:hover {
          filter: brightness(1.1);
          box-shadow: 0 8px 24px rgba(99, 179, 237, 0.3);
        }
        .kx-btn:active {
          transform: translateY(1px);
        }

        /* --- Role selection --- */
        .kx-roles {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 480px) {
          .kx-roles { grid-template-columns: 1fr; }
        }

        .kx-role-btn {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--surface2);
          border-radius: var(--radius);
          padding: 22px 16px;
          text-align: left;
          cursor: pointer;
          transition: border-color var(--transition), background var(--transition), transform 0.15s ease;
          color: var(--text);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .kx-role-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform var(--transition);
        }
        .kx-role-btn.student::before { background: var(--accent); box-shadow: 0 0 10px var(--accent); }
        .kx-role-btn.faculty::before { background: var(--accent3); box-shadow: 0 0 10px var(--accent3); }
        .kx-role-btn:hover::before { transform: scaleX(1); }
        .kx-role-btn:hover {
          border-color: var(--border2);
          background: var(--surface3);
          transform: translateY(-2px);
        }
        .kx-role-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          border-radius: 4px;
        }
        .kx-role-btn.student:hover { border-color: var(--accent); }
        .kx-role-btn.faculty:hover { border-color: var(--accent3); }

        .kx-role-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 14px;
        }
        .kx-role-btn.student .kx-role-icon { background: rgba(99, 179, 237, 0.14); color: var(--accent); }
        .kx-role-btn.faculty .kx-role-icon { background: rgba(246, 173, 85, 0.14); color: var(--accent3); }

        .kx-role-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 16px;
        }
        .kx-role-desc {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .kx-role-arrow {
          margin-top: 6px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
        }
        .kx-role-btn.student .kx-role-arrow { color: var(--accent); }
        .kx-role-btn.faculty .kx-role-arrow { color: var(--accent3); }

        /* --- Forms & fields --- */
        .kx-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          padding: 0;
          margin-bottom: 20px;
          transition: color var(--transition);
        }
        .kx-back:hover { color: var(--text); }
        .kx-back:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }

        .kx-role-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
          margin: 0 auto 16px;
        }

        .kx-field { margin-bottom: 16px; }
        .kx-field label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 7px;
        }
        .kx-field input, .kx-field select {
          width: 100%;
          border: 1.5px solid var(--border);
          background: var(--surface2);
          border-radius: 10px;
          padding: 12px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          color: var(--text);
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .kx-field input::placeholder { color: var(--text-dim); }
        .kx-field input:focus, .kx-field select:focus {
          border-color: var(--role-accent, var(--accent));
          box-shadow: 0 0 0 3px var(--role-accent-dim, rgba(99,179,237,0.14));
        }
        .kx-field p.helper {
          margin: 6px 0 0;
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Toggle Button Group */
        .kx-toggle-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 18px;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 3px;
        }
        .kx-toggle-btn {
          border: none;
          background: none;
          color: var(--text-muted);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 13.5px;
          padding: 10px;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .kx-toggle-btn.active {
          background: var(--surface3);
          color: var(--text);
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .kx-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 4px 0 22px;
          font-size: 13px;
        }
        .kx-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        .kx-remember input {
          width: 15px;
          height: 15px;
          accent-color: var(--role-accent, var(--accent));
        }
        .kx-forgot {
          color: var(--role-accent, var(--accent));
          text-decoration: none;
          font-weight: 500;
        }
        .kx-forgot:hover { text-decoration: underline; }

        .kx-submit {
          width: 100%;
          border: none;
          border-radius: 11px;
          background: var(--role-accent, var(--accent));
          color: #06121f;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 13px;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.15s ease;
        }
        .kx-submit:hover { filter: brightness(1.1); }
        .kx-submit:active { transform: translateY(1px); }
        .kx-submit:focus-visible,
        .kx-forgot:focus-visible {
          outline: 2px solid var(--role-accent, var(--accent));
          outline-offset: 2px;
        }

        .kx-footer {
          text-align: center;
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 22px;
        }

        .kx-confirm {
          text-align: center;
          font-size: 13px;
          color: var(--success);
          margin-top: -8px;
          margin-bottom: 16px;
        }

        @media (prefers-reduced-motion: reduce) {
          .kx-bob-idle, .kx-letter, .kx-role-btn, .kx-role-btn::before, .kx-submit, .kx-card, .kx-btn {
            animation: none !important;
            transition: none !important;
          }
          .kx-letter { opacity: 1 !important; transform: none !important; }
        }

        @media (max-width: 480px) {
          .kx-card { padding: 32px 22px 26px; }
        }
      ` }} />

      <div className="kx-grid" />
      <div className="kx-orbit o1" />
      <div className="kx-orbit o2" />

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ✕
        </button>
      )}

      {step === "select" && (
        <div className="kx-card">
          <p className="kx-eyebrow">THEKINETIX WORKSPACE</p>

          <Pendulum activeRole={null} />

          <h1 className="kx-headline">Sign In</h1>
          <p className="kx-sub">Select your institutional workspace role to continue.</p>

          <div className="kx-roles">
            <button type="button" className="kx-role-btn student" onClick={() => chooseRole("student")}>
              <span className="kx-role-icon">St</span>
              <span className="kx-role-title">Student</span>
              <span className="kx-role-desc">{ROLES.student.desc}</span>
              <span className="kx-role-arrow">Continue →</span>
            </button>
            <button type="button" className="kx-role-btn faculty" onClick={() => chooseRole("faculty")}>
              <span className="kx-role-icon">Fa</span>
              <span className="kx-role-title">Faculty</span>
              <span className="kx-role-desc">{ROLES.faculty.desc}</span>
              <span className="kx-role-arrow">Continue →</span>
            </button>
          </div>
          <div className="kx-actions" style={{ marginTop: "24px" }}>
            <button type="button" className="kx-btn" onClick={() => {
              setStep("signup");
              setSignUpSuccess(false);
            }}>
              Request Access / Sign Up
            </button>
          </div>
        </div>
      )}

      {/* 2. LOGIN FORM STATE */}
      {step === "form" && active && (
        <div
          className="kx-card is-form"
          style={{
            "--role-accent": active.accent,
            "--role-accent-dim": active.accentDim,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button type="button" className="kx-back" style={{ marginBottom: 0 }} onClick={() => {
              setStep("select");
              setSubmitted(null);
            }}>
              ← Change Role
            </button>
            <button
              type="button"
              onClick={fillDemoCredentials}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: active.accent,
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Click to auto-fill demo credentials"
            >
              ⚡ Demo Credentials
            </button>
          </div>

          <Pendulum activeRole={role} />

          <div
            className="kx-role-chip"
            style={{ background: active.accentDim, color: active.accent }}
          >
            {active.label} login
          </div>

          <h1 className="kx-headline" style={{ fontSize: "24px" }}>Welcome back</h1>
          <p className="kx-sub">Enter your institutional details below.</p>

          <form onSubmit={handleLoginSubmit}>
            <div className="kx-field">
              <label htmlFor="kx-id">{active.idLabel}</label>
              <input
                id="kx-id"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={role === "student" ? "e.g. s.patil@thekinetix.edu" : "e.g. t.patil@thekinetix.edu"}
                autoComplete="username"
                required
              />
              <p className="helper">{active.helper}</p>
            </div>

            <div className="kx-field">
              <label htmlFor="kx-pass">Password</label>
              <input
                id="kx-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="kx-row">
              <label className="kx-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Keep me signed in
              </label>
              <a href="#" className="kx-forgot">Forgot password?</a>
            </div>

            {submitted && (
              <p className="kx-confirm">
                Successfully signed in as {ROLES[submitted.role].label} ({submitted.id}).
              </p>
            )}

            <button type="submit" className="kx-submit">{active.cta}</button>
          </form>
        </div>
      )}

      {/* 3. SIGN UP / REGISTER STATE */}
      {step === "signup" && (
        <div className="kx-card is-form">
          <button type="button" className="kx-back" onClick={() => setStep("select")}>
            ← Back
          </button>
          <p className="kx-eyebrow">THEKINETIX</p>

          <h1 className="kx-headline" style={{ fontSize: "24px" }}>Request Access</h1>
          <p className="kx-sub">Submit your registration details for approval.</p>

          <form onSubmit={handleSignUpSubmit}>
            <div className="kx-toggle-group">
              <button
                type="button"
                className={`kx-toggle-btn ${signUpRole === "student" ? "active" : ""}`}
                onClick={() => setSignUpRole("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={`kx-toggle-btn ${signUpRole === "faculty" ? "active" : ""}`}
                onClick={() => setSignUpRole("faculty")}
              >
                Faculty
              </button>
            </div>

            <div className="kx-field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="kx-field">
              <label htmlFor="reg-email">Institutional Email</label>
              <input
                id="reg-email"
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder={signUpRole === "student" ? "s.doe@thekinetix.edu" : "t.doe@thekinetix.edu"}
                required
              />
            </div>

            {signUpSuccess && (
              <p className="kx-confirm" style={{ color: "var(--success)" }}>
                Request submitted successfully! Check your email.
              </p>
            )}

            <button
              type="submit"
              className="kx-submit"
              style={{
                background: signUpRole === "student" ? "var(--accent)" : "var(--accent3)"
              }}
            >
              Submit Request
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
