import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer } from "../components/Sidebar";
import { PageHeader } from "../components/PageHeader";
import {
  Plus, X, Trash2, Pencil, Search, Users, Phone, Mail,
  ArrowRight, TrendingUp, Wallet, RefreshCw,
  LayoutGrid, List, DollarSign,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
function getToken() { return localStorage.getItem("token") ?? ""; }

const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtPhone = (v = "") =>
  v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2").slice(0, 15);

const EMPTY_FORM = { name: "", email: "", phone: "", valueMonthly: "" };
const blockEnter = (e) => { if (e.key === "Enter") e.preventDefault(); };

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
        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
        borderRadius: 12, transition: "all 0.15s", background: "var(--bg-input)",
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

// ─── ClienteModal ─────────────────────────────────────────────────────────────
function ClienteModal({ open, onClose, onSave, inicial }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(inicial
      ? { name: inicial.name || "", email: inicial.email || "",
          phone: inicial.phone || "", valueMonthly: inicial.valueMonthly ?? "" }
      : EMPTY_FORM);
    setSaving(false);
  }, [inicial, open]);

  if (!open) return null;

  const handle      = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePhone = (e) => setForm(f => ({ ...f, phone: fmtPhone(e.target.value) }));
  const valorNum    = parseFloat(String(form.valueMonthly).replace(",", ".")) || 0;

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || saving) return;
    setSaving(true);
    await onSave({ name: form.name.trim(), email: form.email.trim(),
      phone: form.phone || "", valueMonthly: valorNum });
    setSaving(false);
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-md"
        style={{ background: "rgba(0,0,0,0.50)" }} onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}
        onKeyDown={blockEnter}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
          style={{ background: "linear-gradient(90deg,transparent,var(--accent),transparent)", opacity: 0.65 }} />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-muted)" }}>
              <TrendingUp size={12} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>
                {inicial?.id ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>
                O valor mensal entrará no lucro do dashboard
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ border: "1px solid var(--bd-card)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X size={14} style={{ color: "var(--tx-muted)" }} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <ModalField label="Nome *" icon={Users}>
            <input type="text" name="name" value={form.name} onChange={handle}
              placeholder="Nome completo ou empresa…" autoComplete="off"
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
          </ModalField>
          <ModalField label="E-mail *" icon={Mail}>
            <input type="email" name="email" value={form.email} onChange={handle}
              placeholder="email@exemplo.com"
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
          </ModalField>
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Telefone" icon={Phone}>
              <input type="text" name="phone" value={form.phone} onChange={handlePhone}
                placeholder="(00) 00000-0000" maxLength={15}
                className="bg-transparent text-sm outline-none w-full"
                style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
            </ModalField>
            <ModalField label="Valor / mês *">
              <span className="text-xs shrink-0" style={{ color: "var(--tx-muted)" }}>R$</span>
              <input type="number" name="valueMonthly" min="0" step="0.01"
                value={form.valueMonthly} onChange={handle} placeholder="0,00"
                className="bg-transparent text-sm outline-none w-full"
                style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
            </ModalField>
          </div>
        </div>

        <div className="mt-4 px-3.5 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-ring)" }}>
          <DollarSign size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <p className="text-[11px]" style={{ color: "var(--accent)" }}>
            {valorNum > 0
              ? `+${fmt(valorNum)}/mês será adicionado ao lucro do dashboard`
              : "Defina o valor mensal para impactar o dashboard financeiro"}
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ color: "var(--tx-muted)", border: "1px solid var(--bd-card)" }}>
            Cancelar
          </button>
          <button onClick={submit}
            disabled={saving || !form.name.trim() || !form.email.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: "var(--accent)", boxShadow: "var(--accent-shadow-css)" }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => e.currentTarget.style.filter = "none"}>
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando…</>
              : <>{inicial?.id ? "Salvar" : "Cadastrar"} <ArrowRight size={13} /></>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-md"
        style={{ background: "rgba(0,0,0,0.50)" }} onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--color-danger-ring)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-danger-muted)", border: "1px solid var(--color-danger-ring)" }}>
            <Trash2 size={18} style={{ color: "var(--color-danger)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>Remover cliente?</p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--tx-muted)" }}>
              Remover <span style={{ color: "var(--tx-sub)", fontWeight: 500 }}>{item.name}</span> irá
              retirar <span style={{ color: "var(--accent)", fontWeight: 600 }}>{fmt(item.valueMonthly || 0)}/mês</span> do
              lucro do dashboard.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ color: "var(--tx-muted)", border: "1px solid var(--bd-card)" }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all"
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
export default function Clientes() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [liveStatus, setLiveStatus] = useState("ok");

  const [search,   setSearch]   = useState("");
  const [viewMode, setViewMode] = useState("list");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando,  setEditando]  = useState(null);
  const [deletando, setDeletando] = useState(null);

  const pollingRef = useRef(null);
  function handleLogout() { localStorage.removeItem("token"); navigate("/login"); }

  const fetchClients = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setLiveStatus("syncing");
    try {
      const res = await fetch(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      setClients(await res.json());
      setLastUpdate(new Date());
      setLiveStatus("ok");
    } catch { setLiveStatus("error"); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchClients();
    pollingRef.current = setInterval(() => fetchClients(true), 15000);
    return () => clearInterval(pollingRef.current);
  }, [fetchClients]);

  async function handleCriar(form) {
    const res = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { await fetchClients(); setModalOpen(false); }
  }

  async function handleEditar(form) {
    const res = await fetch(`${API_URL}/clients/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { await fetchClients(); setModalOpen(false); setEditando(null); }
  }

  async function handleDeletar() {
    const res = await fetch(`${API_URL}/clients/${deletando.id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { await fetchClients(); setDeletando(null); }
  }

  const receitaMensal = clients.reduce((a, c) => a + (c.valueMonthly || 0), 0);
  const ticketMedio   = clients.length > 0 ? receitaMensal / clients.length : 0;
  const maiorCliente  = [...clients].sort((a, b) => (b.valueMonthly || 0) - (a.valueMonthly || 0))[0];

  const filtrados = clients
    .filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    )
    .sort((a, b) => (b.valueMonthly || 0) - (a.valueMonthly || 0));

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-page)",
      color: "var(--tx-primary)", fontFamily: "inherit" }}>
      <Sidebar onLogout={handleLogout} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">

        <PageHeader
          title="Clientes"
          subtitle={`${clients.length} cadastrado${clients.length !== 1 ? "s" : ""} · ${fmt(receitaMensal)}/mês`}
          initials="JS"
          onMenuClick={() => setMobileOpen(true)}
          live={{ status: liveStatus, lastUpdate }}
        />

        <div className="p-4 md:p-8 flex flex-col gap-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5"
                style={{ color: "var(--tx-muted)" }}>Receita</p>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--tx-primary)" }}>
                Base de Clientes
              </h1>
            </div>
            <button onClick={() => fetchClients(true)}
              className="hidden md:flex items-center gap-1.5 text-xs"
              style={{ color: "var(--tx-muted)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--tx-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--tx-muted)"}>
              <RefreshCw size={11} className={liveStatus === "syncing" ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--bd-div)", borderTopColor: "var(--accent)" }} />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden col-span-2 transition-transform hover:-translate-y-0.5"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                  <div className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none"
                    style={{ background: "var(--accent)", opacity: 0.06, filter: "blur(32px)", transform: "translate(30%,-30%)" }} />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase"
                      style={{ color: "var(--tx-muted)" }}>Receita Mensal (MRR)</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--accent-muted)" }}>
                      <TrendingUp size={13} style={{ color: "var(--accent)" }} />
                    </div>
                  </div>
                  <p className="text-[28px] font-bold tracking-tight leading-none"
                    style={{ color: "var(--accent)" }}>{fmt(receitaMensal)}</p>
                  <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>
                    {clients.length} cliente{clients.length !== 1 ? "s" : ""} · ARR {fmt(receitaMensal * 12)}
                  </p>
                </div>

                <KpiCard label="Ticket médio" value={clients.length > 0 ? fmt(ticketMedio) : "—"}
                  sub="por cliente" icon={<Wallet size={13} style={{ color: "#a78bfa" }} />}
                  iconBg="rgba(167,139,250,0.12)" />
                <KpiCard label="Maior cliente"
                  value={maiorCliente ? fmt(maiorCliente.valueMonthly || 0) : "—"}
                  sub={maiorCliente?.name || "Sem dados"}
                  icon={<Users size={13} style={{ color: "var(--color-blue)" }} />}
                  iconBg="rgba(96,165,250,0.12)" />
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--bd-input)", minWidth: 240 }}>
                  <Search size={13} style={{ color: "var(--tx-muted)", flexShrink: 0 }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nome, e-mail ou telefone…"
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: "var(--tx-primary)", caretColor: "var(--accent)" }} />
                  {search && (
                    <button onClick={() => setSearch("")} style={{ color: "var(--tx-muted)", cursor: "pointer" }}>
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center p-1 rounded-xl gap-1"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--bd-div)" }}>
                    {[{ key: "list", Icon: List }, { key: "grid", Icon: LayoutGrid }].map(({ key, Icon }) => (
                      <button key={key} onClick={() => setViewMode(key)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={viewMode === key
                          ? { background: "var(--accent-muted)", color: "var(--accent)" }
                          : { color: "var(--tx-muted)" }}>
                        <Icon size={13} />
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setEditando(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{ background: "var(--accent)", boxShadow: "var(--accent-shadow-css)" }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.12)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                    <Plus size={15} /> Novo Cliente
                  </button>
                </div>
              </div>

              {/* Lista vazia */}
              {filtrados.length === 0 ? (
                <EmptyState
                  icon={<Users size={24} style={{ color: "var(--accent)" }} />}
                  title={search ? "Nenhum cliente encontrado" : "Sem clientes cadastrados"}
                  desc={search ? `Nenhum resultado para "${search}"` : "Cadastre um cliente para gerar receita no dashboard"}
                  action={!search && (
                    <button onClick={() => { setEditando(null); setModalOpen(true); }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ background: "var(--accent)", boxShadow: "var(--accent-shadow-css)" }}
                      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.12)"}
                      onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                      <Plus size={14} /> Cadastrar cliente
                    </button>
                  )}
                />

              ) : viewMode === "list" ? (
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                  <div className="grid px-5 py-3 items-center"
                    style={{ gridTemplateColumns: "1fr 160px 130px 64px", borderBottom: "1px solid var(--bd-div)" }}>
                    {["Cliente", "Telefone", "Receita/mês", ""].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "var(--tx-muted)" }}>{h}</span>
                    ))}
                  </div>
                  {filtrados.map((c, i) => {
                    const hasValue = (c.valueMonthly || 0) > 0;
                    return (
                      <div key={c.id} className="grid px-5 py-3.5 items-center group cursor-default transition-colors"
                        style={{ gridTemplateColumns: "1fr 160px 130px 64px",
                          borderBottom: i < filtrados.length - 1 ? "1px solid var(--bd-div)" : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={c.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--tx-primary)" }}>{c.name}</p>
                            <p className="text-[11px] truncate" style={{ color: "var(--tx-muted)" }}>{c.email}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono" style={{ color: "var(--tx-sub)" }}>
                          {c.phone || <span style={{ color: "var(--tx-muted)" }}>—</span>}
                        </span>
                        <span className="text-sm font-bold tabular-nums"
                          style={{ color: hasValue ? "var(--accent)" : "var(--tx-muted)" }}>
                          {hasValue ? `+${fmt(c.valueMonthly)}` : fmt(0)}
                        </span>
                        <ActionButtons
                          onEdit={() => { setEditando(c); setModalOpen(true); }}
                          onDelete={() => setDeletando(c)} />
                      </div>
                    );
                  })}
                </div>

              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtrados.map(c => {
                    const hasValue = (c.valueMonthly || 0) > 0;
                    return (
                      <div key={c.id} className="relative rounded-2xl p-4 flex flex-col gap-3 overflow-hidden group transition-transform hover:-translate-y-0.5"
                        style={{ background: "var(--bg-card)",
                          border: hasValue ? "1px solid var(--accent-ring)" : "1px solid var(--bd-card)" }}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                          style={{ background: "var(--accent)", opacity: 0.05, filter: "blur(24px)", transform: "translate(30%,-30%)" }} />
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.name} size={36} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: "var(--tx-primary)" }}>{c.name}</p>
                              <p className="text-[11px] truncate" style={{ color: "var(--tx-muted)" }}>{c.email}</p>
                            </div>
                          </div>
                          <ActionButtons
                            onEdit={() => { setEditando(c); setModalOpen(true); }}
                            onDelete={() => setDeletando(c)} />
                        </div>
                        {c.phone && (
                          <p className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--tx-muted)" }}>
                            <Phone size={10} /> {c.phone}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-2"
                          style={{ borderTop: "1px solid var(--bd-div)" }}>
                          <span className="text-[11px]" style={{ color: "var(--tx-muted)" }}>receita mensal</span>
                          <p className="text-sm font-bold tabular-nums"
                            style={{ color: hasValue ? "var(--accent)" : "var(--tx-muted)" }}>
                            {hasValue ? `+${fmt(c.valueMonthly)}` : fmt(0)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
      <ClienteModal open={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }}
        onSave={editando ? handleEditar : handleCriar} inicial={editando} />
      <DeleteModal open={!!deletando} item={deletando}
        onConfirm={handleDeletar} onClose={() => setDeletando(null)} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name = "", size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.375,
      background: "var(--accent-muted)", color: "var(--accent)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.375, fontWeight: 700, flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, iconBg }) {
  return (
    <div className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--tx-muted)" }}>{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold tracking-tight leading-none" style={{ color: "var(--tx-primary)" }}>{value}</p>
      <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>{sub}</p>
    </div>
  );
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      {[
        { action: onEdit,   Icon: Pencil, hoverBd: "var(--accent-ring)" },
        { action: onDelete, Icon: Trash2, hoverBd: "var(--color-danger-ring)" },
      ].map(({ action, Icon, hoverBd }, i) => (
        <button key={i} onClick={action}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ border: "1px solid var(--bd-div)", background: "transparent" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = hoverBd}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--bd-div)"}>
          <Icon size={11} style={{ color: "var(--tx-sub)" }} />
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-ring)" }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: "var(--tx-sub)" }}>{desc}</p>
      </div>
      {action}
    </div>
  );
}