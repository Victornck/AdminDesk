import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, BarChart2, ArrowRight } from "lucide-react";

const API_URL = "http://localhost:8080";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handle = (e) => {
    setErro("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.email || !form.password) {
      setErro("Preencha email e senha.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setErro("Email ou senha incorretos.");
        setLoading(false);
        return;
      }
      const token = await res.text();
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div className="min-h-screen flex" style={{ background: "#080d14" }}>

      {/* ── Painel esquerdo — decorativo ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{ background: "#0a1019" }}
      >
        {/* Grade de pontos */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow verde */}
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(163,230,53,0.07) 0%, transparent 70%)",
            transform: "translate(-20%, 20%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a3e635, #65a30d)" }}
          >
            <BarChart2 size={18} className="text-black" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">AdminDesk</span>
        </div>

        {/* Headline */}
        <div className="relative">
          <p
            className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "rgba(163,230,53,0.6)" }}
          >
            Gestão financeira
          </p>
          <h2
            className="text-4xl font-bold leading-tight text-white mb-6"
            style={{ letterSpacing: "-0.02em" }}
          >
            Controle total<br />
            do seu negócio<br />
            <span style={{ color: "#a3e635" }}>em tempo real.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)", maxWidth: "360px" }}>
            Receitas, despesas e clientes em um único lugar.
            Dados sempre atualizados, sem complicação.
          </p>
        </div>

        {/* Stat cards */}
        <div className="relative flex gap-4">
          {[
            { label: "Receita mensal", value: "R$ 48.230", delta: "+12%" },
            { label: "Clientes ativos", value: "142", delta: "+8" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p className="text-[11px] tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
              <p className="text-xl font-bold text-white tracking-tight">{s.value}</p>
              <p className="text-[11px] mt-1 font-semibold" style={{ color: "#a3e635" }}>{s.delta} este mês</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div
          className="absolute pointer-events-none"
          style={{
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 65%)",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div className="relative w-full max-w-[360px]">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #a3e635, #65a30d)" }}
            >
              <BarChart2 size={15} className="text-black" />
            </div>
            <span className="text-white font-semibold text-sm">AdminDesk</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              Entre com suas credenciais para continuar
            </p>
          </div>

          <div className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                Email
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all focus-within:outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${erro ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.07)"}`,
                  transition: "border-color 0.15s",
                }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(163,230,53,0.35)"}
                onBlurCapture={e => e.currentTarget.style.borderColor = erro ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.07)"}
              >
                <Mail size={14} style={{ color: "rgba(255,255,255,0.2)" }} className="shrink-0" />
                <input
                  name="email" type="email" value={form.email}
                  onChange={handle} onKeyDown={handleKeyDown}
                  placeholder="seu@email.com"
                  className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
                  style={{ caretColor: "#a3e635" }}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Senha
                </label>
                <button className="text-[11px] font-medium transition-opacity hover:opacity-80" style={{ color: "rgba(163,230,53,0.6)" }}>
                  Esqueceu?
                </button>
              </div>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${erro ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.07)"}`,
                  transition: "border-color 0.15s",
                }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(163,230,53,0.35)"}
                onBlurCapture={e => e.currentTarget.style.borderColor = erro ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.07)"}
              >
                <Lock size={14} style={{ color: "rgba(255,255,255,0.2)" }} className="shrink-0" />
                <input
                  name="password" type={showPass ? "text" : "password"}
                  value={form.password} onChange={handle} onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
                  style={{ caretColor: "#a3e635" }}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs"
                style={{
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.15)",
                  color: "#f87171",
                }}
              >
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              onClick={submit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 mt-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #a3e635, #65a30d)",
                boxShadow: "0 0 24px rgba(163,230,53,0.15)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 32px rgba(163,230,53,0.25)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(163,230,53,0.15)"}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Entrando…
                </>
              ) : (
                <>Entrar <ArrowRight size={14} /></>
              )}
            </button>
          </div>

          <p className="text-center text-xs mt-7" style={{ color: "rgba(255,255,255,0.25)" }}>
            Não tem conta?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: "#a3e635" }}
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}