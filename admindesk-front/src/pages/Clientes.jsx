import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import {
  Bell, Sun, Moon, Search, Plus, X,
  Pencil, Trash2, User, Mail, Phone, Users, DollarSign
} from "lucide-react";

const API_URL = "http://localhost:8080";

const fmt = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

function getToken() {
  return localStorage.getItem("token");
}

function avatarColor(name) {
  const colors = [
    "from-purple-500 to-violet-700",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

const EMPTY_FORM = { name: "", email: "", phone: "", valueMonthly: "" };

const blockEnter = (e) => { if (e.key === "Enter") e.preventDefault(); };

// ── Modal ────────────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white dark:bg-[#1a1025] border border-gray-200 dark:border-purple-900/30 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-purple-900/20"
        onKeyDown={blockEnter}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {inicial?.id ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">

          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nome *</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition">
              <User size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="Nome completo"
                autoComplete="off"
                className="bg-transparent text-sm text-gray-800 dark:text-white outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition">
              <Mail size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="email@exemplo.com"
                autoComplete="off"
                inputMode="email"
                className="bg-transparent text-sm text-gray-800 dark:text-white outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Telefone</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition">
              <Phone size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handle}
                placeholder="(11) 99999-0000"
                autoComplete="off"
                className="bg-transparent text-sm text-gray-800 dark:text-white outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Valor Mensal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Valor Mensal</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition">
              <DollarSign size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400 shrink-0">R$</span>
              <input
                type="number"
                name="valueMonthly"
                min="0"
                step="0.01"
                value={form.valueMonthly}
                onChange={handle}
                placeholder="0,00"
                className="bg-transparent text-sm text-gray-800 dark:text-white outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-purple-900/30 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !form.name.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-lg shadow-purple-900/30"
          >
            {saving ? "Salvando..." : inicial?.id ? "Salvar alterações" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Modal Delete ─────────────────────────────────────────────────────────────
function DeleteModal({ open, cliente, onConfirm, onClose }) {
  if (!open || !cliente) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1025] border border-gray-200 dark:border-red-900/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Trash2 size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Deletar cliente?</h3>
            <p className="text-sm text-gray-400 mt-1">
              Tem certeza que deseja remover <strong className="text-gray-700 dark:text-gray-200">{cliente.name}</strong>? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-purple-900/30 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
            Deletar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
function ClienteCard({ cliente, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-5 flex flex-col gap-4 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-900/10 transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColor(cliente.name)} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
            {cliente.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{cliente.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">ID #{cliente.id}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onEdit(cliente)} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 transition">
            <Pencil size={14} />
          </button>
          <button type="button" onClick={() => onDelete(cliente)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">Valor mensal</span>
        <span className="text-sm font-bold text-purple-600 dark:text-purple-300">{fmt(cliente.valueMonthly)}</span>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-purple-900/20">
        {cliente.email && (
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{cliente.email}</span>
          </div>
        )}
        {cliente.phone && (
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{cliente.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página ───────────────────────────────────────────────────────────────────
export default function Clientes() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
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
      console.error("Erro ao buscar clientes:", e);
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
    } catch (e) { console.error("Erro ao criar:", e); }
  };

  const handleEditar = async (form) => {
    try {
      const res = await fetch(`${API_URL}/clients/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchClientes(); setModalOpen(false); setEditando(null); }
    } catch (e) { console.error("Erro ao editar:", e); }
  };

  const handleDeletar = async () => {
    try {
      const res = await fetch(`${API_URL}/clients/${deletando.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { await fetchClientes(); setDeletando(null); }
    } catch (e) { console.error("Erro ao deletar:", e); }
  };

  const filtrados = clientes.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0816] text-gray-900 dark:text-white font-sans flex transition-colors duration-300">

        <Sidebar onLogout={handleLogout} />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

        <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">

          <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0d0816]/80 backdrop-blur-md border-b border-gray-200 dark:border-purple-900/20 px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <div>
                <h1 className="text-base md:text-lg font-semibold">Clientes</h1>
                <p className="text-xs text-gray-400 hidden md:block">{clientes.length} clientes cadastrados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400 hover:text-gray-700 dark:hover:text-white transition">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="relative p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white">JS</div>
            </div>
          </header>

          <div className="p-4 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 w-full sm:w-80 focus-within:border-purple-500 transition">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none w-full placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={() => { setEditando(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition shadow-lg shadow-purple-900/30 shrink-0"
              >
                <Plus size={16} /> Novo Cliente
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Users size={28} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nenhum cliente encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search ? "Tente outro termo de busca" : "Comece cadastrando seu primeiro cliente"}
                  </p>
                </div>
                {!search && (
                  <button
                    type="button"
                    onClick={() => { setEditando(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition"
                  >
                    <Plus size={15} /> Cadastrar cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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