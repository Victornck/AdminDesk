import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, BarChart2 } from "lucide-react";

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
    } catch (e) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="min-h-screen bg-[#0d0816] flex items-center justify-center p-4">

      {/* Glow de fundo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-900/50">
            <BarChart2 size={22} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">AdminDesk</h1>
            <p className="text-sm text-gray-400 mt-0.5">Entre na sua conta</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#130d1f] border border-purple-900/30 rounded-2xl p-6 shadow-2xl shadow-purple-900/20">

          <div className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">Email</label>
              <div className={`flex items-center gap-2 bg-white/5 border rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition ${erro ? "border-red-500/50" : "border-purple-900/30"}`}>
                <Mail size={15} className="text-gray-400 shrink-0" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handle}
                  onKeyDown={handleKeyDown}
                  placeholder="seu@email.com"
                  className="bg-transparent text-sm text-white outline-none w-full placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">Senha</label>
              <div className={`flex items-center gap-2 bg-white/5 border rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition ${erro ? "border-red-500/50" : "border-purple-900/30"}`}>
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handle}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="bg-transparent text-sm text-white outline-none w-full placeholder:text-gray-600"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-500 hover:text-gray-300 transition shrink-0"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            {/* Botão */}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-lg shadow-purple-900/30 mt-1"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </div>
        </div>

        {/* Registro */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Não tem conta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-purple-400 hover:text-purple-300 transition font-medium"
          >
            Criar conta
          </button>
        </p>

      </div>
    </div>
  );
}