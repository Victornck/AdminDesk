import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Wallet, BarChart2,
  Settings, LogOut, X, Menu
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     path: "/dashboard" },
  { icon: Users,           label: "Clientes",      path: "/clientes" },
  { icon: Wallet,          label: "Despesas",       path: "/despesas" },
  { icon: BarChart2,       label: "Relatórios",    path: "/relatorios" },
  { icon: Settings,        label: "Configurações", path: "/configuracoes" },
];

// Paleta azul escuro
const C = {
  bg:          "#0d1829",          // azul-marinho profundo
  bgHover:     "rgba(59,130,246,0.07)",
  border:      "rgba(59,130,246,0.10)",
  borderItem:  "rgba(59,130,246,0.22)",
  accent:      "#3b82f6",          // blue-500
  accentBg:    "rgba(59,130,246,0.12)",
  accentText:  "#93c5fd",          // blue-300 — mais suave que branco puro
  textMuted:   "rgba(148,163,184,0.5)",  // slate-400 em 50%
  textHover:   "#94a3b8",          // slate-400
  divider:     "rgba(59,130,246,0.08)",
  logoutHover: "rgba(239,68,68,0.09)",
  logoutText:  "#f87171",
};

// ── Nav Item Desktop ──────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, path, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      width: "100%",
      cursor: "pointer",
      transition: "all 0.15s",
      background: active ? C.accentBg : "transparent",
      color: active ? C.accentText : C.textMuted,
      border: active ? `1px solid ${C.borderItem}` : "1px solid transparent",
      letterSpacing: "-0.01em",
      textAlign: "left",
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = C.bgHover;
        e.currentTarget.style.color = C.textHover;
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = C.textMuted;
      }
    }}
  >
    <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
    {label}
    {active && (
      <span style={{
        marginLeft: "auto",
        width: 5, height: 5,
        borderRadius: "50%",
        background: C.accent,
        boxShadow: `0 0 6px ${C.accent}`,
        flexShrink: 0,
      }} />
    )}
  </button>
);

// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 4 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 0 16px rgba(59,130,246,0.35)",
    }}>
      <BarChart2 size={16} style={{ color: "#fff" }} />
    </div>
    <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
      AdminDesk
    </span>
  </div>
);

// ── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = () => (
  <p style={{
    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "rgba(59,130,246,0.4)",
    paddingLeft: 12, marginBottom: 8,
  }}>
    Menu
  </p>
);

// ── Logout Button ─────────────────────────────────────────────────────────────
const LogoutBtn = ({ onLogout }) => (
  <button
    type="button"
    onClick={onLogout}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 10,
      fontSize: 13, fontWeight: 500, width: "100%", cursor: "pointer",
      transition: "all 0.15s",
      background: "transparent",
      color: C.textMuted,
      border: "1px solid transparent",
      textAlign: "left",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = C.logoutHover;
      e.currentTarget.style.color = C.logoutText;
      e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = C.textMuted;
      e.currentTarget.style.borderColor = "transparent";
    }}
  >
    <LogOut size={15} strokeWidth={1.8} />
    Sair
  </button>
);

// ── Sidebar Desktop ───────────────────────────────────────────────────────────
export function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside
      className="hidden md:flex flex-col fixed h-full z-20"
      style={{
        width: 240,
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
        padding: "24px 16px",
      }}
    >
      <Logo />
      <SectionLabel />

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      <div style={{ height: 1, background: C.divider, margin: "16px 0" }} />
      <LogoutBtn onLogout={onLogout} />
    </aside>
  );
}

// ── Bottom Nav Mobile ─────────────────────────────────────────────────────────
export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <style>{`
        .admindesk-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 20;
          background: rgba(13,24,41,0.97);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(59,130,246,0.10);
          padding: 8px 8px 12px;
          align-items: center;
          justify-content: space-around;
        }
        @media (min-width: 768px) {
          .admindesk-bottom-nav { display: none !important; }
        }
      `}</style>
      <nav className="admindesk-bottom-nav">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "6px 12px", borderRadius: 10, cursor: "pointer",
                transition: "all 0.15s",
                background: active ? C.accentBg : "transparent",
                border: active ? `1px solid ${C.borderItem}` : "1px solid transparent",
                color: active ? C.accentText : C.textMuted,
              }}
            >
              <Icon size={19} strokeWidth={active ? 2.2 : 1.7} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: "0.01em" }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

// ── Mobile Drawer ─────────────────────────────────────────────────────────────
export function MobileDrawer({ open, onClose, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />
      <aside
        className="absolute left-0 top-0 h-full flex flex-col"
        style={{
          width: 240,
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          padding: "24px 16px",
        }}
      >
        {/* Header drawer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <Logo />
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(59,130,246,0.06)",
              border: `1px solid ${C.border}`,
              color: C.textMuted,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        <SectionLabel />

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={pathname === item.path}
              onClick={() => { navigate(item.path); onClose(); }}
            />
          ))}
        </nav>

        <div style={{ height: 1, background: C.divider, margin: "16px 0" }} />
        <LogoutBtn onLogout={onLogout} />
      </aside>
    </div>
  );
}

// ── Menu Button ───────────────────────────────────────────────────────────────
export function MenuButton({ onClick }) {
  return (
    <button
      type="button"
      className="md:hidden"
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(59,130,246,0.06)",
        border: `1px solid rgba(59,130,246,0.12)`,
        color: "#94a3b8",
        cursor: "pointer",
      }}
    >
      <Menu size={16} />
    </button>
  );
}