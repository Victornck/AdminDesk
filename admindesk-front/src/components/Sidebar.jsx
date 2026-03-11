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

// ── Nav Item Desktop ──────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, path, active, onClick }) => (
  <button
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
      background: active ? "rgba(163,230,53,0.10)" : "transparent",
      color: active ? "#a3e635" : "rgba(255,255,255,0.38)",
      border: active ? "1px solid rgba(163,230,53,0.18)" : "1px solid transparent",
      letterSpacing: "-0.01em",
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.color = "rgba(255,255,255,0.75)";
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,0.38)";
      }
    }}
  >
    <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
    {label}
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
        background: "#080d14",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        padding: "24px 16px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 4 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg,#a3e635,#65a30d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <BarChart2 size={16} style={{ color: "#000" }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
          AdminDesk
        </span>
      </div>

      {/* Label seção */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", paddingLeft: 12, marginBottom: 8 }}>
        Menu
      </p>

      {/* Nav */}
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

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 10,
          fontSize: 13, fontWeight: 500, width: "100%", cursor: "pointer",
          transition: "all 0.15s",
          background: "transparent",
          color: "rgba(255,255,255,0.28)",
          border: "1px solid transparent",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          e.currentTarget.style.color = "#f87171";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.28)";
          e.currentTarget.style.borderColor = "transparent";
        }}
      >
        <LogOut size={15} strokeWidth={1.8} />
        Sair
      </button>
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
          background: rgba(8,13,20,0.96);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.06);
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
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "6px 12px", borderRadius: 10, cursor: "pointer",
                transition: "all 0.15s",
                background: active ? "rgba(163,230,53,0.08)" : "transparent",
                border: active ? "1px solid rgba(163,230,53,0.15)" : "1px solid transparent",
                color: active ? "#a3e635" : "rgba(255,255,255,0.32)",
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
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      />
      <aside
        className="absolute left-0 top-0 h-full flex flex-col"
        style={{
          width: 240,
          background: "#080d14",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 16px",
        }}
      >
        {/* Header drawer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg,#a3e635,#65a30d)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BarChart2 size={16} style={{ color: "#000" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              AdminDesk
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", paddingLeft: 12, marginBottom: 8 }}>
          Menu
        </p>

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

        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />

        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10,
            fontSize: 13, fontWeight: 500, width: "100%", cursor: "pointer",
            transition: "all 0.15s",
            background: "transparent",
            color: "rgba(255,255,255,0.28)",
            border: "1px solid transparent",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.28)";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <LogOut size={15} strokeWidth={1.8} />
          Sair
        </button>
      </aside>
    </div>
  );
}

// ── Menu Button ───────────────────────────────────────────────────────────────
export function MenuButton({ onClick }) {
  return (
    <button
      className="md:hidden"
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.5)",
        cursor: "pointer",
      }}
    >
      <Menu size={16} />
    </button>
  );
}