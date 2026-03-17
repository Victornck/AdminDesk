import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer } from "../components/Sidebar";
import { PageHeader } from "../components/PageHeader";
import { useTheme } from "../hooks/useTheme";
import {
  Plus, X, Trash2, Pencil, Search,
  TrendingDown, Wallet, ArrowRight, Calendar, FileText,
  Tag, RefreshCw, ChevronDown, LayoutGrid, List,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
function getToken() { return localStorage.getItem("token") ?? ""; }

const fmt      = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtDate  = (s) => { if (!s) return ""; const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };
const today    = () => new Date().toISOString().split("T")[0];
const blockEnter = (e) => { if (e.key === "Enter") e.preventDefault(); };

const CATEGORIAS = [
  { key: "alimentacao", label: "Alimentação", color: "#fb923c" },
  { key: "transporte",  label: "Transporte",  color: "#60a5fa" },
  { key: "moradia",     label: "Moradia",     color: "#a78bfa" },
  { key: "saude",       label: "Saúde",       color: "#34d399" },
  { key: "educacao",    label: "Educação",    color: "#f472b6" },
  { key: "lazer",       label: "Lazer",       color: "#fbbf24" },
  { key: "servicos",    label: "Serviços",    color: "#2dd4bf" },
  { key: "outros",      label: "Outros",      color: "#94a3b8" },
];
const catInfo = (key) => CATEGORIAS.find(c => c.key === key) || CATEGORIAS[7];

const EMPTY_FORM = { descriptor: "", price: "", data: today(), categoria: "outros", type: "expense" };

// ─── ModalField ───────────────────────────────────────────────────────────────
function ModalField({ label, icon: Icon, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "var(--tx-muted)" }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 12,
        transition: "all 0.15s", background: "var(--bg-input)",
        border: focused ? "1px solid var(--accent)" : "1px solid var(--bd-input)",
        boxShadow: focused ? "0 0 0 3px var(--accent-ring)" : "none",
      }}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
        {Icon && <Icon size={14} style={{ color: "var(--tx-muted)", flexShrink: 0 }} />}
        {children}
      </div>
    </div>
  );
}

// ─── DespesaModal ─────────────────────────────────────────────────────────────
function DespesaModal({ open, onClose, onSave, inicial }) {
  const [form,    setForm]    = useState(inicial || EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    setForm(inicial ? { ...inicial } : EMPTY_FORM);
    setSaving(false);
    setCatOpen(false);
  }, [inicial, open]);

  if (!open) return null;

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const cat    = catInfo(form.categoria);

  async function submit() {
    if (!form.descriptor.trim() || !form.price || !form.data || saving) return;
    setSaving(true);
    await onSave({ ...form, price: parseFloat(form.price), type: "expense" });
    setSaving(false);
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-md"
        style={{ background: "rgba(0,0,0,0.50)" }} onClick={onClose} />

      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 md:p-6 shadow-2xl
        max-h-[92vh] overflow-y-auto"
        style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}
        onKeyDown={blockEnter}>

        {/* Handle bar mobile */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--bd-div)" }} />
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px hidden sm:block"
          style={{ background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.65),transparent)" }} />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-danger-muted)" }}>
              <TrendingDown size={13} style={{ color: "var(--color-danger)" }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>
                {inicial?.id ? "Editar Despesa" : "Nova Despesa"}
              </h2>
              <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>Preencha os dados abaixo</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ border: "1px solid var(--bd-card)" }}>
            <X size={14} style={{ color: "var(--tx-muted)" }} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <ModalField label="Descrição *" icon={FileText}>
            <input type="text" name="descriptor" value={form.descriptor} onChange={handle}
              placeholder="Ex: Aluguel, Mercado, Gasolina…" autoComplete="off"
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
          </ModalField>

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Valor *">
              <span className="text-xs shrink-0" style={{ color: "var(--tx-muted)" }}>R$</span>
              <input type="number" name="price" min="0" step="0.01"
                value={form.price} onChange={handle} placeholder="0,00"
                className="bg-transparent text-sm outline-none w-full"
                style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
            </ModalField>

            <ModalField label="Data *" icon={Calendar}>
              <input type="date" name="data" value={form.data} onChange={handle}
                className="bg-transparent text-sm outline-none w-full"
                style={{ color: "var(--tx-primary)", caretColor: "var(--accent)",
                  colorScheme: document.documentElement.classList.contains("dark") ? "dark" : "light" }} />
            </ModalField>
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1.5 relative">
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--tx-muted)" }}>Categoria</label>
            <button onClick={() => setCatOpen(o => !o)}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl w-full"
              style={{ background: "var(--bg-input)",
                border: catOpen ? "1px solid var(--accent)" : "1px solid var(--bd-input)" }}>
              <Tag size={14} style={{ color: cat.color, flexShrink: 0 }} />
              <span className="flex-1 text-left text-sm" style={{ color: "var(--tx-primary)" }}>{cat.label}</span>
              <ChevronDown size={13} style={{ color: "var(--tx-muted)",
                transform: catOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s" }} />
            </button>
            {catOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 shadow-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                {CATEGORIAS.map(c => (
                  <button key={c.key}
                    onClick={() => { setForm(f => ({ ...f, categoria: c.key })); setCatOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-3 text-sm text-left transition-colors"
                    style={{ color: "var(--tx-primary)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    {c.label}
                    {form.categoria === c.key && (
                      <span className="ml-auto text-xs" style={{ color: c.color }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ color: "var(--tx-muted)", border: "1px solid var(--bd-card)" }}>
            Cancelar
          </button>
          <button onClick={submit}
            disabled={saving || !form.descriptor.trim() || !form.price || !form.data}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: "var(--color-danger)" }}>
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Salvando…</>
              : <>{inicial?.id ? "Salvar" : "Registrar"} <ArrowRight size={13} /></>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────
function DeleteModal({ open, item, onConfirm, onClose }) {
  if (!open || !item) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-md"
        style={{ background: "rgba(0,0,0,0.50)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-5 md:p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--color-danger-ring)" }}>
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--bd-div)" }} />
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-danger-muted)", border: "1px solid var(--color-danger-ring)" }}>
            <Trash2 size={18} style={{ color: "var(--color-danger)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>Remover despesa?</p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--tx-muted)" }}>
              Você está prestes a remover{" "}
              <span style={{ color: "var(--tx-sub)", fontWeight: 500 }}>{item.descriptor}</span>.{" "}
              O dashboard será atualizado automaticamente.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ color: "var(--tx-muted)", border: "1px solid var(--bd-card)" }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--color-danger)" }}>
            Remover
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Despesas() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spents,     setSpents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [liveStatus, setLiveStatus] = useState("ok");
  const [search,          setSearch]          = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [viewMode,        setViewMode]        = useState("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando,  setEditando]  = useState(null);
  const [deletando, setDeletando] = useState(null);

  const pollingRef = useRef(null);
  function handleLogout() { localStorage.removeItem("token"); navigate("/login"); }

  const fetchSpents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setLiveStatus("syncing");
    try {
      const res = await fetch(`${API_URL}/spents?type=expense`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setSpents(data.filter(s => s.type === "expense" || s.type === undefined));
      setLastUpdate(new Date());
      setLiveStatus("ok");
    } catch { setLiveStatus("error"); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchSpents();
    pollingRef.current = setInterval(() => fetchSpents(true), 15000);
    return () => clearInterval(pollingRef.current);
  }, [fetchSpents]);

  async function handleCriar(form) {
    const res = await fetch(`${API_URL}/spents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ...form, type: "expense" }),
    });
    if (res.ok) { await fetchSpents(); setModalOpen(false); }
  }

  async function handleEditar(form) {
    const res = await fetch(`${API_URL}/spents/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ...form, type: "expense" }),
    });
    if (res.ok) { await fetchSpents(); setModalOpen(false); setEditando(null); }
  }

  async function handleDeletar() {
    const res = await fetch(`${API_URL}/spents/${deletando.id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { await fetchSpents(); setDeletando(null); }
  }

  const totalGeral = spents.reduce((a, s) => a + (s.price || 0), 0);

  const totalPorCategoria = CATEGORIAS
    .map(c => ({
      ...c,
      total: spents.filter(s => s.categoria === c.key).reduce((a, s) => a + (s.price || 0), 0),
      count: spents.filter(s => s.categoria === c.key).length,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.total - a.total);

  const maiorCategoria = totalPorCategoria[0];

  const filtrados = spents
    .filter(s =>
      s.descriptor?.toLowerCase().includes(search.toLowerCase()) &&
      (filtroCategoria === "all" || s.categoria === filtroCategoria)
    )
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-page)",
      color: "var(--tx-primary)", fontFamily: "inherit" }}>
      <Sidebar onLogout={handleLogout} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">
        <PageHeader
          title="Despesas"
          subtitle={`${spents.length} ${spents.length === 1 ? "lançamento" : "lançamentos"}`}
          onMenuClick={() => setMobileOpen(true)}
          live={{ status: liveStatus, lastUpdate }}
        />

        <div className="p-4 md:p-8 flex flex-col gap-4 md:gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5"
                style={{ color: "var(--tx-muted)" }}>Financeiro</p>
              <h1 className="text-lg md:text-xl font-bold tracking-tight"
                style={{ color: "var(--tx-primary)" }}>Controle de Despesas</h1>
            </div>
            <button onClick={() => fetchSpents(true)}
              className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg"
              style={{ color: "var(--tx-muted)", border: "1px solid var(--bd-div)" }}>
              <RefreshCw size={11} className={liveStatus === "syncing" ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--bd-div)", borderTopColor: "var(--accent)" }} />
            </div>
          ) : (
            <>
              {/* KPI Cards — 1 col mobile, 2+2 desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Total — ocupa tudo no mobile, 2 cols no md */}
                <div className="relative rounded-2xl p-4 md:p-5 flex flex-col gap-2 overflow-hidden sm:col-span-2"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: "var(--color-danger)", opacity: 0.06, filter: "blur(32px)", transform: "translate(30%,-30%)" }} />
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase", color: "var(--tx-muted)" }}>Total do mês</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--color-danger-muted)" }}>
                      <TrendingDown size={13} style={{ color: "var(--color-danger)" }} />
                    </div>
                  </div>
                  <p className="text-2xl md:text-[28px] font-bold tracking-tight leading-none"
                    style={{ color: "var(--color-danger)" }}>{fmt(totalGeral)}</p>
                  <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>
                    {spents.length} despesa{spents.length !== 1 ? "s" : ""} registrada{spents.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="relative rounded-2xl p-4 flex flex-col gap-2"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase", color: "var(--tx-muted)" }}>Maior gasto</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${maiorCategoria?.color ?? "#94a3b8"}20` }}>
                      <Tag size={13} style={{ color: maiorCategoria?.color ?? "#94a3b8" }} />
                    </div>
                  </div>
                  <p className="text-lg font-bold tracking-tight leading-none"
                    style={{ color: maiorCategoria?.color ?? "var(--tx-sub)" }}>
                    {maiorCategoria ? fmt(maiorCategoria.total) : "—"}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>
                    {maiorCategoria?.label || "Sem dados"}
                  </p>
                </div>

                <div className="relative rounded-2xl p-4 flex flex-col gap-2"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase", color: "var(--tx-muted)" }}>Ticket médio</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(167,139,250,0.12)" }}>
                      <Wallet size={13} style={{ color: "#a78bfa" }} />
                    </div>
                  </div>
                  <p className="text-lg font-bold tracking-tight leading-none" style={{ color: "#a78bfa" }}>
                    {spents.length > 0 ? fmt(totalGeral / spents.length) : "—"}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>por lançamento</p>
                </div>
              </div>

              {/* Distribuição por categoria */}
              {totalPorCategoria.length > 0 && (
                <div className="rounded-2xl p-4 md:p-5"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "var(--tx-muted)", marginBottom: 14 }}>
                    Distribuição por categoria
                  </p>
                  <div className="flex flex-col gap-3">
                    {totalPorCategoria.slice(0, 5).map(c => {
                      const pct = totalGeral > 0 ? (c.total / totalGeral) * 100 : 0;
                      return (
                        <div key={c.key} className="flex items-center gap-3">
                          <span className="text-xs w-20 shrink-0 truncate" style={{ color: "var(--tx-sub)" }}>{c.label}</span>
                          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "var(--bg-subtle)" }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: c.color }} />
                          </div>
                          <span className="text-xs w-16 text-right shrink-0 font-mono tabular-nums"
                            style={{ color: "var(--tx-sub)" }}>{fmt(c.total)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex flex-col gap-3">
                {/* Busca */}
                <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--bd-input)" }}>
                  <Search size={13} style={{ color: "var(--tx-muted)", flexShrink: 0 }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar descrição…"
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
                  {search && (
                    <button onClick={() => setSearch("")} style={{ color: "var(--tx-muted)" }}>
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Filtros de categoria — scroll horizontal no mobile */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  <FilterBtn active={filtroCategoria === "all"} onClick={() => setFiltroCategoria("all")}>
                    Todas
                  </FilterBtn>
                  {totalPorCategoria.map(c => (
                    <FilterBtn key={c.key} active={filtroCategoria === c.key}
                      onClick={() => setFiltroCategoria(c.key)} color={c.color}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                      {c.label}
                    </FilterBtn>
                  ))}
                </div>

                {/* Botões de ação */}
                <div className="flex items-center justify-between gap-2">
                  <div className="hidden sm:flex items-center p-1 rounded-xl gap-1"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--bd-div)" }}>
                    {[{ key: "list", Icon: List }, { key: "grid", Icon: LayoutGrid }].map(({ key, Icon }) => (
                      <button key={key} onClick={() => setViewMode(key)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={viewMode === key
                          ? { background: "var(--accent-muted)", color: "var(--accent)" }
                          : { color: "var(--tx-muted)" }}>
                        <Icon size={13} />
                      </button>
                    ))}
                  </div>

                  <button onClick={() => { setEditando(null); setModalOpen(true); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: "var(--color-danger)", boxShadow: "0 0 20px var(--color-danger-muted)" }}>
                    <Plus size={15} /> Nova Despesa
                  </button>
                </div>
              </div>

              {/* Lista vazia */}
              {filtrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--color-danger-muted)", border: "1px solid var(--color-danger-ring)" }}>
                    <TrendingDown size={24} style={{ color: "var(--color-danger)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>
                      {search ? "Nenhuma despesa encontrada" : "Sem despesas registradas"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--tx-sub)" }}>
                      {search
                        ? `Nenhuma despesa para "${search}"`
                        : "Registre sua primeira despesa para ver os dados no dashboard"}
                    </p>
                  </div>
                  {!search && (
                    <button onClick={() => { setEditando(null); setModalOpen(true); }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: "var(--color-danger)" }}>
                      <Plus size={14} /> Registrar despesa
                    </button>
                  )}
                </div>

              ) : (
                // Mobile sempre cards, desktop respeita viewMode
                <div>
                  {/* Desktop list */}
                  {viewMode === "list" && (
                    <div className="hidden sm:block rounded-2xl overflow-hidden"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                      <div className="grid px-5 py-3 items-center"
                        style={{ gridTemplateColumns: "1fr 110px 100px 110px 56px",
                          borderBottom: "1px solid var(--bd-div)" }}>
                        {["Descrição", "Data", "Categoria", "Valor", ""].map(h => (
                          <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                            textTransform: "uppercase", color: "var(--tx-muted)" }}>{h}</span>
                        ))}
                      </div>
                      {filtrados.map((s, i) => {
                        const cat = catInfo(s.categoria);
                        return (
                          <div key={s.id} className="grid px-5 py-3.5 items-center group cursor-default transition-colors"
                            style={{ gridTemplateColumns: "1fr 110px 100px 110px 56px",
                              borderBottom: i < filtrados.length - 1 ? "1px solid var(--bd-div)" : "none" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: `${cat.color}18` }}>
                                <TrendingDown size={13} style={{ color: cat.color }} />
                              </div>
                              <p className="text-sm font-medium truncate" style={{ color: "var(--tx-primary)" }}>{s.descriptor}</p>
                            </div>
                            <span className="text-xs font-mono" style={{ color: "var(--tx-sub)" }}>{fmtDate(s.data)}</span>
                            <span className="text-[11px] font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1 w-fit"
                              style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                              {cat.label}
                            </span>
                            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--color-danger)" }}>
                              −{fmt(s.price)}
                            </span>
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {[
                                { action: () => { setEditando(s); setModalOpen(true); }, Icon: Pencil, hoverBd: "var(--accent-ring)" },
                                { action: () => setDeletando(s), Icon: Trash2, hoverBd: "var(--color-danger-ring)" },
                              ].map(({ action, Icon, hoverBd }, idx) => (
                                <button key={idx} onClick={action}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ border: "1px solid var(--bd-div)" }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = hoverBd}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--bd-div)"}>
                                  <Icon size={11} style={{ color: "var(--tx-sub)" }} />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Cards — mobile sempre, desktop só no grid mode */}
                  <div className={`grid gap-3 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:hidden"} grid-cols-1`}>
                    {filtrados.map(s => {
                      const cat = catInfo(s.categoria);
                      return (
                        <div key={s.id} className="relative rounded-2xl p-4 flex flex-col gap-3 overflow-hidden"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${cat.color}18` }}>
                                <TrendingDown size={14} style={{ color: cat.color }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--tx-primary)" }}>{s.descriptor}</p>
                                <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>{fmtDate(s.data)}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0 ml-2">
                              {[
                                { action: () => { setEditando(s); setModalOpen(true); }, Icon: Pencil },
                                { action: () => setDeletando(s), Icon: Trash2 },
                              ].map(({ action, Icon }, idx) => (
                                <button key={idx} onClick={action}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ border: "1px solid var(--bd-div)" }}>
                                  <Icon size={12} style={{ color: "var(--tx-sub)" }} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-2"
                            style={{ borderTop: "1px solid var(--bd-div)" }}>
                            <span className="text-[11px] font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1"
                              style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                              {cat.label}
                            </span>
                            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--color-danger)" }}>
                              −{fmt(s.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
      <DespesaModal open={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }}
        onSave={editando ? handleEditar : handleCriar} inicial={editando} />
      <DeleteModal open={!!deletando} item={deletando}
        onConfirm={handleDeletar} onClose={() => setDeletando(null)} />
    </div>
  );
}

function FilterBtn({ active, onClick, color, children }) {
  return (
    <button onClick={onClick}
      className="px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
      style={active
        ? color
          ? { background: `${color}18`, color, border: `1px solid ${color}35` }
          : { background: "var(--bg-card)", color: "var(--tx-primary)", border: "1px solid var(--bd-card)" }
        : { color: "var(--tx-muted)", border: "1px solid transparent" }}>
      {children}
    </button>
  );
}