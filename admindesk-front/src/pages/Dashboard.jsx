import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, Bell, Sun, Moon, Search, Plus, Wallet,
  ChevronRight, SlidersHorizontal
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const API_URL = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

const fmt = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-zinc-400 mb-2 text-[11px] font-medium uppercase tracking-wider">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="flex items-center justify-between gap-6">
            <span className="text-zinc-400">{p.name}</span>
            <span className="font-semibold" style={{ color: p.color }}>{fmt(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({ totalReceitas: 0, totalDespesas: 0, lucro: 0 });
  const [areaData, setAreaData] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${getToken()}` };
      try {
        const dashRes = await fetch(`${API_URL}/dashboard`, { headers });
        if (dashRes.status === 401) { handleLogout(); return; }
        const dash = await dashRes.json();
        setDashboardData({
          totalReceitas: dash.totalReceitas || 0,
          totalDespesas: dash.totalDespesas || 0,
          lucro: dash.lucro || 0,
        });
        setAreaData(dash.grafico || []);
      } catch (e) { console.error(e); }
      try {
        const clientRes = await fetch(`${API_URL}/clients`, { headers });
        const clients = await clientRes.json();
        setRecentClients(clients.slice(0, 5));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const lucroPositivo = dashboardData.lucro >= 0;
  const gridStroke = darkMode ? "#27272a" : "#f4f4f5";
  const tickColor = darkMode ? "#71717a" : "#a1a1aa";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex transition-colors duration-300">

        <Sidebar onLogout={handleLogout} />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

        <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">

          {/* Header */}
          <header className="sticky top-0 z-10 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <span className="text-sm font-semibold tracking-tight">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
                <Search size={13} className="text-zinc-400 shrink-0" />
                <input
                  placeholder="Buscar..."
                  className="bg-transparent text-sm text-zinc-600 dark:text-zinc-400 outline-none w-36 placeholder:text-zinc-400"
                />
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button className="relative p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <Bell size={14} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </button>
              <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-[11px] font-bold text-white dark:text-zinc-900 tracking-tight">
                JS
              </div>
            </div>
          </header>

          <div className="p-5 md:p-8 flex flex-col gap-5">

            {/* Page header */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-0.5">Visão geral</p>
                <h1 className="text-xl font-bold tracking-tight">
                  {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(/^\w/, c => c.toUpperCase())}
                </h1>
              </div>
              <button className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                <SlidersHorizontal size={12} />
                Filtrar período
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  {/* Receitas */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Receitas</span>
                      </div>
                      <TrendingUp size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-[26px] font-bold tracking-tight leading-none text-zinc-900 dark:text-zinc-50">
                      {fmt(dashboardData.totalReceitas)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <ArrowUpRight size={11} className="text-emerald-500" /> Entradas registradas
                      </span>
                      <div className="h-1 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "72%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Despesas */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Despesas</span>
                      </div>
                      <TrendingDown size={14} className="text-rose-500" />
                    </div>
                    <p className="text-[26px] font-bold tracking-tight leading-none text-zinc-900 dark:text-zinc-50">
                      {fmt(dashboardData.totalDespesas)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <ArrowDownRight size={11} className="text-rose-500" /> Saídas registradas
                      </span>
                      <div className="h-1 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: "38%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Lucro — card invertido (dark quando light, light quando dark) */}
                  <div className={`rounded-2xl p-5 flex flex-col gap-3 border transition-colors ${
                    lucroPositivo
                      ? "bg-zinc-900 dark:bg-white border-zinc-800 dark:border-zinc-200"
                      : "bg-rose-600 border-rose-500"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${lucroPositivo ? "bg-emerald-400" : "bg-rose-300"}`} />
                        <span className={`text-[11px] font-semibold uppercase tracking-widest ${lucroPositivo ? "text-zinc-500 dark:text-zinc-400" : "text-rose-200"}`}>
                          Lucro Líquido
                        </span>
                      </div>
                      <Wallet size={14} className={lucroPositivo ? "text-zinc-500 dark:text-zinc-400" : "text-rose-200"} />
                    </div>
                    <p className={`text-[26px] font-bold tracking-tight leading-none ${
                      lucroPositivo ? "text-white dark:text-zinc-900" : "text-white"
                    }`}>
                      {fmt(dashboardData.lucro)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs flex items-center gap-1 ${lucroPositivo ? "text-zinc-500 dark:text-zinc-400" : "text-rose-200"}`}>
                        {lucroPositivo
                          ? <><ArrowUpRight size={11} className="text-emerald-400" /> Resultado positivo</>
                          : <><ArrowDownRight size={11} /> Prejuízo no período</>
                        }
                      </span>
                      <div className={`h-1 w-20 rounded-full overflow-hidden ${lucroPositivo ? "bg-zinc-800 dark:bg-zinc-200" : "bg-rose-500"}`}>
                        <div className={`h-full rounded-full ${lucroPositivo ? "bg-emerald-400" : "bg-rose-300"}`} style={{ width: "61%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Receitas vs Despesas</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Evolução mensal</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span className="text-[11px] text-zinc-400">Receitas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                        <span className="text-[11px] text-zinc-400">Despesas</span>
                      </div>
                      <button className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 transition-colors ml-1">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </div>

                  {areaData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[200px] gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <TrendingUp size={17} className="text-zinc-400" />
                      </div>
                      <p className="text-xs text-zinc-400">Nenhum dado financeiro registrado</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={areaData} margin={{ top: 2, right: 0, left: -22, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.13} />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" strokeWidth={2} fill="url(#gradReceita)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#f43f5e" strokeWidth={2} fill="url(#gradDespesa)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Recent Clients */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Clientes Recentes</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{recentClients.length} cadastrados</p>
                    </div>
                    <button
                      onClick={() => navigate("/clientes")}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Ver todos <ChevronRight size={12} />
                    </button>
                  </div>

                  {recentClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <p className="text-xs text-zinc-400">Nenhum cliente cadastrado ainda</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/80">
                      {recentClients.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{c.name}</p>
                            <p className="text-[11px] text-zinc-400 truncate hidden md:block">{c.email}</p>
                          </div>
                          <span className="hidden md:block text-[11px] text-zinc-400">{c.phone}</span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 dark:text-zinc-600 hover:text-zinc-500">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}