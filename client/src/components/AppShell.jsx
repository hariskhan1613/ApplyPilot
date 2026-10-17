import { useEffect, useRef, useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileSearch, MessagesSquare, Settings, LogOut, Menu, ChevronsUpDown } from "lucide-react";
import { Logo, LogoMark } from "./Logo";
import { ThemeToggle } from "./theme";

const GROUPS = [
  { label: "Workspace", items: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/applications", label: "Applications", icon: Briefcase },
  ]},
  { label: "Tools", items: [
    { to: "/tools/resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
    { to: "/tools/interview-prep", label: "Interview Prep", icon: MessagesSquare },
  ]},
];

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="user-wrap" ref={ref}>
      {open && (
        <div className="menu" role="menu">
          <Link to="/settings" role="menuitem" className="menu-item" onClick={() => setOpen(false)}>
            <Settings size={16} strokeWidth={1.75} /> Settings
          </Link>
          <button type="button" role="menuitem" className="menu-item menu-danger" onClick={onLogout}>
            <LogOut size={16} strokeWidth={1.75} /> Log out
          </button>
        </div>
      )}
      <button type="button" className="user-card" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="avatar" aria-hidden="true">{initials(user?.name)}</span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="user-name">{user?.name}</span>
          <span className="user-email">{user?.email}</span>
        </span>
        <ChevronsUpDown size={16} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--text-3)" }} />
      </button>
    </div>
  );
}

// Route element. Usage:
// <Route element={<ProtectedRoute><AppShell user={user} onLogout={logout} /></ProtectedRoute>}> ...children... </Route>
export function AppShell({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="app">
      {open && <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside className="sidebar" data-open={open} aria-label="Primary">
        <Logo />
        <nav>
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className="nav-group">{g.label}</div>
              {g.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className="nav-item">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" /> {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="nav-spacer" />
        <NavLink to="/settings" className="nav-item">
          <Settings size={18} strokeWidth={1.75} aria-hidden="true" /> Settings
        </NavLink>
        <UserMenu user={user} onLogout={onLogout} />
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="only-mobile mobile-nav-controls">
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}>
              <Menu size={20} strokeWidth={1.75} />
            </button>
            <LogoMark size={24} />
          </div>
          <ThemeToggle />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
