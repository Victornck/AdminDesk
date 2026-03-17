import { useState, useEffect, useRef } from "react";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import {
  Bell, Sun, Moon, User, Lock, Palette, Globe, Shield, Camera,
  Check, Eye, EyeOff, Smartphone, Mail, Save, AlertCircle, IdCard, Loader2,
  Trash2, TriangleAlert,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const ACCENT_COLORS = [
  { id: "blue",    label: "Azul",  hex: "#3b82f6" },
  { id: "purple",  label: "Roxo",  hex: "#8b5cf6" },
  { id: "emerald", label: "Verde", hex: "#10b981" },
  { id: "rose",    label: "Rosa",  hex: "#f43f5e" },
  { id: "amber",   label: "Âmbar", hex: "#f59e0b" },
];

const TABS = [
  { id: "perfil",       label: "Perfil",       icon: User    },
  { id: "aparencia",    label: "Aparência",    icon: Palette },
  { id: "notificacoes", label: "Notificações", icon: Bell    },
  { id: "seguranca",    label: "Segurança",    icon: Shield  },
  { id: "regional",     label: "Regional",     icon: Globe   },
];

const NOTIFICATION_CHANNELS = [
  { key: "email", label: "E-mail", desc: "Receba alertas por e-mail",     icon: Mail       },
  { key: "push",  label: "Push",   desc: "Notificações no navegador",     icon: Bell       },
  { key: "sms",   label: "SMS",    desc: "Mensagens de texto no celular", icon: Smartphone },
];

const NOTIFICATION_EVENTS = [
  { key: "reports",    label: "Relatórios",     desc: "Resumos diários e semanais"          },
  { key: "newClients", label: "Novos Clientes", desc: "Quando um novo cliente é cadastrado" },
  { key: "expenses",   label: "Despesas",       desc: "Alertas de novos lançamentos"        },
];

const STRENGTH_COLORS = ["bg-red-500", "bg-amber-400", "bg-blue-400", "bg-emerald-500"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() { return localStorage.getItem("token") ?? ""; }

function getEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.sub ?? payload?.email ?? "";
  } catch { return ""; }
}

function initials(nome = "") {
  return nome.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function passwordStrength(password) {
  return [6, 8, 10, 12].filter(min => password.length >= min).length;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;
  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
  const mergedHeaders = { ...defaultHeaders, ...extraHeaders };
  Object.keys(mergedHeaders).forEach(k => mergedHeaders[k] == null && delete mergedHeaders[k]);
  const res = await fetch(`${API_URL}${path}`, { headers: mergedHeaders, ...restOptions });
  if (!res.ok) { const err = new Error(`HTTP ${res.status}`); err.status = res.status; throw err; }
  return res.json();
}

// ─── Validations ──────────────────────────────────────────────────────────────

function validateProfile({ nome, email }) {
  const errors = {};
  if (!nome?.trim())  errors.nome  = "Nome é obrigatório";
  if (!email?.trim()) errors.email = "E-mail é obrigatório";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "E-mail inválido";
  return errors;
}

function validatePassword({ current, newPass, confirm }) {
  const errors = {};
  if (!current)                errors.current = "Informe a senha atual";
  if (!newPass)                errors.newPass = "Informe a nova senha";
  else if (newPass.length < 6) errors.newPass = "Mínimo 6 caracteres";
  if (newPass !== confirm)     errors.confirm = "As senhas não coincidem";
  return errors;
}

// ─── Modal de Exclusão ────────────────────────────────────────────────────────

function DeleteAccountModal({ onConfirm, onCancel, loading }) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText === "EXCLUIR";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#120d1e] border border-gray-200 dark:border-white/10
          rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-5 md:p-6
          max-h-[92vh] overflow-y-auto space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar mobile */}
        <div className="flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
        </div>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <TriangleAlert size={28} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Excluir conta permanentemente</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Esta ação é <span className="font-semibold text-red-500">irreversível</span>. Todos os seus dados
              serão deletados e não poderão ser recuperados.
            </p>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-white/5" />

        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          {[
            "Seu perfil e dados pessoais serão removidos",
            "Todo o histórico de atividades será apagado",
            "Você perderá acesso imediato ao sistema",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Digite <span className="text-red-500 font-bold">EXCLUIR</span> para confirmar
          </label>
          <input
            type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
            placeholder="EXCLUIR" autoFocus
            className={`w-full px-4 py-3 rounded-xl text-sm border transition bg-gray-50 dark:bg-white/5
              dark:text-white placeholder-gray-300 dark:placeholder-white/20 outline-none ${
              isConfirmed
                ? "border-red-500 ring-2 ring-red-500/20"
                : "border-gray-200 dark:border-white/10 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
            }`}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200
              dark:border-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={!isConfirmed || loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm
              font-semibold bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? "Excluindo…" : "Excluir conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Configuracoes() {
  const { darkMode, toggleDark, accentColor, setAccentColor, density, setDensity } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab,  setActiveTab]  = useState("perfil");
  const [language,   setLanguage]   = useState("pt-BR");
  const [currency,   setCurrency]   = useState("BRL");

  const userIdRef = useRef(null);
  const [profile,         setProfile]         = useState({ nome: "", cpf: "", email: "" });
  const [profileOriginal, setProfileOriginal] = useState(null);
  const [profileLoading,  setProfileLoading]  = useState(true);
  const [profileSaving,   setProfileSaving]   = useState(false);
  const [profileSaved,    setProfileSaved]    = useState(false);
  const [profileErrors,   setProfileErrors]   = useState({});
  const [profileApiError, setProfileApiError] = useState("");

  const [showPassword,     setShowPassword]     = useState(false);
  const [passwords,        setPasswords]        = useState({ current: "", newPass: "", confirm: "" });
  const [passwordErrors,   setPasswordErrors]   = useState({});
  const [passwordSaving,   setPasswordSaving]   = useState(false);
  const [passwordSaved,    setPasswordSaved]    = useState(false);
  const [passwordApiError, setPasswordApiError] = useState("");

  const [notifications, setNotifications] = useState({
    email: true, push: true, sms: false, reports: true, newClients: true, expenses: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const [deleteApiError,  setDeleteApiError]  = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = getToken();
        if (!token) return;
        const email = getEmailFromToken(token);
        const users = await apiFetch("/auth/users");
        const me    = users.find(u => u.email?.toLowerCase() === email.toLowerCase()) ?? users[0];
        if (!me || cancelled) return;
        userIdRef.current = me.id;
        const data = { nome: me.nome ?? me.name ?? "", cpf: me.cpf ?? "", email: me.email ?? "" };
        setProfile(data);
        setProfileOriginal(data);
      } catch {
        if (!cancelled) setProfileApiError("Não foi possível carregar os dados do perfil.");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleSavePerfil() {
    const errors = validateProfile(profile);
    if (Object.keys(errors).length) { setProfileErrors(errors); return; }
    if (!userIdRef.current) { setProfileApiError("ID do usuário não encontrado."); return; }
    setProfileSaving(true); setProfileApiError("");
    try {
      const updated = await apiFetch(`/auth/update/${userIdRef.current}`, {
        method: "PUT",
        body: JSON.stringify({ nome: profile.nome.trim(), email: profile.email.trim(), cpf: profileOriginal?.cpf ?? profile.cpf }),
      });
      const data = { nome: updated.nome ?? updated.name ?? profile.nome, cpf: updated.cpf ?? profile.cpf, email: updated.email ?? profile.email };
      setProfile(data); setProfileOriginal(data);
      flash(setProfileSaved);
    } catch (err) {
      setProfileApiError(err.status === 409 ? "Este e-mail já está em uso." : "Não foi possível salvar. Tente novamente.");
    } finally { setProfileSaving(false); }
  }

  async function handleSavePassword() {
    const errors = validatePassword(passwords);
    if (Object.keys(errors).length) { setPasswordErrors(errors); return; }
    if (!userIdRef.current) return;
    setPasswordSaving(true); setPasswordApiError("");
    try {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, password: passwords.current }),
      });
      if (!loginRes.ok) { setPasswordErrors({ current: "Senha atual incorreta" }); return; }
      const updateRes = await fetch(`${API_URL}/auth/update/${userIdRef.current}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ nome: profile.nome, email: profile.email, cpf: profile.cpf, password: passwords.newPass }),
      });
      if (!updateRes.ok) { setPasswordApiError("Não foi possível atualizar a senha. Tente novamente."); return; }
      setPasswords({ current: "", newPass: "", confirm: "" });
      flash(setPasswordSaved);
    } catch { setPasswordApiError("Erro de conexão. Verifique sua rede e tente novamente."); }
    finally { setPasswordSaving(false); }
  }

  async function handleDeleteAccount() {
    if (!userIdRef.current) return;
    setDeleteLoading(true); setDeleteApiError("");
    try {
      await fetch(`${API_URL}/auth/delete/${userIdRef.current}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch {
      setDeleteApiError("Não foi possível excluir a conta. Tente novamente.");
      setDeleteLoading(false);
    }
  }

  function flash(setter) { setter(true); setTimeout(() => setter(false), 2500); }

  const profileChanged = profileOriginal &&
    (profile.nome !== profileOriginal.nome || profile.email !== profileOriginal.email);

  return (
    <div>
      <style>{`
        .btn-accent          { background-color: var(--accent); box-shadow: var(--accent-shadow-css); color: #fff; transition: filter .15s; }
        .btn-accent:hover    { filter: brightness(1.12); }
        .btn-accent:disabled { opacity: 0.6; cursor: not-allowed; filter: none; }
        .btn-accent-muted    { background-color: var(--accent-muted); color: var(--accent); }
        .tab-active          { background-color: var(--accent); box-shadow: var(--accent-shadow-css); color: #fff; }
        .focus-accent:focus  { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-ring); outline: none; }
        .density-py          { padding-top: calc(0.625rem * var(--ui-density, 1)); padding-bottom: calc(0.625rem * var(--ui-density, 1)); }
        .density-gap         { gap: calc(1rem * var(--ui-density, 1)); }
        .hide-scrollbar      { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {showDeleteModal && (
        <DeleteAccountModal
          loading={deleteLoading}
          onConfirm={handleDeleteAccount}
          onCancel={() => { if (!deleteLoading) { setShowDeleteModal(false); setDeleteApiError(""); } }}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0816] text-gray-900 dark:text-white font-sans flex transition-colors duration-300">
        <Sidebar />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="flex-1 md:ml-64 flex flex-col pb-20 md:pb-0">

          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0d0816]/80 backdrop-blur-md
            border-b border-gray-200 dark:border-white/5 px-4 md:px-8 py-3 md:py-4
            flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Sistema</p>
                <h1 className="text-base font-bold leading-tight">Configurações</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleDark}
                className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200
                  dark:border-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition">
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button className="relative p-2 rounded-xl bg-gray-100 dark:bg-white/5 border
                border-gray-200 dark:border-white/10 text-gray-400">
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }} />
              </button>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white btn-accent">
                {initials(profile.nome)}
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 md:px-8 py-5 md:py-6 max-w-5xl w-full mx-auto overflow-hidden">
            <div className="mb-5 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Configurações</h2>
              <p className="text-sm text-gray-400 mt-1">Gerencie sua conta e preferências do sistema.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">

              {/* Tabs — grade de ícone+label no mobile, lista vertical no desktop */}
              <nav className="grid grid-cols-5 md:grid-cols-none md:flex md:flex-col gap-1 w-full md:w-52 md:shrink-0">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex flex-col md:flex-row items-center justify-center md:justify-start
                      gap-1 md:gap-2.5 px-1 md:px-3.5 py-2.5 md:py-3 rounded-xl
                      text-[10px] md:text-sm font-medium transition-all ${
                      activeTab === id
                        ? "tab-active"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}>
                    <Icon size={16} className="shrink-0" />
                    <span className="leading-tight text-center md:text-left truncate w-full">{label}</span>
                  </button>
                ))}
              </nav>

              <div className="flex-1 min-w-0">

                {/* ── PERFIL ─────────────────────────────────────────────── */}
                {activeTab === "perfil" && (
                  <Card className="space-y-5">
                    <h3 className="text-base font-semibold">Informações do Perfil</h3>

                    {profileLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
                      </div>
                    ) : (
                      <>
                        {/* Avatar + info */}
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center
                              justify-center text-xl md:text-2xl font-bold text-white btn-accent select-none">
                              {initials(profile.nome)}
                            </div>
                            <div title="Upload de foto não disponível"
                              className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-lg
                                flex items-center justify-center border-2 border-white dark:border-[#0d0816]
                                cursor-not-allowed opacity-50"
                              style={{ background: "var(--accent)" }}>
                              <Camera size={11} className="text-white" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{profile.nome || "—"}</p>
                            <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                            {profile.cpf && (
                              <p className="text-xs text-gray-400 mt-0.5">CPF: {profile.cpf}</p>
                            )}
                          </div>
                        </div>

                        <hr className="border-gray-100 dark:border-white/5" />
                        <ErrorBanner message={profileApiError} />

                        <div className="space-y-4">
                          <Field label="Nome completo" required error={profileErrors.nome}>
                            <InputWithIcon icon={<User size={14} />}
                              value={profile.nome}
                              onChange={e => { setProfile(p => ({ ...p, nome: e.target.value })); clearError(setProfileErrors, "nome"); setProfileApiError(""); }}
                              placeholder="Seu nome completo"
                              hasError={!!profileErrors.nome}
                            />
                          </Field>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                              CPF
                              <span className="text-[10px] font-normal normal-case tracking-normal px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-400">
                                não editável
                              </span>
                            </label>
                            <div className="relative">
                              <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20" />
                              <input readOnly tabIndex={-1} value={profile.cpf || "—"}
                                className="w-full pl-9 pr-4 density-py rounded-xl text-sm border cursor-not-allowed
                                  select-none bg-gray-100 dark:bg-white/[0.02] border-gray-200 dark:border-white/5
                                  text-gray-400 dark:text-white/30" />
                            </div>
                            <p className="text-xs text-gray-400">Identificador único. Entre em contato com o suporte para alterações.</p>
                          </div>

                          <Field label="E-mail" required error={profileErrors.email} hint="Usado para login e notificações.">
                            <InputWithIcon icon={<Mail size={14} />}
                              type="email"
                              value={profile.email}
                              onChange={e => { setProfile(p => ({ ...p, email: e.target.value })); clearError(setProfileErrors, "email"); setProfileApiError(""); }}
                              placeholder="seu@email.com"
                              hasError={!!profileErrors.email}
                            />
                          </Field>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {profileChanged && !profileSaved
                            ? <p className="text-xs text-amber-500 flex items-center gap-1">
                                <AlertCircle size={11} /> Alterações não salvas
                              </p>
                            : <span />}
                          <SaveButton onSave={handleSavePerfil} saved={profileSaved}
                            loading={profileSaving} disabled={!profileChanged} />
                        </div>
                      </>
                    )}
                  </Card>
                )}

                {/* ── APARÊNCIA ──────────────────────────────────────────── */}
                {activeTab === "aparencia" && (
                  <div className="space-y-4">
                    <Card className="space-y-4">
                      <h3 className="text-base font-semibold">Tema</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[{ label: "Claro", isDark: false }, { label: "Escuro", isDark: true }].map(({ label, isDark }) => {
                          const isActive = darkMode === isDark;
                          return (
                            <button key={label} onClick={() => { if (darkMode !== isDark) toggleDark(); }}
                              className="relative flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border-2 transition-all"
                              style={{
                                borderColor: isActive ? "var(--accent)" : isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                                // fundo do card nunca usa accent-muted para não ficar feio ao trocar de cor
                                backgroundColor: isActive
                                  ? isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                                  : "transparent",
                              }}>
                              {/* Preview do tema */}
                              <div className={`w-full h-16 md:h-20 rounded-lg overflow-hidden border ${isDark ? "bg-[#0d0816] border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                                <div className={`h-4 border-b flex items-center px-2 gap-1 ${isDark ? "bg-[#1a1025] border-white/5" : "bg-gray-100 border-gray-200"}`}>
                                  <span className={`w-2 h-2 rounded-full ${isDark ? "bg-white/20" : "bg-gray-300"}`} />
                                  <span className={`w-2 h-2 rounded-full ${isDark ? "bg-white/20" : "bg-gray-300"}`} />
                                </div>
                                <div className="p-2 space-y-1">
                                  <div className={`h-2 rounded w-3/4 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                                  <div className="h-2 rounded w-1/2" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }} />
                                </div>
                              </div>
                              {/* Label — cor fixa, nunca herdada do tema */}
                              <span className="text-sm font-medium" style={{ color: isDark ? "#e2e8f0" : "#374151" }}>{label}</span>
                              {/* Checkmark do accent */}
                              {isActive && (
                                <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: "var(--accent)" }}>
                                  <Check size={11} className="text-white" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    <Card className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold">Cor de Destaque</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Aplica em botões, links e indicadores — em tempo real.</p>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {ACCENT_COLORS.map(c => (
                          <button key={c.id} onClick={() => setAccentColor(c.id)} title={c.label}
                            className="w-10 h-10 rounded-xl transition-all"
                            style={{
                              backgroundColor: c.hex,
                              outline:       accentColor === c.id ? `3px solid ${c.hex}` : "none",
                              outlineOffset: "3px",
                              transform:     accentColor === c.id ? "scale(1.15)" : "scale(1)",
                            }}>
                            {accentColor === c.id && <Check size={14} className="mx-auto text-white" />}
                          </button>
                        ))}
                      </div>
                      {/* Preview */}
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 space-y-3">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Preview</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button className="btn-accent px-3 py-2 rounded-xl text-sm font-semibold">Botão primário</button>
                          <button className="btn-accent-muted px-3 py-2 rounded-xl text-sm font-semibold">Secundário</button>
                          <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>Link de ação</span>
                        </div>
                        <input readOnly value="Campo focado com a nova cor" onFocus={e => e.target.select()}
                          className="focus-accent w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-white/5
                            border border-gray-200 dark:border-white/10 dark:text-white" />
                      </div>
                    </Card>

                    <Card className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold">Densidade da Interface</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Controla o espaçamento — efeito imediato.</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {["Compacto", "Normal", "Confortável"].map(d => (
                          <button key={d} onClick={() => setDensity(d)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
                            style={d === density
                              ? { borderColor: "var(--accent)", backgroundColor: "var(--accent-muted)", color: "var(--accent)" }
                              : {}}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* ── NOTIFICAÇÕES ───────────────────────────────────────── */}
                {activeTab === "notificacoes" && (
                  <Card className="space-y-6">
                    <h3 className="text-base font-semibold">Notificações</h3>
                    <NotifGroup label="Canais">
                      {NOTIFICATION_CHANNELS.map(({ key, label, desc, icon: Icon }) => (
                        <NotifRow key={key} label={label} desc={desc}
                          icon={<div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <Icon size={16} className="text-gray-500 dark:text-gray-400" />
                          </div>}
                          value={notifications[key]}
                          onChange={v => setNotifications(n => ({ ...n, [key]: v }))} />
                      ))}
                    </NotifGroup>
                    <hr className="border-gray-100 dark:border-white/5" />
                    <NotifGroup label="Eventos">
                      {NOTIFICATION_EVENTS.map(({ key, label, desc }) => (
                        <NotifRow key={key} label={label} desc={desc}
                          value={notifications[key]}
                          onChange={v => setNotifications(n => ({ ...n, [key]: v }))} />
                      ))}
                    </NotifGroup>
                    <div className="flex justify-end">
                      <SaveButton onSave={() => flash(setNotifSaved)} saved={notifSaved} />
                    </div>
                  </Card>
                )}

                {/* ── SEGURANÇA ──────────────────────────────────────────── */}
                {activeTab === "seguranca" && (
                  <div className="space-y-4">
                    <Card className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold">Alterar Senha</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Mínimo de 6 caracteres.</p>
                      </div>
                      <ErrorBanner message={passwordApiError} />
                      <div className="space-y-3">
                        {[
                          { key: "current", label: "Senha atual",         placeholder: "••••••••",            forceHidden: true  },
                          { key: "newPass", label: "Nova senha",           placeholder: "Mínimo 6 caracteres", forceHidden: false },
                          { key: "confirm", label: "Confirmar nova senha", placeholder: "Repita a nova senha", forceHidden: false },
                        ].map(({ key, label, placeholder, forceHidden }) => {
                          const type = forceHidden || !showPassword ? "password" : "text";
                          const confirmMatch = key === "confirm" && passwords.confirm && passwords.confirm === passwords.newPass;
                          return (
                            <div key={key} className="space-y-1.5">
                              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                {label} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={type} value={passwords[key]} placeholder={placeholder}
                                  onChange={e => { setPasswords(p => ({ ...p, [key]: e.target.value })); clearError(setPasswordErrors, key); setPasswordApiError(""); }}
                                  className={`focus-accent w-full pl-9 pr-10 py-3 rounded-xl text-sm
                                    bg-gray-50 dark:bg-white/5 border transition dark:text-white
                                    placeholder-gray-400 ${
                                    passwordErrors[key] ? "border-red-500" : confirmMatch
                                      ? "border-emerald-500" : "border-gray-200 dark:border-white/10"
                                  }`}
                                />
                                {key === "newPass" && (
                                  <button onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                                      hover:text-gray-600 dark:hover:text-gray-300 transition">
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                )}
                                {confirmMatch && <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                              </div>
                              {passwordErrors[key] && (
                                <p className="flex items-center gap-1 text-xs text-red-500">
                                  <AlertCircle size={11} /> {passwordErrors[key]}
                                </p>
                              )}
                              {key === "newPass" && !passwordErrors.newPass && passwords.newPass.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {STRENGTH_COLORS.map((color, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength(passwords.newPass) ? color : "bg-gray-200 dark:bg-white/10"}`} />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end">
                        <SaveButton label="Atualizar Senha" onSave={handleSavePassword}
                          saved={passwordSaved} loading={passwordSaving} />
                      </div>
                    </Card>

                    {/* 2FA */}
                    <Card>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Shield size={18} className="text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">Autenticação em 2 Fatores</p>
                            <p className="text-xs text-gray-400">Adicione uma camada extra de segurança</p>
                          </div>
                        </div>
                        <button className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold
                          bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition">
                          Ativar
                        </button>
                      </div>
                    </Card>

                    {/* Sessões */}
                    <Card className="space-y-3">
                      <h3 className="text-base font-semibold">Sessões Ativas</h3>
                      {[
                        { device: "Chrome no Windows", location: "Guaraciaba do Norte, CE", current: true  },
                        { device: "Safari no iPhone",  location: "Sobral, CE",              current: false },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl
                          bg-gray-50 dark:bg-white/[0.02] gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: s.current ? "#22c55e" : "#6b7280" }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{s.device}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {s.location}{s.current ? " · Esta sessão" : ""}
                              </p>
                            </div>
                          </div>
                          {!s.current && (
                            <button className="text-xs text-red-500 hover:text-red-400 font-medium shrink-0">
                              Encerrar
                            </button>
                          )}
                        </div>
                      ))}
                    </Card>

                    {/* Zona de perigo */}
                    <div className="rounded-2xl border-2 border-red-200 dark:border-red-500/20 overflow-hidden">
                      <div className="px-4 md:px-6 py-3 md:py-4 bg-red-50 dark:bg-red-500/5
                        border-b border-red-200 dark:border-red-500/20">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                          <TriangleAlert size={15} /> Zona de Perigo
                        </p>
                      </div>
                      <div className="px-4 md:px-6 py-4 md:py-5 bg-white dark:bg-white/[0.01]
                        flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">Excluir minha conta</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Remove permanentemente sua conta e todos os dados associados.
                          </p>
                          {deleteApiError && (
                            <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                              <AlertCircle size={11} /> {deleteApiError}
                            </p>
                          )}
                        </div>
                        <button onClick={() => setShowDeleteModal(true)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                            text-sm font-semibold bg-red-500/10 text-red-500 hover:bg-red-500
                            hover:text-white border border-red-200 dark:border-red-500/30 transition-all">
                          <Trash2 size={15} /> Excluir conta
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── REGIONAL ───────────────────────────────────────────── */}
                {activeTab === "regional" && (
                  <Card className="space-y-5">
                    <h3 className="text-base font-semibold">Preferências Regionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Idioma",         value: language, onChange: setLanguage, options: [["pt-BR","Português (Brasil)"],["en-US","English (US)"],["es","Español"]] },
                        { label: "Moeda",           value: currency, onChange: setCurrency, options: [["BRL","BRL — Real Brasileiro (R$)"],["USD","USD — Dólar Americano ($)"],["EUR","EUR — Euro (€)"]] },
                        { label: "Fuso Horário",    value: "ftz",    onChange: () => {},    options: [["ftz","América/Fortaleza (UTC-3)"],["stz","América/São_Paulo (UTC-3)"],["mtz","América/Manaus (UTC-4)"]] },
                        { label: "Formato de Data", value: "dmy",    onChange: () => {},    options: [["dmy","DD/MM/AAAA"],["mdy","MM/DD/AAAA"],["ymd","AAAA-MM-DD"]] },
                      ].map(({ label, value, onChange, options }) => (
                        <div key={label} className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
                          <select value={value} onChange={e => onChange(e.target.value)}
                            className="focus-accent w-full px-4 py-3 rounded-xl text-sm
                              bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                              transition dark:text-white">
                            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <SaveButton onSave={() => {}} saved={false} />
                    </div>
                  </Card>
                )}

              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

// ─── Helpers de estado ────────────────────────────────────────────────────────

function clearError(setter, key) {
  setter(prev => ({ ...prev, [key]: undefined }));
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-2xl p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
}

function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error
        ? <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} /> {error}</p>
        : hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function InputWithIcon({ icon, hasError, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input {...props}
        className={`focus-accent w-full pl-9 pr-4 py-3 rounded-xl text-sm bg-gray-50
          dark:bg-white/5 border transition dark:text-white placeholder-gray-400 ${
          hasError ? "border-red-500" : "border-gray-200 dark:border-white/10"
        }`}
      />
    </div>
  );
}

function NotifGroup({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NotifRow({ label, desc, icon, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 rounded-xl
      hover:bg-gray-50 dark:hover:bg-white/[0.02] transition gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-gray-400 truncate">{desc}</p>
        </div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} role="switch" aria-checked={value}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
      style={value ? { backgroundColor: "var(--accent)" } : { backgroundColor: "" }}
      data-off={!value}>
      <style>{`.toggle-off { background-color: #e5e7eb; } .dark .toggle-off { background-color: rgba(255,255,255,0.1); }`}</style>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
        transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function SaveButton({ onSave, saved, loading = false, disabled = false, label = "Salvar Alterações" }) {
  return (
    <button onClick={onSave} disabled={disabled || loading || saved}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-300 ${saved ? "bg-emerald-500 text-white" : "btn-accent"}`}>
      {saved   && <Check   size={15} />}
      {loading && <Loader2 size={15} className="animate-spin" />}
      {!saved && !loading && <Save size={15} />}
      {saved ? "Salvo!" : loading ? "Salvando…" : label}
    </button>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10
      border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
      <AlertCircle size={15} className="shrink-0 mt-0.5" /> {message}
    </div>
  );
}