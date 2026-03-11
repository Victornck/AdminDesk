import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import {
  Bell, Sun, Moon, Plus, X, Trash2, Pencil,
  TrendingUp, TrendingDown, Wallet, Search, Calendar, FileText, ArrowRight
} from "lucide-react";

const API_URL = "http://localhost:8080";
function getToken() { return localStorage.getItem("token"); }

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtDate = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

const EMPTY_FORM = { descriptor: "", price: "", data: "", type: "expense" };
const blockEnter = (e) => { if (e.key === "Enter") e.preventDefault(); };

// ── Modal Field ───────────────────────────────────────────────────────────────
function ModalField({ label, icon: Icon, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/30">{label}</label>
      <div
        className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all duration-150"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${focused ? "rgba(163,230,53,0.4)" : "rgba(255,255,255,0.08)"}`,
        }}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
      >
        {Icon && <Icon size={14} className="text-white/25 shrink-0" />}
        {children}
      </div>
    </div>
  );
}

// ── Modal Lançamento ──────────────────────────────────────────────────────────
function SpentModal({ open, onClose, onSave, inicial }) {
  const [form, setForm] = useState(inicial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(inicial || EMPTY_FORM); setSaving(false); }, [inicial, open]);
  if (!open) return null;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async () => {
    if (!form.descriptor.trim() || !form.price || !form.data || saving) return;
    setSaving(true);
    await onSave({ ...form, price: parseFloat(form.price) });
    setSaving(false);
  };

  const isExpense = form.type === "expense";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "#0b1320", border: "1px solid rgba(255,255,255,0.08)" }}
        onKeyDown={blockEnter}
      >
        {/* brilho topo dinâmico */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px transition-all duration-300"
          style={{ background: isExpense
            ? "linear-gradient(90deg,transparent,rgba(239,68,68,0.6),transparent)"
            : "linear-gradient(90deg,transparent,rgba(163,230,53,0.6),transparent)" }} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-white" style={{ letterSpacing: "-0.01em" }}>
              {inicial?.id ? "Editar Lançamento" : "Novo Lançamento"}
            </h2>
            <p className="text-[11px] text-white/30 mt-0.5">Preencha os dados abaixo</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <X size={14} className="text-white/35" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Toggle tipo */}
          <div className="flex p-1 rounded-xl gap-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { key: "expense", label: "Despesa", Icon: TrendingDown, color: "#ef4444", bg: "rgba(239,68,68,0.12)", br: "rgba(239,68,68,0.25)" },
              { key: "income",  label: "Receita",  Icon: TrendingUp,  color: "#a3e635", bg: "rgba(163,230,53,0.10)", br: "rgba(163,230,53,0.25)" },
            ].map(({ key, label, Icon, color, bg, br }) => {
              const active = form.type === key;
              return (
                <button key={key} type="button" onClick={() => setForm({ ...form, type: key })}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={active
                    ? { background: bg, color, border: `1px solid ${br}` }
                    : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }
                  }>
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>

          <ModalField label="Descrição *" icon={FileText}>
            <input type="text" name="descriptor" value={form.descriptor} onChange={handle}
              placeholder="Ex: Salário, Aluguel, Freelance…" autoComplete="off"
              className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
              style={{ caretColor: "#a3e635" }} />
          </ModalField>

          <ModalField label="Valor *">
            <span className="text-xs text-white/25 shrink-0">R$</span>
            <input type="number" name="price" min="0" step="0.01"
              value={form.price} onChange={handle} placeholder="0,00"
              className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
              style={{ caretColor: "#a3e635" }} />
          </ModalField>

          <ModalField label="Data *" icon={Calendar}>
            <input type="date" name="data" value={form.data} onChange={handle}
              className="bg-transparent text-sm text-white outline-none w-full"
              style={{ caretColor: "#a3e635", colorScheme: "dark" }} />
          </ModalField>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/35 transition-colors hover:text-white/60"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancelar
          </button>
          <button type="button" onClick={submit}
            disabled={saving || !form.descriptor.trim() || !form.price || !form.data}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#a3e635,#65a30d)" }}>
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Salvando…</>
              : <>{inicial?.id ? "Salvar" : "Cadastrar"} <ArrowRight size={13} /></>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Modal Delete ──────────────────────────────────────────────────────────────
function DeleteModal({ open, item, onConfirm, onClose }) {
  if (!open || !item) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: "#0b1320", border: "1px solid rgba(239,68,68,0.18)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.6),transparent)" }} />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <Trash2 size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Remover lançamento?</p>
            <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
              Você está prestes a remover{" "}
              <span className="text-white/75 font-medium">{item.descriptor}</span>.<br />
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/60 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            Remover
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function Despesas() {
  const navigate = useNavigate();
  const [dm, setDm] = useState(true); // dm = darkMode
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spents, setSpents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [deletando, setDeletando] = useState(null);

  const toggleTheme = () => { setDm(!dm); document.documentElement.classList.toggle("dark"); };
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

  const fetchSpents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/spents`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.status === 401) { handleLogout(); return; }
      setSpents(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSpents(); }, []);

  const handleCriar = async (form) => {
    try {
      const res = await fetch(`${API_URL}/spents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchSpents(); setModalOpen(false); }
    } catch (e) { console.error(e); }
  };

  const handleEditar = async (form) => {
    try {
      const res = await fetch(`${API_URL}/spents/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchSpents(); setModalOpen(false); setEditando(null); }
    } catch (e) { console.error(e); }
  };

  const handleDeletar = async () => {
    try {
      const res = await fetch(`${API_URL}/spents/${deletando.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { await fetchSpents(); setDeletando(null); }
    } catch (e) { console.error(e); }
  };

  const totalReceitas = spents.filter(s => s.type === "income").reduce((a, s) => a + s.price, 0);
  const totalDespesas = spents.filter(s => s.type === "expense").reduce((a, s) => a + s.price, 0);
  const saldo = totalReceitas - totalDespesas;

  const filtrados = spents.filter((s) =>
    s.descriptor?.toLowerCase().includes(search.toLowerCase()) &&
    (filtroTipo === "all" || s.type === filtroTipo)
  );

  // ── tema ──
  const bgPage   = dm ? "#080d14" : "#f0f2f5";
  const bgCard   = dm ? "#0d1824" : "#ffffff";
  const bdCard   = dm ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const txPrimary= dm ? "#f1f5f9"  : "#0f172a";
  const txSub    = dm ? "#94a3b8"  : "#475569";
  const txMuted  = dm ? "rgba(255,255,255,0.28)" : "#94a3b8";
  const bdDiv    = dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";
  const bgInput  = dm ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const bdInput  = dm ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
  const bgHeader = dm ? "rgba(8,13,20,0.88)" : "rgba(240,242,245,0.92)";

  return (
    <div className={dm ? "dark" : ""}>
      <div className="min-h-screen flex font-sans" style={{ background: bgPage, color: txPrimary }}>

        <Sidebar onLogout={handleLogout} />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

        <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">

          {/* ── Header ── */}
          <header
            className="sticky top-0 z-10 backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between"
            style={{ background: bgHeader, borderBottom: `1px solid ${bdDiv}` }}
          >
            <div className="flex items-center gap-4">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <div>
                <p className="text-sm font-semibold" style={{ color: txPrimary, letterSpacing: "-0.01em" }}>
                  Despesas & Receitas
                </p>
                <p className="text-[11px] hidden md:block" style={{ color: txMuted }}>
                  {spents.length} {spents.length === 1 ? "lançamento" : "lançamentos"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                style={{ background: dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${bdCard === "#ffffff" ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.07)"}` }}>
                {dm
                  ? <Sun size={15} style={{ color: txMuted }} />
                  : <Moon size={15} style={{ color: txSub }} />}
              </button>
              <button className="relative w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${bdCard === "#ffffff" ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.07)"}` }}>
                <Bell size={15} style={{ color: txMuted }} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-lime-400" />
              </button>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black"
                style={{ background: "linear-gradient(135deg,#a3e635,#65a30d)" }}>
                JS
              </div>
            </div>
          </header>

          {/* ── Conteúdo ── */}
          <div className="p-4 md:p-8 flex flex-col gap-5">

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">

              {/* Receitas */}
              <div className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{ background: bgCard, border: `1px solid ${bdCard}` }}>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: "#a3e635", opacity: 0.07, filter: "blur(28px)", transform: "translate(30%,-30%)" }} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: txMuted }}>Receitas</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(163,230,53,0.12)" }}>
                    <TrendingUp size={13} style={{ color: "#a3e635" }} />
                  </div>
                </div>
                <p className="text-xl font-bold" style={{ color: dm ? "#a3e635" : "#166534", letterSpacing: "-0.02em" }}>
                  {fmt(totalReceitas)}
                </p>
              </div>

              {/* Despesas */}
              <div className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{ background: bgCard, border: `1px solid ${bdCard}` }}>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: "#ef4444", opacity: 0.07, filter: "blur(28px)", transform: "translate(30%,-30%)" }} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: txMuted }}>Despesas</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                    <TrendingDown size={13} style={{ color: "#ef4444" }} />
                  </div>
                </div>
                <p className="text-xl font-bold" style={{ color: dm ? "#f87171" : "#991b1b", letterSpacing: "-0.02em" }}>
                  {fmt(totalDespesas)}
                </p>
              </div>

              {/* Saldo */}
              <div className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{
                  background: saldo >= 0
                    ? dm ? "linear-gradient(135deg,#091a0d,#0b1f10)" : "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                    : dm ? "linear-gradient(135deg,#1a0909,#1f0b0b)" : "linear-gradient(135deg,#fff1f2,#ffe4e6)",
                  border: `1px solid ${saldo >= 0
                    ? dm ? "rgba(163,230,53,0.18)" : "rgba(22,163,74,0.2)"
                    : dm ? "rgba(239,68,68,0.18)" : "rgba(220,38,38,0.2)"}`,
                }}>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: saldo >= 0 ? "#a3e635" : "#ef4444", opacity: 0.1, filter: "blur(28px)", transform: "translate(30%,-30%)" }} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase"
                    style={{ color: saldo >= 0 ? (dm ? "rgba(163,230,53,0.65)" : "#15803d") : (dm ? "rgba(239,68,68,0.65)" : "#b91c1c") }}>
                    Saldo
                  </span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: saldo >= 0 ? "rgba(163,230,53,0.12)" : "rgba(239,68,68,0.12)" }}>
                    <Wallet size={13} style={{ color: saldo >= 0 ? (dm ? "#a3e635" : "#15803d") : (dm ? "#f87171" : "#dc2626") }} />
                  </div>
                </div>
                <p className="text-xl font-bold" style={{ color: saldo >= 0 ? (dm ? "#a3e635" : "#15803d") : (dm ? "#f87171" : "#dc2626"), letterSpacing: "-0.02em" }}>
                  {fmt(saldo)}
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">

                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: bgInput, border: `1px solid ${bdInput}`, minWidth: 220 }}>
                  <Search size={13} style={{ color: txMuted, flexShrink: 0 }} />
                  <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar descrição…"
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: txPrimary, caretColor: "#a3e635" }}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} style={{ color: txMuted, cursor: "pointer", flexShrink: 0 }}>
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Filtro tipo */}
                <div className="flex items-center gap-1 p-1 rounded-xl"
                  style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdDiv}` }}>
                  {[
                    { key: "all",     label: "Todos" },
                    { key: "income",  label: "Receitas" },
                    { key: "expense", label: "Despesas" },
                  ].map(({ key, label }) => {
                    const active = filtroTipo === key;
                    const styles = {
                      all:     { c: dm ? "#f1f5f9" : "#0f172a", bg: dm ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)", bd: dm ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" },
                      income:  { c: dm ? "#a3e635" : "#15803d",  bg: "rgba(163,230,53,0.1)",  bd: "rgba(163,230,53,0.22)" },
                      expense: { c: dm ? "#f87171" : "#dc2626",  bg: "rgba(239,68,68,0.1)",   bd: "rgba(239,68,68,0.22)" },
                    };
                    return (
                      <button key={key} type="button" onClick={() => setFiltroTipo(key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={active
                          ? { background: styles[key].bg, color: styles[key].c, border: `1px solid ${styles[key].bd}` }
                          : { color: txMuted, border: "1px solid transparent" }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="button" onClick={() => { setEditando(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:brightness-110 shrink-0"
                style={{ background: "linear-gradient(135deg,#a3e635,#65a30d)", boxShadow: "0 0 20px rgba(163,230,53,0.18)" }}>
                <Plus size={15} /> Novo Lançamento
              </button>
            </div>

            {/* Lista */}
            {loading ? (
              <div className="flex flex-col gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse"
                    style={{ background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }} />
                ))}
              </div>

            ) : filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: dm ? "rgba(163,230,53,0.08)" : "rgba(22,163,74,0.08)", border: `1px solid ${dm ? "rgba(163,230,53,0.15)" : "rgba(22,163,74,0.15)"}` }}>
                  <Wallet size={24} style={{ color: dm ? "#a3e635" : "#15803d" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: txPrimary }}>
                    {search ? "Nenhum resultado encontrado" : "Sem lançamentos"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: txSub }}>
                    {search ? `Nenhum lançamento para "${search}"` : "Registre sua primeira receita ou despesa"}
                  </p>
                </div>
                {!search && (
                  <button type="button" onClick={() => { setEditando(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black hover:brightness-110 transition-all"
                    style={{ background: "linear-gradient(135deg,#a3e635,#65a30d)" }}>
                    <Plus size={14} /> Novo lançamento
                  </button>
                )}
              </div>

            ) : (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: bgCard, border: `1px solid ${bdCard}` }}>

                {/* Header tabela */}
                <div className="grid px-5 py-3 items-center"
                  style={{ gridTemplateColumns: "1fr 96px 88px 112px 56px", borderBottom: `1px solid ${bdDiv}` }}>
                  {["Descrição", "Data", "Tipo", "Valor", ""].map((h) => (
                    <span key={h} className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: txMuted }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {filtrados.map((s, i) => (
                  <div key={s.id}
                    className="grid px-5 py-3.5 items-center group transition-colors cursor-default"
                    style={{
                      gridTemplateColumns: "1fr 96px 88px 112px 56px",
                      borderBottom: i < filtrados.length - 1 ? `1px solid ${bdDiv}` : "none",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = dm ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Descrição */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: s.type === "income" ? "rgba(163,230,53,0.1)" : "rgba(239,68,68,0.1)" }}>
                        {s.type === "income"
                          ? <TrendingUp  size={12} style={{ color: "#a3e635" }} />
                          : <TrendingDown size={12} style={{ color: "#ef4444" }} />
                        }
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: txPrimary }}>{s.descriptor}</span>
                    </div>

                    {/* Data */}
                    <span className="text-xs font-mono" style={{ color: txSub }}>{fmtDate(s.data)}</span>

                    {/* Badge */}
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-lg inline-block"
                      style={s.type === "income"
                        ? { background: dm ? "rgba(163,230,53,0.08)" : "rgba(22,163,74,0.08)", color: dm ? "#a3e635" : "#15803d", border: `1px solid ${dm ? "rgba(163,230,53,0.18)" : "rgba(22,163,74,0.2)"}` }
                        : { background: dm ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.06)", color: dm ? "#f87171" : "#dc2626", border: `1px solid ${dm ? "rgba(239,68,68,0.18)" : "rgba(220,38,38,0.15)"}` }
                      }>
                      {s.type === "income" ? "Receita" : "Despesa"}
                    </span>

                    {/* Valor */}
                    <span className="text-sm font-bold tabular-nums"
                      style={{ color: s.type === "income" ? (dm ? "#a3e635" : "#15803d") : (dm ? "#f87171" : "#dc2626") }}>
                      {s.type === "income" ? "+" : "−"}{fmt(s.price)}
                    </span>

                    {/* Ações */}
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {[
                        { action: () => { setEditando(s); setModalOpen(true); }, Icon: Pencil, hoverBd: "rgba(163,230,53,0.35)" },
                        { action: () => setDeletando(s), Icon: Trash2, hoverBd: "rgba(239,68,68,0.35)" },
                      ].map(({ action, Icon, hoverBd }, idx) => (
                        <button key={idx} type="button" onClick={action}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ border: `1px solid ${bdDiv}`, background: "transparent" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = hoverBd}
                          onMouseLeave={e => e.currentTarget.style.borderColor = bdDiv}>
                          <Icon size={11} style={{ color: txSub }} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNav />

        <SpentModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditando(null); }}
          onSave={editando ? handleEditar : handleCriar}
          inicial={editando}
        />
        <DeleteModal
          open={!!deletando}
          item={deletando}
          onConfirm={handleDeletar}
          onClose={() => setDeletando(null)}
        />
      </div>
    </div>
  );
}