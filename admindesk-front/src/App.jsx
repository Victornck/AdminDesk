import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider }   from "./context/AppContext";

import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";
import Clientes      from "./pages/Clientes";
import Despesas      from "./pages/Despesas";
import Relatorios    from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"              element={<Login />}         />
            <Route path="/register"      element={<Register />}      />
            <Route path="/dashboard"     element={<Dashboard />}     />
            <Route path="/clientes"      element={<Clientes />}      />
            <Route path="/despesas"      element={<Despesas />}      />
            <Route path="/relatorios"    element={<Relatorios />}    />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}