import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import {
  Bell, Sun, Moon, Search, Plus, X,
  Pencil, Trash2, User, Mail, Phone, Users, DollarSign, ChevronRight
} from "lucide-react";

const API_URL = "http://localhost:8080";

const fmt = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

function getToken() {
  return localStorage.getItem("token");
}

// Gera uma cor neutra baseada na inicial — sem gradientes chamativos
function avatarBg(name) {
  const palettes = [
    { bg: "bg-sky-100 dark:bg-sky-900/40", text: "text-sky-700 dark:text-sky-300" },
    { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300" },
    { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
    { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
    { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300" },
  ];
  return palettes[name.charCodeAt(0) % palettes.length];
}

const EMPTY_FORM = { name: "", email: "", phone: "", valueMonthly: "" };
const blockEnter = (e) => { if (e.key === "Enter") e.preventDefault(); };

// ── Field ────────────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</label>
      <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors">
        <Icon size={14} className="text-zinc-400 shrink-0" />
        {children}
      </div>
    </div>
  );
}

// ── Modal Criar/Editar ────────────────────────────────────────────────────────
function ClienteModal({ open, onClose, onSave, inicial }) {
  const [form, setForm] = useState(inicial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(inicial || EMPTY_FORM);
    setSaving(false);
  }, [inicial, open]);

  if (!open) return null;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    await onSave({ ...form, valueMonthly: parseFloat(form.valueMonthly) || 0 });
    setSaving(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl"
        onKeyDown={blockEnter}
      >
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {inicial?.id ? "Editar cliente" : "Novo cliente"}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {inicial?.id ? `Editando #${inicial.id}` : "Preencha os dados abaixo"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-3">
          <Field label="Nome *" icon={User}>
            <input
              type="text" name="name" value={form.name} onChange={handle}
              placeholder="Nome completo" autoComplete="off"
              className="bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
            />
          </Field>
          <Field label="Email" icon={Mail}>
            <input
              type="text" name="email" value={form.email} onChange={handle}
              placeholder="email@exemplo.com" autoComplete="off"
              className="bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
            />
          </Field>
          <Field label="Telefone" icon={Phone}>
            <input
              type="text" name="phone" value={form.phone} onChange={handle}
              placeholder="(11) 99999-0000" autoComplete="off"
              className="bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
            />
          </Field>
          <Field label="Valor Mensal" icon={DollarSign}>
            <span className="text-sm text-zinc-400 shrink-0">R$</span>
            <input
              type="number" name="valueMonthly" min="0" step="0.01"
              value={form.valueMonthly} onChange={handle} placeholder="0,00"
              className="bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
            />
          </Field>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <button
            type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="button" onClick={submit}
            disabled={saving || !form.name.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-zinc-900 text-sm font-semibold transition-colors"
          >
            {saving ? "Salvando…" : inicial?.id ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Modal Delete ──────────────────────────────────────────────────────────────
function DeleteModal({ open, cliente, onConfirm, onClose }) {
  if (!open || !cliente) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center">
            <Trash2 size={18} className="text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Remover cliente?</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              <strong className="text-zinc-600 dark:text-zinc-300 font-medium">{cliente.name}</strong> será removido permanentemente.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors">
            Remover
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function ClienteCard({ cliente, onEdit, onDelete }) {
  const { bg, text } = avatarBg(cliente.name);
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl ${bg} border border-zinc-200 dark:border-transparent flex items-center justify-center text-xs font-bold ${text} shrink-0`}>
            {cliente.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">{cliente.name}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">#{cliente.id}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button type="button" onClick={() => onEdit(cliente)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Pencil size={13} />
          </button>
          <button type="button" onClick={() => onDelete(cliente)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 rounded-lg px-3 py-2">
        <span className="text-[11px] text-zinc-400 font-medium">Mensal</span>
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{fmt(cliente.valueMonthly)}</span>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-50 dark:border-zinc-800">
        {cliente.email && (
          <div className="flex items-center gap-2">
            <Mail size={11} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
            <span className="text-[11px] text-zinc-400 truncate">{cliente.email}</span>
          </div>
        )}
        {cliente.phone && (
          <div className="flex items-center gap-2">
            <Phone size={11} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
            <span className="text-[11px] text-zinc-400">{cliente.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function Clientes() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [deletando, setDeletando] = useState(null);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setClientes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleCriar = async (form) => {
    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchClientes(); setModalOpen(false); }
    } catch (e) { console.error(e); }
  };

  const handleEditar = async (form) => {
    try {
      const res = await fetch(`${API_URL}/clients/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchClientes(); setModalOpen(false); setEditando(null); }
    } catch (e) { console.error(e); }
  };

  const handleDeletar = async () => {
    try {
      const res = await fetch(`${API_URL}/clients/${deletando.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { await fetchClientes(); setDeletando(null); }
    } catch (e) { console.error(e); }
  };

  const filtrados = clientes.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex transition-colors duration-300">

        <Sidebar onLogout={handleLogout} />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

        <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">

          <header className="sticky top-0 z-10 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <span className="text-sm font-semibold tracking-tight">Clientes</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleTheme}
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button type="button"
                className="relative p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 transition-colors">
                <Bell size={14} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </button>
              <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-[11px] font-bold text-white dark:text-zinc-900">
                JS
              </div>
            </div>
          </header>

          <div className="p-5 md:p-8 flex flex-col gap-5">

            {/* Page header */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-0.5">Base de clientes</p>
                <h1 className="text-xl font-bold tracking-tight">
                  Clientes
                  <span className="ml-2 text-base font-normal text-zinc-400">({clientes.length})</span>
                </h1>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 w-full sm:w-72 focus-within:border-zinc-300 dark:focus-within:border-zinc-600 transition-colors">
                <Search size={13} className="text-zinc-400 shrink-0" />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou email…"
                  className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 outline-none w-full placeholder:text-zinc-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-zinc-300 hover:text-zinc-500 transition-colors shrink-0">
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setEditando(null); setModalOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-semibold transition-colors shrink-0"
              >
                <Plus size={14} /> Novo cliente
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
              </div>
            ) : filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  <Users size={22} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    {search ? "Nenhum resultado" : "Nenhum cliente ainda"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {search ? `Sem resultados para "${search}"` : "Comece cadastrando seu primeiro cliente"}
                  </p>
                </div>
                {!search && (
                  <button
                    type="button"
                    onClick={() => { setEditando(null); setModalOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold transition-colors"
                  >
                    <Plus size={13} /> Cadastrar cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtrados.map((c) => (
                  <ClienteCard
                    key={c.id}
                    cliente={c}
                    onEdit={(c) => { setEditando(c); setModalOpen(true); }}
                    onDelete={(c) => setDeletando(c)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNav />

        <ClienteModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditando(null); }}
          onSave={editando ? handleEditar : handleCriar}
          inicial={editando}
        />
        <DeleteModal
          open={!!deletando}
          cliente={deletando}
          onConfirm={handleDeletar}
          onClose={() => setDeletando(null)}
        />
      </div>
    </div>
  );
}