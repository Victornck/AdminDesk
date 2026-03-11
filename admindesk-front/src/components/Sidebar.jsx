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

const NavButton = ({ icon: Icon, label, path, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
      active
        ? "bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30"
        : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
    }`}
  >
    <Icon size={17} />
    {label}
  </button>
);

// ── Sidebar Desktop ──────────────────────────────────────────────────────────
export function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#130d1f] border-r border-gray-200 dark:border-purple-900/30 p-6 fixed h-full z-20 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-900/40">
          <BarChart2 size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">AdminDesk</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavButton
            key={item.path}
            {...item}
            active={pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all mt-4 w-full"
      >
        <LogOut size={17} />
        Sair
      </button>
    </aside>
  );
}

// ── Bottom Nav Mobile ────────────────────────────────────────────────────────
export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-[#130d1f]/95 backdrop-blur-md border-t border-gray-200 dark:border-purple-900/30 px-2 py-3 flex items-center justify-around transition-colors duration-300">
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
              active
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Mobile Drawer ────────────────────────────────────────────────────────────
export function MobileDrawer({ open, onClose, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-[#130d1f] border-r border-gray-200 dark:border-purple-900/30 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center">
              <BarChart2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">AdminDesk</span>
          </div>
          <button onClick={onClose} className="text-gray-400"><X size={20} /></button>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              {...item}
              active={pathname === item.path}
              onClick={() => { navigate(item.path); onClose(); }}
            />
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={17} />
          Sair
        </button>
      </aside>
    </div>
  );
}

// ── Menu Button ──────────────────────────────────────────────────────────────
export function MenuButton({ onClick }) {
  return (
    <button className="md:hidden text-gray-400" onClick={onClick}>
      <Menu size={22} />
    </button>
  );
}