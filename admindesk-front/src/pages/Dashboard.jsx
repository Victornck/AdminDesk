import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, Bell, Sun, Moon, Search, Plus, Wallet
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
      <div className="bg-white dark:bg-[#1a1025] border border-gray-200 dark:border-purple-500/20 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-purple-600 dark:text-purple-300 mb-1 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{fmt(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
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
        // Busca dados do dashboard (totais + gráfico)
        const dashRes = await fetch(`${API_URL}/dashboard`, { headers });
        if (dashRes.status === 401) { handleLogout(); return; }
        const dash = await dashRes.json();
        setDashboardData({
          totalReceitas: dash.totalReceitas || 0,
          totalDespesas: dash.totalDespesas || 0,
          lucro: dash.lucro || 0,
        });
        setAreaData(dash.grafico || []);
      } catch (e) {
        console.error("Erro ao buscar dashboard:", e);
      }

      try {
        // Busca clientes recentes
        const clientRes = await fetch(`${API_URL}/clients`, { headers });
        const clients = await clientRes.json();
        setRecentClients(clients.slice(0, 5));
      } catch (e) {
        console.error("Erro ao buscar clientes:", e);
      }

      setLoading(false);
    };

    fetchAll();
  }, []);

  const lucroPositivo = dashboardData.lucro >= 0;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0816] text-gray-900 dark:text-white font-sans flex transition-colors duration-300">

        <Sidebar onLogout={handleLogout} />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

        <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">

          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0d0816]/80 backdrop-blur-md border-b border-gray-200 dark:border-purple-900/20 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-4">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <div>
                <h1 className="text-base md:text-lg font-semibold">Dashboard</h1>
                <p className="text-xs text-gray-400 hidden md:block">Visão geral do seu negócio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2">
                <Search size={15} className="text-gray-400" />
                <input placeholder="Pesquisar..." className="bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none w-40 placeholder:text-gray-400" />
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400 hover:text-gray-700 dark:hover:text-white transition">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="relative p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400 hover:text-gray-700 dark:hover:text-white transition">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-purple-900/40">
                JS
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 flex flex-col gap-6">

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-emerald-400/40 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Total em Receitas</p>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp size={16} className="text-emerald-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{fmt(dashboardData.totalReceitas)}</p>
                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                      <ArrowUpRight size={13} /> Entradas registradas
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-red-400/40 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Total em Despesas</p>
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <TrendingDown size={16} className="text-red-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{fmt(dashboardData.totalDespesas)}</p>
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <ArrowDownRight size={13} /> Saídas registradas
                    </span>
                  </div>

                  <div className={`rounded-2xl p-5 flex flex-col gap-3 border transition-all ${
                    lucroPositivo
                      ? "bg-purple-600/10 border-purple-500/30 hover:border-purple-400/50"
                      : "bg-red-500/10 border-red-500/30"
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Lucro Líquido</p>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${lucroPositivo ? "bg-purple-500/20" : "bg-red-500/20"}`}>
                        <Wallet size={16} className={lucroPositivo ? "text-purple-400" : "text-red-400"} />
                      </div>
                    </div>
                    <p className={`text-2xl font-bold ${lucroPositivo ? "text-purple-600 dark:text-purple-300" : "text-red-400"}`}>
                      {fmt(dashboardData.lucro)}
                    </p>
                    <span className={`text-xs flex items-center gap-1 ${lucroPositivo ? "text-purple-400" : "text-red-400"}`}>
                      {lucroPositivo
                        ? <><ArrowUpRight size={13} /> Receitas - Despesas</>
                        : <><ArrowDownRight size={13} /> Prejuízo no período</>
                      }
                    </span>
                  </div>
                </div>

                {/* Gráfico */}
                <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-semibold">Receitas vs Despesas</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Evolução nos últimos meses</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {areaData.length === 0 ? (
                    <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
                      Nenhum dado financeiro registrado ainda
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={areaData}>
                        <defs>
                          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="receita" name="Receita" stroke="#7c3aed" strokeWidth={2.5} fill="url(#colorReceita)" />
                        <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#f87171" strokeWidth={2.5} fill="url(#colorDespesa)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  <div className="flex items-center gap-5 mt-4 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                      <span className="text-xs text-gray-400">Receitas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-xs text-gray-400">Despesas</span>
                    </div>
                  </div>
                </div>

                {/* Clientes Recentes */}
                <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold">Clientes Recentes</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{recentClients.length} clientes cadastrados</p>
                    </div>
                    <button
                      onClick={() => navigate("/clientes")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-medium hover:bg-purple-600/30 transition"
                    >
                      <Plus size={13} /> Ver todos
                    </button>
                  </div>

                  {recentClients.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Nenhum cliente cadastrado ainda</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-purple-900/20">
                            {["Cliente", "Email", "Telefone", ""].map((h) => (
                              <th key={h} className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recentClients.map((c, i) => (
                            <tr key={i} className="border-b border-gray-50 dark:border-purple-900/10 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-700/30 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-300">
                                    {c.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium">{c.name}</span>
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-xs text-gray-400 hidden md:table-cell">{c.email}</td>
                              <td className="py-3 pr-4 text-xs text-gray-400 hidden md:table-cell">{c.phone}</td>
                              <td className="py-3">
                                <button className="text-gray-300 hover:text-gray-600 dark:hover:text-gray-300 transition">
                                  <MoreHorizontal size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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