import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer } from "../components/Sidebar";
import { PageHeader } from "../components/PageHeader";
import { useTheme } from "../hooks/useTheme";
import {
  TrendingUp, TrendingDown, ArrowUpRight,
  MoreHorizontal, Search, Wallet,
  ChevronRight, SlidersHorizontal, Users,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const MESES   = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function getToken() { return localStorage.getItem("token") ?? ""; }
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--bd-card)",
      borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    }}>
      <p style={{ color: "var(--tx-muted)", fontSize: 11, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ display: "flex", justifyContent: "space-between", gap: 24, fontSize: 13 }}>
          <span style={{ color: "var(--tx-muted)" }}>{p.name}</span>
          <span style={{ color: p.color, fontWeight: 600 }}>{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function AccentAreaChart({ data }) {
  const [accentHex, setAccentHex] = useState("#3b82f6");
  const [gridColor, setGridColor] = useState("#e2e8f0");

  useEffect(() => {
    function readVars() {
      const style  = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue("--accent").trim();
      const grid   = style.getPropertyValue("--bd-div").trim();
      if (accent) setAccentHex(accent);
      if (grid)   setGridColor(grid);
    }
    readVars();
    const obs = new MutationObserver(readVars);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentHex} stopOpacity={0.2} />
            <stop offset="100%" stopColor={accentHex} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.13} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="time" tick={{ fill: "var(--tx-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--tx-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="receita" name="Receita"
          stroke={accentHex} strokeWidth={2} fill="url(#gradReceita)"
          dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: accentHex }} />
        <Area type="monotone" dataKey="despesa" name="Despesa"
          stroke="#f43f5e" strokeWidth={2} fill="url(#gradDespesa)"
          dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#f43f5e" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [spentsReceitas,  setSpentsReceitas]  = useState(0);
  const [totalDespesas,   setTotalDespesas]   = useState(0);
  const [receitaClientes, setReceitaClientes] = useState(0);
  const [areaData,        setAreaData]        = useState([]);
  const [recentClients,   setRecentClients]   = useState([]);
  const [loading,         setLoading]         = useState(true);

  function handleLogout() { localStorage.removeItem("token"); navigate("/login"); }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${getToken()}` };
      let grafico = [], mrr = 0;

      try {
        const res = await fetch(`${API_URL}/dashboard`, { headers });
        if (res.status === 401) { handleLogout(); return; }
        const dash = await res.json();
        if (!cancelled) {
          setSpentsReceitas(dash.totalReceitas || 0);
          setTotalDespesas(dash.totalDespesas  || 0);
          grafico = dash.grafico || [];
        }
      } catch (e) { console.error(e); }

      try {
        const res = await fetch(`${API_URL}/clients`, { headers });
        if (res.ok) {
          const clients = await res.json();
          mrr = clients.reduce((a, c) => a + (c.valueMonthly || 0), 0);
          if (!cancelled) {
            setReceitaClientes(mrr);
            setRecentClients(clients.slice(0, 5));
          }
        }
      } catch (e) { console.error(e); }

      if (mrr > 0) {
        const mes = MESES[new Date().getMonth()];
        const existe = grafico.find(p => p.time === mes);
        grafico = existe
          ? grafico.map(p => p.time === mes ? { ...p, receita: (p.receita || 0) + mrr } : p)
          : [...grafico, { time: mes, receita: mrr, despesa: 0 }]
              .sort((a, b) => MESES.indexOf(a.time) - MESES.indexOf(b.time));
      }

      if (!cancelled) { setAreaData(grafico); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalReceitas = spentsReceitas + receitaClientes;
  const lucro         = totalReceitas - totalDespesas;
  const lucroPositivo = lucro >= 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-page)",
      color: "var(--tx-primary)", fontFamily: "inherit" }}>
      <Sidebar onLogout={handleLogout} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">
        <PageHeader
          title="Dashboard"
          onMenuClick={() => setMobileOpen(true)}
        >
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
            <Search size={13} style={{ color: "var(--tx-muted)" }} />
            <input placeholder="Buscar..."
              className="bg-transparent text-sm outline-none w-36"
              style={{ color: "var(--tx-sub)", caretColor: "var(--accent)" }} />
          </div>
        </PageHeader>

        <div className="p-4 md:p-8 flex flex-col gap-4 md:gap-5">
          {/* Cabeçalho da seção */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5"
                style={{ color: "var(--tx-muted)" }}>Visão geral</p>
              <h1 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: "var(--tx-primary)" }}>
                {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                  .replace(/^\w/, c => c.toUpperCase())}
              </h1>
            </div>
            <button className="hidden md:flex items-center gap-1.5 text-xs"
              style={{ color: "var(--tx-muted)" }}>
              <SlidersHorizontal size={12} /> Filtrar período
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--bd-div)", borderTopColor: "var(--accent)" }} />
            </div>
          ) : (
            <>
              {/* KPI Cards — 1 col mobile, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Receitas */}
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                      <span className="text-[11px] font-semibold uppercase tracking-widest"
                        style={{ color: "var(--tx-muted)" }}>Receitas</span>
                    </div>
                    <TrendingUp size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="text-2xl md:text-[26px] font-bold tracking-tight leading-none"
                    style={{ color: "var(--tx-primary)" }}>
                    {fmt(totalReceitas)}
                  </p>
                  {receitaClientes > 0 && (
                    <div className="flex flex-col gap-1 pt-2" style={{ borderTop: "1px solid var(--bd-div)" }}>
                      {spentsReceitas > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--tx-muted)" }}>
                            <ArrowUpRight size={10} style={{ color: "var(--accent)" }} /> Lançamentos
                          </span>
                          <span className="text-[11px] font-medium" style={{ color: "var(--tx-sub)" }}>
                            {fmt(spentsReceitas)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--tx-muted)" }}>
                          <Users size={10} style={{ color: "var(--accent)" }} /> Clientes (MRR)
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: "var(--tx-sub)" }}>
                          {fmt(receitaClientes)}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Despesas */}
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-widest"
                        style={{ color: "var(--tx-muted)" }}>Despesas</span>
                    </div>
                    <TrendingDown size={14} className="text-rose-500" />
                  </div>
                  <p className="text-2xl md:text-[26px] font-bold tracking-tight leading-none"
                    style={{ color: "var(--tx-primary)" }}>
                    {fmt(totalDespesas)}
                  </p>
                </Card>

                {/* Lucro */}
                <div className="rounded-2xl p-4 md:p-5 flex flex-col gap-3"
                  style={lucroPositivo
                    ? { background: "var(--accent)", boxShadow: "var(--accent-shadow-css)", border: "1px solid var(--accent)" }
                    : { background: "#dc2626", border: "1px solid #ef4444" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                        Lucro Líquido
                      </span>
                    </div>
                    <Wallet size={14} className="text-white/70" />
                  </div>
                  <p className="text-2xl md:text-[26px] font-bold tracking-tight leading-none text-white">
                    {fmt(lucro)}
                  </p>
                  <p className="text-[11px] text-white/60">
                    {fmt(totalReceitas)} receitas − {fmt(totalDespesas)} despesas
                  </p>
                </div>
              </div>

              {/* Gráfico */}
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>
                      Receitas vs Despesas
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--tx-muted)" }}>Evolução mensal</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                      <span className="text-[11px]" style={{ color: "var(--tx-muted)" }}>Receitas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-[11px]" style={{ color: "var(--tx-muted)" }}>Despesas</span>
                    </div>
                  </div>
                </div>
                {areaData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[160px] gap-3">
                    <TrendingUp size={17} style={{ color: "var(--tx-muted)" }} />
                    <p className="text-xs" style={{ color: "var(--tx-muted)" }}>Nenhum dado financeiro registrado</p>
                  </div>
                ) : (
                  <AccentAreaChart data={areaData} />
                )}
              </Card>

              {/* Clientes recentes */}
              <Card noPadding>
                <div className="flex items-center justify-between px-4 md:px-5 py-4"
                  style={{ borderBottom: "1px solid var(--bd-div)" }}>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>
                      Clientes Recentes
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--tx-muted)" }}>
                      {recentClients.length} cadastrados
                    </p>
                  </div>
                  <button onClick={() => navigate("/clientes")}
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: "var(--accent)" }}>
                    Ver todos <ChevronRight size={12} />
                  </button>
                </div>

                {recentClients.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-xs" style={{ color: "var(--tx-muted)" }}>Nenhum cliente cadastrado ainda</p>
                  </div>
                ) : (
                  <div>
                    {recentClients.map((c, i) => (
                      <div key={i}
                        className="flex items-center gap-3 px-4 md:px-5 py-3"
                        style={{ borderBottom: i < recentClients.length - 1 ? "1px solid var(--bd-div)" : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--tx-primary)" }}>{c.name}</p>
                          <p className="text-[11px] truncate" style={{ color: "var(--tx-muted)" }}>{c.email}</p>
                        </div>
                        {(c.valueMonthly || 0) > 0 && (
                          <span className="text-[12px] font-semibold tabular-nums shrink-0"
                            style={{ color: "var(--accent)" }}>
                            +{fmt(c.valueMonthly)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function Card({ children, noPadding = false }) {
  return (
    <div className={`rounded-2xl flex flex-col gap-3 ${noPadding ? "overflow-hidden" : "p-4 md:p-5"}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
      {children}
    </div>
  );
}