import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud, FileText, X } from "lucide-react";

/* ---------- Button ---------- */
export function Button({ variant = "primary", icon: Icon, loading = false, disabled, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : Icon ? <Icon size={16} strokeWidth={1.75} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/* ---------- Status badge (text is always shown, color is secondary) ---------- */
const STATUSES = ["Applied", "In Review", "Interview", "Offer", "Rejected"];
export function Badge({ status }) {
  const known = STATUSES.includes(status);
  const slug = known ? status.toLowerCase().replace(/\s+/g, "-") : "applied";
  return <span className={`badge badge-${slug}`}>{known ? status : "Applied"}</span>;
}

/* ---------- Empty state ---------- */
export function EmptyState({ illustration: Illustration, title, description, action, text }) {
  return (
    <div className="empty">
      {Illustration ? <Illustration /> : null}
      {title ? <h3>{title}</h3> : null}
      {description || text ? <p>{description || text}</p> : null}
      {action}
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ icon: Icon, label, value, loading = false }) {
  return (
    <div className="card stat">
      {Icon ? <span className="stat-chip"><Icon size={18} strokeWidth={1.75} aria-hidden="true" /></span> : null}
      <div>
        {loading ? <div className="skeleton" style={{ width: 48, height: 28 }} /> : <div className="stat-value">{value}</div>}
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function Dialog({ open, title, description, onClose, children }) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll("button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }

    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="dialog-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex="-1" ref={dialogRef}>
        <h2 id="dialog-title">{title}</h2>
        {description ? <p className="muted dialog-description">{description}</p> : null}
        {children}
      </section>
    </div>
  );
}

export function Drawer({ open, title, onClose, children }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="drawer-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className="drawer-header">
          <h2 id="drawer-title">{title}</h2>
          <button ref={closeRef} type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close panel">×</button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}

/* ---------- PDF dropzone ----------
   Client checks are UX only. The server MUST re-validate type, size and content (FR-05). */
function formatSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Dropzone({ file, onFile, maxMB = 5, disabled = false }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const accept = (f) => {
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return setError("Only PDF files are supported.");
    if (f.size === 0) return setError("This file is empty.");
    if (f.size > maxMB * 1024 * 1024) return setError(`File is larger than ${maxMB} MB.`);
    setError("");
    onFile(f);
  };

  const clear = () => {
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onFile(null);
  };

  if (file) {
    return (
      <div className="file-row">
        <span className="stat-chip"><FileText size={18} strokeWidth={1.75} aria-hidden="true" /></span>
        <div className="file-details">
          <div className="file-name">{file.name}</div>
          <div className="meta">{formatSize(file.size)}</div>
        </div>
        <button type="button" className="btn btn-ghost btn-icon" onClick={clear} disabled={disabled} aria-label={`Remove ${file.name}`}>
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        className="dropzone"
        data-dragging={dragging}
        data-invalid={!!error}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!disabled) accept(e.dataTransfer.files?.[0]); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => accept(e.target.files?.[0])}
        />
        <span className="dropzone-icon"><UploadCloud size={20} strokeWidth={1.75} aria-hidden="true" /></span>
        <span className="dropzone-title">Drop your resume here, or browse</span>
        <span className="meta">PDF only, up to {maxMB} MB. Scanned PDFs are not supported yet.</span>
      </label>
      {error ? <p className="error-text" role="alert" style={{ marginTop: 8 }}>{error}</p> : null}
    </div>
  );
}
