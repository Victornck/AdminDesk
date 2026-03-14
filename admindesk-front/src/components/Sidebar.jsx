import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Wallet, BarChart2,
  Settings, LogOut, X, Menu, ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     path: "/dashboard" },
  { icon: Users,           label: "Clientes",      path: "/clientes" },
  { icon: Wallet,          label: "Despesas",       path: "/despesas" },
  { icon: BarChart2,       label: "Relatórios",    path: "/relatorios" },
  { icon: Settings,        label: "Configurações", path: "/configuracoes" },
];

const C = {
  bg:           "#080f1a",
  bgGlass:      "rgba(8,15,26,0.96)",
  border:       "rgba(59,130,246,0.10)",
  borderItem:   "rgba(59,130,246,0.20)",
  accent:       "#3b82f6",
  accentGlow:   "rgba(59,130,246,0.25)",
  accentBg:     "rgba(59,130,246,0.10)",
  accentText:   "#93c5fd",
  textMuted:    "rgba(148,163,184,0.45)",
  textHover:    "#94a3b8",
  divider:      "rgba(59,130,246,0.07)",
  logoutHover:  "rgba(239,68,68,0.08)",
  logoutText:   "#f87171",
};

// ── Logo premium ──────────────────────────────────────────────────────────────
const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 11, paddingLeft: 4 }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 0 20px rgba(59,130,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Reflexo interno */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
        borderRadius: "10px 10px 0 0",
      }} />
      <BarChart2 size={17} style={{ color: "#fff", position: "relative", zIndex: 1 }} />
    </div>
    <div>
      <span style={{
        fontSize: 15, fontWeight: 800, color: "#e2e8f0",
        letterSpacing: "-0.03em", display: "block", lineHeight: 1.1,
      }}>
        AdminDesk
      </span>
      <span style={{
        fontSize: 9.5, fontWeight: 600, color: "rgba(59,130,246,0.55)",
        letterSpacing: "0.14em", textTransform: "uppercase",
      }}>
        Dashboard
      </span>
    </div>
  </div>
);

// ── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = () => (
  <p style={{
    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em",
    textTransform: "uppercase", color: "rgba(59,130,246,0.35)",
    paddingLeft: 12, marginBottom: 6, marginTop: 28,
  }}>
    Navegação
  </p>
);

// ── Nav Item ──────────────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, path, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 10,
      fontSize: 13, fontWeight: active ? 600 : 500,
      width: "100%", cursor: "pointer", transition: "all 0.15s",
      background: active ? C.accentBg : "transparent",
      color: active ? C.accentText : C.textMuted,
      border: active ? `1px solid ${C.borderItem}` : "1px solid transparent",
      letterSpacing: "-0.01em", textAlign: "left",
      boxShadow: active ? `inset 0 1px 0 rgba(255,255,255,0.04)` : "none",
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = C.accentBg;
        e.currentTarget.style.color = C.textHover;
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.10)";
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = C.textMuted;
        e.currentTarget.style.borderColor = "transparent";
      }
    }}
  >
    <div style={{
      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: active ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
      border: active ? "1px solid rgba(59,130,246,0.20)" : "1px solid rgba(255,255,255,0.04)",
      transition: "all 0.15s",
    }}>
      <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
    </div>
    {label}
    {active && (
      <ChevronRight size={12} style={{ marginLeft: "auto", color: C.accent, opacity: 0.6, flexShrink: 0 }} />
    )}
  </button>
);

// ── Logout Button ─────────────────────────────────────────────────────────────
const LogoutBtn = ({ onLogout }) => {
  // Fallback: se onLogout não for passado, limpa token e redireciona
  const navigate = useNavigate();
  function handleLogout() {
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 10,
        fontSize: 13, fontWeight: 500, width: "100%", cursor: "pointer",
        transition: "all 0.15s",
        background: "transparent", color: C.textMuted,
        border: "1px solid transparent", textAlign: "left",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = C.logoutHover;
        e.currentTarget.style.color = C.logoutText;
        e.currentTarget.style.borderColor = "rgba(239,68,68,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = C.textMuted;
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.08)",
      }}>
        <LogOut size={14} strokeWidth={1.8} />
      </div>
      Sair da conta
    </button>
  );
};

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
        padding: "24px 16px 20px",
      }}
    >
      {/* Glow de fundo sutil */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 200,
        background: "radial-gradient(ellipse at 50% -20%, rgba(59,130,246,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <Logo />
      <SectionLabel />

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, position: "relative" }}>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* Divisor com gradiente */}
      <div style={{
        height: 1, margin: "16px 0",
        background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
      }} />

      <LogoutBtn onLogout={onLogout} />

      {/* Versão */}
      <p style={{
        fontSize: 10, color: "rgba(148,163,184,0.2)",
        textAlign: "center", marginTop: 12, letterSpacing: "0.05em",
      }}>
        AdminDesk v1.0
      </p>
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
        .adsk-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 20;
          background: rgba(6,12,24,0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(59,130,246,0.10);
          padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
          align-items: flex-end;
          justify-content: space-around;
        }
        @media (min-width: 768px) {
          .adsk-bottom-nav { display: none !important; }
        }
        .adsk-bn-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 6px 8px 4px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: none;
          background: transparent;
          flex: 1;
          min-width: 0;
          position: relative;
        }
        .adsk-bn-btn:active { transform: scale(0.88); }

        /* Indicador superior no item ativo */
        .adsk-bn-btn.active::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 24px; height: 2.5px;
          border-radius: 0 0 4px 4px;
          background: linear-gradient(90deg, #60a5fa, #3b82f6);
          box-shadow: 0 0 8px rgba(59,130,246,0.7);
        }

        .adsk-bn-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .adsk-bn-btn.active .adsk-bn-icon {
          background: linear-gradient(135deg, rgba(59,130,246,0.22), rgba(29,78,216,0.15));
          border: 1px solid rgba(59,130,246,0.28);
          box-shadow: 0 4px 12px rgba(59,130,246,0.20), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .adsk-bn-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 64px;
          transition: all 0.15s;
        }
        .adsk-bn-btn.active .adsk-bn-label {
          font-weight: 700;
          font-size: 9.5px;
        }
      `}</style>

      <nav className="adsk-bottom-nav">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path)}
              className={`adsk-bn-btn${active ? " active" : ""}`}
            >
              <div className="adsk-bn-icon">
                <Icon
                  size={17}
                  strokeWidth={active ? 2.3 : 1.6}
                  style={{ color: active ? "#93c5fd" : "rgba(148,163,184,0.38)" }}
                />
              </div>
              <span className="adsk-bn-label" style={{ color: active ? "#93c5fd" : "rgba(148,163,184,0.38)" }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

// ── Mobile Drawer — com animação slide + fade ─────────────────────────────────
export function MobileDrawer({ open, onClose, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes adsk-overlay-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes adsk-overlay-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes adsk-drawer-in   { from { transform: translateX(-100%) } to { transform: translateX(0) } }
        @keyframes adsk-drawer-out  { from { transform: translateX(0) } to { transform: translateX(-100%) } }
        .adsk-overlay {
          position: fixed; inset: 0; z-index: 49;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(3px);
        }
        .adsk-overlay.in  { animation: adsk-overlay-in  0.25s ease forwards; }
        .adsk-overlay.out { animation: adsk-overlay-out 0.28s ease forwards; }
        .adsk-drawer {
          position: fixed; left: 0; top: 0; bottom: 0; z-index: 50;
          width: 264px;
          display: flex; flex-direction: column;
          padding: 24px 16px 20px;
        }
        .adsk-drawer.in  { animation: adsk-drawer-in  0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
        .adsk-drawer.out { animation: adsk-drawer-out 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
      `}</style>

      {/* Overlay */}
      <div
        className={`adsk-overlay ${animating ? "in" : "out"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`adsk-drawer ${animating ? "in" : "out"}`}
        style={{
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          boxShadow: "4px 0 40px rgba(0,0,0,0.5), 1px 0 0 rgba(59,130,246,0.08)",
        }}
      >
        {/* Glow topo */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 180,
          background: "radial-gradient(ellipse at 40% -10%, rgba(59,130,246,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 4,
          position: "relative",
        }}>
          <Logo />
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 9,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(59,130,246,0.06)",
              border: `1px solid ${C.border}`,
              color: C.textMuted, cursor: "pointer",
              transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(59,130,246,0.12)";
              e.currentTarget.style.color = "#94a3b8";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(59,130,246,0.06)";
              e.currentTarget.style.color = C.textMuted;
            }}
          >
            <X size={14} />
          </button>
        </div>

        <SectionLabel />

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, position: "relative" }}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={pathname === item.path}
              onClick={() => { navigate(item.path); onClose(); }}
            />
          ))}
        </nav>

        {/* Divisor */}
        <div style={{
          height: 1, margin: "16px 0",
          background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
        }} />

        <LogoutBtn onLogout={onLogout} />

        <p style={{
          fontSize: 10, color: "rgba(148,163,184,0.18)",
          textAlign: "center", marginTop: 12, letterSpacing: "0.05em",
        }}>
          AdminDesk v1.0
        </p>
      </aside>
    </>
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
        width: 34, height: 34, borderRadius: 9,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(59,130,246,0.06)",
        border: "1px solid rgba(59,130,246,0.12)",
        color: "#94a3b8", cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.12)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.06)"}
    >
      <Menu size={16} />
    </button>
  );
}